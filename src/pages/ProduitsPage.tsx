import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useUser } from "../contexts/UserContext";
import { Produit } from "../components/ProductForm";
import EditProduit from "./EditProduit"; 
import { ChevronLeft, Search, Plus, Pencil, Boxes } from "lucide-react";
import AjoutProduit from "./AjoutProduit";


interface Props {
  onBack: () => void;
}

export default function ProduitsPage({ onBack }: Props) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [recherche, setRecherche] = useState("");
  const [produitEnEdition, setProduitEnEdition] = useState<Produit | null>(null);
  const [ajoutProduitMode, setAjoutProduitMode] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.role === "Admin";
  const [produitSelectionne, setProduitSelectionne] = useState<Produit | null>(null);

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
  if (ajoutProduitMode) {
  return (
    <AjoutProduit
      onBack={() => {
        setAjoutProduitMode(false);
        chargerProduits(); // rafraîchir la liste après ajout
      }}
    />
  );
}

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 transition text-sm"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <Boxes size={22} />
        {isAdmin ? "Gérer les Produits" : "Répertoire Alimentaire"}
      </h1>

      <div className="flex items-center gap-2 mb-4">
        <Search size={18} className="text-zinc-500" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && rechercher()}
          className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white w-64 text-sm focus:outline-none focus:ring-2 focus:ring-bioGreen"
        />
      </div>

      {isAdmin && (
        <button
          onClick={() => setAjoutProduitMode(true)}
          className="mb-4 flex items-center gap-2 bg-bioGreen hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          <Plus size={16} /> Ajouter un produit
        </button>
      )}

      <ul className="space-y-4">
        {produits.map((p) => (
         <li
          key={p.id}
          className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-md shadow-sm transition hover:shadow-md hover:scale-[1.01] ${
            !isAdmin ? "cursor-pointer" : ""
          }`}
            onClick={() => {
              if (!isAdmin) {
                setProduitSelectionne(p);
              }
            }} 
          >
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-white">{p.nom}</h3>
              {p.description && (
                <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                {p.description}
              </p>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  if (isAdmin) {
                    setProduitEnEdition({
                      ...p,
                      description: p.description ?? "",
                    });
                  } else {
                    setProduitSelectionne(p);
                  }
                }}
                className="px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded text-sm text-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-600 transition flex items-center gap-1"
                title="Modifier"
              >
                <Pencil size={16} /> Modifier
              </button>
            )}
          </li>
        ))}
        {produitSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow-lg w-full max-w-lg border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold mb-4 text-bioGreen dark:text-bioGreenLight">{produitSelectionne.nom}</h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
                {produitSelectionne.description || "Aucune description disponible."}
              </p>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setProduitSelectionne(null)}
                  className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </ul>
    </div>
  );
}
