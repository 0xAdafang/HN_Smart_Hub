use tauri::State;
use sqlx::FromRow;
use chrono::NaiveDate;
use crate::AppState;
use crate::models::{TeleventeEntry, TeleventePayload};


#[tauri::command]
pub async fn add_televente_entry(payload: TeleventePayload, state: State<'_, AppState>) -> Result<(), String> {
    let date = NaiveDate::parse_from_str(&payload.date, "%Y-%m-%d")
        .map_err(|e| format!("Invalid date format: {}", e))?;

    let query = sqlx::query!(
        r#"
        INSERT INTO televente_entries (
            employee_id, date, client_number, client_name, 
            product_code, product_name, quantity, hit_click
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
        payload.employee_id,
        date,
        payload.client_number,
        payload.client_name,
        payload.product_code,
        payload.product_name,
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
pub async fn get_televente_entries_by_date(
    date: String,
    state: State<'_, AppState>
) -> Result<Vec<TeleventeEntry>, String> {
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
            quantity: row.quantity,
            hit_click: row.hit_click,
        })
        .collect();

    Ok(entries)
}
