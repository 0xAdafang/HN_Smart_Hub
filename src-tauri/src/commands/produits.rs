use crate::{models::ProduitAlimentaire, AppState};
use sqlx::FromRow;

#[tauri::command]
pub async fn get_all_produits(state: tauri::State<'_, AppState>) -> Result<Vec<ProduitAlimentaire>, String> {
    sqlx::query_as::<_, ProduitAlimentaire>("SELECT * FROM produit_alimentaire ORDER BY nom")
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