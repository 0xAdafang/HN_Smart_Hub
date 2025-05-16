#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Builder, State};
use serde::Deserialize;
use sqlx::{query_scalar, PgPool};
use std::sync::Arc;
use dotenvy::dotenv;
use std::env;

#[derive(Deserialize)]
struct LoginPayload {
    username: String,
    password: String,
}

// Contient la connexion PostgreSQL partagée
struct AppState {
    db: Arc<PgPool>,
}

#[command]
async fn login_user(payload: LoginPayload, state: State<'_, AppState>) -> Result<String, String> {
    // Requête SQL pour vérifier les identifiants
    let count = query_scalar!(
        r#"
        SELECT COUNT(*) as "count!"
        FROM users
        WHERE username = $1 AND password = $2
        "#,
        payload.username,
        payload.password
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|e| format!("Erreur SQL: {}", e))?;

    if count == 1 {
        Ok(format!("Bienvenue, {} !", payload.username))
    } else {
        Err("Identifiants invalides.".into())
    }
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
        .invoke_handler(tauri::generate_handler![login_user])
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de l'application");
}
