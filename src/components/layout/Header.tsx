import ToggleTheme from "../ui/ToggleTheme";
import { useUser } from "../../contexts/UserContext";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 shadow-md">
      <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
        HN Smart Hub
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {user?.prenom} {user?.nom}
        </span>
        <ToggleTheme />
      </div>
    </header>
  );
}
