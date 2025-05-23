import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer,} from 'recharts';

type Vente = {
  date: string;
  client_name: string;
  client_number: string;
  product_code: string;
  product_name: string;
  quantity: number;
  hit_click: boolean;
  employee_id: number;
  employee_name: string;
};

export default function MesVentes({ employeeId }: { employeeId: number }) {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [filter, setFilter] = useState<"jour" | "semaine">("jour");

  useEffect(() => {
    const fetchVentes = async () => {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      try {
        const result: Vente[] = await invoke("get_televente_entries_by_date", { date: formattedDate });

        const filtered = result.filter(v => v.employee_id === employeeId);

        setVentes(filtered);
      } catch (err) {
        console.error("Erreur chargement ventes :", err);
      }
    };

    fetchVentes();
  }, [employeeId]);

  const total = ventes.length;
  const totalHits = ventes.filter(v => v.hit_click).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Mes ventes du jour</h2>

      <div className="mb-4">
        <p>Total ventes : <strong>{total}</strong></p>
        <p>Ventes réussies (Hit) : <strong>{totalHits}</strong></p>
        <p>Taux de réussite : <strong>{total > 0 ? ((totalHits / total) * 100).toFixed(1) : 0}%</strong></p>
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
                fill="#8884d8"
                label
                >
                <Cell fill="#10b981" /> {/* vert */}
                <Cell fill="#ef4444" /> {/* rouge */}
                </Pie>
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        </div>
        )}
        
      <div className="space-y-2">
        {ventes.map((v, idx) => (
          <div key={idx} className="border rounded p-2 bg-gray-50 shadow-sm">
            <p><strong>Client :</strong> {v.client_name} ({v.client_number})</p>
            <p><strong>Produit :</strong> {v.product_name} ({v.product_code})</p>
            <p><strong>Quantité :</strong> {v.quantity}</p>
            <p><strong>Date :</strong> {v.date}</p>
            <p><strong>✅ Vendu :</strong> {v.hit_click ? "Oui" : "Non"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
