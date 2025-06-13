defmodule Synonymes do
  @moduledoc """
  Fournit un mapping de synonymes pour harmoniser les mots-clés détectés.
  """

  @map %{
    "repos" => "congé",
    "vacances" => "congé",
    "event" => "événement",
    "rdv" => "réunion",
    "cours" => "formation",
    "tuto" => "formation",
    "produits" => "produit",
    "aliment" => "produit"
  }

  @doc """
  Retourne la forme canonique d’un mot ou le mot lui-même s’il n’a pas de synonyme défini.
  """
  def get_base(word) do
    Map.get(@map, word, word)
  end

  @doc """
  Applique la normalisation à une phrase entière.
  """
  def normalize_phrase(phrase) do
    phrase
    |> String.split(~r/\s+/, trim: true)
    |> Enum.map(&get_base/1)
    |> Enum.join(" ")
  end
end
