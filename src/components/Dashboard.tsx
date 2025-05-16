import React from "react";

type Props = {
  role: string;
  onNavigate: (section: string) => void;
  onCreateUser: () => void;
};

const sections = [
  { id: "indicateurs", label: "Indicateurs RH" },
  { id: "conges", label: "Congés" },
  { id: "formation", label: "Formation" },
  { id: "produits", label: "Produits" },
  { id: "televente", label: "Télévente" },
  { id: "liens", label: "Liens utiles" },
];

export default function Dashboard({ role, onNavigate, onCreateUser }: Props) {
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

      {/* Bouton visible uniquement pour Admin */}
      {role === "Admin" && (
        <div style={{ marginTop: 40 }}>
          <button onClick={onCreateUser}>Créer un nouvel utilisateur</button>
        </div>
      )}
    </div>
  );
}
