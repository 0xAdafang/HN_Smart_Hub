import { useUser } from "../../contexts/UserContext";
import DashboardUserView from "./DashboardUserView";
import DashboardAdminView from "./DashboardAdminView";
import type { AppSection } from "../../App";
import ChatBotWidget from "../../components/ui/ChatBotWidget";

type Props = {
  onNavigate: (section: AppSection) => void;
};

export default function DashboardPage({ onNavigate }: Props) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="relative">
      {user.role === "Admin" ? (
        <DashboardAdminView />
      ) : (
        <DashboardUserView
          onNavigate={(route: string) => onNavigate(route as AppSection)}
        />
      )}
      {/* Assistant IA flottant */}
      <div className="absolute bottom-4 left-4 z-50">
        <ChatBotWidget userId={user.id} role={user.role} />
      </div>
    </div>
  );
}
