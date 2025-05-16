import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import IndicateursRH from "./components/IndicateursRH";
import MaGrilleRH from "./components/MaGrilleRH";

// Tu peux gérer chaque section comme une chaîne de texte
type Section =
  | "dashboard"
  | "indicateurs"
  | "conges"
  | "formation"
  | "produits"
  | "televente"
  | "liens"
  | "createUser";

function App() {
  // État global de l'utilisateur
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"Admin" | "User">(() => {
  return (localStorage.getItem("role") as "Admin" | "User") ?? "User";
  });
  const [section, setSection] = useState<Section>("dashboard");

  // Simulé ici, mais tu peux le récupérer via SQL plus tard
  const handleLogin = (userRole: "Admin" | "User") => {
  localStorage.setItem("role", userRole);
  setLoggedIn(true);
  setRole(userRole);
  setSection("dashboard");
  };

  // Logique principale d'affichage
  if (!loggedIn) {
    return (
      <LoginForm
        onRegister={() => setSection("createUser")}
        onSuccess={(role) => handleLogin(role)} // ← temporaire, à remplacer par vrai rôle via backend
      />
    );
  }

  if (section === "createUser") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Créer un nouvel utilisateur</h2>
        <RegisterForm onBack={() => setSection("dashboard")} />
      </div>
    );
  }

  if (section === "indicateurs") {
  return (
    <>
      <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
      {role === "Admin" ? <IndicateursRH /> : <MaGrilleRH />}
    </>
  );
}

  return (
    <Dashboard
      role={role}
      onNavigate={(id) => setSection(id as Section)}
      onCreateUser={() => setSection("createUser")}
    />
  );
}

export default App;
