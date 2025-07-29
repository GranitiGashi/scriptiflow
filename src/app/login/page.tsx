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
  refreshToken: string;
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
        "https://ffmpeg-j3vv.onrender.com/api/login",
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
      console.log("Login response:", response);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#1c0837] text-white">
      <NavigationBar />
      <section className="flex flex-col items-center justify-center px-6 py-12 mx-auto md:h-screen lg:py-0">
        <div className="w-full max-w-md bg-[#1a1342] bg-opacity-90 rounded-xl shadow-lg p-8">
          <h1 className="mb-8 text-3xl font-extrabold text-center text-purple-400">
            Sign in to your account
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-semibold text-purple-300"
              >
                Email
              </label>
              <input
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-[#2e2159] border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-purple-300"
              >
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-3 rounded-lg bg-[#2e2159] border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full py-3 mt-6 font-bold rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 transition-colors duration-300"
            >
              {loading ? "Logging in..." : "Submit Login"}
            </button>
            {error && (
              <p className="mt-4 text-center text-red-500 font-semibold">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 text-center text-green-400 font-semibold">
                {success}
              </p>
            )}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LoginForm;
