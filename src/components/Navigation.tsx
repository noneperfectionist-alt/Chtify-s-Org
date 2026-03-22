import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Layers, MapPin, Calendar, User, Settings, LogOut, Moon, Sun, Bell, Search } from "lucide-react";
import { cn } from "./UI";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";

const navItems = [
  { icon: MessageSquare, label: "Chats", path: "/chats" },
  { icon: Layers, label: "Stories", path: "/stories" },
  { icon: MapPin, label: "Location", path: "/location" },
  { icon: Calendar, label: "Memories", path: "/memories" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = navItems.find(item => item.path === location.pathname)?.label || "Chatify";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-[60] flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center md:hidden">
          <MessageSquare size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-foreground tracking-tight md:hidden">{pageTitle}</h1>
        <h1 className="text-xl font-bold text-foreground tracking-tight hidden md:block">Chatify</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 transition-all flex-1 h-full",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-border h-screen sticky top-0 z-50 pt-16">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button 
          onClick={() => {
            auth.signOut();
            localStorage.removeItem("isLoggedIn");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
