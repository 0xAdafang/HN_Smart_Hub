import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

// Définir les props à recevoir depuis App.tsx
type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      {isRegistering ? (
        <RegisterForm onBack={() => setIsRegistering(false)} />
      ) : (
        <LoginForm
          onRegister={() => setIsRegistering(true)}
          onSuccess={onSuccess} // prop transmise à LoginForm
        />
      )}
    </div>
  );
}
