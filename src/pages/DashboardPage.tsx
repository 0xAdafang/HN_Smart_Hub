import { useUser } from "../contexts/UserContext";
import DashboardUserView from "./DashboardUserView";
import DashboardAdminView from "./DashboardAdminView";
import type { AppSection } from "../App"; 

type Props = {
  onNavigate: (section: AppSection) => void;
};

export default function DashboardPage({ onNavigate }: Props) {
  const { user } = useUser();

  if (!user) return null;

  return user.role === "Admin" ? (
    <DashboardAdminView />
  ) : (
    <DashboardUserView onNavigate={(route: string) => onNavigate(route as AppSection)} />
  );
}
