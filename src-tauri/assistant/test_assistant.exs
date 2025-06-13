Mix.install([{:jason, "~> 1.4"}])

payload = %{
  "message" => "C’est quoi le seitan ?",
  "role" => "user",
  "user_id" => "demo-user"
}

# On écrit dans un fichier temporaire
File.write!("input.json", Jason.encode!(payload))

# On appelle Elixir sans stdin
{result, _exit_code} = System.cmd("elixir", ["assistant.exs", "input.json"], stderr_to_stdout: true)

IO.puts("🧪 Réponse de l’assistant :\n#{result}")
