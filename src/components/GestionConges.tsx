import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestion des demandes de congé</h2>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
          <option value="Tous">Tous</option>
          <option value="En attente">En attente</option>
          <option value="Approuvé">Approuvé</option>
          <option value="Refusé">Refusé</option>
        </select>

        <button onClick={() => setTriAscendant(prev => !prev)}>
          Trier par date : {triAscendant ? "Ancien → Récent" : "Récent → Ancien"}
        </button>

        <button onClick={() => setTriParNom(prev => !prev)}>
          Trier par nom {triParNom ? "A→Z" : "Z→A"}
        </button>

        <input
          type="text"
          placeholder="🔍 Rechercher un nom..."
          value={rechercheNom}
          onChange={(e) => setRechercheNom(e.target.value)}
          style={{ flexGrow: 1 }}
        />
      </div>

      {congesTries.length === 0 ? (
        <p>📭 Aucune demande trouvée avec ces critères.</p>
      ) : (
        <table border={1} cellPadding={5} style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Type</th>
              <th>Du</th>
              <th>Au</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {congesTries.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.prenom} {c.nom}
                  {detecteChevauchement(c) && (
                    <span style={{
                      backgroundColor: "orange",
                      color: "white",
                      padding: "2px 6px",
                      marginLeft: 8,
                      borderRadius: "6px",
                      fontSize: "0.75rem"
                    }}>
                      ⚠️ Conflit 
                    </span>
                  )}
                </td>
                <td>{c.type_conge}</td>
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
                  <td>
                  {c.statut === "En attente" ? (
                    <>
                      <button onClick={() => handleStatut(c.id, "Approuvé")}>✅</button>
                      <button onClick={() => handleStatut(c.id, "Refusé")} style={{ marginLeft: 5 }}>❌</button>
                    </>
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
