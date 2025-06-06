import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, GraduationCap } from "lucide-react";


type Result = {
  id: number;
  employee_id: number;
  nom: string;
  prenom: string;
  formation_code: string;
  score: number;
  date_completed: string;
};

export default function AdminFormation({ onBack }: { onBack: () => void }) {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    invoke("get_all_quiz_results_with_names")
      .then((res) => setResults(res as Result[]))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-600 transition"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        <h2 className="text-2xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
          <GraduationCap size={22} /> Suivi des modules de formation
        </h2>
      <table className="w-full border-collapse rounded overflow-hidden text-sm mt-4">
        <thead className="bg-zinc-100 dark:bg-zinc-700">
          <tr>
            <th className="text-left px-4 py-2">Employé</th>
            <th className="text-left px-4 py-2">Module</th>
            <th className="text-left px-4 py-2">Score</th>
            <th className="text-left px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {results.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2">{r.prenom} {r.nom}</td>
              <td className="px-4 py-2">{r.formation_code}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white
                  ${r.score >= 80 ? "bg-green-600"
                    : r.score >= 50 ? "bg-orange-500"
                    : "bg-red-600"}`}>
                  {r.score}%
                </span>
              </td>
              <td className="px-4 py-2">{new Date(r.date_completed).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
