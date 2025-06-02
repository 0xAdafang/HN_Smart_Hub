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

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 shadow-lg p-4 hidden md:block">
      <nav className="flex flex-col gap-4">
        <SidebarLink icon={<Home />} label="Dashboard" />
        <SidebarLink icon={<LineChart />} label="Indicateurs RH" />
        <SidebarLink icon={<Users />} label="Congés" />
        <SidebarLink icon={<GraduationCap />} label="Formation" />
        <SidebarLink icon={<Package />} label="Produits" />
        <SidebarLink icon={<PhoneCall />} label="Télévente" />
        {/* Logout peut être géré autrement */}
      </nav>
    </aside>
  );
}

function SidebarLink({ icon, label }: { icon: JSX.Element; label: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-marble dark:hover:bg-zinc-700 cursor-pointer transition">
      <div className="text-lg">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
  );
}
