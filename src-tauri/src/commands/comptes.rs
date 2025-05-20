use tauri::State;
use sqlx::query_as;
use crate::models::{
    LoginPayload, LoginResponse, RegisterPayload, UserWithEmploye,
};
use crate::AppState;

#[tauri::command]
pub async fn login_user(payload: LoginPayload, state: State<'_, AppState>) -> Result<LoginResponse, String> {
    let result = sqlx::query!(
        r#"
        SELECT u.username, u.role, e.prenom, e.nom, e.id as employe_id
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
            employe_id: row.employe_id,
        }),
        None => Err("Identifiants invalides.".into()),
    }
}

#[tauri::command]
pub async fn create_user_and_employee(payload: RegisterPayload, state: State<'_, AppState>) -> Result<(), String> {
    if payload.role != "Admin" && payload.role != "User" {
        return Err("❌ Rôle invalide".into());
    }

    let mut tx = state
        .db
        .begin()
        .await
        .map_err(|e| format!("Erreur démarrage transaction: {}", e))?;

    let exists = sqlx::query_scalar!(
        "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)",
        payload.username
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("Erreur vérification user: {}", e))?;

    if exists.unwrap_or(false) {
        return Err("❌ Ce nom d'utilisateur existe déjà".into());
    }

    let user_id = sqlx::query_scalar!(
        r#"
        INSERT INTO users (username, password, role)
        VALUES ($1, $2, $3)
        RETURNING id
        "#,
        payload.username,
        payload.password,
        payload.role
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("Erreur insertion user: {}", e))?;

    sqlx::query!(
        r#"
        INSERT INTO employees (user_id, nom, prenom, poste)
        VALUES ($1, $2, $3, $4)
        "#,
        user_id,
        payload.nom,
        payload.prenom,
        payload.poste
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Erreur insertion employé: {}", e))?;

    tx.commit()
        .await
        .map_err(|e| format!("Erreur commit: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_all_users(state: State<'_, AppState>) -> Result<Vec<UserWithEmploye>, String> {
    let rows = query_as!(
        UserWithEmploye,
        r#"
        SELECT users.id, username, role, nom, prenom, poste
        FROM users
        JOIN employees ON employees.user_id = users.id
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur DB : {}", e))?;

    Ok(rows)
}

#[tauri::command]
pub async fn update_user_role(id: i32, role: String, state: State<'_, AppState>) -> Result<(), String> {
    let normalized = match role.to_lowercase().as_str() {
        "admin" => "Admin",
        "user" => "User",
        _ => return Err(format!("❌ Rôle invalide reçu : {}", role)),
    };

    let result = sqlx::query!(
        "UPDATE users SET role = $1 WHERE id = $2",
        normalized,
        id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("❌ Erreur SQL : {}", e))?;

    if result.rows_affected() == 0 {
        return Err(format!("❌ Aucun utilisateur trouvé avec l'id {}", id));
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_user_and_employee(id: i32, state: State<'_, AppState>) -> Result<(), String> {
    let result = sqlx::query!(
        "DELETE FROM users WHERE id = $1",
        id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("❌ Erreur SQL : {}", e))?;

    if result.rows_affected() == 0 {
        return Err("❌ Aucun utilisateur supprimé (ID invalide)".into());
    }

    Ok(())
}

#[tauri::command]
pub async fn reset_user_password(user_id: i32, new_password: String, state: State<'_, AppState>) -> Result<(), String> {
    let result = sqlx::query!(
        "UPDATE users SET password = $1 WHERE id = $2",
        new_password,
        user_id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("❌ Erreur SQL : {}", e))?;

    if result.rows_affected() == 0 {
        return Err("❌ Aucun utilisateur trouvé avec cet ID.".into());
    }

    Ok(())
}