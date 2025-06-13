Mix.install([{:jason, "~> 1.4"}])

Code.require_file("intents.ex", __DIR__)
Code.require_file("match.ex", __DIR__)
Code.require_file("entity.ex", __DIR__)
Code.require_file("synonymes.ex", __DIR__)
Code.require_file("static_infos.ex", __DIR__)
Code.require_file("helpers.ex", __DIR__)

args = System.argv()

input =
  case args do
    [file_path] ->
      File.read!(file_path) |> Jason.decode!()

    _ ->
      %{}
  end

message = Map.get(input, "message", "")
role = Map.get(input, "role", "user")
user_id = Map.get(input, "user_id", "unknown")

message_norm =
  message
  |> Helpers.normalize_string()
  |> Synonymes.normalize_phrase()

intent = Intents.get_intent(message_norm)
response = Match.process_intent(intent, message_norm, role, user_id)

IO.puts(response)
