import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Shield, Bell } from "lucide-react";

export default function Account() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold">Account</h2>

      <div className="glass p-8 rounded-3xl flex items-center gap-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h3 className="text-xl font-bold">{user?.name}</h3>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
          <User className="text-gray-400" size={20} />
          <span className="font-medium">Edit Profile</span>
        </button>
        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
          <Shield className="text-gray-400" size={20} />
          <span className="font-medium">Security</span>
        </button>
        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
          <Bell className="text-gray-400" size={20} />
          <span className="font-medium">Notifications</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left text-red-600"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
