import { useState } from "react";
import TeleventeForm from "../components/TeleventeForm";
import MesVentes from "../pages/MesVentes";
import Succes from "../pages/Succes";
import { PhoneCall, BarChart3, Trophy } from "lucide-react";
import { useUser } from "../contexts/UserContext";


export default function TeleventePage() {
  const { user } = useUser();
  const employeeId = user?.id; 

  const [subSection, setSubSection] = useState<"form" | "ventes" | "succes">("form");

  return (
  <div className="p-8 min-h-screen bg-gray-100 dark:bg-zinc-900 text-zinc-800 dark:text-white">
    <div className="mb-6 flex justify-center gap-4 flex-wrap">
      <button
        onClick={() => setSubSection("form")}
        className={`px-4 py-2 rounded-md transition font-semibold flex items-center gap-2
          ${subSection === "form"
            ? "bg-bioGreen text-white"
            : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
          }`}
      >
        <PhoneCall size={16} /> Appels
      </button>

      <button
        onClick={() => setSubSection("ventes")}
        className={`px-4 py-2 rounded-md transition font-semibold flex items-center gap-2
          ${subSection === "ventes"
            ? "bg-bioGreen text-white"
            : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
          }`}
      >
        <BarChart3 size={16} /> Mes ventes
      </button>

      <button
        onClick={() => setSubSection("succes")}
        className={`px-4 py-2 rounded-md transition font-semibold flex items-center gap-2
          ${subSection === "succes"
            ? "bg-bioGreen text-white"
            : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
          }`}
      >
        <Trophy size={16} /> Succès
      </button>
    </div>

    <div className="flex justify-center">
      {subSection === "form" && employeeId !== undefined && <TeleventeForm employeeId={employeeId} />}
      {subSection === "ventes" && employeeId !== undefined && <MesVentes employeeId={employeeId} />}
      {subSection === "succes" && employeeId !== undefined && <Succes employeeId={employeeId} />}
    </div>
  </div>
);


}

