#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;

use commands::televente::{add_televente_entry, get_all_televente_entries, get_televente_entries_by_date, get_user_achievements, unlock_achievement};
use tauri::{Builder, State};
use dotenvy::dotenv;
use sqlx::PgPool;
use std::env;
use std::sync::Arc;

use commands::{comptes::*, indicateurs::*, conges::*};
use commands::conges::demande_conge;



pub struct AppState {
    pub db: Arc<PgPool>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL manquant dans .env");

    let db = PgPool::connect(&database_url)
        .await
        .expect("Connexion à la base PostgreSQL échouée");

    Builder::default()
        .manage(AppState {
            db: Arc::new(db),
        })
        .invoke_handler(tauri::generate_handler![
            // Comptes
            login_user,
            create_user_and_employee,
            get_all_users,
            update_user_role,
            delete_user_and_employee,
            // RH
            get_employes_non_admins,
            submit_evaluation,
            get_all_evaluations,
            get_user_evaluation,
            delete_evaluation,
            reset_user_password,
            // Congés
            demande_conge,
            get_mes_conges,
            get_all_conges, 
            update_statut_conge,
            // Televente
            add_televente_entry,
            get_televente_entries_by_date,
            unlock_achievement,
            get_user_achievements,
            get_all_televente_entries,
        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de l'application");
}
