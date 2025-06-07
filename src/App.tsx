import React, { useState } from "react";
import './styles.css';
import { ThemeProvider } from "./lib/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
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
import ProduitsPage from "./pages/ProduitsPage";
import { Produit } from "./components/ProductForm";
import ProduitsAdmin from "./pages/ProduitsAdmin";
import EditProduit from "./pages/EditProduit";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AjoutProduit from "./pages/AjoutProduit";

export type AppSection =
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
  | "adminFormation"
  | "produitsAdmin"     
  | "editProduit"
  | "ajouterProduit"
  | "options"; 


function AppContent() {
  const [section, setSection] = useState<AppSection>("dashboard");
  const { user, logout } = useUser();
  const [formationModule, setFormationModule] = useState<Module | null>(null);
  const [produitAModifier, setProduitAModifier] = useState<Produit | null>(null);
  const [renderKey, setRenderKey] = useState(0);

 if (!user) {
  return (
    <LoginPage
      onSuccess={() => setSection("dashboard")}
    />
  );
}

  const isAdmin = user.role === "Admin";

  return (
    <Layout onNavigate={(s: AppSection) => setSection(s)}>
      {(() => {
        switch (section) {
          case "dashboard":
            return <DashboardPage onNavigate={setSection} />;

          case "indicateurs":
            return isAdmin ? (
              <IndicateursRH />
            ) : (
              <MaGrilleRH onBack={() => { setRenderKey(k => k + 1); setSection("dashboard")}} />
            );

          case "conges":
          case "gestionConges":
            return <GestionConges />;
          case "mesConges":
            return <MesConges />;

          case "formation":
            return formationModule ? (
              <FormationModule
                module={formationModule}
                employeeId={user.employe_id}
                onBack={() => setFormationModule(null)}
              />
            ) : (
              <FormationPage onOpen={(m) => setFormationModule(m)} />
            );

          case "adminFormation":
            return isAdmin ? (
              <AdminFormation onBack={() => setSection("dashboard")} />
            ) : (
              <DashboardPage onNavigate={setSection} />
            );

          case "televente":
          case "adminTelevente":
            return isAdmin ? <AdminTelevente /> : <TeleventePage />;

          case "produits":
            return <ProduitsPage onBack={() => setSection("dashboard")} />;

          case "produitsAdmin":
            return (
              <ProduitsAdmin
                onBack={() => setSection("dashboard")}
                onEdit={(p) => {
                  setProduitAModifier(p);
                  setSection("editProduit");
                }}
              />
            );

          case "editProduit":
            return produitAModifier ? (
              <EditProduit
                produit={produitAModifier}
                onBack={() => setSection("produitsAdmin")}
              />
            ) : (
              <DashboardPage key={renderKey} onNavigate={setSection} />
            );
            
          case "ajouterProduit":
            return <AjoutProduit onBack={() => setSection("produitsAdmin")} />;

          case "gestionComptes":
            return <GestionComptes />;

          case "createUser":
            return <RegisterForm onBack={() => setSection("gestionComptes")} />;

          default:
            return <DashboardPage onNavigate={setSection} />; // ← éviter TS error
        }
      })()}
    </Layout>
  );
}


export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <ToastContainer />
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}
