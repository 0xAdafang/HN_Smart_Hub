import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { CalendarRange, Search, Check, X, AlertCircle, CalendarDays, ArrowDownAZ, ArrowUpAZ, SortAsc, SortDesc } from "lucide-react";

interface CongeAvecEmploye {
  id: number;
  nom: string;
  prenom: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  statut: string;
}

export default function GestionConges() {
  const [conges, setConges] = useState<CongeAvecEmploye[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [triAscendant, setTriAscendant] = useState(false);
  const [triParNom, setTriParNom] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [rechercheNom, setRechercheNom] = useState("");

  useEffect(() => {
    invoke("get_all_conges")
      .then((res) => setConges(res as CongeAvecEmploye[]))
      .catch((err) => {
        console.error(err);
        setErreur("Erreur lors du chargement des demandes");
      });
  }, []);

  const handleStatut = async (id: number, statut: "Approuvé" | "Refusé") => {
    try {
      await invoke("update_statut_conge", { id, statut });
      setConges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, statut } : c))
      );
    } catch (err) {
      console.error(err);
      toast.success("Erreur lors de la mise à jour");
    }
  };

  const congesFiltres = conges
    .filter(c => filtreStatut === "Tous" || c.statut === filtreStatut)
    .filter(c => `${c.nom} ${c.prenom}`.toLowerCase().includes(rechercheNom.toLowerCase()));

  const congesTries = [...congesFiltres].sort((a, b) => {
    if (triParNom) return a.nom.localeCompare(b.nom);
    return triAscendant
      ? new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
      : new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
  });

  function detecteChevauchement(current: CongeAvecEmploye) : boolean {
    const d1 = new Date(current.date_debut);
    const f1 = new Date(current.date_fin);
    
    return conges.some(other => {
      if(other.id === current.id || other.nom === current.nom) return false;
      const d2 = new Date(other.date_debut);
      const f2 = new Date(other.date_fin);
      return d1 <= f2 && d2 >= f1;
    })
  }
  const getStatutBadge = (statut: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (statut.toLowerCase()) {
      case "approuvé":
      case "validé":
        return <span className={`${base} bg-green-600 text-white`}>Validé</span>;
      case "refusé":
        return <span className={`${base} bg-red-600 text-white`}>Refusé</span>;
      case "en attente":
      default:
        return <span className={`${base} bg-orange-500 text-white`}>En attente</span>;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-2xl font-bold text-bioGreen dark:text-bioGreenLight mb-4 flex items-center gap-2">
        <CalendarRange size={24} /> Gestion des Congés
      </h2>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-4 py-2 text-sm rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white dark:border-zinc-600 focus:outline-none"
        >
          <option value="Tous">Tous</option>
          <option value="En attente">En attente</option>
          <option value="Approuvé">Approuvé</option>
          <option value="Refusé">Refusé</option>
        </select>


        <button
          onClick={() => setTriAscendant(prev => !prev)}
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


        <button
          onClick={() => setTriParNom(prev => !prev)}
          className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 text-sm text-zinc-800 dark:text-white"
        >
          {triParNom ? (
            <>
              A → Z <ArrowDownAZ size={14} />
            </>
          ) : (
            <>
              Z → A <ArrowUpAZ size={14} />
            </>
          )}
        </button>

        <div className="mb-6 flex justify-center items-center gap-2">
          <Search size={18} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={rechercheNom}
            onChange={(e) => setRechercheNom(e.target.value)}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-bioGreen"
          />
        </div>
      </div>

      {congesTries.length === 0 ? (
        <p>📭 Aucune demande trouvée avec ces critères.</p>
      ) : (
        <table className="w-full border-collapse rounded overflow-hidden text-sm mt-4">
          <thead className="bg-zinc-100 dark:bg-zinc-700">
            <tr>
              <th className="text-left px-4 py-2">Employé</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Du</th>
              <th className="text-left px-4 py-2">Au</th>
              <th className="text-left px-4 py-2">Statut</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {congesTries.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 flex items-center gap-2">
                  {c.prenom} {c.nom}
                  {detecteChevauchement(c) && (
                    <span title="Chevauchement détecté">
                      <AlertCircle size={16} className="text-orange-500" />
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{c.type_conge}</td>
                <td className="px-4 py-2">{new Date(c.date_debut).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-2">{new Date(c.date_fin).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-2">
                  {getStatutBadge(c.statut)}
                </td>
                <td className="px-4 py-2">
                  {c.statut.toLowerCase() === "en attente" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatut(c.id, "Approuvé")}
                        title="Valider"
                        className="p-1 rounded bg-green-100 dark:bg-green-700 hover:bg-green-200 dark:hover:bg-green-600 text-green-700 dark:text-white transition"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleStatut(c.id, "Refusé")}
                        title="Refuser"
                        className="p-1 rounded bg-red-100 dark:bg-red-700 hover:bg-red-200 dark:hover:bg-red-600 text-red-700 dark:text-white transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
