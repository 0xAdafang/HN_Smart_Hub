import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import {
  PhoneCall,
  Package,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Plus,
  Save,
  DollarSign
} from "lucide-react";



export default function TeleventeForm({ employeeId }: { employeeId: number }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_number: "",
    product_code: "",
    product_name: "",
    category: "Catégorie du produit",
    quantity: 1,
    hit_click: false,
  });

  const [pendingList, setPendingList] = useState<typeof form[]>([]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value
    }));
  };

  const handleAddToList = () => {
    setPendingList(prev => [...prev, form]);
    setForm({
      date: new Date().toISOString().split("T")[0],
      client_name: "",
      client_number: "",
      product_code: "",
      product_name: "",
      category: "Catégorie du produit",
      quantity: 1,
      hit_click: false,
    });
  };

  const handleValidate = async (index: number) => {
    const vente = pendingList[index];
    try {
      await invoke("add_televente_entry", {
        payload: {
          ...vente,
          quantity: Number(vente.quantity),
          employee_id: employeeId,
          category: vente.category,
        },
      });
      toast.success("✅ Vente envoyée !");
      const newList = [...pendingList];
      newList.splice(index, 1);
      setPendingList(newList);
    } catch (err: any) {
      toast.error("❌ Erreur : " + err);
    }
  };
    const [salesToday, setSalesToday] = useState(0);
    const calculerBonusTotal = () => {
      return pendingList.reduce((total, item) => {
        const isBonus =
          item.category?.toLowerCase() === "inewa" ||
          item.category?.toLowerCase() === "abenakis";
        return total + (isBonus ? 1 : 0.5);
      }, 0);
    };
    const TARGET_CALLS = 10;
    
    useEffect(() => {
        const fetchTodaySales = async () => {
            const today = new Date().toISOString().split("T")[0];
            try {
            const result = await invoke<any[]>("get_televente_entries_by_date", { date: today });
            const userSales = result.filter((entry) => entry.employee_id === employeeId);
            setSalesToday(userSales.length);
            } catch (err) {
            console.error("Erreur chargement jauge télévente :", err);
            }
        };

        fetchTodaySales();
        }, [pendingList]); // refresh la jauge à chaque ajout ou validation

  return (
          
   <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-xl p-4 max-w-xl w-full text-zinc-800 dark:text-white">
    <div className="mb-4">
      <p className="font-semibold flex items-center gap-2">
        <PhoneCall size={16} /> Progression : {salesToday} / {TARGET_CALLS} appels aujourd’hui
      </p>
      <div className="w-full h-4 bg-gray-200 dark:bg-zinc-700 rounded overflow-hidden mt-1">
        <div
          className="h-full bg-bioGreen transition-all"
          style={{ width: `${Math.min((salesToday / TARGET_CALLS) * 100, 100)}%` }}
        />
      </div>
    </div>

    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <ClipboardList size={18} /> Ajouter un appel à la liste
    </h2>

    <input name="client_name" placeholder="Nom client" className="input-style" value={form.client_name} onChange={handleChange} />
    <input name="client_number" placeholder="N° client" className="input-style" value={form.client_number} onChange={handleChange} />
    <input name="product_code" placeholder="Code produit" className="input-style" value={form.product_code} onChange={handleChange} />
    <input name="product_name" placeholder="Nom produit" className="input-style" value={form.product_name} onChange={handleChange} />
    <select name="category" value={form.category} onChange={handleChange} className="input-style">
      <option value="inewa">Inewa</option>
      <option value="abenakis">Abenakis</option>
      <option value="autres">Autres</option>
    </select>
    <input name="quantity" type="number" min={1} step={1} placeholder="Quantité" className="input-style" value={form.quantity} onChange={handleChange} />

    <button
      onClick={handleAddToList}
      className="mt-4 w-full bg-bioGreen hover:bg-green-700 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
    >
      <Plus size={16} /> Ajouter à la liste
    </button>

    {pendingList.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <ClipboardList size={18} /> Liste des appels
        </h3>

        <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-4 italic">
          <DollarSign size={14} className="inline-block mr-1" />
          Boni estimé total : <strong>{calculerBonusTotal().toFixed(2)} $</strong>
        </div>

        {pendingList.map((item, index) => (
          <div key={index} className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg mb-3 shadow">
            <div><strong><PhoneCall size={14} className="inline-block mr-1" /> Client :</strong> {item.client_name} ({item.client_number})</div>
            <div><strong><Package size={14} className="inline-block mr-1" /> Produit :</strong> {item.product_name} ({item.product_code}) — Qté : {item.quantity}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              💰 Bonus estimé : {["inewa", "abenakis"].some((m) => item.product_name.toLowerCase().includes(m)) ? `${(item.quantity * 1).toFixed(2)} $` : `${(item.quantity * 0.5).toFixed(2)} $`}
              <span className="italic text-xs"> (⚠️ Le client n'a pas/jamais commandé le produit depuis 6 mois)</span>
            
            </div>
            <div><CalendarDays size={14} className="inline-block mr-1" /> <strong>Date :</strong> {item.date}</div>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={item.hit_click}
                onChange={(e) => {
                  const updated = [...pendingList];
                  updated[index].hit_click = e.target.checked;
                  setPendingList(updated);
                }}
              />
              <CheckCircle size={16} /> Produit vendu ? (Hit)
            </label>
            <button
              className="mt-2 bg-green-600 hover:bg-green-700 text-white rounded px-4 py-1 flex items-center gap-2"
              onClick={() => handleValidate(index)}
            >
              <Save size={16} /> Fait
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
