#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod offline;



use tauri::{Builder};
use dotenvy::dotenv;
use sqlx::PgPool;
use std::env;
use std::sync::Arc;

use commands::{comptes::*, indicateurs::*, conges::*, televente::*, formation::*, produits::*, evenements::*, chatbot::*};
use commands::conges::demande_conge;

use crate::models::AppState;
use crate::offline::save_offline_action;


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
            get_infos_employe,
            // RH
            get_employes_non_admins,
            submit_evaluation,
            get_all_evaluations,
            get_user_evaluation,
            has_new_evaluation,
            set_evaluation_vue,
            delete_evaluation,
            reset_user_password,
            // Congés
            demande_conge,
            get_mes_conges,
            get_all_conges, 
            update_statut_conge,
            get_conges_restants,
            // Televente
            add_televente_entry,
            get_televente_entries_by_date,
            unlock_achievement,
            get_user_achievements,
            get_all_televente_entries,
            // Formation
            get_all_formations,
            get_formation_by_code,
            submit_quiz_result,
            get_employee_quiz_results,
            get_questions_for_module,
            get_all_quiz_results_with_names,
            // Produits
            get_all_produits,
            rechercher_produits,
            ajouter_produit,
            modifier_produit,
            supprimer_produit,
            // Evenements
            ajouter_evenement,
            supprimer_evenement,
            get_evenements_par_employe,
            modifier_evenement,
            // Chatbot
            chatbot_query,
            // Offline
            save_offline_action,
            
            

        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors du lancement de l'application");
}

