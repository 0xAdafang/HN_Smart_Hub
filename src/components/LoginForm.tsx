import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { useUser } from "../contexts/UserContext";

type Props = {
  onSuccess: (role: "Admin" | "User") => void;
};

export default function LoginForm({onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await invoke("login_user", {
        payload: { username, password },
      }) as {
        username: string;
        role: "Admin" | "User";
        prenom: string;
        nom: string;
        employe_id: number;
      };

      login({
        id: result.employe_id,
        prenom: result.prenom,
        nom: result.nom,
        role: result.role,
        employe_id: result.employe_id,
      });

      toast.success(`Bienvenue ${result.prenom} !`);
      onSuccess(result.role);
    } catch (err) {
      console.error("❌ Erreur login :", err);
      toast.error("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
    <div>
      <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">
        Nom d'utilisateur
      </label>
      <input
        className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2A2E27] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">
        Mot de passe
      </label>
      <input
        type="password"
        className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#2A2E27] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-bioGreen"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    {error && <p className="text-red-500 text-sm">{error}</p>}

    <button
      type="submit"
      disabled={loading}
      className="w-full py-2 px-4 bg-bioGreen hover:bg-green-700 text-white font-semibold rounded-md transition"
    >
      {loading ? "Connexion..." : "Se connecter"}
    </button>
  </form>
  );
}
