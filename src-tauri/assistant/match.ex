defmodule Match do
  des process_intent("produit_unique", message, _role, user_id) do
    case Entity.extract(message) do
      nil -> "Quel produit voulez-vous que je décrive ? Exemple : \"C’est quoi le produit agave ?\""
      name -> {:ok, desc} = requete_produit(name); desc
    end
  end

  def process_intent("conges_restant", _msg, role, user_id) do
    if role == "admin" do
      "🙅 Les admins ne prennent pas de vacances, voyons."
    else
      case Queries.conges_restant(user_id) do
        {:ok, jours} -> "il vous reste **#{jours} jours** de congés."
        {:error, msg} -> msg
      end
    end
  end

  def process_intent("formation_suivie", _msg, _role, user_id) do
    case.Queries.formation_suivie(user_id) do
      {:ok, f} -> "🧠 Formations suivies :\n\n" <> f
      {:error, m} -> m
    end
  end

  def process_intent("evenements_jour", _msg, _role, user_id) do
    case Queries.evenement_jours(user_id) do
      {:ok, e} -> "📆 Vos événements du jour :\n\n" <> e
      {:error, m} -> m
    end
  end

  def process_intent("televente_succes", _msg, _role, user_id) do
    case Queries.vente_reussies(user_id) do
      {:ok, v} -> v
      {:error, m} -> m
    end
  end

  def process("static_info", message, _r, _u) do
    case Entity.extract(message) do
      nil -> "Tu cherches une info générale ? Essaie par exemple : \"C’est quoi le seitan ?\""
      name -> {:ok, desc} = requete_produit(name); desc
    end
  end

  def process_intent("inconnu", _, _, _), do: "🤖 Je n’ai pas compris, essaie de formuler autrement."
  def process_intent(_, _, _, _),         do: "❓ Cette fonctionnalité n’est pas encore disponible."

  defp requete_produit(nom), do: {:ok, StaticInfos.get_info(nom)}
    
  end
