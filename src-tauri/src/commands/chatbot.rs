use std::{env, io::Write, process::{Command, Stdio}};
use tauri::State;
use tempfile::NamedTempFile;
use serde_json::json;

use crate::{commands::chatbot_logs::log_interaction, models::AppState};

#[tauri::command]
pub async fn ask_chatbot(message: String, role: String, user_id: i32, state: State<'_, AppState>) -> Result<String, String> {
    let mut temp_file = NamedTempFile::new().map_err(|e| e.to_string())?;
    let json_payload = json!({
        "message": message,
        "role": role,
        "user_id": user_id
    });

    write!(temp_file, "{}", json_payload.to_string()).map_err(|e| e.to_string())?;

    let current_dir = env::current_dir().map_err(|e| e.to_string())?;
    let assistant_path = current_dir.join("assistant/assistant.exs");
    let elixir_path = "C:\\Program Files\\Elixir\\bin\\elixir.bat";

    let output = Command::new(elixir_path)
        .arg(assistant_path)
        .arg(temp_file.path())
        .output()
        .map_err(|e| format!("Erreur exécution Elixir : {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("❌ Elixir a échoué :\n{}", err));
    }

    let response = String::from_utf8_lossy(&output.stdout).to_string();
    let response_clean = response.trim();

   
    log_interaction(user_id, &message, response_clean, &state.db).await;

    Ok(response_clean.to_string())
}