use std::sync::Arc;

use serde::{Serialize, Deserialize};
use tauri::State;
use crate::AppState;
use crate::models::{CongeAvecEmploye, Conges, DemandeCongesPayload, GetCongesPayload};

#[tauri::command]
pub async fn demande_conge(payload: DemandeCongesPayload, state: tauri::State<'_, AppState>,) -> Result<(), String> {
    sqlx::query!(
        r#"
        INSERT INTO conges (employe_id, date_debut, date_fin, type_conge, statut)
        VALUES ($1, $2, $3, $4, 'En attente')
        "#,
        payload.employe_id,
        payload.date_debut,
        payload.date_fin,
        payload.type_conge
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur insertion congé: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_mes_conges(payload: GetCongesPayload, state: tauri::State<'_, AppState>,) -> Result<Vec<Conges>, String> {
    let result = sqlx::query_as!(
        Conges,
        r#"
        SELECT id, employe_id, date_debut, date_fin, type_conge, statut
        FROM conges
        WHERE employe_id = $1
        ORDER BY date_debut DESC
        "#,
        payload.employe_id
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur SQL : {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn get_all_conges(state: State<'_, AppState>) -> Result<Vec<CongeAvecEmploye>, String> {
    let conges = sqlx::query_as_unchecked!(
        CongeAvecEmploye,
        r#"
        SELECT 
            c.id,
            e.nom,
            e.prenom,
            c.type_conge as "type_conge?",
            c.date_debut,
            c.date_fin,
            c.statut as "statut?"
        FROM conges c
        JOIN employees e ON c.employe_id = e.id
        ORDER BY c.date_debut DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(conges)
}

#[tauri::command]
pub async fn update_statut_conge(id: i32, statut: String, state: State<'_, AppState>) -> Result<(), String> {
    if statut != "Approuvé" && statut != "Refusé" {
        return Err("❌ Statut invalide".into());
    }
    sqlx::query!(
        "UPDATE conges SET statut = $1 WHERE id = $2",
        statut,
        id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur SQL : {}", e))?;

    Ok(())
}