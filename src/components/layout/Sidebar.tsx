import {
  Home,
  LineChart,
  GraduationCap,
  PhoneCall,
  Package,
  Users,
  LogOut,
} from "lucide-react";
import { JSX } from "react";

import type { AppSection } from "../../App";

interface SidebarProps {
  onNavigate?: (s: AppSection) => void;
}


export default function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 shadow-lg p-4 hidden md:block">
      <nav className="flex flex-col gap-4">
        <SidebarLink icon={<Home />} label="Dashboard" section="dashboard" onClick={onNavigate} />
        <SidebarLink icon={<LineChart />} label="Indicateurs RH" section="indicateurs" onClick={onNavigate} />
        <SidebarLink icon={<Users />} label="Congés" section="conges" onClick={onNavigate} />
        <SidebarLink icon={<GraduationCap />} label="Formation" section="formation" onClick={onNavigate} />
        <SidebarLink icon={<Package />} label="Produits" section="produits" onClick={onNavigate} />
        <SidebarLink icon={<PhoneCall />} label="Télévente" section="televente" onClick={onNavigate} />
      </nav>
    </aside>
  );
}

function SidebarLink({
  icon,
  label,
  section,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  section: AppSection;
  onClick?: (s: AppSection) => void;
}) {
  return (
    <div
      onClick={() => onClick?.(section)}
      className="flex items-center gap-3 p-2 rounded hover:bg-marble dark:hover:bg-zinc-700 cursor-pointer transition"
    >
      <div className="text-lg">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
  );
}