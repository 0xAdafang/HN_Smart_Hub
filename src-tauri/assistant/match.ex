defmodule Match do
  def process_intent("produit_unique", message, _role, _user_id) do
    case Entity.extract(message) do
      nil  -> "Quel produit voulez-vous que je décrive ? Exemple : \"C’est quoi le produit agave ?\""
      name -> {:ok, desc} = requete_produit(name); desc
    end
  end

  def process_intent("conges_restants", _msg, role, user_id) do
    if role == "admin" do
      "🙅 Les admins ne prennent pas de vacances, voyons."
    else
      {:ok, rest} = requete_conges(user_id)
      "Il vous reste **#{rest} jours** de congés."
    end
  end

  def process_intent("inconnu", _, _, _), do: "🤔 Je n'ai pas compris votre question."
  def process_intent(_, _, _, _),         do: "❓ Cette fonctionnalité n’est pas encore disponible."


  defp requete_produit(nom), do: {:ok, StaticInfos.get_info(nom)}
  defp requete_conges(_id),  do: {:ok, 11}
end
