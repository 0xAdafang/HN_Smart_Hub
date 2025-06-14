defmodule Queries do
  def conges_restants(user_id) do
    try do
      {:ok, %{rows: [[jours_restants]]}} =
        Postgrex.query!(DB.conn(), "SELECT 14 - COALESCE(SUM(duree), 0) FROM conges WHERE employe_id = $1", [user_id])*

      {:ok, jours_restants}
    rescue
      _-> {:error, "Impossible de récupérer vos congés."}
    end
  end

  def formation_suivies(user_id) do
    try do
      {:ok, %{rows: rows}} =
        Postgrex.query!(DB.conn(), "SELECT titre FROM formations_suivies WHERE employe_id = $1", [user_id])

      titres = rows |> Enum.map(fn [titre] -> "📚 " <> titre end) |> Enum.join("\n")
      {:ok, titres}
    rescue
      _-> {:error, "Aucune formation suivie trouvée."}
    end
  end
  def evenements_jour(user_id) do
    try do
      {:ok, %{rows: rows}} =
        Postgrex.query!(DB.conn(), """
          SELECT titre FROM evenements
          WHERE employe_id = $1 AND date = CURRENT_DATE
        """, [user_id])

      events = rows |> Enum.map(fn [e] -> "📅 " <> e end) |> Enum.join("\n")
      {:ok, events}
    rescue
      _ -> {:error, "Aucun événement prévu aujourd’hui."}
    end
  end

  def ventes_reussies(user_id) do
    try do
      {:ok, %{rows: [[total]]}} =
        Postgrex.query!(DB.conn(), "SELECT COUNT(*) FROM ventes WHERE employe_id = $1 AND reussie = TRUE", [user_id])

      {:ok, "🎯 Vous avez réalisé #{total} ventes réussies."}
    rescue
      _ -> {:error, "Impossible de récupérer vos données de télévente."}
    end
  end
end
