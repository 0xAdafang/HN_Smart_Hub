import { motion } from "framer-motion";
import { cn } from "../../lib/utils"; // si tu as ajouté le utils.ts comme dans tauri-ui

interface CardButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export default function CardButton({ label, icon, onClick }: CardButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-6 w-48 h-40 rounded-2xl",
        "bg-white dark:bg-zinc-800 shadow-md hover:bg-bioGreen hover:text-white",
        "text-zinc-800 dark:text-white font-semibold text-lg transition"
      )}
    >
      {icon && <div className="text-3xl">{icon}</div>}
      <span>{label}</span>
    </motion.button>
  );
}
