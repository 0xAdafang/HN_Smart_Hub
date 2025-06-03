import { useUser } from "../contexts/UserContext";
import DashboardUserView from "./DashboardUserView";
import DashboardAdminView from "./DashboardAdminView";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) return null;

  return user.role === "Admin" ? (
    <DashboardAdminView />
  ) : (
    <DashboardUserView employeeId={user.employe_id} />
  );
}
