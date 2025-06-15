use regex::Regex;
use std::collections::HashMap;

use crate::models::IntentResult;
use crate::commands::chatbot::extract_last_word;


pub fn normalize_entity(word: &str) -> String {
    let mut w = word.to_lowercase();

    // Supprimer les préfixes d'articles courants
    let prefixes = ["l'", "d'", "qu'", "j'", "c'", "t'"];
    for prefix in prefixes {
        if w.starts_with(prefix) {
            w = w.replacen(prefix, "", 1);
            break;
        }
    }

    // Supprimer les ponctuations & parenthèses
    w = w
        .replace(['(', ')', '[', ']', '{', '}', ',', '.', '?', '!', '\'', '"', '-', '_'], "")
        .trim()
        .to_string();

    // Supprimer les pluriels simples
    if w.ends_with('s') && w.len() > 4 {
        w.pop();
    }

    // Corrections manuelles
    let corrections = HashMap::from([
        ("tofou", "tofu"),
        ("soumisson", "soumission"),
        ("evenement", "événement"),
        ("evenements", "événement"),
        ("sauces", "sauce"),
        ("sauce", "sauce"),
        ("sauces végétaliennes", "sauce"),
        ("végétaliennes", "végétalien"),
        ("végétariennes", "végétarien"),
    ]);

    if let Some(corr) = corrections.get(w.as_str()) {
        return corr.to_string();
    }

    w
}

pub fn analyze_intent(message: &str) -> IntentResult {

    let q = message.to_lowercase();

    let map =  vec![
        ("congé", "conges"),
        ("jours de repos", "conges"),
        ("absences", "conges"),
        ("événement", "evenements"),
        ("agenda", "evenements"),
        ("formation", "formation_contenu"),
        ("soumission", "formation_contenu"),
        ("commande manuelle", "formation_contenu"),
        ("sauce", "recherche_produit_par_categorie"),
        ("protéine", "recherche_produit_par_categorie"),
        ("édulcorant", "recherche_produit_par_categorie"),
    ];

    let synonymes = std::collections::HashMap::from([
        ("off", "conges"),
        ("ca va","ça va"),
        ("vacances", "conges"),
        ("jours de repos", "conges"),
        ("absence", "conges"),
        ("agenda", "evenements"),
        ("événement", "evenements"),
        ("evenements", "evenements"),
        ("formation", "formation_contenu"),
        ("soumission", "formation_contenu"),
        ("vendeur", "mes_ventes"),
        ("télévente", "mes_ventes"),
        ("client", "mes_ventes"),
        ("vente", "ventes"),
        ("mes ventes", "mes_ventes"),
        ("congés en attente", "conges_en_attente"),
        ("congés refusés", "conges_en_attente"),
        ("meilleure évaluation", "meilleure_eval"),
        ("ma meilleure note", "meilleure_eval"),
        ("événements à venir", "evenements"),
        ("calendrier", "evenements"),
        ("formation contenu", "formation_contenu"),
        ("comment faire", "formation_contenu"),
        ("procédure", "formation_contenu"),
        ("ventes", "ventes"),
        ("produits sans gluten", "produits_sans_gluten"),
        ("sans gluten", "produits_sans_gluten"),
        ("faible en gluten", "produits_sans_gluten"),
        ("éviter le gluten", "produits_sans_gluten"),
        ("ne contient pas de gluten", "produits_sans_gluten"),
    ]);

    for (mot_clef, intent) in &synonymes {
        if q.contains(mot_clef) {
            return IntentResult {
                intent,
                entity: None,
            };
        }
    }

    for (mot, intent) in map {
        if q.contains(mot) || q.contains(&normalize_entity(mot)) {
            return IntentResult {
                intent,
                entity: Some(extract_last_word(&q)),
            }
        }
    }


    
    if q.contains("mes ventes") || q.contains("combien j'ai vendu") {
        return IntentResult {
            intent: "mes_ventes",
            entity: None,
        };
    }

    
    if q.contains("congés") && (q.contains("en attente") || q.contains("refus")) {
        return IntentResult {
            intent: "conges_en_attente",
            entity: None,
        };
    }

    
    if q.contains("meilleure évaluation") || q.contains("ma meilleure note") {
        return IntentResult {
            intent: "meilleure_eval",
            entity: None,
        };
    }

    
    if q.contains("conges") {
        return IntentResult {
            intent: "conges",
            entity: None,
        };
    }

    if q.contains("événements") || q.contains("calendrier") {
        return IntentResult {
            intent: "evenements",
            entity: None,
        };
    }

    if q.contains("formation") || q.contains("module") {
        return IntentResult {
            intent: "formation_contenu",
            entity: None,
        };
    }


    if q.contains("vente") {
        return IntentResult {
            intent: "ventes",
            entity: None,
        };
    }

    let gluten_regex = Regex::new(r"(sans|faible en|éviter le|ne contient pas de) gluten").unwrap();
        if gluten_regex.is_match(&q) {
            return IntentResult {
                intent: "produits_sans_gluten",
                entity: None,
            };
        }
 
    IntentResult {
        intent: "unknown",
        entity: None,
    }
}
