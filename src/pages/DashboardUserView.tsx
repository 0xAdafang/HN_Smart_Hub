import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Widget from "../components/ui/Widget";
import { useNavigate } from "react-router-dom";
import TodoWidget from "../components/TodoWidget";
import {
  AlertTriangle,
  PhoneCall,
  Truck,
  FileText,
  CheckCircle,
} from "lucide-react";
import CalendarWidget from "../components/CalendarWidget";
import { useUser } from "../contexts/UserContext";   

interface DashboardUserViewProps {
  onNavigate: (route: string) => void;
}

export default function DashboardUserView({ onNavigate }: DashboardUserViewProps) {        
  const { user } = useUser();                        
  const employe_id = user?.employe_id;               

  const [joursCongesRestants, setJoursCongesRestants] = useState(14);
  const [aNouvelleEvaluation, setANouvelleEvaluation] = useState(false);
  const [evaluationId, setEvaluationId] = useState<number | null>(null);


  useEffect(() => {
    if (!user?.id) return;

    const id = user.id;

    invoke<number>("get_conges_restants", { id })
      .then(setJoursCongesRestants)
      .catch((e) => console.error("Erreur chargement congés :", e));

    invoke<{ id: number | null }>("has_new_evaluation", { id })
      .then((res) => {
        setANouvelleEvaluation(!!res.id);
        setEvaluationId(res.id);
      })
      .catch((e) => console.error("Erreur évaluation :", e));
  }, [user]);

  const handleConsulterEvaluation = () => {
    if (!evaluationId) return;
    invoke("set_evaluation_vue", { id: evaluationId })
      .then(() => {
        setANouvelleEvaluation(false);
        onNavigate("indicateurs"); 
      })
      .catch((e) => console.error("Erreur mise à jour évaluation :", e));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Colonne gauche : calendrier + todo */}
      <div className="w-full xl:w-[460px] flex-shrink-0 space-y-6">
        <CalendarWidget />
        <TodoWidget selectedDate={new Date()} />
      </div>

      {/* Colonne droite : widgets indépendants 2 par ligne */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 self-start">
        <Widget title="Évaluation RH" className="min-h-[100px]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {aNouvelleEvaluation ? (
              <>
                <FileText size={16} className="text-yellow-600 dark:text-yellow-400" />
                <span>Nouvelle évaluation disponible</span>
                <button
                  onClick={handleConsulterEvaluation}
                  className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  Consulter
                </button>
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
