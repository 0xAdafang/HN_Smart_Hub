use tauri::State;
use crate::AppState;
use crate::models::{EmployeLite, EvaluationPayload, EvaluationDetail, UserEvalQuery};

#[tauri::command]
pub async fn get_employes_non_admins(state: State<'_, AppState>) -> Result<Vec<EmployeLite>, String> {
    let result = sqlx::query_as!(
        EmployeLite,
        r#"
        SELECT e.id, e.prenom, e.nom
        FROM employees e
        JOIN users u ON e.user_id = u.id
        WHERE u.role = 'User' AND e.actif = true
        ORDER BY e.nom ASC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn submit_evaluation(payload: EvaluationPayload, state: State<'_, AppState>) -> Result<String, String> {
    sqlx::query!(
        r#"
        INSERT INTO indicateurs_rh (
            employee_id, ponctualite, assiduite, service_client, outils,
            respect_consignes, rendement, redressements, consequences, date_evaluation
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
        "#,
        payload.employee_id,
        payload.ponctualite,
        payload.assiduite,
        payload.service_client,
        payload.outils,
        payload.respect_consignes,
        payload.rendement,
        payload.redressements,
        payload.consequences
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok("Évaluation soumise avec succès".to_string())
}

#[tauri::command]
pub async fn get_all_evaluations(state: State<'_, AppState>) -> Result<Vec<EvaluationDetail>, String> {
    let result = sqlx::query_as!(
        EvaluationDetail,
        r#"
        SELECT 
            ir.id,
            ir.employee_id,
            e.prenom,
            e.nom,
            ir.date_evaluation,
            ir.ponctualite,
            ir.assiduite,
            ir.service_client,
            ir.outils,
            ir.respect_consignes,
            ir.rendement,
            ir.redressements,
            ir.consequences
        FROM indicateurs_rh ir
        JOIN employees e ON ir.employee_id = e.id
        ORDER BY ir.date_evaluation DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn get_user_evaluation(payload: UserEvalQuery, state: State<'_, AppState>) -> Result<Option<EvaluationDetail>, String> {
    let result = sqlx::query_as!(
        EvaluationDetail,
        r#"
        SELECT 
            ir.id,
            ir.employee_id,
            e.prenom,
            e.nom,
            ir.date_evaluation,
            ir.ponctualite,
            ir.assiduite,
            ir.service_client,
            ir.outils,
            ir.respect_consignes,
            ir.rendement,
            ir.redressements,
            ir.consequences
        FROM indicateurs_rh ir
        JOIN employees e ON ir.employee_id = e.id
        WHERE e.prenom = $1 AND e.nom = $2
        ORDER BY ir.date_evaluation DESC
        LIMIT 1
        "#,
        payload.prenom,
        payload.nom
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn delete_evaluation(id: i32, state: State<'_, AppState>) -> Result<(), String> {
    sqlx::query!("DELETE FROM indicateurs_rh WHERE id = $1", id)
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(())
}
