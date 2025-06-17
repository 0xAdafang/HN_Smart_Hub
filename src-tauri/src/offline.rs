use tauri::State;
use serde_json::Value;
use crate::AppState;
use chrono::NaiveDate;

#[tauri::command]
pub async fn save_offline_action(payload: Value, state: State<'_, AppState>) -> Result<String, String> {
    println!("🎯 Reçu (offline) : {:?}", payload);

    match payload.get("type").and_then(|v| v.as_str()) {
        Some("televente") => {
            let date_str = payload.get("date").and_then(|v| v.as_str()).unwrap_or("");
            let date = chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
                .map_err(|e| format!("Invalid date format: {}", e))?;
            let client_name = payload.get("client_name").and_then(|v| v.as_str()).unwrap_or("");
            let client_number = payload.get("client_number").and_then(|v| v.as_str()).unwrap_or("");
            let product_code = payload.get("product_code").and_then(|v| v.as_str()).unwrap_or("");
            let product_name = payload.get("product_name").and_then(|v| v.as_str()).unwrap_or("");
            let category = payload.get("category").and_then(|v| v.as_str()).unwrap_or("autres");
            let quantity = payload.get("quantity").and_then(|v| v.as_i64()).unwrap_or(1) as i32;
            let hit_click = payload.get("hit_click").and_then(|v| v.as_bool()).unwrap_or(false);
            let employee_id = payload.get("employee_id").and_then(|v| v.as_i64()).unwrap_or(0);

            let employee_id = employee_id as i32;

            println!("✅ Vente restaurée depuis offline : {} - {} - {} x{}", client_name, product_name, product_code, quantity);

            sqlx::query!(
                "INSERT INTO televente_entries (date, client_name, client_number, product_code, product_name, category, quantity, hit_click, employee_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                date,
                client_name,
                client_number,
                product_code,
                product_name,
                category,
                quantity,
                hit_click,
                employee_id
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur DB : {:?}", e))?;

            

            Ok("ok".to_string())

        }
    
        Some("produit_ajout") => {
            let nom = payload.get("nom").and_then(|v| v.as_str()).unwrap_or("");
            let description = payload.get("description").and_then(|v| v.as_str()).unwrap_or("");
            println!("➕ Ajout produit offline : {nom}");

            sqlx::query!(
                "INSERT INTO produits_alimentaires (nom, description) VALUES ($1, $2)",
                nom,
                description
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur ajout produit : {:?}", e))?;
            Ok("ok".into())
        }

        Some("produit_modif") => {
            let id = payload.get("id").and_then(|v| v.as_i64()).unwrap_or(0);
            let nom = payload.get("nom").and_then(|v| v.as_str()).unwrap_or("");
            let description = payload.get("description").and_then(|v| v.as_str()).unwrap_or("");
            println!("✏️ Modification produit offline id {id}");

            sqlx::query!(
                "UPDATE produits_alimentaires SET nom = $1, description = $2 WHERE id = $3",
                nom,
                description,
                id as i32
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur modif produit : {:?}", e))?;
            Ok("ok".into())
        }

        Some("produit_suppression") => {
            let id = payload.get("id").and_then(|v| v.as_i64()).unwrap_or(0);
            println!("🗑️ Suppression produit offline id {id}");

            sqlx::query!(
                "DELETE FROM produits_alimentaires WHERE id = $1",
                id as i32
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur suppression produit : {:?}", e))?;
            Ok("ok".into())
        }

        Some("conge_demande") => {
            println!("📅 Demande de congé offline reçue");

            let employe_id = payload
                .get("employe_id")
                .and_then(|v| v.as_i64())
                .unwrap_or(0) as i32;

            let date_debut_str = payload
                .get("date_debut")
                .and_then(|v| v.as_str())
                .unwrap_or("");

            let date_fin_str = payload
                .get("date_fin")
                .and_then(|v| v.as_str())
                .unwrap_or("");

            let date_debut = chrono::NaiveDate::parse_from_str(date_debut_str, "%Y-%m-%d")
                .map_err(|e| format!("Invalid date_debut format: {}", e))?;

            let date_fin = chrono::NaiveDate::parse_from_str(date_fin_str, "%Y-%m-%d")
                .map_err(|e| format!("Invalid date_fin format: {}", e))?;

            let type_conge = payload
                .get("type_conge")
                .and_then(|v| v.as_str())
                .unwrap_or("Autre")
                .to_string();

            sqlx::query!(
                "INSERT INTO conges (employe_id, date_debut, date_fin, type_conge, statut) VALUES ($1, $2, $3, $4, 'En attente')",
                employe_id,
                date_debut,
                date_fin,
                type_conge
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur insertion congé offline : {:?}", e))?;

            println!("✅ Congé offline inséré avec succès");
            Ok("ok".into())
        }

        Some("evenement") => {
            println!("📅 Événement offline reçu");

            let employee_id = payload
                .get("employee_id")
                .and_then(|v| v.as_i64())
                .unwrap_or(0) as i32;

            let titre = payload
                .get("titre")
                .and_then(|v| v.as_str())
                .unwrap_or("Événement")
                .to_string();

            let date_debut_str = payload
                .get("date_debut")
                .and_then(|v| v.as_str())
                .unwrap_or("");

            let date_debut = chrono::NaiveDate::parse_from_str(date_debut_str, "%Y-%m-%d")
                .map_err(|e| format!("Invalid date_debut format: {}", e))?;

            let date_fin = payload
                .get("date_fin")
                .and_then(|v| v.as_str())
                .map(|s| chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d").ok())
                .flatten();

            let heure_debut = payload
                .get("heure_debut")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono::NaiveTime::parse_from_str(s, "%H:%M").ok());

            let heure_fin = payload
                .get("heure_fin")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono::NaiveTime::parse_from_str(s, "%H:%M").ok());

            sqlx::query!(
                "INSERT INTO evenements (employee_id, titre, date_debut, date_fin, heure_debut, heure_fin) VALUES ($1, $2, $3, $4, $5, $6)",
                employee_id,
                titre,
                date_debut,
                date_fin,
                heure_debut,
                heure_fin
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur DB (événement offline) : {:?}", e))?;

            println!("✅ Événement offline inséré avec succès");
            Ok("ok".to_string())
        }

        Some("evenement_modif") => {
            println!("🖊️ Modification offline événement reçue");

            let id = payload.get("id").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
            let titre = payload.get("titre").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let date_debut_str = payload.get("date_debut").and_then(|v| v.as_str()).unwrap_or("");
            let date_debut = chrono::NaiveDate::parse_from_str(date_debut_str, "%Y-%m-%d")
                .map_err(|e| format!("Invalid date_debut format: {}", e))?;
            let date_fin = payload
                .get("date_fin")
                .and_then(|v| v.as_str())
                .map(|s| chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d").ok())
                .flatten();
            let heure_debut = payload.get("heure_debut")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono::NaiveTime::parse_from_str(s, "%H:%M").ok());
            let heure_fin = payload.get("heure_fin")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono::NaiveTime::parse_from_str(s, "%H:%M").ok());

            sqlx::query!(
                "UPDATE evenements SET titre = $1, date_debut = $2, date_fin = $3, heure_debut = $4, heure_fin = $5 WHERE id = $6",
                titre,
                date_debut,
                date_fin,
                heure_debut,
                heure_fin,
                id
            )
            .execute(&*state.db)
            .await
            .map_err(|e| format!("Erreur update événement offline : {:?}", e))?;

            println!("✅ Événement modifié offline avec succès");
            Ok("ok".to_string())
        }

        Some("evenement_suppression") => {
            println!("🗑️ Suppression offline événement reçue");

            let id = payload.get("id").and_then(|v| v.as_i64()).unwrap_or(0) as i32;

            sqlx::query!("DELETE FROM evenements WHERE id = $1", id)
                .execute(&*state.db)
                .await
                .map_err(|e| format!("Erreur suppression événement offline : {:?}", e))?;

            println!("✅ Événement supprimé offline avec succès");
            Ok("ok".to_string())
        }

        other => {
            println!("⚠️ Type d'action non supporté : {:?}", other);
            Err("Type d'action inconnu".into())
        }
    }
}
