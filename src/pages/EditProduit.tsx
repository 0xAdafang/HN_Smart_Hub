import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Produit } from "../components/ProductForm";

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
      <button onClick={onBack} className="mb-4">
        ⬅ Retour
      </button>

      <h1 className="text-2xl font-bold mb-4">✏️ Modifier le produit</h1>

      <label className="block mb-4">
        Nom :
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full border px-3 py-1 mt-1"
        />
      </label>

      <label className="block mb-4">
        Description :
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-1 mt-1"
          rows={5}
        />
      </label>

      <button
        onClick={enregistrer}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Enregistrer
      </button>

      <button
        onClick={supprimer}
        className="bg-red-600 text-white px-4 py-2 rounded ml-2"
      >
        Supprimer
      </button>
    </div>
  );
}
