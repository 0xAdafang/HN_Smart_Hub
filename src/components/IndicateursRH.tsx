import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

type Employe = {
  id: number;
  prenom: string | null;
  nom: string | null;
};

type Evaluation = {
  id: number;
  employee_id: number | null;
  prenom: string | null;
  nom: string | null;
  date_evaluation: string; // corrigé ici
  ponctualite: number | null;
  assiduite: number | null;
  service_client: number | null;
  outils: number | null;
  respect_consignes: number | null;
  rendement: number | null;
  redressements: string | null;
  consequences: string | null;
};

export default function IndicateursRH() {
  const [mode, setMode] = useState<"form" | "list">("form");
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState({
    ponctualite: 0,
    assiduite: 0,
    service_client: 0,
    outils: 0,
    respect_consignes: 0,
    rendement: 0,
    redressements: "",
    consequences: "",
  });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rechercheNom, setRechercheNom] = useState("");

  useEffect(() => {
    invoke("get_employes_non_admins")
      .then((res) => setEmployes(res as Employe[]))
      .catch(console.error);

    invoke("get_all_evaluations")
      .then((res) => setEvaluations(res as Evaluation[]))
      .catch(console.error);
  }, []);

  const handleChangeNote = (field: keyof typeof notes, value: number | string) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedId) return toast.error("Veuillez sélectionner un employé");
    
    try {
      await invoke("submit_evaluation", {
        payload: {
          employee_id: selectedId,
          ponctualite: notes.ponctualite,
          assiduite: notes.assiduite,
          service_client: notes.service_client,
          outils: notes.outils,
          respect_consignes: notes.respect_consignes,
          rendement: notes.rendement,
          redressements: notes.redressements,
          consequences: notes.consequences,
        },
      });

      toast.success("Évaluation enregistrée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm(" ❗ Êtes-vous sûr de vouloir supprimer cette évaluation ?");
    if(!confirmed) return;
    try {
        await invoke("delete_evaluation", {id});
        setEvaluations((prev) => prev.filter((e)=> e.id !== id));
        toast.success("Évaluation supprimée !");
    } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la suppression");
    }
  };

  const printGrille = (id: number) => {
  const content = document.getElementById(`grille-eval-${id}`);
  if (!content) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Grille RH</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          ul { list-style: none; padding: 0; }
          li { margin-bottom: 4px; }
          table, td, th { border: 1px solid black; border-collapse: collapse; padding: 6px; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const exportPDFGrille = (id: number) => {
  printGrille(id); 
};
const evaluationsFiltrees = evaluations.filter((e) =>
    `${e.prenom ?? ""} ${e.nom ?? ""}`.toLowerCase().includes(rechercheNom.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Évaluation RH</h2>

      {/* Navigation entre formulaire / liste */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setMode("form")}>➕ Nouvelle évaluation</button>
        <button onClick={() => setMode("list")}>📋 Voir les évaluations</button>
      </div>

      {mode === "form" && (
        <>
          <label>Choisir un employé :</label>
          <select onChange={(e) => setSelectedId(Number(e.target.value))} value={selectedId ?? ""}>
            <option value="">-- Sélectionner --</option>
            {employes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom ?? "??"} {e.nom ?? ""}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 20 }}>
            {Object.entries(notes)
              .filter(([key]) => typeof notes[key as keyof typeof notes] === "number")
              .map(([critere, value]) => (
                <div key={critere} style={{ marginBottom: 10 }}>
                  <label style={{ marginRight: 10 }}>{critere.replace(/_/g, " ")} :</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={value as number}
                    onChange={(e) => handleChangeNote(critere as keyof typeof notes, Number(e.target.value))}
                  />
                </div>
              ))}

            <div style={{ marginTop: 10 }}>
              <label>Redressements :</label>
              <textarea
                placeholder="Redressements"
                value={notes.redressements}
                onChange={(e) => handleChangeNote("redressements", e.target.value)}
                style={{ width: "100%", minHeight: 60 }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <label>Conséquences :</label>
              <textarea
                placeholder="Conséquences"
                value={notes.consequences}
                onChange={(e) => handleChangeNote("consequences", e.target.value)}
                style={{ width: "100%", minHeight: 60 }}
              />
            </div>
          </div>

          <button onClick={handleSubmit} style={{ marginTop: 20 }}>
            Soumettre l’évaluation
          </button>
        </>
      )}

      {mode === "list" && (
        <>
          <h3>Évaluations enregistrées</h3>
          <input
            type="text"
            placeholder="🔍 Rechercher un employé..."
            value={rechercheNom}
            onChange={(e) => setRechercheNom(e.target.value)}
            style={{ marginBottom: 10, padding: 5, width: "100%" }}
          />
          <table border={1} cellPadding={5} style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Date</th>
                <th>Scores</th>
                <th>Commentaires</th>
              </tr>
            </thead>
            <tbody>
              {evaluationsFiltrees.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td>{evaluation.prenom ?? "?"} {evaluation.nom ?? ""}</td>
                  <td>{new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}</td>
                  <td>
                    {[
                      ["ponctualité", evaluation.ponctualite],
                      ["assiduité", evaluation.assiduite],
                      ["service", evaluation.service_client],
                      ["outils", evaluation.outils],
                      ["consignes", evaluation.respect_consignes],
                      ["rendement", evaluation.rendement],
                    ].map(([label, score]) => (
                      <div key={label}>
                        {label} : {score ?? "-"}
                      </div>
                    ))}
                  </td>
                  <td>
                    <strong>Redressements :</strong><br />
                    {evaluation.redressements || "—"}
                    <br />
                    <strong>Conséquences :</strong><br />
                    {evaluation.consequences || "—"}

                    <div id={`grille-eval-${evaluation.id}`} style={{ display: "none" }}>
                      <h3>Grille RH de {evaluation.prenom ?? "?"} {evaluation.nom ?? ""}</h3>
                      <p>Date : {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}</p>
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
                      <p><strong>Redressements :</strong> {evaluation.redressements || "—"}</p>
                      <p><strong>Conséquences :</strong> {evaluation.consequences || "—"}</p>
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <button onClick={() => printGrille(evaluation.id)}>🖨️ Imprimer</button>
                      <button onClick={() => exportPDFGrille(evaluation.id)}>📥 PDF</button>
                      <button
                        onClick={() => handleDelete(evaluation.id)}
                        style={{ backgroundColor: "#f44336", color: "white" }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
