defmodule Helpers do
  @moduledoc """
  Fonctions utilitaires pour le traitement du texte.
  """

  @doc """
  Normalise une chaîne : supprime accents, met en minuscule, enlève ponctuation.
  """

  def normalize_string(str) do
    str
    |> String.downcase()
    |> remove_accents()
    |> String.replace(~r/[^\w\s-]/u, "")
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end

  defp remove_accents(str) do
    str
    |> :unicode.characters_to_nfd_binary()
    # \p{Mn} = tous les diacritiques (combining marks)
    |> String.replace(~r/\p{Mn}/u, "")
  end


  def slugify(str) do
    normalize_string(str)
    |> String.replace(" ", "-")
  end
end
