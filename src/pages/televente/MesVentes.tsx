import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer,} from 'recharts';
import {
  BarChart3,
  DollarSign,
  Package,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  User,
  Tags
} from "lucide-react";


type Vente = {
  date: string;
  client_name: string;
  client_number: string;
  product_code: string;
  product_name: string;
  category: string;
  quantity: number;
  hit_click: boolean;
  employee_id: number;
  employee_name: string;
};

export default function MesVentes({ employeeId }: { employeeId: number }) {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [filter, setFilter] = useState<"jour" | "semaine" | "mois" | "total">("jour");

  useEffect(() => {
    const fetchVentes = async () => {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
     

      try {
       const result: Vente[] = await invoke("get_all_televente_entries");
       let filtered = result.filter(v => v.employee_id === employeeId);

          const now = new Date();

          if (filter === "jour") {
            const todayStr = now.toISOString().split("T")[0];
            filtered = filtered.filter(v => v.date.startsWith(todayStr));
          } else if (filter === "semaine") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            filtered = filtered.filter(v => {
              const vd = new Date(v.date);
              return vd >= startOfWeek && vd <= endOfWeek;
            });
            
          }
          else if (filter === "mois") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            filtered = filtered.filter(v => {
              const vd = new Date(v.date);
              return vd >= startOfMonth && vd <= endOfMonth;
            });
        } else if (filter === "total") {
        }

        setVentes(filtered);

      } catch (err) {
        console.error("Erreur chargement ventes :", err);
      }
    };

    fetchVentes();
  }, [employeeId, filter]);

  const total = ventes.length;
  const totalHits = ventes.filter(v => v.hit_click).length;

  const bonusTotal = ventes.reduce((sum, v) => {
    const isBonus =
      v.category?.toLowerCase() === "inewa" ||
      v.category?.toLowerCase() === "abenakis";
    return sum + (v.hit_click ? (isBonus ? 1 : 0.5) : 0);
    }, 0);

  return (
    <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow max-w-4xl mx-auto text-zinc-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 size={20} /> Mes ventes totales
      </h2>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2 font-medium text-sm">Filtrer par :</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "jour" | "semaine" | "mois" | "total")
          }
          className="px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm text-zinc-800 dark:text-white"
        >
          <option value="jour">Jour</option>
          <option value="semaine">Semaine</option>
          <option value="mois">Mois</option>
          <option value="total">Total</option>
        </select>
      </div>

      <div className="mb-4 space-y-1 text-sm">
        <p><User size={14} className="inline-block mr-1" /> Total ventes : <strong>{total}</strong></p>
        <p><CheckCircle size={14} className="inline-block mr-1 text-green-500" /> Ventes réussies : <strong>{totalHits}</strong></p>
        <p><BarChart3 size={14} className="inline-block mr-1" /> Taux de réussite : <strong>{total > 0 ? ((totalHits / total) * 100).toFixed(1) : 0}%</strong></p>
      </div>
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
        <DollarSign size={20} className="text-amber-500" />
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bonus estimé sur la période :</p>
          <p className="text-xl font-semibold text-zinc-800 dark:text-white">
            {bonusTotal.toFixed(2)} $
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="my-6 w-full flex justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Hit", value: totalHits },
                  { name: "Non-Hit", value: total - totalHits },
                ]}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                innerRadius={40}
                label
              >
                <Cell fill="#10b981" /> {/* vert bio */}
                <Cell fill="#f97316" /> {/* orange clair */}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2 flex items-center gap-2">
        <ClipboardList size={20} className="text-zinc-600 dark:text-zinc-300" />
         Détail des ventes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ventes.map((v, idx) => {
          const isBonus =
            v.category?.toLowerCase() === "inewa" ||
            v.category?.toLowerCase() === "abenakis";
          const bonus = isBonus ? 1 : 0.5;

          

          return (
            <div key={idx} className="border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-zinc-500" />
                <p><span className="font-medium">Client :</span> {v.client_name} ({v.client_number})</p>
              </div>

              <div className="flex items-center gap-2">
                <Package size={16} className="text-zinc-500" />
                <p><span className="font-medium">Produit :</span> {v.product_name} ({v.product_code})</p>
              </div>

              <div className="flex items-center gap-2">
                <Tags size={16} className="text-zinc-500" />
                <p>
                  <span className="font-medium">Catégorie :</span>{" "}
                  {v.category ? v.category : "Non spécifiée"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-zinc-500" />
                <p><span className="font-medium">Date :</span> {v.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={16} className={v.hit_click ? "text-green-500" : "text-zinc-400"} />
                <p>
                  {v.hit_click ? (
                    <span className="text-green-600"> Vendu</span>
                  ) : (
                    <span className="text-red-500"> Non vendu</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-zinc-500" />
                <p><span className="font-medium">Bonus estimé :</span> {bonus.toFixed(2)} $</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
