import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'react-toastify';
import { useUser } from "../contexts/UserContext";
import {
  ShieldCheck,
  UserCog,
  Trash2,
  KeyRound,
  Users2,
} from "lucide-react";

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-800 dark:text-white">
        <Users2 size={24} /> Gestion des comptes
      </h2>

      {erreur && (
        <p className="text-red-500 font-semibold mb-4">{erreur}</p>
      )}

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Prénom</th>
              <th className="p-3 text-left">Poste</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-center">Actions</th>
              <th className="p-3 text-center">Supprimer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {comptes.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                <td className="p-3">{c.nom}</td>
                <td className="p-3">{c.prenom}</td>
                <td className="p-3">{c.poste}</td>
                <td className="p-3">{c.username}</td>
                <td className="p-3">
                  <select
                    value={c.role}
                    onChange={(e) => handleChangeRole(c.id, e.target.value)}
                    className="border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-sm"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => openPwdModal(c)}
                    className="text-yellow hover:underline flex items-center gap-1 mx-auto"
                    title="Réinitialiser le mot de passe"
                  >
                    <KeyRound size={16} /> Réinitialiser
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline flex items-center gap-1 mx-auto"
                    title="Supprimer le compte"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} />
              Réinitialisation – {modal.user?.username}
            </h3>

            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-2 mb-2"
            />
            <input
              type="password"
              placeholder="Confirmation"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded p-2"
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
                className="px-3 py-1 rounded bg-zinc-300 text-zinc-800"
              >
                Annuler
              </button>
              <button
                disabled={!pw1 || pw1 !== pw2 || !isPasswordStrong(pw1)}
                onClick={async () => {
                  await handleResetPassword(modal.user!.id, pw1);
                  closePwdModal();
                }}
                className="px-3 py-1 rounded bg-bioGreen text-white disabled:opacity-50"
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



