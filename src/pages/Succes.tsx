import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

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
        }

        if (ventes.length >= 10) {
            await invoke("unlock_achievement", {
            payload: {
                employee_id: employeeId,
                achievement_code: "ten_calls_day",
            },
            });
        }

        const hits = ventes.filter((v) => v.hit_click).length;
        if (hits >= 5) {
            await invoke("unlock_achievement", {
            payload: {
                employee_id: employeeId,
                achievement_code: "five_hit",
            },
            });
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
      }

      // Journée sans Hit
      if (total > 0 && hits === 0) {
        await invoke("unlock_achievement", {
          payload: {
            employee_id: employeeId,
            achievement_code: "no_hit_day",
          },
        });
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
      }
      if (ventes.length >= 100) {
        await invoke("unlock_achievement", {
          payload: { employee_id: employeeId, achievement_code: "hundred_total" },
        });
      }
      const daysSet = new Set(ventes.map((v) => v.date));
      if (daysSet.size >= 3) {
        await invoke("unlock_achievement", {
          payload: { employee_id: employeeId, achievement_code: "weekly_active" },
        });
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
      premierAppel: !!getDate("first_call"),
      appelsEnRafale: !!getDate("ten_calls_day"),
      fullHit: !!getDate("five_hit"),
      trenteTotal: !!getDate("thirty_total"),
      noHitDay: !!getDate("no_hit_day"),
      comboHit: !!getDate("combo_hit"),
      fiveDaysRow: !!getDate("five_days_row"),
      weeklyActive: !!getDate("weekly_active"),
      hundredTotal: !!getDate("hundred_total"),
      fiveDayStreak: !!getDate("five_day_streak"),
      firstFlip: !!getDate("first_flip"), 
    };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 Succès débloqués</h2>
      <ul className="space-y-4">
        <li className={`p-3 rounded ${unlocked.premierAppel ? "bg-green-100" : "bg-gray-100"}`}>
          🥇 <strong>Premier appel :</strong> faire une première vente {unlocked.premierAppel ? "✅" : "🔒"}
          {unlocked.premierAppel ? ` ✅ (débloqué le ${getDate("first_call")})` : " 🔒"}
        </li>
        <li className={`p-3 rounded ${unlocked.appelsEnRafale ? "bg-green-100" : "bg-gray-100"}`}>
          🔟 <strong>Appels en rafale :</strong> 10 ventes dans la journée {unlocked.appelsEnRafale ? "✅" : "🔒"}
          {unlocked.appelsEnRafale ? ` ✅ (débloqué le ${getDate("ten_calls_day")})` : " 🔒"}
        </li>
        <li className={`p-3 rounded ${unlocked.fullHit ? "bg-green-100" : "bg-gray-100"}`}>
          🎯 <strong>100% Hit :</strong> 5 ventes réussies {unlocked.fullHit ? "✅" : "🔒"}
            {unlocked.fullHit ? ` ✅ (débloqué le ${getDate("five_hit")})` : " 🔒"}
        </li>
        <li className="p-3 rounded bg-yellow-50">
          📆 <strong>Semaine active :</strong> en cours de développement...
        
        </li>
        <li className={`p-3 rounded ${unlocked.trenteTotal ? "bg-green-100" : "bg-gray-100"}`}>
          ☎️ <strong>Trente appels :</strong> 30 ventes cumulées
          {unlocked.trenteTotal ? ` ✅ (débloqué le ${getDate("thirty_total")})` : " 🔒"}
        </li>

        <li className={`p-3 rounded ${unlocked.noHitDay ? "bg-green-100" : "bg-gray-100"}`}>
          😓 <strong>Journée difficile :</strong> 0 vente réussie
          {unlocked.noHitDay ? ` ✅ (débloqué le ${getDate("no_hit_day")})` : " 🔒"}
        </li>

        <li className={`p-3 rounded ${unlocked.comboHit ? "bg-green-100" : "bg-gray-100"}`}>
          ⚡ <strong>Combo !</strong> 3 ventes Hit d’affilée
          {unlocked.comboHit ? ` ✅ (débloqué le ${getDate("combo_hit")})` : " 🔒"}
        </li>
        <li className={`p-3 rounded ${unlocked.weeklyActive ? "bg-green-100" : "bg-gray-100"}`}>
          📆 <strong>Agent assidu :</strong> 3 jours de vente dans la même semaine
          {unlocked.weeklyActive ? ` ✅ (débloqué le ${getDate("weekly_active")})` : " 🔒"}
        </li>

        <li className={`p-3 rounded ${unlocked.fiveDaysRow ? "bg-green-100" : "bg-gray-100"}`}>
          🗓️ <strong>Semaine active :</strong> 5 jours consécutifs avec au moins 1 vente
          {unlocked.fiveDaysRow ? ` ✅ (débloqué le ${getDate("five_days_row")})` : " 🔒"}
        </li>

        <li className={`p-3 rounded ${unlocked.fiveDayStreak ? "bg-green-100" : "bg-gray-100"}`}>
          🔥 <strong>Série de feu :</strong> 5 jours consécutifs de vente
          {unlocked.fiveDayStreak ? ` ✅ (débloqué le ${getDate("five_day_streak")})` : " 🔒"}
        </li>

        <li className={`p-3 rounded ${unlocked.firstFlip ? "bg-green-100" : "bg-gray-100"}`}>
          🎲 <strong>Le destin :</strong> Vendre à un client déjà refusé une fois avant
          {unlocked.firstFlip ? ` ✅ (débloqué le ${getDate("first_flip")})` : " 🔒"}
        </li>
        <li className="p-3 rounded bg-yellow-50">
          👑 <strong>Maître télévendeur :</strong> bientôt disponible...
        </li>
      </ul>
    </div>
  );
}


