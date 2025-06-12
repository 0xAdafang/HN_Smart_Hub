use tauri::State;
use sqlx::FromRow;
use chrono::NaiveDate;
use crate::models::AppState;
use crate::models::{TeleventeEntry, TeleventePayload, UnlockAchievementPayload, UnlockedAchievement, AdminTeleventeEntry};


#[tauri::command]
pub async fn add_televente_entry(payload: TeleventePayload, state: State<'_, AppState>) -> Result<(), String> {
    let date = NaiveDate::parse_from_str(&payload.date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let query = sqlx::query!(
        r#"
        INSERT INTO televente_entries (
            employee_id, date, client_number, client_name, 
            product_code, product_name, category, quantity, hit_click
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        "#,
        payload.employee_id,
        date,
        payload.client_number,
        payload.client_name,
        payload.product_code,
        payload.product_name,
        payload.category,
        payload.quantity,
        payload.hit_click,
    );

    query
        .execute(&*state.db)
        .await
        .map_err(|e| format!("Failed to insert televente entry: {}", e))?;

    Ok(())

}

#[tauri::command]
pub async fn get_televente_entries_by_date(date: String,state: State<'_, AppState>) -> Result<Vec<TeleventeEntry>, String> {
    let parsed_date = chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d")
        .map_err(|e| format!("Date invalide : {}", e))?;

    let rows = sqlx::query!(
        r#"
        SELECT 
            e.id AS employee_id,
            e.prenom,
            e.nom,
            t.date,
            t.client_number,
            t.client_name,
            t.product_code,
            t.product_name,
            t.category,
            t.quantity,
            t.hit_click
        FROM televente_entries t
        JOIN employees e ON t.employee_id = e.id
        WHERE t.date = $1
        ORDER BY e.nom
        "#,
        parsed_date
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur lecture télévente : {}", e))?;

    let entries: Vec<TeleventeEntry> = rows
        .into_iter()
        .map(|row| TeleventeEntry {
            employee_id: row.employee_id,
            employee_name: format!("{} {}", row.prenom.unwrap_or_default(), row.nom.unwrap_or_default()),
            date: row.date,
            client_number: row.client_number,
            client_name: row.client_name,
            product_code: row.product_code,
            product_name: row.product_name,
            category: row.category,
            quantity: row.quantity,
            hit_click: row.hit_click,
        })
        .collect();

    Ok(entries)
}


#[tauri::command]
pub async fn unlock_achievement(payload: UnlockAchievementPayload, state: State<'_, AppState>) -> Result<(), String> {
    
    let achievement = sqlx::query!(
        r#"
        SELECT id FROM achievements
        WHERE code = $1
        "#,
        payload.achievement_code
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| format!("Erreur récupération succès : {}", e))?;

    let achievement_id = if let Some(a) = achievement {
        a.id
    } else {
        return Err("Succès non trouvé".into());
    };

    
    sqlx::query!(
        r#"
        INSERT INTO user_achievements (employee_id, achievement_id)
        VALUES ($1, $2)
        ON CONFLICT (employee_id, achievement_id) DO NOTHING
        "#,
        payload.employee_id,
        achievement_id
    )
    .execute(&*state.db)
    .await
    .map_err(|e| format!("Erreur insertion succès : {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_user_achievements(employee_id: i32, state: State<'_, AppState>) -> Result<Vec<UnlockedAchievement>, String> {
    
   let records = sqlx::query!(
        r#"
        SELECT a.code, ua.unlocked_at
        FROM user_achievements ua
        JOIN achievements a ON a.id = ua.achievement_id
        WHERE ua.employee_id = $1
        "#,
        employee_id
        )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur lecture succès : {}", e))?;

    let achievements = records
        .into_iter()
        .map(|r| UnlockedAchievement {
            code: r.code,
            unlocked_at: r.unlocked_at,
        })
        .collect();

    Ok(achievements)

}

#[tauri::command]
pub async fn get_all_televente_entries(state: State<'_, AppState>) -> Result<Vec<AdminTeleventeEntry>, String> {
    let rows = sqlx::query!(
         r#"
        SELECT 
            t.employee_id,
            CONCAT(e.prenom, ' ', e.nom) AS employee_name,
            t.date,
            t.client_number,
            t.client_name,
            t.product_code,
            t.product_name,
            t.category,
            t.quantity,
            t.hit_click
        FROM televente_entries t
        JOIN employees e ON e.id = t.employee_id
        ORDER BY t.date DESC
        "#
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| format!("Erreur lecture télévente : {}", e))?;

    let result = rows.into_iter().map(|r| AdminTeleventeEntry {
        employee_id: r.employee_id,
        employee_name: r.employee_name.unwrap_or_default(),
        date: r.date,
        client_number: r.client_number,
        client_name: r.client_name,
        product_code: r.product_code,
        product_name: r.product_name,
        category: r.category,
        quantity: r.quantity,
        hit_click: r.hit_click,
    }).collect();

    Ok(result)

}

