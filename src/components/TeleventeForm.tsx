import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

export default function TeleventeForm({ employeeId }: { employeeId: number }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    client_name: "",
    client_number: "",
    product_code: "",
    product_name: "",
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
        <div className="bg-white shadow-xl rounded-xl p-4 max-w-xl w-full">
            <div className="mb-4">
                <p className="font-semibold">
                    📈 Progression : {salesToday} / {TARGET_CALLS} appels aujourd’hui
                </p>
                <div className="w-full h-4 bg-gray-200 rounded overflow-hidden mt-1">
                    <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${Math.min((salesToday / TARGET_CALLS) * 100, 100)}%` }}
                />
            </div>
        </div>
      <h2 className="text-xl font-bold mb-4">Ajouter un appel à la liste</h2>
      <input name="client_name" placeholder="Nom client" className="input" value={form.client_name} onChange={handleChange} />
      <input name="client_number" placeholder="N° client" className="input" value={form.client_number} onChange={handleChange} />
      <input name="product_code" placeholder="Code produit" className="input" value={form.product_code} onChange={handleChange} />
      <input name="product_name" placeholder="Nom produit" className="input" value={form.product_name} onChange={handleChange} />
      <input name="quantity" type="number" min={1} step={1} placeholder="Quantité" className="input" value={form.quantity} onChange={handleChange}/>
      <button onClick={handleAddToList} className="btn btn-primary mt-4 w-full">
        ➕ Ajouter à la liste d'appels
      </button>

      {pendingList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📋 Liste des clients à appeler</h3>
          {pendingList.map((item, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg mb-3 shadow flex flex-col gap-1">
              <div><strong>📞 Client :</strong> {item.client_name} ({item.client_number})</div>
              <div><strong>📦 Produit :</strong> {item.product_name} ({item.product_code}) — Qté : {item.quantity}</div>
              <div><strong>🗓️ Date :</strong> {item.date}</div>
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
                ✅ Produit vendu ? (Hit)
              </label>
              <button
                className="btn bg-green-600 text-white w-fit px-4 py-1 mt-2 rounded"
                onClick={() => handleValidate(index)}
              >
                💾 Fait
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
