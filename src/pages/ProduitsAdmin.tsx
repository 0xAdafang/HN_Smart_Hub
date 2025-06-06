import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Produit } from "../components/ProductForm";
import { ChevronLeft, Search, Pencil, Trash2, Boxes } from "lucide-react";


interface Props {
  onBack: () => void;
  onEdit: (produit: Produit) => void;
}

export default function ProduitsAdmin({ onBack, onEdit }: Props) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");

  const charger = async () => {
    const data = await invoke<Produit[]>("get_all_produits");
    setProduits(data);
  };

  const supprimer = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await invoke("supprimer_produit", { id });
    charger();
  };

  const filtrer = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  useEffect(() => {
    charger();
  }, []);

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 transition text-sm"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <Boxes size={22} /> Gestion des Produits
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <Search size={18} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white w-64 text-sm focus:outline-none focus:ring-2 focus:ring-bioGreen"
        />
      </div>

      <table className="w-full text-sm border-collapse rounded overflow-hidden">
        <thead className="bg-zinc-100 dark:bg-zinc-700">
          <tr>
            <th className="text-left px-4 py-2">Nom</th>
            <th className="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {filtrer.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 text-zinc-800 dark:text-white">{p.nom}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded text-sm text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-600 transition"
                >
                  <Pencil size={16} /> Modifier
                </button>
                <button
                  onClick={() => supprimer(p.id!)}
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
