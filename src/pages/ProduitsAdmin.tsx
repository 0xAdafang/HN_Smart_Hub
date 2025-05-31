import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Produit } from "../components/ProductForm";

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
      <button onClick={onBack} className="mb-4">
        ⬅ Retour
      </button>
      <h1 className="text-2xl font-bold mb-4">🧑‍🔧 Gestion des Produits</h1>

      <input
        type="text"
        placeholder="🔍 Rechercher..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="border px-3 py-1 rounded w-full mb-4"
      />

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left p-2">Nom</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtrer.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.nom}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => onEdit(p)} className="text-blue-600">
                  ✏️ Modifier
                </button>
                <button onClick={() => supprimer(p.id!)} className="text-red-600">
                  🗑 Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
