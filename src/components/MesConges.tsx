import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

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

      // Recharge la liste
      const res = await invoke("get_mes_conges", { payload: { employeId: Number(employe_id) } });
      setConges(res as Conge[]);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi");
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
      <h2>Mes congés</h2>

      {/* Formulaire de demande */}
      <div style={{ marginBottom: 30 }}>
        <h3>Faire une demande</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select name="type_conge" value={form.type_conge} onChange={handleChange} required>
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
            required
          />

          <input
            type="date"
            name="date_fin"
            value={form.date_fin}
            onChange={handleChange}
            required
          />

          <button onClick={handleSubmit}>📩 Envoyer</button>
        </div>
      </div>

      {/* Liste des congés */}
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      {conges.length === 0 ? (
        <p>📭 Aucun congé trouvé.</p>
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
            <button onClick={() => setTriAscendant((prev) => !prev)}>
              Trier par date : {triAscendant ? "Ancien → Récent" : "Récent → Ancien"}
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
                  <td
                    style={{
                      color:
                        c.statut === "Approuvé"
                          ? "green"
                          : c.statut === "Refusé"
                          ? "red"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {c.statut ?? "—"}
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
