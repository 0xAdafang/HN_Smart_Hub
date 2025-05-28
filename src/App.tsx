import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import IndicateursRH from "./components/IndicateursRH";
import MaGrilleRH from "./components/MaGrilleRH";
import GestionComptes from "./components/GestionComptes";
import MesConges from "./components/MesConges";
import GestionConges from "./components/GestionConges";
import TeleventePage from "./pages/Televente";
import { UserProvider, useUser } from "./contexts/UserContext"; 
import AdminTelevente from "./pages/AdminTelevente";
import FormationPage from "./pages/FormationPage";
import FormationModule from "./components/FormationModule";
import type { Module } from "./pages/FormationPage";
import AdminFormation from "./components/AdminFormation";


type Section =
  | "dashboard"
  | "indicateurs"
  | "conges"
  | "formation"
  | "produits"
  | "televente"
  | "liens"
  | "createUser"
  | "gestionComptes"
  | "mesConges"
  | "gestionConges"
  | "adminTelevente"
  | "adminFormation";


function AppContent() {
  const [section, setSection] = useState<Section>("dashboard");
  const { user, logout } = useUser();
  const [formationModule, setFormationModule] = useState<Module | null>(null);

  if (!user) {
    return (
      <LoginForm
        onRegister={() => setSection("createUser")}
        onSuccess={(loggedInUser) => {
          setSection("dashboard");
        }}
      />
    );
  }

  const isAdmin = user.role === "Admin";

  if (section === "createUser") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Créer un nouvel utilisateur</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setSection("gestionComptes")}>⬅ Retour</button>
        </div>
        <RegisterForm onBack={() => setSection("gestionComptes")} />
      </div>
    );
  }

  if (section === "gestionComptes") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Gestion des comptes</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
          <button onClick={() => setSection("createUser")}>➕ Créer un utilisateur</button>
        </div>
        <GestionComptes />
      </div>
    );
  }

  if (section === "indicateurs") {
    return (
      <>
        <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
        {isAdmin ? <IndicateursRH /> : <MaGrilleRH onBack={() => setSection("dashboard")} />}
      </>
    );
  }

  if (section === "conges") {
    return (
      <>
        <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
        {isAdmin ? <GestionConges /> : <MesConges />}
      </>
    );
  }

  if (section === "gestionConges") {
    return (
      <>
        <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
        <GestionConges />
      </>
    );
  }

  if (section === "mesConges") {
    return (
      <>
        <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
        <MesConges />
      </>
    );
  }

  if (section === "televente") {
  return (
    <>
      <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
      {user.role === "Admin" ? <AdminTelevente /> : <TeleventePage />}
    </>
  );
}
  if (section === "adminTelevente" && user.role === "Admin") {
  return (
    <>
      <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
      <AdminTelevente />
    </>
  );
}

if (section === "formation" && !isAdmin) {
  if (formationModule) {
    return (
      <FormationModule
        module={formationModule}
        employeeId={user.employe_id}
        onBack={() => setFormationModule(null)}
      />
    );
  }
  return (
    <>
      <button onClick={() => setSection("dashboard")}>⬅ Retour</button>
      <FormationPage onOpen={(m: any) => setFormationModule(m)} />
    </>
  );
}

if (section === "adminFormation" && isAdmin) {
  return <AdminFormation onBack={() => setSection("dashboard")} />;
}

  return (
    <Dashboard
      role={user.role}
      onNavigate={(id) => {
        if (id === "conges") {
          setSection(user.role === "Admin" ? "gestionConges" : "mesConges");
        } else {
          setSection(id as Section);
        }
      }}
            onCreateUser={() => setSection("createUser")}
            onLogout={logout}
          />
        );
      }



export default function App() {
  return (
    <UserProvider>
      <ToastContainer />
      <AppContent />
    </UserProvider>
  );
}
