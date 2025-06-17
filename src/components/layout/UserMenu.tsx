import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { UploadCloud } from "lucide-react";
import { OfflineQueueModal } from "../ui/OfflineQueueStatus";

interface Props {
  employeeId: number;
  role: "admin" | "user";
  onLogout: () => void;
}

type InfosEmploye = {
  prenom: string;
  nom: string;
};

export default function UserMenu({ employeeId, role, onLogout }: Props) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("notifications") !== "off"
  );
  const [infos, setInfos] = useState<InfosEmploye | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);

  useEffect(() => {
    invoke<InfosEmploye>("get_infos_employe", { employeeId })
      .then(setInfos)
      .catch(console.error);
  }, [employeeId]);

  useEffect(() => {
    localStorage.setItem("notifications", notifications ? "on" : "off");
  }, [notifications]);

  if (!infos) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-widgetDarkNature text-black dark:text-[#E6F4E6] border border-zinc-300 dark:border-borderDarkNature hover:bg-zinc-100 dark:hover:bg-[#3A3F37] transition">
            <div className="rounded-full bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white w-8 h-8 flex items-center justify-center text-sm font-bold">
              {infos.prenom[0]}
            </div>
            <span className="text-sm font-medium">
              {infos.prenom} {infos.nom}
            </span>
            <svg className="w-4 h-4 fill-white" viewBox="0 0 20 20">
              <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.01l3.71-3.78a.75.75 0 0 1 1.08 1.04l-4.25 4.33a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
            </svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="z-[999] p-2 rounded-xl shadow-lg bg-white dark:bg-widgetDarkNature border border-zinc-200 dark:border-borderDarkNature w-56 mt-2">
          <DropdownMenuLabel className="text-sm font-semibold text-black dark:text-white">
            {role === "admin" ? "Administrateur" : "Employé"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex justify-between items-center cursor-pointer px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-black dark:text-white"
          >
            <span className="flex items-center gap-2">
              {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
              Mode
            </span>
            <span className="text-xs opacity-60 capitalize">{theme}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setNotifications((n) => !n)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-black dark:text-white"
          >
            <Bell size={16} />
            {notifications ? "Désactiver notif." : "Activer notif."}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOfflineOpen(true)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-black dark:text-white"
          >
            <UploadCloud size={16} />
            File offline
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 cursor-pointer px-3 py-2 hover:bg-red-100 dark:hover:bg-red-800 rounded"
          >
            <LogOut size={16} />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <OfflineQueueModal
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
      />
    </>
  );
}
