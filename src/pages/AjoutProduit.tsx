import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, Plus, Save } from "lucide-react";
import { addToQueue } from "../utils/offlineQueue";
import { toast } from "react-toastify";

interface Props {
  onBack: () => void;
}

export default function AjoutProduit({ onBack }: Props) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const enregistrer = async () => {
    if (!nom.trim()) return alert("Le nom est obligatoire");
    try {
      await invoke("ajouter_produit", { nom, description: description || null });
      setConfirmation(true);
      setTimeout(() => {
        setConfirmation(false);
        onBack();
      }, 2000);
    } catch (e) {
      console.warn("❌ Erreur réseau, fallback offline :", e);
      await addToQueue({
        type: "produit_ajout",
        nom,
        description: description || null,
      });
      toast("⏳ Produit stocké pour ajout différé.");
      onBack();
    }
  };
  
  {confirmation && (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
        ✅ Produit ajouté avec succès !
    </div>
    )}

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 transition text-sm"
      >
        <ChevronLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-6 text-bioGreen dark:text-bioGreenLight flex items-center gap-2">
        <Plus size={20} /> Ajouter un produit
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

      <button
        onClick={enregistrer}
        className="px-4 py-2 bg-bioGreen hover:bg-green-700 text-white rounded transition flex items-center gap-1 text-sm"
      >
        <Save size={16} /> Enregistrer
      </button>
    </div>
  );
}
