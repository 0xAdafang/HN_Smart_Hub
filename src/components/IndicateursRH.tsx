import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
    if (!selectedId) return alert("Veuillez sélectionner un employé");

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

      alert("✅ Évaluation enregistrée !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm(" ❗ Êtes-vous sûr de vouloir supprimer cette évaluation ?");
    if(!confirmed) return;
    try {
        await invoke("delete_evaluation", {id});
        setEvaluations((prev) => prev.filter((e)=> e.id !== id));
        alert("✅ Évaluation supprimée !");
    } catch (err) {
        console.error(err);
        alert("❌ Erreur lors de la suppression");
    }
  };

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
              {evaluations.map((evaluation) => (
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
                    <button onClick={() => handleDelete(evaluation.id)} style={{ marginTop: 10, backgroundColor: "#f44336", color: "white" }}>
                    🗑️ Supprimer
                    </button>
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
