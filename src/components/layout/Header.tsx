import { useUser } from "../../contexts/UserContext";
import UserMenu from "./UserMenu";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-natureDark border-b border-bioGreen shadow-sm">


      <h1 className="text-xl font-bold text-black dark:text-white">
        HN Smart Hub
      </h1>

      <div className="flex items-center gap-4">
        <UserMenu
          employeeId={user?.employe_id ?? 0}
          role={user?.role === "Admin" ? "admin" : "user"}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
