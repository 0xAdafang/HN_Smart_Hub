import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Props = {
  onRegister: () => void;
  onSuccess: () => void;
};

export default function LoginForm({ onRegister, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await invoke("login_user", {
        payload: { username, password },
      });

      console.log("✅ Résultat du login :", result);
      alert(`Bienvenue ${username} !`);
      onSuccess(); // déclenche le passage au dashboard

    } catch (err) {
      console.error("❌ Erreur login :", err);
      setError("Échec de la connexion");
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

      <button type="submit">Se connecter</button>
      <button type="button" onClick={onRegister}>Créer un compte</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
