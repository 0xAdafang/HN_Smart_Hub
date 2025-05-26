import { use, useEffect, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    const [filtreEmploye, setFiltreEmploye] = useState<string>("all");
    const [filtreDate, setFiltreDate] = useState<"jour" | "semaine" | "mois">("mois");
    const [employeSelectionnes, setEmployesSelectionnes] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: Vente[] = await invoke("get_all_televente_entries");
                setVentes(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des données :", err);
            }
        };
        fetchData();
    }, []);

    const filtreVentes = (liste: Vente[]) => {
      const now = new Date();
      let dateMin = new Date();

      switch (filtreDate) {
        case "jour":
          dateMin.setDate(now.getDate() - 1);
          break;
        case "semaine":
          dateMin.setDate(now.getDate() - 7);
          break;
        case "mois":
          dateMin.setMonth(now.getMonth() - 1);
          break;
      }

      return liste.filter((v) => {
        const dateVente = new Date(v.date);
        const matchDate = dateVente >= dateMin;
        const matchEmploye = filtreEmploye === "all" || v.employee_name === filtreEmploye;
        return matchDate && matchEmploye;
      });

    };

    const venteFiltrees = filtreVentes(Ventes);
    const totalHits = venteFiltrees.filter((v) => v.hit_click).length;
    const totalMiss = venteFiltrees.length - totalHits;

    const pieData = [
      { name: "Ventes réussies (Hit)", value: totalHits },
      { name: "Échecs (Miss)", value: totalMiss },
    ];

    const pieColors = ["#10b981", "#ef4444"];

    const ventesParEmploye: VentesParEmploye[] = Object.values(
      
        venteFiltrees.reduce((acc, vente) => {
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

    const chartData = ventesParEmploye
      .filter((emp) => employeSelectionnes.includes(emp.employee_name))
      .map((emp) => {
        const total = emp.ventes.length;
        const hits = emp.ventes.filter(v => v.hit_click).length;
        return {
          name: emp.employee_name,
          total,
          hits,
        };
      });

    const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Bilan Télévente - Export RH", 14, 20);

    ventesParEmploye.forEach((emp, index) => {
      const startY = 30 + index * 80;

      doc.setFontSize(12);
      doc.text(`${emp.employee_name} - ${emp.ventes.length} ventes`, 14, startY);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Date", "Client", "Produit", "Code", "Qté", "Hit"]],
        body: emp.ventes.map((v) => [
          v.date,
          `${v.client_name} (${v.client_number})`,
          v.product_name,
          v.product_code,
          v.quantity.toString(),
          v.hit_click ? "✅" : "❌",
        ]),
        theme: "striped",
        styles: { fontSize: 10 },
      });
    });

    doc.save("bilan-televente.pdf");
  };

 return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 Vue Admin - Télévente</h2>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📄 Exporter en PDF
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🖨️ Imprimer
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">📊 Ratio global des ventes réussies</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={40}
              label
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>


      {ventesParEmploye.map((emp) => {
        const total = emp.ventes.length;
        const hits = emp.ventes.filter((v) => v.hit_click).length;
        const taux = total > 0 ? ((hits / total) * 100).toFixed(1) : "0";

        return (
          <div key={emp.employee_name} className="mb-6 border rounded-lg p-4 bg-white shadow">
            <h3 className="text-xl font-semibold mb-2">{emp.employee_name}</h3>
            <p>Total ventes : <strong>{total}</strong></p>
            <p>Ventes réussies : <strong>{hits}</strong> ({taux}%)</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {ventesParEmploye.map((emp, i) => (
                <label key={i} className="flex items-center gap-2 border px-2 py-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employeSelectionnes.includes(emp.employee_name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEmployesSelectionnes((prev) => [...prev, emp.employee_name]);
                      } else {
                        setEmployesSelectionnes((prev) =>
                          prev.filter((n) => n !== emp.employee_name)
                        );
                      }
                    }}
                  />
                  {emp.employee_name}
                </label>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Ventes totales" />
              <Bar dataKey="hits" fill="#10b981" name="Ventes réussies (Hit)" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mb-4 flex flex-wrap gap-4 items-center">
              <label>
                📆 Période :
                <select value={filtreDate} onChange={(e) => setFiltreDate(e.target.value as any)} className="ml-2 border p-1">
                  <option value="jour">Aujourd’hui</option>
                  <option value="semaine">7 derniers jours</option>
                  <option value="mois">30 derniers jours</option>
                </select>
              </label>

              <label>
                👤 Employé :
                <select value={filtreEmploye} onChange={(e) => setFiltreEmploye(e.target.value)} className="ml-2 border p-1">
                  <option value="all">Tous</option>
                  {[...new Set(Ventes.map(v => v.employee_name))].map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-auto mt-4">
              <table className="table-auto w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Employé</th>
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
                      <td className="p-2 border">{v.employee_name}</td>
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
