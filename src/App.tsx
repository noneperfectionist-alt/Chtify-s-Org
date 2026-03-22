import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import Home from "./pages/Home";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { Help } from "./pages/Help";
import { Contact } from "./pages/Contact";
import { MainLayout } from "./components/MainLayout";
import { Profile } from "./pages/Profile";
import { Vault } from "./pages/Vault";
import { WatchCinema } from "./pages/WatchCinema";
import { Chats } from "./pages/Chats";
import { Stories } from "./pages/Stories";
import { Memories } from "./pages/Memories";
import { LocationSharing } from "./pages/LocationSharing";
import { AdminDashboard } from "./pages/AdminDashboard";
import NotificationSettings from "./pages/NotificationSettings";
import { useNotifications } from "./hooks/useNotifications";

import { Policies } from "./pages/Policies";

// Notification Initializer
const NotificationInitializer = () => {
  useNotifications();
  return null;
};

// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
    <p className="text-zinc-400">This page is under construction.</p>
  </div>
);

export default function App() {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Policies />} />
        <Route path="/terms" element={<Policies />} />
        <Route path="/disclaimer" element={<Policies />} />
        <Route path="/policies" element={<Policies />} />
        
        <Route element={isAuthenticated ? <><NotificationInitializer /><MainLayout /></> : <Navigate to="/login" />}>
          <Route path="/chats" element={<Chats />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/cinema" element={<WatchCinema />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/location" element={<LocationSharing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/requests" element={<AdminDashboard />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
