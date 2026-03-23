import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Layers, MapPin, Calendar, User, Settings, LogOut, Moon, Sun, Bell, Search, ShieldCheck, Rocket, LayoutGrid, Star, Clock } from "lucide-react";
import { cn } from "./UI";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../firebase";

const navItems = [
  { icon: MessageSquare, label: "Chats", path: "/chats" },
  { icon: Layers, label: "Stories", path: "/stories" },
  { icon: MapPin, label: "Location", path: "/location" },
  { icon: Calendar, label: "Memories", path: "/memories" },
  { icon: ShieldCheck, label: "Vault", path: "/vault" },
  { icon: Rocket, label: "Cinema", path: "/cinema" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = navItems.find(item => item.path === location.pathname)?.label || "Nexora";

  return (
    <header className="fixed top-0 left-0 right-0 h-20 glass sticky top-0 z-[60] border-b border-primary/10 flex items-center justify-between px-6 md:px-8 bg-background/50 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="size-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Rocket size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
           <h1 className="text-xl font-black text-foreground tracking-tight uppercase leading-none">Nexora</h1>
           <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase mt-1 hidden md:block">Orbital Network</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
           <input
             className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-primary focus:border-primary w-64 text-foreground placeholder:text-zinc-600"
             placeholder="Search the universe..."
           />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl glass hover:bg-white/10 text-muted-foreground transition-all border-white/5">
             <Bell size={20} />
           </button>
           <button
             onClick={toggleTheme}
             className="p-2.5 rounded-xl glass hover:bg-white/10 text-foreground transition-all border-white/5"
           >
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
        <div className="size-10 rounded-full border-2 border-primary/50 p-0.5 overflow-hidden hidden md:block">
           <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">
             {localStorage.getItem("username")?.[0] || "U"}
           </div>
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-primary/10 md:hidden z-50 bg-background/80 backdrop-blur-2xl">
      <div className="flex justify-around items-center h-20 px-2 pb-4 pt-2">
        {navItems.filter(item => ["/chats", "/stories", "/vault", "/profile"].includes(item.path)).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 transition-all flex-1 h-full relative group",
                isActive ? "text-primary" : "text-zinc-500 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute -top-2 size-1 bg-primary rounded-full neon-glow" />}
                <item.icon size={24} className={cn(isActive && "fill-primary/20")} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-72 glass-panel border-y-0 rounded-none h-screen sticky top-0 z-50 pt-24 border-r border-white/5">
      <nav className="flex-1 px-6 py-8 space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 px-4">Navigation</h3>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group border border-transparent",
                isActive
                  ? "bg-primary/5 text-primary border-primary/20 neon-glow-sm"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(isActive && "fill-primary/10")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {isActive && <div className="ml-auto size-1.5 bg-primary rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 mb-6">
           <h4 className="text-primary font-black uppercase tracking-tight text-[10px] mb-2">Cosmic Pro</h4>
           <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-widest mb-4">Unlock military-grade encryption and unlimited themes.</p>
           <button className="w-full bg-primary text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity">Upgrade Now</button>
        </div>
        <button 
          onClick={() => {
            auth.signOut();
            localStorage.removeItem("isLoggedIn");
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm tracking-tight group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span>Exit Orbit</span>
        </button>
      </div>
    </aside>
  );
};
