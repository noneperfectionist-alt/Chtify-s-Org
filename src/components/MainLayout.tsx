import React from "react";
import { Outlet } from "react-router-dom";
import { BottomNav, Sidebar, Header } from "./Navigation";

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 relative overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
