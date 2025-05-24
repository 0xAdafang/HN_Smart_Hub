import { use, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Vente = {
    employee_id: number;
    employee_name: string;
    date: string;
    client_number: string;
    client_name: string;
    product_code: string;
    product_name: string;
    quantity: number;
    hit_click: boolean;
}

type VentesParEmploye = {
    employee_name: string;
    ventes: Vente[];
}

export default function AdminTelevente() {
    const [Ventes, setVentes] = useState<Vente[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: Vente[] = await invoke("get_televente_entries");
                setVentes(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des données :", err);
            }
        };
        fetchData();
    }, []);

    const ventesParEmploye: VentesParEmploye[] = Object.values(
        Ventes.reduce((acc, vente) => {
        if (!acc[vente.employee_id]) {
            acc[vente.employee_id] = {
            employee_name: vente.employee_name,
            ventes: [],
            };
        }
        acc[vente.employee_id].ventes.push(vente);
        return acc;
        }, {} as Record<number, VentesParEmploye>)
    );

 return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Vue Admin - Télévente</h2>

      {ventesParEmploye.map((emp) => {
        const total = emp.ventes.length;
        const hits = emp.ventes.filter((v) => v.hit_click).length;
        const taux = total > 0 ? ((hits / total) * 100).toFixed(1) : "0";

        return (
          <div key={emp.employee_name} className="mb-6 border rounded-lg p-4 bg-white shadow">
            <h3 className="text-xl font-semibold mb-2">{emp.employee_name}</h3>
            <p>Total ventes : <strong>{total}</strong></p>
            <p>Ventes réussies : <strong>{hits}</strong> ({taux}%)</p>

            <div className="overflow-auto mt-4">
              <table className="table-auto w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Client</th>
                    <th className="p-2 border">Produit</th>
                    <th className="p-2 border">Code</th>
                    <th className="p-2 border">Qté</th>
                    <th className="p-2 border">Hit</th>
                  </tr>
                </thead>
                <tbody>
                  {emp.ventes.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 border">{v.date}</td>
                      <td className="p-2 border">{v.client_name} ({v.client_number})</td>
                      <td className="p-2 border">{v.product_name}</td>
                      <td className="p-2 border">{v.product_code}</td>
                      <td className="p-2 border">{v.quantity}</td>
                      <td className={`p-2 border font-bold ${v.hit_click ? "text-green-600" : "text-red-600"}`}>
                        {v.hit_click ? "✅" : "❌"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
