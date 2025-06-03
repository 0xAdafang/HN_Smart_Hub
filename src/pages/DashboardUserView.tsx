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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Widget title="Évaluation RH">
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

      <Widget title="Congés">
        Il vous reste <strong>{joursCongesRestants} jours</strong> de congés (sur 14).
      </Widget>

      <Widget title="Alertes">
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
  );
}
