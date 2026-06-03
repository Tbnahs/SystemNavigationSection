import { useState, ReactNode } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        menuOpen={sidebarOpen}
      />
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-6 transition-all duration-200 ${
            sidebarCollapsed ? "lg:ml-0" : "lg:ml-60"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
