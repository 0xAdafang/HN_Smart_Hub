import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { useUser } from "../contexts/UserContext";


type Props = {
  onRegister: () => void;
  onSuccess: (role: "Admin" | "User") => void;
};

export default function LoginForm({ onRegister, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        name: `${result.prenom} ${result.nom}`,
        role: result.role,
      });

      console.log("✅ Résultat du login :", result);
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2>Connexion</h2>

      <input
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}


