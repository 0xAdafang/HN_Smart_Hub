import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Compte {
    id: number;
    username: string;
    role: string;
    nom: string;
    prenom: string;
    poste: string;
    nouveauMotDePasse?: string;
}

export default function GestionComptes() {
    const [comptes, setComptes] = useState<Compte[]>([]);
    const [erreur, setErreur] = useState<string | null>(null);

    const estAdmin = localStorage.getItem("role") === "Admin";

    useEffect(() => {
    if (!estAdmin) return;

    invoke("get_all_users")
      .then((res) => setComptes(res as Compte[]))
      .catch((err) => {
        console.error(err);
        setErreur("Erreur lors du chargement des comptes");
      });
  }, []);

  const handleChangeRole = async (id: number, nouveauRole: string) => {
    try {
    await invoke("update_user_role", { id, role: nouveauRole });
    setComptes((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: nouveauRole } : u))
    );
    } catch (err: any) {
    console.error("Erreur changement rôle :", err);
    alert(err);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmer = confirm("Supprimer ce compte ? Cette action est définitive.");
    if(!confirmer) return;

    try {
        await invoke("delete_user_and_employee", { id });
        setComptes((prev) => prev.filter((u) => u.id !== id));
        } catch (err: any) {
        console.error("Erreur suppression :", err);
        alert("Erreur : " + (err?.toString() ?? "inconnue"));
        }
  };

  const handleResetPassword = async (id: number, nouveauMotDePasse: string) => {
    if(!nouveauMotDePasse) {
        alert("Veuillez entrer un nouveau mot de passe.");
        return;
    }

    try {
        await invoke("reset_user_password", { userId: id, newPassword: nouveauMotDePasse});
        alert("✅ Mot de passe réinitialisé !");
        setComptes((prev) =>
            prev.map((u) => (u.id === id ? { ...u, nouveauMotDePasse: "" } : u))
        );
    } catch (err: any) {
        console.error("Erreur réinitialisation mot de passe :", err);
        alert("Erreur : " + (err?.toString() ?? "inconnue"));
    }
};

  if (!estAdmin) return <p>⛔ Accès réservé aux administrateurs.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestion des comptes</h2>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <table border={1} cellPadding={5} style={{ width: "100%", marginTop: 10 }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Poste</th>
            <th>Username</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comptes.map((c) => (
            <tr key={c.id}>
              <td>{c.nom}</td>
              <td>{c.prenom}</td>
              <td>{c.poste}</td>
              <td>{c.username}</td>
              <td>
                <select
                  value={c.role}
                  onChange={(e) => handleChangeRole(c.id, e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(c.id)} style={{ color: "red", marginBottom: "5px" }}>
                    Supprimer
                </button>
                <br />
                <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    onChange={(e) =>
                    setComptes((prev) =>
                        prev.map((u) =>
                        u.id === c.id ? { ...u, nouveauMotDePasse: e.target.value } : u
                        )
                    )
                    }
                />
                <button
                    onClick={() => handleResetPassword(c.id, c.nouveauMotDePasse ?? "")}
                    disabled={!c.nouveauMotDePasse}
                >
                    🔑 Réinitialiser
                </button>
                </td>
              <td>
                <button onClick={() => handleDelete(c.id)} style={{ color: "red" }}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



