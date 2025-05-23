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
    
    if (!employeeId) {
    console.warn("employeeId est undefined, succès non chargés.");
    return;
  }
    const today = new Date().toISOString().split("T")[0];
    try {
      const result: Vente[] = await invoke("get_televente_entries_by_date", { date: today });
      setVentes(result.filter(v => v.employee_id === employeeId));

      const res: UnlockedAchievement[] = await invoke("get_user_achievements", {
        employee_id: employeeId,
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
        <li className="p-3 rounded bg-yellow-50">
          👑 <strong>Maître télévendeur :</strong> bientôt disponible...
        </li>
      </ul>
    </div>
  );
}


