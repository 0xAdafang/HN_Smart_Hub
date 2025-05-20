use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub username: String,
    pub role: String,
    pub prenom: String,
    pub nom: String,
    pub employe_id: i32,
}

#[derive(Deserialize)]
pub struct RegisterPayload {
    pub username: String,
    pub password: String,
    pub nom: String,
    pub prenom: String,
    pub poste: String,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EmployeLite {
    pub id: i32,
    pub prenom: Option<String>,
    pub nom: Option<String>,
}

#[derive(Deserialize)]
pub struct UserEvalQuery {
    pub prenom: String,
    pub nom: String,
}

#[derive(Deserialize)]
pub struct EvaluationPayload {
    pub employee_id: i32,
    pub ponctualite: i16,
    pub assiduite: i16,
    pub service_client: i16,
    pub outils: i16,
    pub respect_consignes: i16,
    pub rendement: i16,
    pub redressements: Option<String>,
    pub consequences: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct EvaluationDetail {
    pub id: i32,
    pub employee_id: Option<i32>,
    pub prenom: Option<String>,
    pub nom: Option<String>,
    pub date_evaluation: NaiveDate,
    pub ponctualite: Option<i16>,
    pub assiduite: Option<i16>,
    pub service_client: Option<i16>,
    pub outils: Option<i16>,
    pub respect_consignes: Option<i16>,
    pub rendement: Option<i16>,
    pub redressements: Option<String>,
    pub consequences: Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct UserWithEmploye {
    pub id: i32,
    pub username: String,
    pub role: String,
    pub nom: Option<String>,
    pub prenom: Option<String>,
    pub poste: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct DemandeCongesPayload {
    pub employe_id: i32,
    pub date_debut: NaiveDate,
    pub date_fin: NaiveDate,
    pub type_conge: String,
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct Conges {
    pub id: i32,
    pub employe_id: i32,
    pub date_debut: NaiveDate,
    pub date_fin: NaiveDate,
    pub type_conge: Option<String>,
    pub statut: Option<String>, 
}

#[derive(serde::Deserialize)]
pub struct GetCongesPayload {
    #[serde(rename = "employeId")]
    pub employe_id: i32,
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct CongeAvecEmploye {
    pub id: i32,
    pub nom: String,
    pub prenom: String,
    pub type_conge: Option<String>,
    pub date_debut: NaiveDate,
    pub date_fin: NaiveDate, 
    pub statut: Option<String>,
}
