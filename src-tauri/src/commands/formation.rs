use crate::models::{Formation, QuizResult};
use sqlx::FromRow;

#[tauri::command]
pub async fn get_all_formations(state: tauri::State<'_, sqlx::PgPool>) -> Result<Vec<Formation>, String> {
    sqlx::query_as::<_, Formation>("SELECT * FROM formations ORDER BY id")
        .fetch_all(&*state)
        .await
        .map_err(|e| format!("Erreur récupération formations : {}", e))
}

#[tauri::command]
pub async fn get_formation_by_code(code: String, state: tauri::State<'_, sqlx::PgPool>) -> Result<Formation, String> {
    sqlx::query_as::<_, Formation>(
        "SELECT * FROM formations WHERE code = $1"
    )
    .bind(code)
    .fetch_one(&*state)
    .await
    .map_err(|e| format!("Erreur récupération module : {}", e))
}

#[tauri::command]
pub async fn submit_quiz_result(employee_id: i32, formation_code: String, score: i32, state: tauri::State<'_, sqlx::PgPool>) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO quiz_results (formation_code, employee_id, score) VALUES ($1, $2, $3)"
    )
    .bind(formation_code)
    .bind(employee_id)
    .bind(score)
    .execute(&*state)
    .await
    .map_err(|e| format!("Erreur insertion résultat : {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn get_employee_quiz_results(employee_id: i32, state: tauri::State<'_, sqlx::PgPool>) -> Result<Vec<QuizResult>, String> {
    sqlx::query_as::<_, QuizResult>(
        "SELECT * FROM quiz_results WHERE employee_id = $1 ORDER BY date_completed DESC"
    )
    .bind(employee_id)
    .fetch_all(&*state)
    .await
    .map_err(|e| format!("Erreur résultats : {}", e))
}