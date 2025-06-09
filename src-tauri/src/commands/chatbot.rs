use sqlx::PgPool;
use crate::AppState;

fn match_intent(question : &str) -> Option<&'static str> {
    let q = question.to_lowercase();

    if q.contains("congé") {
        Some("conges")
    } else if q.contains("événement") || q.contains("évènement") || q.contains("calendrier") {
        Some("evenements")
    } else if q.contains("formation") {
        Some("formation")
    } else if q.contains("route") {
        Some("routes")
    } else if q.contains("vente") {
        Some("ventes")
    } else {
        None
    }
}

#[tauri::command]
pub async fn chatbot_query(message: String, id: i32, role: String, state: tauri::State<'_, AppState>,) -> Result<String, String> {
    let pool: &PgPool = &state.db;
    let intent = match_intent(&message);

    match intent {
        // SECTION RH
         Some("conges") => {
            
            let result = sqlx::query_scalar!(
                r#"
                SELECT
                    COALESCE(SUM(date_fin - date_debut + 1), 0) AS jours_pris
                FROM conges
                WHERE employe_id = $1
                AND statut = 'Approuvé'
                "#,
                id
            )
            .fetch_one(pool)
            .await
            .map_err(|e| e.to_string())?;

            let jours_total = 14;
            let jours_restants = jours_total - result.unwrap_or(0);

            Ok(format!(
                "Vous avez utilisé {} jour(s) de congé. Il vous en reste {}. 🏖️",
                jours_total - jours_restants,
                jours_restants
            ))
        }

        Some("rh") => {
            let row = sqlx::query!(
                r#"
                SELECT ponctualite, assiduite, service_client, outils, respect_consignes, rendement, date_evaluation
                FROM indicateurs_rh
                WHERE employee_id = $1
                ORDER BY date_evaluation DESC
                LIMIT 1
                "#,
                id
            )
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

            match row {
                Some(r) => Ok(format!(
                    "📋 Évaluation du {} :\n🕒 Ponctualité : {}\n📈 Assiduité : {}\n🤝 Service client : {}\n🛠️ Outils : {}\n⚠️ Consignes : {}\n⚡ Rendement : {}",
                    r.date_evaluation,
                    r.ponctualite.unwrap_or(0),
                    r.assiduite.unwrap_or(0),
                    r.service_client.unwrap_or(0),
                    r.outils.unwrap_or(0),
                    r.respect_consignes.unwrap_or(0),
                    r.rendement.unwrap_or(0)
                )),
                None => Ok("🔍 Aucune évaluation trouvée.".to_string()),
            }
        }

        Some("evenements") => {
            let rows = sqlx::query!(
                r#"
                SELECT titre, date_debut, heure_debut
                FROM evenements
                WHERE employee_id = $1 AND date_debut >= CURRENT_DATE
                ORDER BY date_debut, heure_debut
                "#,
                id
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            if rows.is_empty() {
                Ok("📭 Vous n'avez aucun événement à venir.".to_string())
            } else {
                let list = rows
                    .into_iter()
                    .map(|e| {
                        let date_str = e.date_debut.format("%d/%m/%Y").to_string();
                        let heure_str = e.heure_debut.map(|h| h.format("%Hh%M").to_string()).unwrap_or("Heure inconnue".to_string());
                        format!("📅 {date_str} à {heure_str} : {}", e.titre)
                    })
                    .collect::<Vec<_>>()
                    .join("\n");

                Ok(list)
            }
        }


        // SECTION FORMATION
        Some("routes") => {
            
            let jour = "mercredi";
            let row = sqlx::query_scalar!(
                "SELECT contenu FROM formations WHERE titre ILIKE $1",
                format!("%{}%", jour)
            )
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

            match row {
                Some(contenu) => Ok(format!("🛣️ Route du {} : {}", jour, contenu)),
                None => Ok("Je n’ai rien trouvé sur les routes ce jour-là 😢".to_string()),
            }
        }


        // SECTION VENTES

        Some("ventes") => {
            if role.to_lowercase() != "admin" {
                return Ok("❌ Cette information est réservée aux administrateurs.".to_string());
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

            if rows.is_empty() {
                return Ok("📭 Aucune vente enregistrée aujourd’hui.".to_string());
            }

            let summary = rows
                .into_iter()
                .map(|r| {
                    format!(
                        "👤 {} {} : {} vente(s), dont {} hit(s)",
                        r.prenom.unwrap_or_default(),
                        r.nom.unwrap_or_default(),
                        r.total.unwrap_or(0),
                        r.total_hits.unwrap_or(0)
                    )
                })
                .collect::<Vec<_>>()
                .join("\n");

            Ok(format!("📊 Ventes du jour :\n{}", summary))
        }

        // SECTION PRODUITS

        Some("produits_sans_gluten") => {
            let rows = sqlx::query!(
                r#"
                SELECT nom
                FROM produits_alimentaires
                WHERE description ILIKE '%sans gluten%'
                LIMIT 10
                "#
            )
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

            if rows.is_empty() {
                Ok("Aucun produit sans gluten trouvé dans la base.".to_string())
            } else {
                let list = rows
                    .into_iter()
                    .map(|r| format!("✅ {}", r.nom))
                    .collect::<Vec<_>>()
                    .join("\n");

                Ok(format!("🥖 Produits sans gluten :\n{}", list))
            }
        }

        Some("produit_unique") => {
            
            let lower = message.to_lowercase();
            let produit_nom = lower
                .split_whitespace()
                .skip_while(|w| !w.contains("produit"))
                .skip(1)
                .take(3)
                .collect::<Vec<_>>()
                .join(" ");

            if produit_nom.is_empty() {
                return Ok("Quel produit cherchez-vous ? Essayez : \"C'est quoi le produit tofu ?\"".to_string());
            }

            let row = sqlx::query!(
                r#"
                SELECT nom, description FROM produits_alimentaires
                WHERE LOWER(nom) ILIKE $1
                "#,
                format!("%{}%", produit_nom)
            )
            .fetch_optional(pool)
            .await
            .map_err(|e| e.to_string())?;

            match row {
                Some(p) => Ok(format!("📦 **{}**\n\n{}", p.nom, p.description.unwrap_or("Description indisponible".to_string()))),
                None => Ok(format!("Désolé, je ne trouve pas de produit nommé \"{}\" dans la base. 🤖", produit_nom)),
            }
        }


        _ => Ok("Je n’ai pas compris votre question. Essayez avec : 'Combien de congés me reste-t-il ?'".to_string()),
    }
}
    