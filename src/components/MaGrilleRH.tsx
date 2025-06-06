import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowLeft, Printer, FileDown, StickyNote, AlertCircle, BadgeCheck,CalendarDays,
  EqualNot,
} from "lucide-react";

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
    <div className="px-4 py-6 sm:px-8 max-w-3xl mx-auto text-zinc-800 dark:text-zinc-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
          <BadgeCheck size={24} /> Mon Évaluation RH
        </h2>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">
            <ArrowLeft size={16} /> Retour
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
            <FileDown size={16} /> PDF
          </button>
        </div>
      </div>

      <p className="mb-2 flex items-center gap-2">
        <CalendarDays size={18} className="text-bioGreen" />
        <span>
          Évalué le : <strong>{new Date(evaluation.date_evaluation).toLocaleDateString("fr-FR")}</strong>
        </span>
      </p>

      {(() => {
        const moyenne = calculerMoyenne(evaluation);
        if (moyenne === null) return null;

        let couleur = moyenne >= 7 ? "bg-green-600" : moyenne >= 4 ? "bg-orange-500" : "bg-red-600";
        return (
          <p className="mb-4 flex items-center gap-2">
          <EqualNot size={18} className="text-bioGreen" />
          <span>
            Moyenne :
            <span className={`ml-2 px-3 py-1 rounded-full text-white font-semibold text-sm ${couleur}`}>
              {moyenne}/10
            </span>
          </span>
        </p>
        );
      })()}

      <table className="w-full border-collapse mb-6 text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-700">
            <th className="border px-4 py-2">Critère</th>
            <th className="border px-4 py-2">Note</th>
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
          ].map(([label, note]) => (
            <tr key={label}>
              <td className="border px-4 py-2">{label}</td>
              <td className="border px-4 py-2 text-center">{note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          <div className="flex items-center gap-2 mb-1 font-semibold">
            <StickyNote size={18} /> Redressements :
          </div>
          <p>{evaluation.redressements || "—"}</p>
        </div>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          <div className="flex items-center gap-2 mb-1 font-semibold text-orange-500">
            <AlertCircle size={18} /> Conséquences :
          </div>
          <p>{evaluation.consequences || "—"}</p>
        </div>
      </div>
    </div>
  );
}
