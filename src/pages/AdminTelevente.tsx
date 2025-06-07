import { use, useEffect, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { invoke } from "@tauri-apps/api/core";
import {
  Printer,
  FileDown,
  PieChart as PieChartIcon,
  BarChart3,
  CalendarDays,
  User,
  DollarSign
} from "lucide-react";


type Vente = {
    employee_id: number;
    employee_name: string;
    date: string;
    client_number: string;
    client_name: string;
    product_code: string;
    product_name: string;
    category?: string;
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
    const [filtreDate, setFiltreDate] = useState<"jour" | "semaine" | "mois">("jour");
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

    const resultatsData = [
      { name: "Ventes réussies (Hit)", value: totalHits },
      { name: "Échecs (Miss)", value: totalMiss },
    ];

    const resultatsColors = ["#10b981", "#ef4444"];

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
    const produitCounts = venteFiltrees.reduce((acc, v) => {
      const type = v.category || "Autres produits";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const produitData = Object.entries(produitCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const topVendeurs = [...ventesParEmploye]
    .map((emp) => {
      const total = emp.ventes.reduce((sum, v) => sum + (v.hit_click ? 1 : 0), 0);
      return { nom: emp.employee_name, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);


 return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 size={20} /> Vue Admin – Télévente
      </h2>
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
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span>Période :</span>
                    <select
                      value={filtreDate}
                      onChange={(e) => setFiltreDate(e.target.value as any)}
                      className="border px-3 py-1 rounded bg-white dark:bg-zinc-800 dark:text-white text-sm"
                    >
                      <option value="jour">Aujourd’hui</option>
                      <option value="semaine">7 jours</option>
                      <option value="mois">30 jours</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-2">
                    <User size={16} />
                    <span>Employé :</span>
                    <select
                      value={filtreEmploye}
                      onChange={(e) => setFiltreEmploye(e.target.value)}
                      className="border px-3 py-1 rounded bg-white dark:bg-zinc-800 dark:text-white text-sm"
                    >
                      <option value="all">Tous</option>
                      {[...new Set(Ventes.map((v) => v.employee_name))].map((name, i) => (
                        <option key={i} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
      <div className="mb-4 flex gap-4">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 text-sm text-zinc-800 dark:text-white"

        >
          <FileDown size={16} /> Export PDF
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          <Printer size={16} /> Imprimer
        </button>
      </div>

      <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-800 dark:text-white">
          <BarChart3 size={20} /> Ratio global des ventes réussies
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={40}
              label={false}
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              height={60}
              wrapperStyle={{
                whiteSpace: "pre-wrap",
                textAlign: "center",
                fontSize: "13px",
                lineHeight: "1.4",
                maxWidth: 240, 
                margin: "auto"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mb-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-800 dark:text-white">
            <PieChartIcon size={20} /> Répartition par catégorie de produit
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={produitData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={false}
              >
                {produitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} ventes`, "Catégorie"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                wrapperStyle={{
                  whiteSpace: "pre-wrap",
                  textAlign: "center",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  maxWidth: 240,
                  margin: "auto",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      
      {ventesParEmploye.length === 0 && (
        <p className="text-center text-zinc-600 dark:text-zinc-300 my-8">
          Aucune vente enregistrée pour la période sélectionnée.
        </p>
      )}
      
      {ventesParEmploye.map((emp) => {
        const total = emp.ventes.length;
        const hits = emp.ventes.filter((v) => v.hit_click).length;
        const taux = total > 0 ? ((hits / total) * 100).toFixed(1) : "0";

        return (
          <div key={emp.employee_name} className="bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-xl font-semibold mb-2">{emp.employee_name}</h3>
            <p>Total ventes : <strong>{total}</strong></p>
            <p>Ventes réussies : <strong>{hits}</strong> ({taux}%)</p>

           <div className="overflow-x-auto mt-4 rounded-lg shadow border border-zinc-300 dark:border-zinc-700">
              <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
                <thead className="bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold rounded-tl-lg">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Employé</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Produit</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Code</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Catégorie</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold">Qté</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold rounded-tr-lg">Hit</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                  {emp.ventes.map((entry, index, arr) => (
                    <tr
                      key={index}
                      className={`hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                        index === arr.length - 1 ? 'last:rounded-b-lg' : ''
                      }`}
                    >
                      <td className="px-4 py-2">{entry.date}</td>
                      <td className="px-4 py-2">{entry.employee_name}</td>
                      <td className="px-4 py-2">{entry.client_name} ({entry.client_number})</td>
                      <td className="px-4 py-2">{entry.product_name}</td>
                      <td className="px-4 py-2">{entry.product_code}</td>
                      <td className="px-4 py-2">{entry.category}</td>
                      <td className="px-4 py-2 text-center">{entry.quantity}</td>
                      <td className="px-4 py-2 text-center">
                        {entry.hit_click ? (
                          <span className="text-green-500">✔️</span>
                        ) : (
                          <span className="text-red-500">❌</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-white dark:bg-zinc-800 shadow rounded p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Estimation des bonus par employé
              </h3>
              <ul className="list-disc pl-6 text-sm space-y-1 text-zinc-700 dark:text-zinc-300">
                {ventesParEmploye.map((emp, i) => {
                  const totalBonus = emp.ventes.reduce((sum, v) => {
                    const isBonus = ["inewa", "abenakis"].some((m) =>
                      v.product_name.toLowerCase().includes(m)
                    );
                    return sum + (isBonus ? 1 : 0.5);
                  }, 0);
                  return (
                    <li key={i}>
                      <span className="font-semibold">{emp.employee_name}</span> : {totalBonus.toFixed(2)} $
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-8 bg-white dark:bg-zinc-800 shadow rounded p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} /> Top 3 vendeurs
              </h3>
              <ol className="list-decimal pl-6 text-sm text-zinc-800 dark:text-zinc-200 space-y-1">
                {topVendeurs.map((v, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{v.nom}</span>
                    <span className="font-semibold">{v.total} ventes</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
