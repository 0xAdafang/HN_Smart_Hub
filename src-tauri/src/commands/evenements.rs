use chrono::{NaiveDate, NaiveTime};
use tauri::State;
use crate::{models::{EmployeIdArgs, Evenement, ModifierEvenementArgs, NouvelEvenement}, AppState};

#[tauri::command]
pub async fn ajouter_evenement(evt: NouvelEvenement,state: tauri::State<'_, AppState>,) -> Result<(), String> {
    use chrono::{NaiveDate, NaiveTime};

    let date_debut = NaiveDate::parse_from_str(&evt.date_debut, "%Y-%m-%d")
    .map_err(|e| e.to_string())?;

    let date_fin = match &evt.date_fin {
        Some(d) => Some(NaiveDate::parse_from_str(d, "%Y-%m-%d").map_err(|e| e.to_string())?),
        None => None,
    };

    let heure_debut = match &evt.heure_debut {
        Some(h) => Some(NaiveTime::parse_from_str(h, "%H:%M").map_err(|e| e.to_string())?),
        None => None,
    };

    let heure_fin = match &evt.heure_fin {
        Some(h) => Some(NaiveTime::parse_from_str(h, "%H:%M").map_err(|e| e.to_string())?),
        None => None,
    };

    sqlx::query!(
        "INSERT INTO evenements (employee_id, titre, date_debut, date_fin, heure_debut, heure_fin)
         VALUES ($1, $2, $3, $4, $5, $6)",
        evt.employee_id,
        evt.titre,
        date_debut,
        date_fin,
        heure_debut,
        heure_fin
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur base de données: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn supprimer_evenement(state: State<'_, AppState>, id: i32,) -> Result<(), String> {
    sqlx::query!("DELETE FROM evenements WHERE id = $1", id)
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Erreur suppression : {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_evenements_par_employe(state: State<'_, AppState>,args: EmployeIdArgs,) -> Result<Vec<Evenement>, String> {
    let rows = sqlx::query_as!(
        Evenement,
        r#"
        SELECT
        id,
        titre,
        date_debut::TEXT as "date_debut!",
        date_fin::TEXT as "date_fin?",
        heure_debut::TEXT as "heure_debut?",
        heure_fin::TEXT as "heure_fin?",
        created_at::TEXT as "created_at!"
        FROM evenements
        WHERE employee_id = $1
        ORDER BY date_debut
        "#,
        args.employee_id
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur lecture : {}", e))?;

    Ok(rows)
}

#[tauri::command]
pub async fn modifier_evenement(state: State<'_, AppState>,args: ModifierEvenementArgs,) -> Result<(), String> {

    let date_debut = NaiveDate::parse_from_str(&args.date_debut, "%Y-%m-%d")
        .map_err(|e| format!("Erreur parsing date_debut : {}", e))?;

    let date_fin = match &args.date_fin {
        Some(date_str) => Some(NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
            .map_err(|e| format!("Erreur parsing date_fin : {}", e))?),
        None => None,
    };

    let heure_debut = match &args.heure_debut {
        Some(h) => Some(NaiveTime::parse_from_str(h, "%H:%M").map_err(|e| e.to_string())?),
        None => None,
    };

    let heure_fin = match &args.heure_fin {
        Some(h) => Some(NaiveTime::parse_from_str(h, "%H:%M").map_err(|e| e.to_string())?),
        None => None,
    };

    sqlx::query!(
        "UPDATE evenements
        SET titre = $1, date_debut = $2, date_fin = $3, heure_debut = $4, heure_fin = $5
        WHERE id = $6",
        args.titre,
        date_debut,
        date_fin,
        heure_debut,
        heure_fin,
        args.id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur modification : {}", e))?;

    Ok(())
}