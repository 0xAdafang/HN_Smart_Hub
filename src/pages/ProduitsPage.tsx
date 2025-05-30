import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Produit {
    id: number;
    nom: string;
    description?: string;
}

export default function ProduitsPage() {
    const [produits, setProduits] = useState<Produit[]>([]);
    const [recherche, setRecherche] = useState("");

    const chargerProduits = async () => {
        const data = await invoke<Produit[]>("get_all_produits");
        setProduits(data);
    };

    const rechercher = async () => {
        if (recherche.trim() === "") { 
            chargerProduits();
        } else {
            const data = await invoke<Produit[]>("rechercher_produits", {
                motCle: recherche,
            });
            setProduits(data);
        }
    };

    useEffect(() => {
        chargerProduits();
    }, []);

    return (
        <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📦 Répertoire Alimentaire</h1>

      <input
        type="text"
        placeholder="🔍 Rechercher un produit..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && rechercher()}
        className="border px-3 py-1 rounded w-full mb-4"
      />

      <ul className="space-y-2">
        {produits.map((p) => (
          <li key={p.id} className="bg-gray-100 p-3 rounded shadow">
            <strong>{p.nom}</strong>
            {p.description && <p className="text-sm mt-1">{p.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );   
}