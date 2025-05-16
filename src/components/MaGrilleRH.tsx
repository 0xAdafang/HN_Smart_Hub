import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Evaluation = {
  id: number;
  employee_id: number | null;
  prenom: string | null;
  nom: string | null;
  date_evaluation: string;
  ponctualite: number | null;
  assiduite: number | null;
  service_client: number | null;
  outils: number | null;
  respect_consignes: number | null;
  rendement: number | null;
  redressements: string | null;
  consequences: string | null;
};

export default function MaGrilleRH() {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    const prenom = localStorage.getItem("prenom");
    const nom = localStorage.getItem("nom");

    if (!prenom || !nom) {
      console.error("Prénom ou nom introuvables dans le localStorage");
      return;
    }

    invoke("get_user_evaluation", {
      payload: { prenom, nom },
    })
      .then((res) => setEvaluation(res as Evaluation))
      .catch(console.error);
  }, []);

  if (!evaluation) {
    return <p>📭 Aucune évaluation disponible pour le moment.</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Mon évaluation RH</h2>
      <p>
        Évalué le :{" "}
        <strong>
          {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}
        </strong>
      </p>

      <table border={1} cellPadding={5} style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>Critère</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Ponctualité", evaluation.ponctualite],
            ["Assiduité", evaluation.assiduite],
            ["Service client", evaluation.service_client],
            ["Outils", evaluation.outils],
            ["Respect des consignes", evaluation.respect_consignes],
            ["Rendement", evaluation.rendement],
          ].map(([label, score]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{score ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <p>
          <strong>Redressements :</strong><br />
          {evaluation.redressements || "—"}
        </p>
        <p>
          <strong>Conséquences :</strong><br />
          {evaluation.consequences || "—"}
        </p>
      </div>
    </div>
  );
}
