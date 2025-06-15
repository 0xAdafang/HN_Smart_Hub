use crate::models::{Formation, QuizQuestion, QuizResult, QuizResultWithNames, AppState};


#[tauri::command]
pub async fn get_all_formations(state: tauri::State<'_, AppState>) -> Result<Vec<Formation>, String> {
    sqlx::query_as::<_, Formation>("SELECT * FROM formations ORDER BY id")
        .fetch_all(&*state.db)
        .await
        .map_err(|e| format!("Erreur récupération formations : {}", e))
}

#[tauri::command]
pub async fn get_formation_by_code(code: String, state: tauri::State<'_, AppState>) -> Result<Formation, String> {
    sqlx::query_as::<_, Formation>(
        "SELECT * FROM formations WHERE code = $1"
    )
    .bind(code)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| format!("Erreur récupération module : {}", e))
}

#[tauri::command]
pub async fn submit_quiz_result(employee_id: i32, formation_code: String, score: i32, state: tauri::State<'_, AppState>) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO quiz_results (formation_code, employee_id, score) VALUES ($1, $2, $3)"
    )
    .bind(formation_code)
    .bind(employee_id)
    .bind(score)
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur insertion résultat : {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn get_employee_quiz_results(employee_id: i32, state: tauri::State<'_, AppState>) -> Result<Vec<QuizResult>, String> {
    sqlx::query_as::<_, QuizResult>(
        "SELECT * FROM quiz_results WHERE employee_id = $1 ORDER BY date_completed DESC"
    )
    .bind(employee_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur résultats : {}", e))
}

#[tauri::command]
pub async fn get_questions_for_module(formation_code: String, state: tauri::State<'_, AppState>) -> Result<Vec<QuizQuestion>, String> {
    sqlx::query_as::<_, QuizQuestion>(
        "SELECT * FROM quiz_questions WHERE formation_code = $1 ORDER BY id"
    )
    .bind(formation_code)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur récupération questions : {}", e))
}

#[tauri::command]
pub async fn get_all_quiz_results_with_names(state: tauri::State<'_, AppState>) -> Result<Vec<QuizResultWithNames>, String> {
    sqlx::query_as::<_, QuizResultWithNames>(
        r#"
        SELECT q.id, q.employee_id, e.nom, e.prenom, q.formation_code, q.score, q.date_completed
        FROM quiz_results q
        JOIN employees e ON q.employee_id = e.id
        ORDER BY q.date_completed DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur récupération résultats admin : {}", e))
}
