import React from "react";

type Props = {
  role: string;
  onNavigate: (section: string) => void;
  onCreateUser: () => void;
  onLogout: () => void;
};

const sections = [
  { id: "indicateurs", label: "Indicateurs RH" },
  { id: "conges", label: "Congés" },
  { id: "formation", label: "Formation" },
  { id: "produits", label: "Produits" },
  { id: "televente", label: "Télévente" },
  { id: "liens", label: "Liens utiles" },
];

export default function Dashboard({ role, onNavigate, onCreateUser, onLogout }: Props) {
  const handleLogoutClick = () => {
    window.alert("À bientôt 👋");
    onLogout();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord</h1>
      <p>Bienvenue dans l'application !</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 30 }}>
        {sections.map((s) => (
          <div
            key={s.id}
            onClick={() => onNavigate(s.id)}
            style={{
              flex: "1 0 30%",
              padding: 20,
              backgroundColor: "#f0f0f0",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
              minWidth: 150,
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Boutons bas du dashboard */}
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 10 }}>
        {role === "Admin" && (
          <button onClick={() => onNavigate("gestionComptes")}>
            👤 Gérer les comptes
          </button>
        )}
        <button
          onClick={handleLogoutClick}
          style={{ backgroundColor: "#ffcccc", color: "black" }}
        >
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  );
}
