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

        other => {
            println!("⚠️ Type d'action non supporté : {:?}", other);
            Err("Type d'action inconnu".into())
        }
    }
}
