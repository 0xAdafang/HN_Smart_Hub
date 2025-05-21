import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Structure de données de l'évaluation
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

type Props = {
  onBack: () => void;
};

export default function MaGrilleRH({ onBack }: Props) {
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

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = document.getElementById("grille-rh-pdf");
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Grille RH</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            td, th { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!evaluation) {
    return <p>📭 Aucune évaluation disponible pour le moment.</p>;
  }
  function calculerMoyenne(e: Evaluation): number | null {
    const valeurs = [
      e.ponctualite,
      e.assiduite,
      e.service_client,
      e.outils,
      e.respect_consignes,
      e.rendement,
    ].filter((n): n is number => typeof n === "number");

    if (valeurs.length === 0) return null;

    const somme = valeurs.reduce((a, b) => a + b, 0);
    return Math.round((somme / valeurs.length) * 10) / 10;
}

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={onBack}>⬅ Retour</button>
        <button onClick={handlePrint}>🖨️ Imprimer</button>
        <button onClick={handleExportPDF}>📥 Exporter en PDF</button>
      </div>

      <div id="grille-rh-pdf">
        <h2>Mon évaluation RH</h2>
        <p>
          Évalué le :
          <strong> {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}</strong>
        </p>
        {(() => {
            const moyenne = calculerMoyenne(evaluation);
            if (moyenne === null) return null;

            let couleur = "gray";
            if (moyenne >= 7) couleur = "green";
            else if (moyenne >= 4) couleur = "orange";
            else couleur = "red";

            return (
              <p>
                Moyenne :
                <span
                  style={{
                    backgroundColor: couleur,
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    marginLeft: "10px"
                  }}
                >
                  {moyenne}/10
                </span>
              </p>
            );
          })()}
        <table>
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
    </div>
  );
}
