import { useTheme } from "next-themes";


export default function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={handleToggleTheme}
      className="px-4 py-2 rounded-full bg-bioGreen text-white transition hover:scale-105"
    >
      {theme === "light" ? "🌙 Mode sombre" : "☀️ Mode clair"}
    </button>
  );
}
