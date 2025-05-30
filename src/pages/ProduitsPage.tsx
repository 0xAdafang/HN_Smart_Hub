import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useUser } from "../contexts/UserContext";


interface Props {
  onBack: () => void;
}

interface Produit {
  id: number;
  nom: string;
  description?: string;
}


export default function ProduitsPage({ onBack }: Props) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");
  const { user } = useUser();
  const isAdmin = user?.role === "Admin";

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
  const handleModifier = (produit: Produit) => {
  alert(`Modifier ${produit.nom}`);
  };

  const handleSupprimer = async (id: number) => {
    const confirm = window.confirm("Supprimer ce produit ?");
    if (!confirm) return;

    try {
      await invoke("supprimer_produit", { id });
      await chargerProduits(); // rechargement de la liste
    } catch (e) {
      console.error("Erreur suppression :", e);
    }
  };


  useEffect(() => {
    chargerProduits();
  }, []);

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4">
        ⬅ Retour
      </button>
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
            {isAdmin && (
              <div className="mt-2 flex gap-2 text-sm">
                <button onClick={() => handleModifier(p)}>✏️ Modifier</button>
                <button onClick={() => handleSupprimer(p.id)} className="text-red-600">🗑 Supprimer</button>
              </div>
            )}
            {isAdmin && (
              <button onClick={() => setEditProduct(null)} className="mb-4 bg-green-600 text-white px-3 py-1 rounded">
                ➕ Ajouter un produit
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
