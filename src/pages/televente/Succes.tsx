import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Award,
  Phone,
  Target,
  CalendarCheck,
  Flame,
  Lock,
  CheckCircle,
  Sparkles,
  Repeat,
  RefreshCw,
  Crown
} from "lucide-react";
import { toast } from "react-toastify";


type Vente = {
  hit_click: boolean;
  date: string;
  employee_id: number;
};

type UnlockedAchievement = {
  code: string;
  unlocked_at: string;
};

export default function Succes({ employeeId }: { employeeId: number }) {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [unlockedList, setUnlockedList] = useState<UnlockedAchievement[]>([]);


  useEffect(() => {
  const fetchData = async () => {
    
    const today = new Date().toISOString().split("T")[0];
    try {
      const result: Vente[] = await invoke("get_televente_entries_by_date", { date: today });
      setVentes(result.filter(v => v.employee_id === employeeId));

      const res: UnlockedAchievement[] = await invoke("get_user_achievements", {
        employeeId: employeeId,
        });
        setUnlockedList(res);
    } catch (err) {
      console.error("Erreur succès :", err);
    }
  };

  fetchData();
}, [employeeId]);

    useEffect(() => {
    const unlockSuccesses = async () => {
        try {
        if (ventes.length >= 1) {
            await invoke("unlock_achievement", {
            payload: {
                employee_id: employeeId,
                achievement_code: "first_call",
            },
            });
            toast.success('🎉 Succès "Premier appel" débloqué !');
        }

        if (ventes.length >= 10) {
            await invoke("unlock_achievement", {
            payload: {
                employee_id: employeeId,
                achievement_code: "ten_calls_day",
            },
            });
            toast.success('🎉 Succès "Appels en rafale (10/jour)" débloqué !');
        }

        const hits = ventes.filter((v) => v.hit_click).length;
        if (hits >= 5) {
            await invoke("unlock_achievement", {
            payload: {
                employee_id: employeeId,
                achievement_code: "five_hit",
            },
            });
            toast.success('🎉 Succès "100% Hit (5 ventes)" débloqué !');
        }
        const total = ventes.length;


      // Trente appels cumulés
      if (total >= 30) {
        await invoke("unlock_achievement", {
          payload: {
            employee_id: employeeId,
            achievement_code: "thirty_total",
          },
        });
        toast.success('🎉 Succès "30 ventes cumulées" débloqué !');
      }

      // Journée sans Hit
      if (total > 0 && hits === 0) {
        await invoke("unlock_achievement", {
          payload: {
            employee_id: employeeId,
            achievement_code: "no_hit_day",
          },
        });
        toast.success('🎉 Succès "Journée sans Hit" débloqué !');
      }

      // Combo de 3 Hit d'affilée (simplifié)
      let combo = 0;
      for (const v of ventes) {
        if (v.hit_click) {
          combo++;
          if (combo >= 3) break;
        } else {
          combo = 0;
        }
      }
      
      if (combo >= 3) {
        await invoke("unlock_achievement", {
          payload: {
            employee_id: employeeId,
            achievement_code: "combo_hit",
          },
        });
        toast.success('🎉 Succès "Combo 3 Hits" débloqué !');
      }

      if (ventes.length >= 100) {
        await invoke("unlock_achievement", {
          payload: { employee_id: employeeId, achievement_code: "hundred_total" },
        });
        toast.success('🎉 Succès "100 ventes totales" débloqué !');
      }

      const totalHits = ventes.filter((v) => v.hit_click).length;
        if (totalHits >= 1000) {
          await invoke("unlock_achievement", {
            payload: { employee_id: employeeId, achievement_code: "televendeur_master" },
          });
          toast.success('🎉 Succès "Maître télévendeur" débloqué !');
        }

      const daysSet = new Set(ventes.map((v) => v.date));
      if (daysSet.size >= 3) {
        await invoke("unlock_achievement", {
          payload: { employee_id: employeeId, achievement_code: "weekly_active" },
        });
        toast.success('🎉 Succès "3 jours/semaine" débloqué !');
      }

      const sortedDates = [...daysSet].sort();
      let streak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i - 1]);
        const d2 = new Date(sortedDates[i]);
        const diff = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
        streak = diff === 1 ? streak + 1: 1; 
        if(streak >=5) break;
      }

      if (streak >=5 ) {
        await invoke("unlock_achievement", {
          payload : { employee_id: employeeId, achievement_code: "five_days_row" },
        });
        await invoke("unlock_achievement", {
          payload : { employee_id: employeeId, achievement_code: "five_day_streak" },
        });
        toast.success('🎉 Succès "5 jours consécutifs" et "Série de feu" débloqués !');
      }

        } catch (err) {
        console.error("Erreur déblocage succès :", err);
        }
    };

    unlockSuccesses();
  }, [ventes]);


    const getDate = (code: string) => {
    const found = unlockedList.find(a => a.code === code);
    return found ? new Date(found.unlocked_at).toLocaleDateString() : null;
    };

    const unlocked = {
      first_call: !!getDate("first_call"),
      ten_calls_day: !!getDate("ten_calls_day"),
      five_hit: !!getDate("five_hit"),
      thirty_total: !!getDate("thirty_total"),
      no_hit_day: !!getDate("no_hit_day"),
      combo_hit: !!getDate("combo_hit"),
      five_days_row: !!getDate("five_days_row"),
      weekly_active: !!getDate("weekly_active"),
      hundred_total: !!getDate("hundred_total"),
      five_day_streak: !!getDate("five_day_streak"),
      first_flip: !!getDate("first_flip"),
      televendeur_master: !!getDate("televendeur_master"),
    };

  return (
    <div className="p-6 bg-white dark:bg-zinc-800 rounded shadow max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white flex items-center gap-2">
        <Award size={24} /> Succès débloqués
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Premier appel",
            code: "first_call",
            icon: <Phone size={28} />,
          },
          {
            label: "Appels en rafale (10/jour)",
            code: "ten_calls_day",
            icon: <Repeat size={28} />,
          },
          {
            label: "100% Hit (5 ventes)",
            code: "five_hit",
            icon: <Target size={28} />,
          },
          {
            label: "30 ventes cumulées",
            code: "thirty_total",
            icon: <CalendarCheck size={28} />,
          },
          {
            label: "Journée sans Hit",
            code: "no_hit_day",
            icon: <RefreshCw size={28} />,
          },
          {
            label: "Combo 3 Hits",
            code: "combo_hit",
            icon: <Sparkles size={28} />,
          },
          {
            label: "3 jours/semaine",
            code: "weekly_active",
            icon: <CalendarCheck size={28} />,
          },
          {
            label: "5 jours consécutifs",
            code: "five_days_row",
            icon: <Flame size={28} />,
          },
          {
            label: "Série de feu",
            code: "five_day_streak",
            icon: <Flame size={28} />,
          },
          {
            label: "Retour du destin",
            code: "first_flip",
            icon: <RefreshCw size={28} />,
          },
          {
            label: "100 ventes totales",
            code: "hundred_total",
            icon: <Target size={28} />,
          },
         {
          label: "Maître télévendeur",
          code: "televendeur_master",
          icon: <Crown size={28} />,
        },
        ].map((s, i) => {
          const isUnlocked = s.code ? unlocked[s.code as keyof typeof unlocked] : false;
          const date = s.code ? getDate(s.code) : null;

          return (
            <div
              key={i}
              className={`rounded-xl p-4 h-full text-center border ${
                isUnlocked
                  ? "bg-green-100 dark:bg-green-800/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200"
                  : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-400 opacity-60"
              }`}
            >
              <div className="mb-2 flex justify-center">
                {isUnlocked ? (
                  <CheckCircle size={32} className="text-green-600 mb-2" />
                ) : (
                  <Lock size={32} className="mb-2" />
                )}
              </div>
              <div className="text-lg font-semibold mb-1">{s.label}</div>
              {date && (
                <div className="text-xs italic">
                  Débloqué le {date}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
);

}


