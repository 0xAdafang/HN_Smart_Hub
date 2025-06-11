use sqlx::PgPool;
use crate::{models::chatbot::log_interaction, AppState};
use regex::Regex;
use crate::models::IntentResult;

fn extract_last_word(message: &str) -> String {

    let cleaned = message.trim().trim_matches(|c: char| !c.is_alphanumeric());

    cleaned
        .split_whitespace()
        .last()
        .unwrap_or("inconnu")
        .to_string()
}

fn analyze_intent(message: &str) -> IntentResult {

    let q = message.to_lowercase();

    let map =  vec![
        ("congé", "conges"),
        ("jours de repos", "conges"),
        ("absences", "conges"),
        ("événement", "evenements"),
        ("agenda", "evenements"),
        ("formation", "formation_contenu"),
        ("soumission", "formation_contenu"),
        ("commande manuelle", "formation_contenu"),
        ("produit", "produit_unique"),
        ("c'est quoi", "produit_unique"),
        ("définition", "produit_unique"),
    ];

    for (mot, intent) in map {
        if q.contains(mot) {
            return IntentResult {
                intent,
                entity: Some(extract_last_word(&q)),
            }
        }
    }

    let produit_re = Regex::new(r"c['e]st quoi (le|la) produit (\w+)").unwrap();
        if let Some(caps) = produit_re.captures(&q) {
            return IntentResult {
                intent: "produit_unique",
                entity: Some(caps[2].to_string()),
            };
        }

    
    let route_re = Regex::new(r"route du (\w+)").unwrap();
    if let Some(caps) = route_re.captures(&q) {
        return IntentResult {
            intent: "routes",
            entity: Some(caps[1].to_string()),
        };
    }

    
    if q.contains("mes ventes") || q.contains("combien j'ai vendu") {
        return IntentResult {
            intent: "mes_ventes",
            entity: None,
        };
    }

    
    if q.contains("congés") && (q.contains("en attente") || q.contains("refus")) {
        return IntentResult {
            intent: "conges_en_attente",
            entity: None,
        };
    }

    
    if q.contains("meilleure évaluation") || q.contains("ma meilleure note") {
        return IntentResult {
            intent: "meilleure_eval",
            entity: None,
        };
    }

    
    if q.contains("conges") {
        return IntentResult {
            intent: "conges",
            entity: None,
        };
    }

    if q.contains("événements") || q.contains("calendrier") {
        return IntentResult {
            intent: "evenements",
            entity: None,
        };
    }

    if q.contains("formation") || q.contains("comment") || q.contains("procédure") {
        return IntentResult {
            intent: "formation_contenu",
            entity: None,
        };
    }

    if q.contains("succès") {
        return IntentResult {
            intent: "succès",
            entity: None,
        };
    }

    if q.contains("vente") {
        return IntentResult {
            intent: "ventes",
            entity: None,
        };
    }

    let gluten_regex = Regex::new(r"(sans|faible en|éviter le|ne contient pas de) gluten").unwrap();
        if gluten_regex.is_match(&q) {
            return IntentResult {
                intent: "produits_sans_gluten",
                entity: None,
            };
        }
 
    IntentResult {
        intent: "unknown",
        entity: None,
    }
}


