import { useEffect, useState } from "react";
import Widget from "./ui/Widget";
import { PlusCircle, Trash2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface Task {
  heure: string;
  description: string;
}

export default function TodoWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [heure, setHeure] = useState("06:00");
  const { user } = useUser(); 
  const storageKey = `todo_tasks_user_${user?.id || 0}`;

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      heure,
      description: newTask.trim(),
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const deleteTask = (index: number) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: Task[] = JSON.parse(saved);
        setTasks(parsed);
      } catch (e) {
        console.error("Tâches corrompues", e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  return (
    <Widget title="Mes Tâches du Jour" className="max-h-[340px] overflow-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={heure.split(":")[0]}
            onChange={(e) =>
              setHeure(`${e.target.value.padStart(2, "0")}:${heure.split(":")[1]}`)
            }
            className="px-2 py-1 rounded border bg-white dark:bg-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
          >
            {Array.from({ length: 17 }, (_, i) => 6 + i).map((h) => (
              <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
            ))}
          </select>

          <span className="text-sm text-zinc-500 dark:text-zinc-300">:</span>

          <select
            value={heure.split(":")[1]}
            onChange={(e) =>
              setHeure(`${heure.split(":")[0]}:${e.target.value.padStart(2, "0")}`)
            }
            className="px-2 py-1 rounded border bg-white dark:bg-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600"
          >
            {["00", "15", "30", "45"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input
            type="text"
            className="w-full md:w-auto px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
            placeholder="Ajouter une tâche..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />

          <button
            onClick={addTask}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            title="Ajouter"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        <ul className="space-y-1">
          {tasks.length === 0 ? (
            <li className="text-sm italic text-zinc-500">
              Aucune tâche pour aujourd’hui.
            </li>
          ) : (
            tasks.map((task, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2 rounded bg-zinc-100 dark:bg-zinc-800"
              >
                <span className="text-sm">
                  <strong className="mr-2">{task.heure}</strong>
                  {task.description}
                </span>
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
    </Widget>
  );
}
