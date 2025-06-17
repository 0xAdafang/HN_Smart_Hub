import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import {
  Clock,
  CalendarCheck,
  Headphones,
  Wrench,
  ClipboardList,
  Gauge,
  StickyNote,
  AlertCircle,
  Printer,
  FileDown,
  Trash2,
  Search,
  FileText,
} from "lucide-react";


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

  const chargerEvaluations = () => {
    invoke("get_all_evaluations")
      .then((res) => setEvaluations(res as Evaluation[]))
      .catch(console.error);
  };

  useEffect(() => {
    invoke("get_employes_non_admins")
      .then((res) => setEmployes(res as Employe[]))
      .catch(console.error);

    chargerEvaluations();
  }, []);

  const handleChangeNote = (field: keyof typeof notes, value: number | string) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    function aDejaEteEvalueCeMois(id: number): boolean {
      const maintenant = new Date();
      return evaluations.some(e => {
        if (e.employee_id !== id) return false;
        const dateEval = new Date(e.date_evaluation);
        return (
          dateEval.getFullYear() === maintenant.getFullYear() &&
          dateEval.getMonth() === maintenant.getMonth()
          
        );
      });
    }
    if (!selectedId) return toast.error("Veuillez sélectionner un employé");

    if (aDejaEteEvalueCeMois(selectedId)) {
      toast.error("⚠️ Cet employé a déjà été évalué ce mois-ci.");
      return;
    }
    
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

      toast.success("✅ Évaluation enregistrée avec succès !");
      chargerEvaluations();
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
    <div className="px-4 py-6 sm:px-8 sm:py-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-bioGreen dark:text-bioGreenLight mb-4 text-center">
        Évaluation RH
      </h2>

      {/* Navigation entre formulaire / liste */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setMode("form")}
          className="bg-bioGreen hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow"
        >
          Nouvelle Évaluation
        </button>
        <button
          onClick={() => setMode("list")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow"
        >
          Voir les Évaluations
        </button>
      </div>

      {mode === "form" && (
        <>
          <div className="mb-6 max-w-sm mx-auto">
            <label className="block text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-200">
              Choisir un employé :
            </label>
            <select
              onChange={(e) => setSelectedId(Number(e.target.value))}
              value={selectedId ?? ""}
              className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen transition"
            >
              <option value="">-- Sélectionner --</option>
              {employes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom ?? "??"} {e.nom ?? ""}
                </option>
              ))}
            </select>
          </div>


          <div style={{ marginTop: 20 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-3xl mx-auto">
              {Object.entries(notes)
                .filter(([key]) => typeof notes[key as keyof typeof notes] === "number")
                .map(([critere, value]) => (
                  <div key={critere}>
                    <label className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
                      {critere.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={value as number}
                      onChange={(e) =>
                        handleChangeNote(critere as keyof typeof notes, Number(e.target.value))
                      }
                      className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
                    />
                  </div>
                ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <label>Redressements :</label>
              <textarea
                className="w-full h-[60px] resize-y border rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="Redressements"
                value={notes.redressements}
                onChange={(e) => handleChangeNote("redressements", e.target.value)}
                style={{ width: "100%", minHeight: 60 }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              
              <label>Conséquences :</label>
              <textarea
                className="w-full h-[60px] resize-y border rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
                placeholder="Conséquences"
                value={notes.consequences}
                onChange={(e) => handleChangeNote("consequences", e.target.value)}
                style={{ width: "100%", minHeight: 60 }}
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-bioGreen hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
            >
              Enregistrer l’évaluation
            </button>
          </div>
        </>
      )}

      {mode === "list" && (
        <>
          <h3 className="text-xl font-semibold text-center mb-4 text-zinc-800 dark:text-zinc-200">
            <FileText size={20} className="inline-block mr-2 text-bioGreen" />
            Évaluations enregistrées
          </h3>

          <div className="mb-6 flex justify-center items-center gap-2">
            <Search size={18} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={rechercheNom}
              onChange={(e) => setRechercheNom(e.target.value)}
              className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-bioGreen"
            />
          </div>

          <div className="space-y-6">
            {evaluationsFiltrees.map((evaluation) => {
              const moyenne = calculerMoyenne(evaluation);
              const couleur =
                moyenne === null
                  ? "bg-zinc-400"
                  : moyenne >= 7
                  ? "bg-green-600"
                  : moyenne >= 4
                  ? "bg-orange-500"
                  : "bg-red-600";

              return (
                <div
                  key={evaluation.id}
                  className="bg-white dark:bg-zinc-800 shadow rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold">
                      {evaluation.prenom} {evaluation.nom}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${couleur}`}>
                      {moyenne ?? "—"}/10
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3 flex items-center gap-1">
                    <CalendarCheck size={14} />
                    {new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                    {[
                      [<Clock size={16} />, "Ponctualité", evaluation.ponctualite],
                      [<CalendarCheck size={16} />, "Assiduité", evaluation.assiduite],
                      [<Headphones size={16} />, "Service", evaluation.service_client],
                      [<Wrench size={16} />, "Outils", evaluation.outils],
                      [<ClipboardList size={16} />, "Consignes", evaluation.respect_consignes],
                      [<Gauge size={16} />, "Rendement", evaluation.rendement],
                    ].map(([icon, label, score], i) => (
                      <div key={i} className="flex items-center gap-2">
                        {icon}
                        <strong>{label}</strong>: {score ?? "—"}
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 font-semibold mb-1">
                        <StickyNote size={16} /> Redressements :
                      </div>
                      <p>{evaluation.redressements || "—"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-orange-500 mb-1">
                        <AlertCircle size={16} /> Conséquences :
                      </div>
                      <p>{evaluation.consequences || "—"}</p>
                    </div>
                  </div>

                  {/* Grille RH invisible pour PDF/Impression */}
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => printGrille(evaluation.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 text-sm"
                    >
                      <Printer size={16} /> Imprimer
                    </button>
                    <button
                      onClick={() => exportPDFGrille(evaluation.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <FileDown size={16} /> PDF
                    </button>
                    <button
                      onClick={() => handleDelete(evaluation.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
