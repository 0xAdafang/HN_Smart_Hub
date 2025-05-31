use crate::{models::ProduitAlimentaire, AppState};
use sqlx::FromRow;

#[tauri::command]
pub async fn get_all_produits(state: tauri::State<'_, AppState>) -> Result<Vec<ProduitAlimentaire>, String> {
    sqlx::query_as::<_, ProduitAlimentaire>("SELECT * FROM produits_alimentaires ORDER BY nom")
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur récupération produits : {}", e))
}

#[tauri::command]
pub async fn rechercher_produits(mot_cle: String, state: tauri::State<'_, AppState>) -> Result<Vec<ProduitAlimentaire>, String> {
    let pattern = format!("%{}%", mot_cle);
    sqlx::query_as::<_, ProduitAlimentaire>(
        "SELECT * FROM produits_alimentaires WHERE nom ILIKE $1 OR description ILIKE $1"
    )
    .bind(pattern)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur recherche produit : {}", e))
}

#[tauri::command]
pub async fn ajouter_produit(nom: String, description: Option<String>, state: tauri::State<'_, AppState>, ) -> Result<(), String> {
    sqlx::query("INSERT INTO produits_alimentaires (nom, description) VALUES ($1, $2)")
        .bind(nom)
        .bind(description)
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Erreur ajout produit : {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn modifier_produit(id: i32, nom: String, description: Option<String>, state: tauri::State<'_, AppState>,) -> Result<(), String> {
    sqlx::query("UPDATE produits_alimentaires SET nom = $1, description = $2 WHERE id = $3")
        .bind(nom)
        .bind(description)
        .bind(id)
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Erreur modification produit : {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn supprimer_produit(id: i32, state: tauri::State<'_, AppState>,) -> Result<(), String> {
    sqlx::query("DELETE FROM produits_alimentaires WHERE id = $1")
        .bind(id)
        .execute(&*state.db)
        .await
        .map_err(|e| format! ("Erreur suppression produit : {}", e))?;

    Ok(())
}

