use std::{env, io::Write, process::{Command, Stdio}};
use tempfile::NamedTempFile;
use serde_json::json;

#[tauri::command]
pub async fn ask_chatbot(message: String, role: String, user_id: String) -> Result<String, String> {
    // 1. Créer fichier JSON temporaire
    let mut temp_file = NamedTempFile::new().map_err(|e| e.to_string())?;
    let json_payload = json!({
        "message": message,
        "role": role,
        "user_id": user_id
    });

    write!(temp_file, "{}", json_payload.to_string()).map_err(|e| e.to_string())?;

    // 2. Construire le chemin vers assistant.exs
    let current_dir = env::current_dir().map_err(|e| e.to_string())?;
    let assistant_path = current_dir.join("assistant/assistant.exs");

    // 3. Spécifier chemin vers Elixir (local)
    let elixir_path = "C:\\Program Files\\Elixir\\bin\\elixir.bat";

    // 4. Appeler Elixir
    let output = Command::new(elixir_path)
        .arg(assistant_path)
        .arg(temp_file.path())
        .output()
        .map_err(|e| format!("Erreur exécution Elixir : {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("❌ Elixir a échoué :\n{}", err));
    }

    // 5. Récupérer la réponse
    let response = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(response.trim().to_string())
}
