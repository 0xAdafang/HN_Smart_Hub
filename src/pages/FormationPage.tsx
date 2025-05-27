import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
      <h2 className="text-2xl font-bold mb-4">📚 Modules de formation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div
            key={m.code}
            className="bg-white p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
            onClick={() => onOpen(m)}
          >
            <h3 className="text-lg font-semibold">{m.titre}</h3>
            <p className="text-sm text-gray-500">Code : {m.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
