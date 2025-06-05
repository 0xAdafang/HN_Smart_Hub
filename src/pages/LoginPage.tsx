import React from "react";
import LoginForm from "../components/LoginForm";

type Props = {
  onSuccess: () => void;
};

export default function LoginPage({ onSuccess }: Props) {
  return (
    <div className="h-full grid place-items-center bg-marble dark:bg-natureDark text-black dark:text-white px-4">
      <div className="w-full max-w-md bg-white dark:bg-widgetDarkNature rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-borderDarkNature">
        <h2 className="text-2xl font-bold mb-6 text-center text-bioGreen dark:text-bioGreenLight">
          Connexion
        </h2>
        <LoginForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}
