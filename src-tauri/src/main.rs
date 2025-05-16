#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::NaiveDate;
use tauri::{Builder, State};
use serde::Deserialize;
use sqlx::{ PgPool};
use std::sync::Arc;
use dotenvy::dotenv;
use std::env;

#[derive(Deserialize)]
struct LoginPayload {
    username: String,
    password: String,
}

#[derive(serde::Serialize)]
struct LoginResponse {
    username: String,
    role: String,
    prenom: String,
    nom: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
struct EmployeLite {
    id: i32,
    prenom: Option<String>,
    nom: Option<String>,
}

#[derive(serde::Deserialize)]
struct UserEvalQuery {
    prenom: String,
    nom: String,
}

#[derive(serde::Deserialize)]
struct EvaluationPayload {
    employee_id: i32,
    ponctualite: i16,
    assiduite: i16,
    service_client: i16,
    outils: i16,
    respect_consignes: i16,
    rendement: i16,
    redressements: Option<String>,
    consequences: Option<String>,
}

#[derive(serde::Serialize, Debug)]
struct EvaluationDetail {
    id: i32,
    employee_id: Option<i32>,
    prenom: Option<String>,
    nom: Option<String>,
    date_evaluation: NaiveDate,
    ponctualite: Option<i16>,
    assiduite: Option<i16>,
    service_client: Option<i16>,
    outils: Option<i16>,
    respect_consignes: Option<i16>,
    rendement: Option<i16>,
    redressements: Option<String>,
    consequences: Option<String>,
}

// Contient la connexion PostgreSQL partagée
struct AppState {
    db: Arc<PgPool>,
}

#[tauri::command]
async fn login_user(payload: LoginPayload, state: State<'_, AppState>) -> Result<LoginResponse, String> {
    let result = sqlx::query!(
        r#"
        SELECT u.username, u.role, e.prenom, e.nom
        FROM users u
        JOIN employees e ON u.id = e.user_id
        WHERE u.username = $1 AND u.password = $2
        "#,
        payload.username,
        payload.password
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| format!("Erreur SQL : {}", e))?;

    match result {
        Some(row) => Ok(LoginResponse {
            username: row.username,
            role: row.role,
            prenom: row.prenom.unwrap_or_default(),
            nom: row.nom.unwrap_or_default(),
        }),
        None => Err("Identifiants invalides.".into()),
    }
}

#[tauri::command]
async fn get_employes_non_admins(state: tauri::State<'_, AppState>) -> Result<Vec<EmployeLite>, String> {
    let result = sqlx::query_as!(
        EmployeLite,
        r#"
        SELECT e.id, e.prenom, e.nom
        FROM employees e
        JOIN users u ON e.user_id = u.id
        WHERE u.role = 'User' AND e.actif = true
        ORDER BY e.nom ASC
        "#,
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(result)
}

#[tauri::command]
async fn submit_evaluation(payload: EvaluationPayload, state: tauri::State<'_, AppState>,) -> Result<String, String> {
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
async fn get_all_evaluations(state: tauri::State<'_, AppState>) -> Result<Vec<EvaluationDetail>, String> {
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
        "#,
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;
    Ok(result)
}

#[tauri::command]
async fn get_user_evaluation(payload: UserEvalQuery, state: tauri::State<'_, AppState>) -> Result<Option<EvaluationDetail>, String> {
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
async fn delete_evaluation(id: i32, state: tauri::State<'_, AppState>) -> Result<(), String> {
    sqlx::query!("DELETE FROM indicateurs_rh WHERE id = $1", id)
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Erreur DB : {}", e))?;
    Ok(())
}


#[tokio::main]
async fn main() {
    // Charge les variables .env
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL manquant dans .env");

    // Connexion à PostgreSQL avec sqlx
    let db = PgPool::connect(&database_url)
        .await
        .expect("Connexion à la base PostgreSQL échouée");

    // Lancement de l'app Tauri avec la BDD injectée
    Builder::default()
        .manage(AppState {
            db: Arc::new(db),
        })
        .invoke_handler(tauri::generate_handler![login_user, get_employes_non_admins, submit_evaluation, get_all_evaluations,delete_evaluation, get_user_evaluation,])
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de l'application");
}
