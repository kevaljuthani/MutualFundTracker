import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = await login(email, password);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-300">
      <div className="w-full max-w-sm p-8 glass rounded-2xl mx-4">
        <h2 className="mb-6 text-2xl font-bold text-center">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/10 border-none outline-none transition-all",
                "focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-white/20",
                "text-gray-900 dark:text-white placeholder-gray-400",
              )}
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/10 border-none outline-none transition-all",
                "focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-white/20",
                "text-gray-900 dark:text-white placeholder-gray-400",
              )}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 text-white font-medium bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-lg shadow-primary/30"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
