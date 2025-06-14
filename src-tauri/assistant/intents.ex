defmodule Intents do
  @moduledoc """
  Détecte l'intention d'une phrase utilisateur.
  """

  @intent_keywords%{
    "produit_unique" => ~w[qu'est-ce que c'est quoi description info détail produit aliment],
    "conges_restants" => ~w[congé repos vacances restant jours pris],
    "evenements_jour" => ~w[événement planning jour rendez-vous réunion],
    "formation_suivie" => ~w[formation cours suivi tutoriel apprentissage],
    "televente_succes" => ~w[vente télévente réussite succès performance],
    "static_info" => ~w[gluten seitan aspartame ogm]
  }

  def get_intent(message) do
    downcased = String.downcase(message)

    Enum.find_value(@intent_keywords, fn {intent, keywords} ->
      if Enum.any?(keywords, &String.contains?(downcased, &1)), do: intent
    end) || "inconnu"

  end
end
