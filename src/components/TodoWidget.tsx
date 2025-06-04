import { useState } from "react";
import Widget from "./ui/Widget";
import { PlusCircle, Trash2, CheckCircle } from "lucide-react";

interface Props {
  selectedDate: Date | undefined;
}

export default function TodoWidget({ selectedDate }: Props) {
  const [tasksByDate, setTasksByDate] = useState<Record<string, string[]>>({});
  const [newTask, setNewTask] = useState("");

  const dateKey = selectedDate?.toDateString() || "Aucune date";
  const tasks = tasksByDate[dateKey] || [];

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...tasks, newTask.trim()];
    setTasksByDate({ ...tasksByDate, [dateKey]: updated });
    setNewTask("");
  };

  const deleteTask = (index: number) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasksByDate({ ...tasksByDate, [dateKey]: updated });
  };

  return (
    <Widget title="Mes Tâches du Jour" className="max-h-[250px] overflow-auto">
      {selectedDate ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
              placeholder="Ajouter une tâche..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button
              onClick={addTask}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <PlusCircle size={20} />
            </button>
          </div>

          <ul className="space-y-1">
            {tasks.length === 0 ? (
              <li className="text-sm italic text-zinc-500">Aucune tâche pour aujourd’hui.</li>
            ) : (
              tasks.map((task, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded bg-zinc-100 dark:bg-zinc-800">
                  <span className="text-sm">{task}</span>
                  <button
                    onClick={() => deleteTask(i)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <p className="text-sm italic text-zinc-500">Sélectionne une date dans le calendrier.</p>
      )}
    </Widget>
  );
}
