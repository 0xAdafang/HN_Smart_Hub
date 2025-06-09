import { useEffect, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Widget from "./ui/Widget";
import {
  PlusCircle,
  StickyNote,
  Trash2,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  XCircle,
  Save,
  Clock,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useUser } from "../contexts/UserContext"; 

interface Evenement {
  id: number;
  titre: string;
  date_debut: string;
  date_fin?: string | null;
  created_at: string;
  heure_debut?: string | null;
  heure_fin?: string | null;
}

export default function CalendarWidget() {
  const { user } = useUser(); 
  const [range, setRange] = useState<DateRange | undefined>();
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [nouvelEvenement, setNouvelEvenement] = useState("");
  const [afficherEvenements, setAfficherEvenements] = useState(true);
  const [editionId, setEditionId] = useState<number | null>(null);
  const [editionTitre, setEditionTitre] = useState("");const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");

  const fetchEvenements = async () => {
    if (!user?.employe_id) return;
    try {
      console.log("user:", user); // debug ici
      console.log("employe_id envoyé:", user?.employe_id);
      const data = await invoke<Evenement[]>("get_evenements_par_employe", {
        args: {
          employee_id: user.employe_id,
        },
      });
      setEvenements(data);
    } catch (err) {
      console.error("Erreur chargement événements :", err);
    }
  };

  useEffect(() => {
    fetchEvenements();
  }, [user]);

  const joursAvecEvenements = evenements.map((e) =>
    new Date(e.date_debut + "T12:00:00")
  );

  const ajouterEvenement = async () => {
    if (!range?.from || !nouvelEvenement.trim() || !user?.id) return;

    const date_debut = range.from.toLocaleDateString("fr-CA");
    const date_fin = range.to ? range.to.toLocaleDateString("fr-CA") : null;

    try {
      await invoke("ajouter_evenement", {
        evt: {
          employee_id: user.employe_id,
          titre: nouvelEvenement,
          date_debut,
          date_fin,
          heure_debut: heureDebut || null,
          heure_fin: heureFin || null,
        },
      });
      setNouvelEvenement("");
      setRange(undefined);
      fetchEvenements();
    } catch (err) {
      console.error("Erreur ajout événement :", err);
    }
  };

  const modifierEvenement = async (id: number) => {
    const evenement = evenements.find((e) => e.id === id);
    if (!evenement) return;

    try {
      await invoke("modifier_evenement", {
        args: {
          id,
          titre: editionTitre,
          date_debut: evenement.date_debut,
          date_fin: evenement.date_fin,
          heure_debut: heureDebut || null,
          heure_fin: heureFin || null,
        },
      });
      setEditionId(null);
      setEditionTitre("");
      fetchEvenements();
    } catch (err) {
      console.error("Erreur modification événement :", err);
    }
  };

  const supprimerEvenement = async (id: number) => {
    try {
      await invoke("supprimer_evenement", { id });
      fetchEvenements();
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const heures: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      heures.push(`${hh}:${mm}`);
    }
  }


  return (
    <Widget title="Calendrier" className="col-span-2 h-auto overflow-hidden">
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          modifiersClassNames={{
            selected: "ring-2 ring-green-600 text-black dark:text-white font-medium",
            range_middle: "bg-green-100 dark:bg-green-900 text-black dark:text-white",
            range_start: "ring-2 ring-green-600 text-black dark:text-white font-medium",
            range_end: "ring-2 ring-green-600 text-black dark:text-white font-medium",
            today: "ring-2 ring-green-600 text-black dark:text-white font-bold",
          }}
          className="rdp-custom-calendar rounded-xl"
          styles={{
            caption: { color: "inherit" },
            head: { color: "inherit" },
            day: {
              padding: "0.5rem",
              fontSize: "0.875rem",
              borderRadius: "9999px",
              color: "inherit",
            },
          }}
        />

        {range?.from && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Ajouter un événement..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white"
                value={nouvelEvenement}
                onChange={(e) => setNouvelEvenement(e.target.value)}
              />

              <div className="flex gap-2">
                <select
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white text-sm"
                >
                  <option value="">Début</option>
                  {heures.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <select
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-black dark:text-white text-sm"
                >
                  <option value="">Fin</option>
                  {heures.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={ajouterEvenement}
                className="w-full bg-bioGreen text-white rounded py-1 hover:bg-green-700 text-sm flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} /> Ajouter l’événement
              </button>
            </div>
          )}

        <div className="mt-4">
          <button
            onClick={() => setAfficherEvenements(!afficherEvenements)}
            className="text-sm font-semibold mb-2 flex items-center gap-1"
          >
            <StickyNote size={16} /> Événements enregistrés
            {afficherEvenements ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {afficherEvenements && (
            <ul className="text-xs space-y-1 max-h-[140px] overflow-auto">
              {evenements.map((e) => (
                <li
                  key={e.id}
                  className="bg-zinc-100 dark:bg-zinc-800 px-3 py-3 rounded flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-xs text-zinc-800 dark:text-white flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {e.date_fin && e.date_fin !== e.date_debut
                        ? `${new Date(e.date_debut + "T12:00:00").toLocaleDateString()} → ${new Date(
                            e.date_fin + "T12:00:00"
                          ).toLocaleDateString()}`
                        : new Date(e.date_debut + "T12:00:00").toLocaleDateString()}
                      {e.heure_debut && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {e.heure_debut}
                        {e.heure_fin && `→ ${e.heure_fin}`}
                      </span>
                    )}
                    </span>

                    <br />
                    {editionId === e.id ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <input
                          type="text"
                          value={editionTitre}
                          onChange={(e) => setEditionTitre(e.target.value)}
                          className="px-2 py-1 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-sm text-black dark:text-white"
                        />

                        <div className="flex gap-2">
                            <select
                              value={heureDebut}
                              onChange={(e) => setHeureDebut(e.target.value)}
                              className="w-1/2 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm text-black dark:text-white"
                            >
                              <option value="">Début</option>
                              {heures.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>

                            <select
                              value={heureFin}
                              onChange={(e) => setHeureFin(e.target.value)}
                              className="w-1/2 px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-sm text-black dark:text-white"
                            >
                              <option value="">Fin</option>
                              {heures.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => modifierEvenement(e.id)}
                            className="bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Save size={14} /> Sauvegarder
                          </button>
                          <button
                            onClick={() => {
                              setEditionId(null);
                              setEditionTitre("");
                            }}
                            className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
                          >
                            <XCircle size={14} /> Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 dark:text-zinc-300 italic text-base cursor-pointer hover:underline flex items-center gap-1">
                        {e.titre}
                        <button
                          className="text-blue-500 hover:text-blue-700 ml-1"
                          onClick={() => {
                            setEditionId(e.id);
                            setEditionTitre(e.titre);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 ml-2 mt-1"
                    onClick={() => supprimerEvenement(e.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
              {evenements.length === 0 && (
                <li className="text-zinc-400">Aucun événement</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </Widget>
  );
}
