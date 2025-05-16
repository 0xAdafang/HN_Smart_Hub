import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/DashboardPage"; // à créer

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <Dashboard />
  ) : (
    <LoginForm onRegister={() => console.log("Créer compte")} onSuccess={() => setLoggedIn(true)} />
  );
}

export default App;
