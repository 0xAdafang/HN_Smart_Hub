import {
  Home,
  LineChart,
  GraduationCap,
  PhoneCall,
  Package,
  Users,
} from "lucide-react";
import { JSX } from "react";
import type { AppSection } from "../../App";
import { useUser } from "../../contexts/UserContext";

interface SidebarProps {
  onNavigate?: (s: AppSection) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useUser();
  return (
   <aside className="w-64 bg-[#F8FAF4] dark:bg-widgetDarkNature bg-opacity-80 backdrop-blur-sm border-r border-zinc-300 dark:border-borderDarkNature p-4 hidden md:block">


      <nav className="flex flex-col gap-4">
        <SidebarLink icon={<Home />} label="Dashboard" section="dashboard" onClick={onNavigate} />
        <SidebarLink icon={<LineChart />} label="Indicateurs RH" section="indicateurs" onClick={onNavigate} />
        {user?.role === "Admin" ? (
            <SidebarLink icon={<Users />} label="Congés" section="conges" onClick={onNavigate} />
          ) : (
            <SidebarLink icon={<Users />} label="Mes congés" section="mesConges" onClick={onNavigate} />
          )}
        <SidebarLink icon={<GraduationCap />} label="Formation" section="formation" onClick={onNavigate} />
        <SidebarLink icon={<Package />} label="Produits" section="produits" onClick={onNavigate} />
        <SidebarLink icon={<PhoneCall />} label="Télévente" section="televente" onClick={onNavigate} />
        {user?.role === "Admin" && (
        <SidebarLink
          icon={<Users />}
          label="Comptes"
          section="gestionComptes"
          onClick={onNavigate}
        />
)}
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
      className="flex items-center gap-3 p-2 rounded hover:bg-bioGreen/10 dark:hover:bg-zinc-800 cursor-pointer transition"
    >
      <div className="text-lg text-bioGreen dark:text-white">{icon}</div>
      <span className="font-medium text-black dark:text-[#E6F4E6]">{label}</span>
    </div>
  );
}
