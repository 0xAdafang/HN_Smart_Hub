import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Widget from "../../components/ui/Widget";
import CalendarWidget from "../../components/ui/CalendarWidget";
import "react-day-picker/dist/style.css";
import {
  ClipboardList,
  CalendarClock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserX,
} from "lucide-react";
import TodoWidget from "../../components/ui/TodoWidget";

interface TeleventeEntry {
  employee_id: number;
  employee_name: string;
  date: string;
  quantity: number;
}

interface Conge {
  statut?: string;
}

interface Evaluation {
  employee_id: number;
  date_evaluation: string;
  rendement: number;
  ponctualite: number;
  assiduite: number;
}

export default function DashboardAdminView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [televentes, setTeleventes] = useState<TeleventeEntry[]>([]);

  useEffect(() => {
    invoke<Evaluation[]>("get_all_evaluations")
      .then(setEvaluations)
      .catch(console.error);
    invoke<Conge[]>("get_all_conges").then(setConges).catch(console.error);
    invoke<TeleventeEntry[]>("get_all_televente_entries")
      .then(setTeleventes)
      .catch(console.error);
  }, []);

  const evaluationsAFaire = evaluations.length;
  const demandesConges = conges.filter((c) => c.statut === "En attente").length;
  const ventesAujourdHui = televentes.filter(
    (v) => v.date === new Date().toISOString().slice(0, 10)
  );
  const totalVentes = ventesAujourdHui.reduce((sum, v) => sum + v.quantity, 0);

  const noteCritique = evaluations.find(
    (e) => e.rendement < 3 || e.assiduite < 3 || e.ponctualite < 3
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Colonne gauche : calendrier ajusté */}
      <div className="w-full xl:w-[460px] flex-shrink-0 space-y-6">
        <CalendarWidget />
      </div>

      {/* Colonne droite : widgets empilés en grille 2 colonnes */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 flex-1 auto-rows-min">
        <Widget title="Évaluations RH" className="min-h-[100px]">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} />
            {evaluationsAFaire > 0 ? (
              <span>{evaluationsAFaire} évaluations en base</span>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span>Aucune évaluation en attente</span>
              </>
            )}
          </div>
        </Widget>

        <Widget title="Demandes de congé" className="min-h-[50px]">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} />
            {demandesConges > 0 ? (
              <span>{demandesConges} demandes en attente</span>
            ) : (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span>Aucune nouvelle demande</span>
              </>
            )}
          </div>
        </Widget>

        <Widget title="Téléventes" className="min-h-[60px]">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span>
              Total du jour : <strong>{totalVentes}</strong>
            </span>
          </div>
          <div className="text-sm opacity-70 ml-6">
            Nombre d’entrées : {ventesAujourdHui.length}
          </div>
        </Widget>

        <Widget title="Alertes" className="min-h-[120px]">
          {totalVentes < 5 && (
            <div className="flex items-center gap-2 text-orange-500">
              <AlertCircle size={16} />
              <span>Peu de téléventes aujourd’hui</span>
            </div>
          )}
          {noteCritique ? (
            <div className="flex items-center gap-2 text-red-600 mt-2">
              <UserX size={16} />
              <span>
                Employé critique : #{noteCritique.employee_id} (note :{" "}
                {noteCritique.rendement}/5)
              </span>
            </div>
          ) : (
            totalVentes >= 5 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span>Aucun signalement</span>
              </div>
            )
          )}
        </Widget>
        <TodoWidget />
      </div>
    </div>
  );
}
