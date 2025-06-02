import React from "react";
import CardButton from "./ui/CardButton";
import {
  LineChart,
  CalendarDays,
  GraduationCap,
  Package,
  PhoneCall,
  Link,
  Settings,
  Users,
  LogOut,
} from "lucide-react";

type Props = {
  role: string;
  onNavigate: (section: string) => void;
  onCreateUser: () => void;
  onLogout: () => void;
};

export default function Dashboard({ role, onNavigate, onLogout, onCreateUser }: Props) {
  const handleLogoutClick = () => {
    window.alert("À bientôt 👋");
    onLogout();
  };

  const sections = [
    { id: "indicateurs", label: "Indicateurs RH", icon: <LineChart /> },
    { id: "conges", label: role === "Admin" ? "Gérer les congés" : "Congés", icon: <CalendarDays /> },
    { id: role === "Admin" ? "adminFormation" : "formation", label: "Formation", icon: <GraduationCap /> },
    { id: "produits", label: "Répertoire alimentaire", icon: <Package /> },
    { id: "televente", label: "Télévente", icon: <PhoneCall /> },
    { id: "liens", label: "Liens utiles", icon: <Link /> },
    { id: "options", label: "Options", icon: <Settings /> },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">📋 Tableau de bord</h1>
      <p className="text-zinc-600 dark:text-zinc-300">Bienvenue dans l'application !</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {sections.map((s) => (
          <CardButton key={s.id} label={s.label} icon={s.icon} onClick={() => onNavigate(s.id)} />
        ))}

        {role === "Admin" && (
          <CardButton
            label="👤 Gérer les comptes"
            icon={<Users />}
            onClick={() => onNavigate("gestionComptes")}
          />
        )}

        <CardButton
          label="🚪 Se déconnecter"
          icon={<LogOut />}
          onClick={handleLogoutClick}
        />
      </div>
    </div>
  );
}
