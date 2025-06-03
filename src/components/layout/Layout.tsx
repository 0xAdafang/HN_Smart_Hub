import Header from "./Header";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import type { AppSection } from "../../App";

interface LayoutProps {
  children: ReactNode;
  onNavigate?: (s: AppSection) => void;
}

export default function Layout({ children, onNavigate }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={onNavigate} />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
