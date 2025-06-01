import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  employeeId: number;
  role: "admin" | "user";
  onLogout: () => void;
}

type InfosEmploye = {
  prenom: string;
  nom: string;
};

export default function Options({ employeeId, role, onLogout }: Props) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("notifications") !== "off");
  const [infos, setInfos] = useState<InfosEmploye | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications ? "on" : "off");
  }, [notifications]);

  useEffect(() => {
    invoke<InfosEmploye>("get_infos_employe", { employeeId })
      .then(setInfos)
      .catch((err) => {
        toast.error("Erreur chargement infos employé");
        console.error(err);
      });
  }, [employeeId]);

  useEffect(() => {
    invoke<InfosEmploye>("get_infos_employe", { employeeId })
        .then(setInfos)
        .catch((err) => {
        console.error("Erreur chargement infos employé :", err);
        });
    }, [employeeId]);

  if (!infos) return <p>Chargement des informations...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">⚙️ Options</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">🎨 Apparence</h2>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span>Mode sombre</span>
        </label>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">🔔 Notifications</h2>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          <span>Activer les notifications</span>
        </label>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">👤 Utilisateur</h2>
        <p><strong>Nom :</strong> {infos.prenom} {infos.nom}</p>
        <p><strong>Rôle :</strong> {role === "admin" ? "Administrateur" : "Employé"}</p>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          🔓 Se déconnecter
        </button>
      </section>
    </div>
  );
}
