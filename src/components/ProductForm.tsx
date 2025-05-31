import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

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
    try {
      if (produit) {
        await invoke("modifier_produit", {
          id: produit.id,
          nom,
          description: description || null,
        });
      } else {
        await invoke("ajouter_produit", {
          nom,
          description: description || null,
        });
      }
      onSuccess();
    } catch (e) {
      console.error("Erreur enregistrement produit :", e);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {produit ? "✏️ Modifier le produit" : "➕ Ajouter un produit"}
        </h2>

        <label className="block mb-2">
          Nom :
          <input
            className="w-full border px-2 py-1 mt-1"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          Description :
          <textarea
            className="w-full border px-2 py-1 mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 bg-gray-300 rounded">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white rounded">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
