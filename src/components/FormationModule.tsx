import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type QuizQuestion = {
  id: number;
  formation_code: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d?: string;
  correct_option: string;
};

type Formation = {
  id: number;
  code: string;
  titre: string;
  contenu: string;
};

export default function FormationModule({
  module,
  employeeId,
  onBack,
}: {
  module: Formation;
  employeeId: number;
  onBack: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    invoke("get_questions_for_module", { formationCode: module.code })
      .then((res) => setQuestions(res as QuizQuestion[]))
      .catch(console.error);
  }, [module]);

  const handleSubmit = async () => {
    const total = questions.length;
    const correct = questions.filter(
      (q) => answers[q.id] === q.correct_option
    ).length;
    const result = Math.round((correct / total) * 100);

    setScore(result);

    try {
      const payload = {
        employeeId: employeeId,
        formationCode: module.code,
        score: result,
      };
      console.log("payload ⇒", payload);
      await invoke("submit_quiz_result", payload);
      alert("✅ Résultat envoyé !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’envoi du score.");
    }
  };

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4">
        ⬅ Retour
      </button>

      <h2 className="text-2xl font-bold mb-2">{module.titre}</h2>
      <div className="prose bg-white p-4 rounded shadow mb-6 whitespace-pre-wrap">
        {module.contenu}
      </div>

      <h3 className="text-xl font-semibold mb-4">📝 Quiz</h3>
      {questions.map((q) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium">{q.question}</p>
          {["A", "B", "C", "D"].map((key) => {
            const label = q[`option_${key.toLowerCase()}` as keyof QuizQuestion];
            if (!label) return null;
            return (
              <label key={key} className="block">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={key}
                  checked={answers[q.id] === key}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: key }))
                  }
                />
                {" "}{key}. {label}
              </label>
            );
          })}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ✅ Valider mes réponses
      </button>

      {score !== null && (
        <p className="mt-4 text-lg">
          🏁 Score : <strong>{score}%</strong>
        </p>
      )}
    </div>
  );
}
