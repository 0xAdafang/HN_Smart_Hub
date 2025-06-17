import React, { useEffect, useState } from "react";
import "./styles.css";
import { ThemeProvider } from "./lib/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegisterForm from "./components/forms/RegisterForm";
import IndicateursRH from "./components/rh/IndicateursRH";
import MaGrilleRH from "./components/rh/MaGrilleRH";
import GestionComptes from "./components/forms/GestionComptes";
import MesConges from "./components/rh/MesConges";
import GestionConges from "./components/forms/GestionConges";
import TeleventePage from "./pages/televente/Televente";
import { UserProvider, useUser } from "./contexts/UserContext";
import AdminTelevente from "./pages/televente/AdminTelevente";
import FormationPage from "./pages/formation/FormationPage";
import FormationModule from "./components/forms/FormationModule";
import type { Module } from "./pages/formation/FormationPage";
import AdminFormation from "./components/forms/AdminFormation";
import ProduitsPage from "./pages/repertoire alimentaire/ProduitsPage";
import { Produit } from "./components/forms/ProductForm";
import ProduitsAdmin from "./pages/repertoire alimentaire/ProduitsAdmin";
import EditProduit from "./pages/repertoire alimentaire/EditProduit";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/login/LoginPage";
import AjoutProduit from "./pages/repertoire alimentaire/AjoutProduit";
import { getQueue, removeFromQueue } from "./utils/offlineQueue";
import { invoke } from "@tauri-apps/api/core";

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
  const [produitAModifier, setProduitAModifier] = useState<Produit | null>(
    null
  );
  const [renderKey, setRenderKey] = useState(0);

  if (!user) {
    return <LoginPage onSuccess={() => setSection("dashboard")} />;
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
              <MaGrilleRH
                onBack={() => {
                  setRenderKey((k) => k + 1);
                  setSection("dashboard");
                }}
              />
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
  useOfflineSync();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <ToastContainer />
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}

async function synchronizeQueue() {
  const queue = await getQueue();
  for (const item of queue) {
    console.log("🛰️  invoke save_offline_action");
    try {
      const res = await invoke("save_offline_action", { payload: item });
      if (res === "ok") {
        console.log("✅ Action synchronisée :", item);
        await removeFromQueue(item.id);
      } else {
        console.warn("⚠️ Erreur de synchro :", res);
      }
    } catch (e) {
      console.error("❌ Échec d’envoi pour :", item, e);
    }
  }
}

export function useOfflineSync() {
  useEffect(() => {
    const handleOnline = () => {
      console.log("🔌 Connexion restaurée, lancement de la synchro...");
      synchronizeQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
