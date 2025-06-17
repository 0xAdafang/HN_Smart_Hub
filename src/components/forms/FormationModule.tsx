import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ChevronLeft,
  FileText,
  ListChecks,
  SendHorizontal,
  Flag,
  StickyNote,
  Check,
} from "lucide-react";

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
  const [wrongQuestions, setWrongQuestions] = useState<{ id: number, question: string }[]>([]);


  useEffect(() => {
    invoke("get_questions_for_module", { formationCode: module.code })
      .then((res) => setQuestions(res as QuizQuestion[]))
      .catch(console.error);
  }, [module]);

  const handleSubmit = async () => {
  const total = questions.length;
  let correct = 0;
  const incorrects: { id: number, question: string }[] = [];

  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    if (userAnswer === q.correct_option) {
      correct += 1;
    } else {
      incorrects.push({ id: q.id, question: q.question });
    }
  });

  setWrongQuestions(incorrects);

  const result = Math.round((correct / total) * 100);
  setScore(result);

  try {
    await invoke("submit_quiz_result", {
      employeeId: employeeId,
      formationCode: module.code,
      score: result,
    });
    alert("✅ Résultat envoyé !");
  } catch (err) {
    console.error(err);
    alert("❌ Erreur lors de l’envoi du score.");
  }
};
  const renderFormattedContent = (raw: string) => {
    const withBold = raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: withBold }} />;
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded text-sm text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-600 transition"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      <h2 className="text-2xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <FileText size={22} /> {module.titre}
      </h2>
      <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow mb-6 border border-zinc-200 dark:border-zinc-700 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-100">
        {renderFormattedContent(module.contenu)}
      </div>

      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
        <ListChecks size={20} /> Quiz
      </h3>
      {questions.map((q) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium">{q.question}</p>
          {["A", "B", "C", "D"].map((key) => {
            const label = q[`option_${key.toLowerCase()}` as keyof QuizQuestion];
            if (!label) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [q.id]: key }))
                }
                className={`flex items-center justify-between w-full px-4 py-2 border rounded text-left text-sm transition
                  ${answers[q.id] === key
                    ? "bg-bioGreen text-white border-bioGreen"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600"}
                  hover:border-bioGreen`}
              >
                <span>{key}. {label}</span>
                {answers[q.id] === key && <Check size={16} />}
              </button>
            );
          })}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-bioGreen hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
      >
        <SendHorizontal size={16} /> Valider mes réponses
      </button>

      {score !== null && (
        <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
          <Flag size={18} /> Score : <strong>{score}%</strong>
        </p>
      )}
      {wrongQuestions.length > 0 && (
        <div className="mt-6 bg-yellow-100 dark:bg-yellow-900 p-4 rounded shadow">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
            <StickyNote size={16} /> Questions à revoir :
          </h4>
          <ul className="list-disc list-inside text-sm text-zinc-800 dark:text-zinc-200">
            {wrongQuestions.map((q) => (
              <li key={q.id}>
                <strong>Question {q.id}</strong> : {q.question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    
  );
}
