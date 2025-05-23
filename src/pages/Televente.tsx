import { useState } from "react";
import TeleventeForm from "../components/TeleventeForm";
import MesVentes from "../pages/MesVentes";
import Succes from "../pages/Succes";

export default function TeleventePage() {
  const employeeId = 5; 

  const [subSection, setSubSection] = useState<"form" | "ventes" | "succes">("form");

  return (
  <div className="p-8 min-h-screen bg-gray-100">
    <div className="mb-6 flex justify-center gap-4">
      <button onClick={() => setSubSection("form")} className="btn">📞 Appels</button>
      <button onClick={() => setSubSection("ventes")} className="btn">📊 Mes ventes</button>
      <button onClick={() => setSubSection("succes")} className="btn">🏆 Succès</button>
    </div>

    <div className="flex justify-center">
      {subSection === "form" && <TeleventeForm employeeId={employeeId} />}
      {subSection === "ventes" && <MesVentes employeeId={employeeId} />}
      {subSection === "succes" && <Succes employeeId={employeeId} />}
    </div>
  </div>
);

}
