defmodule StaticInfos do
  @moduledoc """
  Contient les définitions et réponses statiques liées à des mots-clés alimentaires ou RH.
  """

  @infos %{
    "seitan" => """
    🥩 **Seitan** : aliment fabriqué à base de protéine de blé (gluten). Riche en protéines (30%), peu calorique (120 kcal/100g), sans graisse, cholestérol ni purine.
    Il se présente sous forme de pâte cuite dans un bouillon et peut être cuisiné de mille manières.
    """,

    "gluten" => """
    🌾 **Gluten** : mélange de protéines présent dans le blé, l’orge et le seigle. Responsable de la texture élastique du pain.
    Problématique pour les personnes atteintes de la maladie cœliaque.
    """,

    "aspartame" => """
    🍬 **Aspartame** : édulcorant artificiel utilisé comme substitut du sucre. Très faible en calories, il est controversé, mais autorisé en quantité limitée.
    """,

    "ogm" => """
    🌱 **OGM** : organisme génétiquement modifié. Utilisé pour améliorer les rendements agricoles. Leur consommation fait débat, notamment sur les plans écologique et sanitaire.
    """
  }

  def get_info(nil), do: "Je n’ai pas reconnu l’élément dont tu parles."

  def get_info(entity) do
    Map.get(@infos, String.downcase(entity), "🤖 Je ne connais pas encore \"#{entity}\".")
  end
end
