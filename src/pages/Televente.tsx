import TeleventeForm from "../components/TeleventeForm";

export default function TeleventePage() {
  const employeeId = 5; 

  return (
    <div className="p-8 flex justify-center items-start min-h-screen bg-gray-100">
      <TeleventeForm employeeId={employeeId} />
    </div>
  );
}
