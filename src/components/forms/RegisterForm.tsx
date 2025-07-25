// RegisterForm.tsx
import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

type Props = {
  onBack: () => void;
};

export default function RegisterForm({ onBack }: Props) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    nom: "",
    prenom: "",
    poste: "",
    role: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Payload envoyé :", form);
      await invoke("'create_user'_and_employee", { payload: form });
      toast.success("Compte créé avec succès");
      onBack();
    } catch (err) {
      setError("Erreur lors de la création");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2>Créer un compte</h2>
      <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
      <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
      <input name="poste" placeholder="Poste" value={form.poste} onChange={handleChange} required />
      <input name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
      <select name="role" value={form.role} onChange={handleChange} required>
        <option value="">-- Sélectionner un rôle --</option>
        <option value="Admin">Admin</option>
        <option value="User">Utilisateur</option>
      </select>
      <button type="submit">Créer</button>
      <button type="button" onClick={onBack}>Retour</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
