import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils"; 

interface WidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Widget({ title, children, className }: WidgetProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      className={cn(
        "bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 transition-colors",
        className
      )}
    >
      <h2 className="text-base font-semibold mb-2 text-zinc-800 dark:text-white tracking-tight">
        {title}
      </h2>
      <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}