#[tauri::command]
pub async fn chatbot_query(message: String, user_id: i32, role: String, state: tauri::State<'_, AppState>,) -> Result<String, String> {
    let pool: &PgPool = &state.db;
    let result = analyze_intent(&message);
    let intent = result.intent;
    let entity = result.entity;

    match intent {

        // SECTION RH

         "conges" => {
            let result = sqlx::query_scalar!(
                r#"
                SELECT COALESCE(SUM(date_fin - date_debut + 1), 0)
                FROM conges
                WHERE employe_id = $1 AND statut = 'Approuvé'
                "#,
                user_id
            )
            .fetch_one(pool)
            .await
            .map_err(|e| e.to_string())?;

            let pris = result.unwrap_or(0);
            let restants = 14 - pris;
            let response = format!("🗓️ Vous avez utilisé {} jour(s) de congé. Il vous en reste {}.", pris, restants);
            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }


        "conges_en_attente" => {
            let rows = sqlx::query!(
                r#"
                SELECT date_debut, date_fin, type_conge, statut
                FROM conges
                WHERE employe_id = $1 AND statut != 'Approuvé'
                "#,
                user_id
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            let response = if rows.is_empty() {
                "Aucun congé en attente ou refusé.".to_string()
            } else {
                rows.into_iter()
            .map(|c| format!("📆 {} → {} : {} ({})", c.date_debut, c.date_fin, c.type_conge.unwrap_or_default(), c.statut.unwrap_or_default()))
            .collect::<Vec<_>>()
            .join("\n")
            };

            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }

        "meilleure_eval" => {
            let row = sqlx::query!(
                r#"
                SELECT ponctualite, assiduite, service_client, outils, respect_consignes, rendement, date_evaluation
                FROM indicateurs_rh
                WHERE employee_id = $1
                ORDER BY (ponctualite + assiduite + service_client + outils + respect_consignes + rendement) DESC
                LIMIT 1
                "#,
                user_id
            )
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

            let response = match row {
                Some(r) => format!(
                    "🏆 Meilleure évaluation ({}):\n🕒 Ponctualité: {}, Assiduité: {}, Client: {}, Outils: {}, Consignes: {}, Rendement: {}",
                    r.date_evaluation,
                    r.ponctualite.unwrap_or(0),
                    r.assiduite.unwrap_or(0),
                    r.service_client.unwrap_or(0),
                    r.outils.unwrap_or(0),
                    r.respect_consignes.unwrap_or(0),
                    r.rendement.unwrap_or(0)
                ),
                None => "Aucune évaluation trouvée.".to_string()
            };

            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }

        "evenements" => {
            let rows = sqlx::query!(
                r#"
                SELECT titre, date_debut, heure_debut
                FROM evenements
                WHERE employee_id = $1 AND date_debut >= CURRENT_DATE
                ORDER BY date_debut, heure_debut
                "#,
                user_id
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            if rows.is_empty() {
                let response = "📭 Aucun événement à venir.".to_string();
                log_interaction(user_id, &message, &response, pool).await;
                Ok(response)        
            } else {
                let list = rows
                    .into_iter()
                    .map(|e| {
                        let heure = e.heure_debut.map(|h| h.format("%Hh%M").to_string()).unwrap_or("Heure inconnue".to_string());
                        format!("📅 {} à {} : {}", e.date_debut, heure, e.titre)
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                log_interaction(user_id, &message, &list, pool).await;
                Ok(list)
            }
        }


        // SECTION FORMATION

        "routes" => {
            if let Some(jour) = entity {
                let row = sqlx::query!(
                    "SELECT contenu FROM formations WHERE titre ILIKE '%routes%'"
                )
                .fetch_optional(pool)
                .await
                .map_err(|e| e.to_string())?;

                if let Some(r) = row {
                    let contenu = r.contenu.to_lowercase();
                    if contenu.contains(&jour) {
                        Ok(format!("📦 Route du {} :\n\n{}", jour, contenu))
                    } else {
                        Ok(format!("Je n’ai rien trouvé sur les routes du {}.", jour))
                    }
                } else {
                    Ok("Aucune formation sur les routes trouvée.".to_string())
                }
            } else {
                Ok("Quel jour souhaitez-vous ? Exemple : route du mercredi.".to_string())
            }
        }

        "formation_contenu" => {
            let lower = message.to_lowercase();

            let rows = sqlx::query!(
                "SELECT titre, contenu FROM formations"
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            let match_found = rows.into_iter().find(|f| {
                f.titre.to_lowercase().contains(&lower) || f.contenu.to_lowercase().contains(&lower)
            });

             let response = match match_found {
                Some(f) => {
                    let resume = f.contenu.chars().take(300).collect::<String>();
                    format!("📘 Extrait de **{}** :\n\n{}...", f.titre, resume)
                },
                None => "Je n’ai rien trouvé dans les modules de formation correspondant à votre question.".to_string()
            };

            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }

        // SECTION VENTES

        "ventes" => {
            if role.to_lowercase() != "admin" {
                let response = "❌ Cette information est réservée aux administrateurs.".to_string();
                log_interaction(user_id, &message, &response, pool).await;
                return Ok(response);
            }

            let rows = sqlx::query!(
                r#"
                SELECT e.prenom, e.nom, COUNT(*) as total, SUM(CASE WHEN t.hit_click THEN 1 ELSE 0 END) AS total_hits
                FROM televente_entries t
                JOIN employees e ON e.id = t.employee_id
                WHERE t.date = CURRENT_DATE
                GROUP BY e.id
                ORDER BY total DESC
                "#
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            let response = if rows.is_empty() {
                "📭 Aucune vente enregistrée aujourd’hui.".to_string()
            } else {
                rows.into_iter()
                    .map(|r| format!("👤 {} {} : {} vente(s), {} hit(s)", r.prenom.unwrap_or_default(), r.nom.unwrap_or_default(), r.total.unwrap_or(0), r.total_hits.unwrap_or(0)))
                    .collect::<Vec<_>>()
                    .join("\n")
            };

            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }

        "mes_ventes" => {
            let rows = sqlx::query!(
                r#"
                SELECT date, COUNT(*) as total, SUM(CASE WHEN hit_click THEN 1 ELSE 0 END) as hits
                FROM televente_entries
                WHERE employee_id = $1
                GROUP BY date
                ORDER BY date DESC
                "#,
                user_id
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            let response = if rows.is_empty() {
                "Vous n'avez effectué aucune vente récemment.".to_string()
            } else {
                rows.into_iter()
                    .map(|r| format!("📆 {} : {} vente(s), {} hit(s)", r.date, r.total.unwrap_or(0), r.hits.unwrap_or(0)))
                    .collect::<Vec<_>>()
                    .join("\n")
            };

            log_interaction(user_id, &message, &response, pool).await;
            Ok(response)
        }

        // SECTION PRODUITS

        "produits_sans_gluten" => {
            let rows = sqlx::query!(
                "SELECT nom FROM produits_alimentaires WHERE description ILIKE '%sans gluten%'"
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            if rows.is_empty() {
                let alternatifs = sqlx::query!(
                    "SELECT nom FROM produits_alimentaires WHERE description ILIKE '%faible en gluten%'"
                )
                .fetch_all(pool)
                .await
                .map_err(|e| e.to_string())?;
                
                if alternatifs.is_empty() {
                    let response = "😕 Aucun produit sans gluten trouvé dans la base.".to_string();
                    log_interaction(user_id, &message, &response, pool).await;
                    Ok(response)
                } else {
                    let liste = alternatifs
                        .into_iter()
                        .map(|p| format!("⚠️ {}", p.nom))
                        .collect::<Vec<_>>()
                        .join("\n");
                    let response = format!(
                        "❌ Aucun produit strictement sans gluten trouvé. Voici des produits faibles en gluten :\n{}",
                        liste
                    );
                    log_interaction(user_id, &message, &response, pool).await;
                    Ok(response)
                }
            } else {
                let liste = rows
                    .into_iter()
                    .map(|p| format!("✅ {}", p.nom))
                    .collect::<Vec<_>>()
                    .join("\n");
                let response = format!("Voici les produits sans gluten :\n{}", liste);
                log_interaction(user_id, &message, &response, pool).await;
                Ok(response)
            }
        }

        
        "produit_unique" => {
            if let Some(nom) = entity {
                let row = sqlx::query!(
                    "SELECT nom, description FROM produits_alimentaires WHERE LOWER(nom) ILIKE $1",
                    format!("%{}%", nom)
                )
                .fetch_optional(pool)
                .await
                .map_err(|e| e.to_string())?;

                let response = match row {
                    Some(p) => format!("📦 **{}**\n\n{}", p.nom, p.description.unwrap_or("Pas de description disponible.".to_string())),
                    None => format!("🤖 Désolé, je ne trouve aucun produit nommé \"{}\".", nom),
                };

                log_interaction(user_id, &message, &response, pool).await;
                Ok(response)
            } else {
                let response = "Quel produit voulez-vous que je décrive ? Exemple : \"C’est quoi le produit agave ?\"".to_string();
                log_interaction(user_id, &message, &response, pool).await;
                Ok(response)
            }
        }


        _ => Ok("Je n’ai pas compris votre question. Essayez avec : 'Combien de congés me reste-t-il ?'".to_string()),
    }
}
    