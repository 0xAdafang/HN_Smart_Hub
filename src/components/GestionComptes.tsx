import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'react-toastify';
import { useUser } from "../contexts/UserContext";

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
    const [modal, setModal] = useState<{ open: boolean; user: Compte | null }>({ open: false, user: null });
    const [pw1, setPw1] = useState('');
    const [pw2, setPw2] = useState('');

    function openPwdModal(user: Compte) {
      setModal({ open: true, user });
      setPw1('');
      setPw2('');
    }
    function closePwdModal() {
      setModal({ open: false, user: null });
      setPw1('');
      setPw2('');
    }
    function isPasswordStrong(pwd: string): boolean {
      const longEnough = pwd.length >= 7;
      const hasNumber = /\d/.test(pwd);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
      return longEnough && hasNumber && hasSpecialChar;
    }

    const { user } = useUser();
    const estAdmin = user?.role === "Admin";

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
    const compte = comptes.find(u => u.id === id);
    if(!compte) return;

    if (compte.role === nouveauRole) {
      toast.info("Ce rôle est déjà assigné à l'utilisateur.");
      return;
    }

    try {
    await invoke("update_user_role", { id, role: nouveauRole });
    setComptes((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: nouveauRole } : u))
    );
    } catch (err: any) {
    console.error("Erreur changement rôle :", err);
    toast.error("Erreur : " + (err?.toString() ?? "inconnue"));
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
        toast.success("Erreur : " + (err?.toString() ?? "inconnue"));
        }
  };

  const handleResetPassword = async (id: number, nouveauMotDePasse: string) => {
    if(!nouveauMotDePasse) {
        toast.success("Veuillez entrer un nouveau mot de passe.");
        return;
    }

    try {
        await invoke("reset_user_password", { userId: id, newPassword: nouveauMotDePasse});
        toast.success("Mot de passe réinitialisé !");
        setComptes((prev) =>
            prev.map((u) => (u.id === id ? { ...u, nouveauMotDePasse: "" } : u))
        );
    } catch (err: any) {
        console.error("Erreur réinitialisation mot de passe :", err);
        toast.success("Erreur : " + (err?.toString() ?? "inconnue"));
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
            <th>Supprimer un compte</th>
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
                <button onClick={() => openPwdModal(c)}>🔑 Réinitialiser</button>
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
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Nouveau mot de passe – {modal.user?.username}
            </h3>

            <input
              type="password"
              placeholder="Mot de passe"
              value={pw1}
              onChange={e => setPw1(e.target.value)}
              className="w-full border rounded p-2 mb-2"
            />
            <input
              type="password"
              placeholder="Confirmation"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              className="w-full border rounded p-2"
            />

            {pw1 && pw2 && pw1 !== pw2 && (
              <p className="text-red-500 text-sm mt-1">
                Les mots de passe ne correspondent pas.
              </p>
            )}
            {pw1 && !isPasswordStrong(pw1) && (
              <p className="text-red-500 text-sm mt-1">
                Le mot de passe doit contenir au moins 7 caractères, un chiffre et un caractère spécial.
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closePwdModal}
                className="px-3 py-1 rounded bg-gray-300"
              >
                Annuler
              </button>

              <button
                disabled={!pw1 || pw1 !== pw2 || !isPasswordStrong(pw1)}
                onClick={async () => {
                  try {
                    await handleResetPassword(modal.user!.id, pw1);
                    closePwdModal();
                  } catch {
                    
                  }
                }}
                className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



