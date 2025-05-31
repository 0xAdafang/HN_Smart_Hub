import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useUser } from "../contexts/UserContext";
import { Produit } from "../components/ProductForm";
import EditProduit from "./EditProduit"; // on l'appelle localement

interface Props {
  onBack: () => void;
}

export default function ProduitsPage({ onBack }: Props) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");
  const [produitEnEdition, setProduitEnEdition] = useState<Produit | null>(null);
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

  useEffect(() => {
    chargerProduits();
  }, []);

  if (produitEnEdition) {
    return (
      <EditProduit
        produit={produitEnEdition}
        onBack={() => {
          setProduitEnEdition(null);
          chargerProduits(); // pour rafraîchir la liste après modif
        }}
      />
    );
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4">
        ⬅ Retour
      </button>

      <h1 className="text-2xl font-bold mb-4">
        {isAdmin ? "🛠 Gérer les Produits" : "📦 Répertoire Alimentaire"}
      </h1>

      <input
        type="text"
        placeholder="🔍 Rechercher un produit..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && rechercher()}
        className="border px-3 py-1 rounded w-full mb-4"
      />

      {isAdmin && (
        <button
          onClick={() => setProduitEnEdition({ id: 0, nom: "", description: "" })}
          className="mb-4 bg-green-600 text-white px-3 py-1 rounded"
        >
          ➕ Ajouter un produit
        </button>
      )}

      <ul className="space-y-2">
        {produits.map((p) => (
          <li
            key={p.id}
            className="bg-gray-100 p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <strong>{p.nom}</strong>
              {p.description && (
                <p className="text-sm mt-1 text-gray-700">{p.description}</p>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={() =>
                  setProduitEnEdition({
                    ...p,
                    description: p.description ?? "",
                  })
                }
                className="text-blue-600 hover:text-blue-800"
                title="Modifier"
              >
                ✏️
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
