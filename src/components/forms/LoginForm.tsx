import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useUser } from "../../contexts/UserContext";
import { motion } from "framer-motion";

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

      onSuccess(result.role);
    } catch (err) {
      console.error("❌ Erreur login :", err);
      setError("Nom d'utilisateur ou mot de passe incorrect.");
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

    {error && (
      <motion.div
        className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm border border-red-300"
        initial={{ x: 0 }}
        animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0] }}
        transition={{ duration: 0.5 }}
      >
        {error}
      </motion.div>
    )}

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
