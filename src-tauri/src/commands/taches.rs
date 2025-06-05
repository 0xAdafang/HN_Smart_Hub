use tauri::State;
use crate::AppState;
use crate::models::Tache;
use chrono::NaiveDate;





#[tauri::command]
pub async fn get_tasks_for_day(employee_id: i32, date: String, state: State<'_, AppState>,) -> Result<Vec<Tache>, String> {
    let date_parsed = NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| e.to_string())?;

    let tasks = sqlx::query_as!(
        Tache,
        r#"
        SELECT id, description,
               TO_CHAR(heure, 'HH24:MI') as heure,
               start_date,
               end_date,
               statut
        FROM taches_utilisateur
        WHERE employee_id = $1
          AND start_date <= $2
          AND (end_date IS NULL OR end_date >= $2)
        "#,
        employee_id,
        date_parsed
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(tasks)
}