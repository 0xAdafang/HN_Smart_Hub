import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Pencil, X, Save } from "lucide-react";
import { addToQueue } from "../../utils/offlineQueue";
import { toast } from "react-toastify";

interface Props {
  produit?: Produit | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface Produit {
  id?: number;
  nom: string;
  description?: string | null;
}

export default function ProductForm({ produit, onSuccess, onCancel }: Props) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (produit) {
      setNom(produit.nom);
      setDescription(produit.description || "");
    } else {
      setNom("");
      setDescription("");
    }
  }, [produit]);

  const handleSubmit = async () => {
    if (!nom.trim()) return alert("Le nom est obligatoire");

    const data = {
      nom,
      description: description || null,
    };

    try {
      if (produit) {
        await invoke("modifier_produit", { id: produit.id, ...data });
        toast.success("✅ Produit modifié !");
      } else {
        await invoke("ajouter_produit", data);
        toast.success("✅ Produit ajouté !");
      }
      onSuccess();
    } catch (e) {
      console.warn("❌ Erreur réseau, fallback offline :", e);
      await addToQueue({
        type: produit ? "produit_modif" : "produit_ajout",
        ...(produit ? { id: produit.id } : {}),
        ...data,
      });
      toast.info("⏳ Action stockée pour synchro offline.");
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow-lg w-full max-w-md border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-800 dark:text-white">
          {produit ? (
            <>
              <Pencil size={20} /> Modifier le produit
            </>
          ) : (
            <>
              <Plus size={20} /> Ajouter un produit
            </>
          )}
        </h2>

        <label className="block mb-4 text-sm text-zinc-700 dark:text-zinc-200">
          Nom :
          <input
            className="w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </label>

        <label className="block mb-6 text-sm text-zinc-700 dark:text-zinc-200">
          Description :
          <textarea
            className="w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition flex items-center gap-1 text-sm"
          >
            <X size={16} /> Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-bioGreen hover:bg-green-700 text-white rounded transition flex items-center gap-1 text-sm"
          >
            <Save size={16} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
