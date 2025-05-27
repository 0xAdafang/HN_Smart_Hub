import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
      <button onClick={onBack}>⬅ Retour</button>
      <h2 className="text-2xl font-bold mb-4">📊 Suivi des modules de formation</h2>

      <table className="w-full text-sm border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th>Employé</th>
            <th>Module</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="border-t">
              <td>{r.prenom} {r.nom}</td>
              <td>{r.formation_code}</td>
              <td>{r.score}%</td>
              <td>{new Date(r.date_completed).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
