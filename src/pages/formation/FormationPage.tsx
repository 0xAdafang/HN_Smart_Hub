import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BookText } from "lucide-react";


export type Module = {
  id: number;
  code: string;
  titre: string;
  contenu: string;
};

export default function FormationPage({ onOpen }: { onOpen: (module: Module) => void }) {
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    invoke("get_all_formations")
      .then((res) => setModules(res as Module[]))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <BookText size={22} /> Modules de formation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div
            key={m.code}
            onClick={() => onOpen(m)}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded shadow hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white mb-1">{m.titre}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-300">Code : {m.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
