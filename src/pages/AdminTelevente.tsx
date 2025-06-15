// Nouveau composant AdminTelevente.tsx (version propre et finalisée)

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { invoke } from "@tauri-apps/api/core";
import { FileDown, Printer, BarChart3, PieChart as PieChartIcon, DollarSign, User, CalendarDays } from "lucide-react";


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
};

export default function AdminTelevente() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [filtreEmploye, setFiltreEmploye] = useState<string>("all");
  const [filtreDate, setFiltreDate] = useState<"jour" | "semaine" | "mois"| "total">("jour");

  useEffect(() => {
    invoke("get_all_televente_entries")
      .then((data: any) => setVentes(data))
      .catch((err) => console.error("Erreur de chargement télévente:", err));
  }, []);

  const filtreVentes = (liste: Vente[]) => {

    const now = new Date();

    let dateMin = new Date();

    if (filtreDate === "jour") dateMin.setDate(now.getDate() - 1);
    if (filtreDate === "semaine") dateMin.setDate(now.getDate() - 7);
    if (filtreDate === "mois") dateMin.setMonth(now.getMonth() - 1);
    if (filtreDate === "total") dateMin = new Date("01-01-1970");

    return liste.filter((v) => {
      const dateVente = new Date(v.date);
      const matchDate = dateVente >= dateMin;
      const matchEmploye = filtreEmploye === "all" || v.employee_name === filtreEmploye;
      return matchDate && matchEmploye;
    });
  };

  const venteFiltrees = filtreVentes(ventes);

  const ventesParEmploye = venteFiltrees.reduce((acc, v) => {
    if (!acc[v.employee_name]) acc[v.employee_name] = [];
    acc[v.employee_name].push(v);
    return acc;
  }, {} as Record<string, Vente[]>);

  const chartData = Object.entries(ventesParEmploye).map(([name, ventes]) => {
    const total = ventes.length;
    const hits = ventes.filter(v => v.hit_click).length;
    return { name, total, hits };
  });

  const bonusParEmploye = Object.entries(ventesParEmploye).map(([name, ventes]) => {
    const totalBonus = ventes.reduce((sum, v) => {
      const isBonus = v.category?.toLowerCase() === "inewa" || v.category?.toLowerCase() === "abenakis";
      return sum + (isBonus ? 1 : 0.5);
    }, 0);
        return { name, bonus: totalBonus };
  });

  const topVendeurs = Object.entries(ventesParEmploye)
    .map(([name, ventes]) => ({ name, total: ventes.filter(v => v.hit_click).length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const totalHits = venteFiltrees.filter((v) => v.hit_click).length;
  const totalMiss = venteFiltrees.length - totalHits;
  const pieData = [
    { name: "Ventes réussies (Hit)", value: totalHits },
    { name: "Échecs (Miss)", value: totalMiss },
  ];
  const pieColors = ["#10b981", "#ef4444"];

  const produitCounts = venteFiltrees.reduce((acc, v) => {
    const type = v.category || "Autres produits";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const produitData = Object.entries(produitCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Bilan Télévente - Export RH", 14, 20);
    Object.entries(ventesParEmploye).forEach(([name, ventes], index) => {
      const startY = 30 + index * 80;
      doc.setFontSize(12);
      doc.text(`${name} - ${ventes.length} ventes`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [["Date", "Client", "Produit", "Code", "Qté", "Hit"]],
        body: ventes.map((v) => [
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
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 size={20} /> Vue Admin – Télévente
      </h2>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2">
          <CalendarDays size={16} />
          <select
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value as any)}
            className="border px-2 py-1 rounded dark:bg-zinc-800 dark:text-white"
          >
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">7 jours</option>
            <option value="mois">30 jours</option>
            <option value="total">Total</option>
            
          </select>
        </label>

        <label className="flex items-center gap-2">
          <User size={16} />
          <select
            value={filtreEmploye}
            onChange={(e) => setFiltreEmploye(e.target.value)}
            className="border px-2 py-1 rounded dark:bg-zinc-800 dark:text-white"
          >
            <option value="all">Tous</option>
            {[...new Set(ventes.map(v => v.employee_name))].map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Graphique BarChart */}
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

      {/* Boutons PDF / Print */}
      <div className="my-6 flex gap-4">
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 text-sm text-zinc-800 dark:text-white">
          <FileDown size={16} /> Export PDF
        </button>
        <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          <Printer size={16} /> Imprimer
        </button>
      </div>

      {/* Tableau des ventes */}
      <div className="overflow-x-auto rounded-lg shadow border border-zinc-300 dark:border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-300 dark:divide-zinc-700">
          <thead className="bg-zinc-100 dark:bg-zinc-700">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Employé</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Produit</th>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Catégorie</th>
              <th className="px-4 py-2">Qté</th>
              <th className="px-4 py-2">Hit</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 text-sm divide-y divide-zinc-200 dark:divide-zinc-700">
            {venteFiltrees.map((v, i) => (
              <tr key={i}>
                <td className="px-4 py-2">{v.date}</td>
                <td className="px-4 py-2">{v.employee_name}</td>
                <td className="px-4 py-2">{v.client_name} ({v.client_number})</td>
                <td className="px-4 py-2">{v.product_name}</td>
                <td className="px-4 py-2">{v.product_code}</td>
                <td className="px-4 py-2">{v.category}</td>
                <td className="px-4 py-2 text-center">{v.quantity}</td>
                <td className="px-4 py-2 text-center">{v.hit_click ? "✔️" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bonus */}
      <div className="mt-8 bg-white dark:bg-zinc-800 shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={20} /> Bonus estimés par employé
        </h3>
        <ul className="list-disc pl-6 text-sm space-y-1">
          {bonusParEmploye.map((e, i) => (
            <li key={i}><strong>{e.name}</strong> : {e.bonus.toFixed(2)} $</li>
          ))}
        </ul>
      </div>

      {/* Top 3 */}
      <div className="mt-8 bg-white dark:bg-zinc-800 shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🏆 Top 3 Vendeurs
        </h3>
        <ol className="list-decimal pl-6 text-sm space-y-1">
          {topVendeurs.map((v, i) => (
            <li key={i} className="flex justify-between">
              <span>{v.name}</span><span className="font-semibold">{v.total} ventes</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Graphiques */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mt-10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} /> Ratio global des ventes réussies
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40} label={false}>
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={60} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg p-4 shadow mt-10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChartIcon size={20} /> Répartition par catégorie de produit
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={produitData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
              {produitData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} ventes`, "Catégorie"]} contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc" }} />
            <Legend verticalAlign="bottom" height={60} wrapperStyle={{ whiteSpace: "pre-wrap", textAlign: "center", fontSize: "13px", lineHeight: "1.4", maxWidth: 240, margin: "auto" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
