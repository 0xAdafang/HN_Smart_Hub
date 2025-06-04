import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Widget from "../components/ui/Widget";
import {
  AlertTriangle,
  PhoneCall,
  Truck,
  FileText,
  CheckCircle,
} from "lucide-react";
import CalendarWidget from "../components/CalendarWidget";
import { DayPicker } from "react-day-picker";

interface Props {
  employeeId: number;
}

export default function DashboardUserView({ employeeId }: Props) {
  const [joursCongesRestants, setJoursCongesRestants] = useState<number>(14);
  const [aNouvelleEvaluation, setANouvelleEvaluation] = useState<boolean>(false);

  useEffect(() => {
    invoke<number>("get_conges_restants", { employeeId })
      .then(setJoursCongesRestants)
      .catch((e) => console.error("Erreur chargement congés :", e));

    invoke<boolean>("has_new_evaluation", { employeeId })
      .then(setANouvelleEvaluation)
      .catch((e) => console.error("Erreur évaluation :", e));
  }, [employeeId]);

  return (
  <div className="flex flex-col xl:flex-row gap-6">
    {/* Colonne gauche : calendrier aligné avec admin view */}
    <div className="w-full xl:w-[460px] flex-shrink-0 space-y-6">
       <CalendarWidget />
    </div>

    {/* Colonne droite : widgets en 2 colonnes */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
      <Widget title="Évaluation RH" className="min-h-[100px]">
        <div className="flex items-center gap-2">
          {aNouvelleEvaluation ? (
            <>
              <FileText size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span>Nouvelle évaluation disponible</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              <span>Aucune nouvelle évaluation</span>
            </>
          )}
        </div>
      </Widget>

      <Widget title="Congés" className="min-h-[80px]">
        Il vous reste <strong>{joursCongesRestants} jours</strong> de congés (sur 14).
      </Widget>

      <Widget title="Alertes" className="min-h-[140px] sm:col-span-1">
        <div className="flex items-center gap-2">
          <PhoneCall size={16} /> Liste d’appels à faire
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
          Aucune télévente aujourd’hui
        </div>
        <div className="flex items-center gap-2">
          <Truck size={16} /> Vérifier les routes de livraison
        </div>
      </Widget>
    </div>
  </div>
);

}
