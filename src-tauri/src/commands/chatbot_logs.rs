use sqlx::PgPool;

use crate::models::ChatbotLog;

impl ChatbotLog {
    pub async fn save(self, pool: &PgPool) {
        let _ = sqlx::query!(
            "INSERT INTO chatbot_logs (user_id, message, response) VALUES ($1, $2, $3)",
            self.user_id,
            self.message,
            self.response
        )
        .execute(pool)
        .await;
    }
}


pub async fn log_interaction(user_id: i32, message: &str, response: &str, pool: &PgPool) {
    let _ = sqlx::query!(
        "INSERT INTO chatbot_logs (user_id, message, response) VALUES ($1, $2, $3)",
        user_id,
        message,
        response
    )
    .execute(pool)
    .await;
}