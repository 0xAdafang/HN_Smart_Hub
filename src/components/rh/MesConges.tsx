import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { CalendarDays, Inbox, PlaneTakeoff, SendHorizontal, SortAsc, SortDesc } from "lucide-react";
import { addToQueue } from "../../utils/offlineQueue";

// Structure d'un congé
interface Conge {
  id: number;
  employe_id: number;
  date_debut: string;
  date_fin: string;
  type_conge: string | null;
  statut: string | null;
}

export default function MesConges() {
  const [conges, setConges] = useState<Conge[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [form, setForm] = useState({
    type_conge: "",
    date_debut: "",
    date_fin: "",
  });
  const [triAscendant, setTriAscendant] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("Tous");

  const employe_id = localStorage.getItem("employe_id");

  useEffect(() => {
    if (!employe_id) {
      setErreur("Aucun ID employé trouvé");
      return;
    }

    invoke("get_mes_conges", { payload: { employeId: Number(employe_id) } })
      .then((res) => setConges(res as Conge[]))
      .catch((err) => {
        console.error(err);
        setErreur("Erreur lors du chargement des congés");
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!employe_id || !form.date_debut || !form.date_fin || !form.type_conge) {
      toast.success("Veuillez remplir tous les champs");
      return;
    }

    try {
    const debut = new Date(form.date_debut);
    const fin = new Date(form.date_fin);

    if (debut > fin) {
      toast.error("La date de début ne peut pas être après la date de fin.");
      return;
    }

    await invoke("demande_conge", {
      payload: {
        employe_id: Number(employe_id),
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        type_conge: form.type_conge,
      },
    });

    toast.success("Demande envoyée !");
    setForm({ type_conge: "", date_debut: "", date_fin: "" });

    const res = await invoke("get_mes_conges", {
      payload: { employeId: Number(employe_id) },
    });
    setConges(res as Conge[]);

  } catch (err) {
    console.warn("❌ Erreur lors de l'envoi, fallback offline :", err);

    await addToQueue({
      type: "conge_demande",
      employe_id: Number(employe_id),
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      type_conge: form.type_conge,
    });

    toast.success("📦 Demande enregistrée hors-ligne !");
  }

  };
  const congesFiltres = conges.filter((c) => {
    if (filtreStatut === "Tous") return true;
    return c.statut === filtreStatut;
    });
  const congesTries = [...congesFiltres].sort((a, b) => {
    const aDate = new Date(a.date_debut).getTime();
    const bDate = new Date(b.date_debut).getTime();
    return triAscendant ? aDate - bDate : bDate - aDate;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl font-bold text-bioGreen dark:text-bioGreenLight mb-4 flex items-center gap-2">
        <PlaneTakeoff size={24} /> Mes congés
      </h2>

      {/* Formulaire de demande */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow mb-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-white flex items-center gap-2">
          <PlaneTakeoff size={18} /> Faire une demande
        </h3>
        <div className="flex flex-wrap gap-4">
          <select
            name="type_conge"
            value={form.type_conge}
            onChange={handleChange}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white text-sm"
            required
          >
            <option value="">-- Type de congé --</option>
            <option value="Vacances">Vacances</option>
            <option value="Maladie">Maladie</option>
            <option value="Personnel">Personnel</option>
          </select>

          <input
            type="date"
            name="date_debut"
            value={form.date_debut}
            onChange={handleChange}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white text-sm"
            required
          />

          <input
            type="date"
            name="date_fin"
            value={form.date_fin}
            onChange={handleChange}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white text-sm"
            required
          />

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-bioGreen hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2"
          >
            <SendHorizontal size={16} /> Envoyer
          </button>
        </div>
      </div>


      {/* Liste des congés */}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      {conges.length === 0 ? (
        <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          <Inbox size={18} /> Aucun congé trouvé.
        </p>
      ) : (
        <>
        <div style={{ marginBottom: 10, display: "flex", gap: 10 }}>
            <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
            >
                <option value="Tous">Tous</option>
                <option value="En attente">En attente</option>
                <option value="Approuvé">Approuvé</option>
                <option value="Refusé">Refusé</option>
            </select>
        </div>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => setTriAscendant((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 text-sm text-zinc-800 dark:text-white"
            >
              <CalendarDays size={16} />
              {triAscendant ? (
                <>
                  Ancien → Récent <SortAsc size={14} />
                </>
              ) : (
                <>
                  Récent → Ancien <SortDesc size={14} />
                </>
              )}
            </button>
          </div>

          <table border={1} cellPadding={5} style={{ width: "100%", marginTop: 10 }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Du</th>
                <th>Au</th>
                <th>Statut</th>
              </tr>
            </thead>
           <tbody>
              {congesTries.map((c) => (
                <tr key={c.id}>
                  <td>{c.type_conge ?? "—"}</td>
                  <td>{new Date(c.date_debut).toLocaleDateString("fr-FR")}</td>
                  <td>{new Date(c.date_fin).toLocaleDateString("fr-FR")}</td>
                  <td>
                    {(() => {
                      let bg = "gray";
                      let label = c.statut ?? "—";

                      if (label === "Approuvé") bg = "green";
                      else if (label === "Refusé") bg = "red";
                      else if (label === "En attente") bg = "orange";

                      return (
                        <span
                          style={{
                            backgroundColor: bg,
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
