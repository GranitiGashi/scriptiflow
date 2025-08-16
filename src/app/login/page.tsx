"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../../app/globals.css";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";

export interface User {
  id: string;
  email: string;
  role: "client" | "admin";
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface FormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${baseDomain}/api/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Login response:", response.data);

      localStorage.setItem("access_token", response.data?.access_token);
      localStorage.setItem("refresh_token", response.data?.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);

      setSuccess("Login successful! Redirecting...");
      setFormData({ email: "", password: "" });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "An error occurred";
      console.error("Login error details:", err.response?.data);
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      <section className="relative flex items-center justify-center px-6 py-20 md:py-28">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-10 right-1/5 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full"></div>
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:"linear-gradient(0deg, transparent 24%, rgba(128, 90, 213, 0.35) 25%, rgba(128, 90, 213, 0.35) 26%, transparent 27%, transparent 74%, rgba(128, 90, 213, 0.35) 75%, rgba(128, 90, 213, 0.35) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(128, 90, 213, 0.35) 25%, rgba(128, 90, 213, 0.35) 26%, transparent 27%, transparent 74%, rgba(128, 90, 213, 0.35) 75%, rgba(128, 90, 213, 0.35) 76%, transparent 77%, transparent)", backgroundSize:"50px 50px"}}></div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="hidden lg:block">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">Welcome back</h1>
            <p className="text-gray-300 mb-6">Sign in to access your dashboard, campaigns, and inventory insights.</p>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-2xl blur-xl"></div>
              <img src="https://images.unsplash.com/photo-1532960401350-0062385219d8?w=1200&q=80" alt="Login" className="relative z-10 rounded-2xl border border-purple-500/30 object-cover w-full h-64" />
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:ml-auto bg-black/50 border border-purple-500/30 rounded-xl shadow-lg p-8">
            <h2 className="mb-6 text-2xl font-bold text-center">Sign in to your account</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm text-gray-300">Email</label>
                <input
                  id="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm text-gray-300">Password</label>
                <input
                  id="password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300"
              >
                {loading ? "Logging in..." : "Sign In"}
              </button>
              {error && <p className="mt-2 text-center text-red-500 text-sm">{error}</p>}
              {success && <p className="mt-2 text-center text-green-400 text-sm">{success}</p>}
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LoginForm;
