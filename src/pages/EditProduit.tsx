import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Produit } from "../components/ProductForm";
import { ChevronLeft, Pencil, Trash2, Save } from "lucide-react";


interface Props {
  produit: Produit;
  onBack: () => void;
}

export default function EditProduit({ produit, onBack }: Props) {
    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
  

  const enregistrer = async () => {
    if (!nom.trim()) return alert("Le nom est obligatoire");
    try {
      await invoke("modifier_produit", {
        id: produit.id,
        nom,
        description: description || null,
      });
      alert("✅ Produit modifié avec succès");
      onBack();
    } catch (e) {
      console.error("Erreur modification :", e);
      alert("❌ Erreur lors de la modification");
    }
  };

  const supprimer = async () => {
  const confirm = window.confirm("Supprimer ce produit ?");
  if (!confirm) return;
  try {
    await invoke("supprimer_produit", { id: produit.id });
    alert("✅ Produit supprimé");
    onBack();
  } catch (e) {
    console.error("Erreur suppression :", e);
    alert("❌ Erreur suppression");
  }
};

  useEffect(() => {
  console.log("Produit reçu pour édition :", produit);
  if (produit) {
    setNom(produit.nom ?? "");
    setDescription(produit.description ?? "");
  }
}, [produit]);

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 transition text-sm"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-6 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <Pencil size={20} /> Modifier le produit
      </h1>

      <label className="block mb-4 text-sm text-zinc-700 dark:text-zinc-200">
        Nom :
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
        />
      </label>

      <label className="block mb-6 text-sm text-zinc-700 dark:text-zinc-200">
        Description :
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={enregistrer}
          className="px-4 py-2 bg-bioGreen hover:bg-green-700 text-white rounded transition flex items-center gap-1 text-sm"
        >
          <Save size={16} /> Enregistrer
        </button>
        <button
          onClick={supprimer}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-1 text-sm"
        >
          <Trash2 size={16} /> Supprimer
        </button>
      </div>
    </div>
  );
}
