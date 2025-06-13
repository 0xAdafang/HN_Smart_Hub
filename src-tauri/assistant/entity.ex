defmodule Entity do
  def extract(message) do
    # simple regex de test
    regex = ~r/\b(?:le|la|l'|du|de|des)\s+([a-zA-Z\-]+)/iu

    case Regex.run(regex, message) do
      [_full, entity] -> String.downcase(entity)
      _ -> nil
    end
  end
end
