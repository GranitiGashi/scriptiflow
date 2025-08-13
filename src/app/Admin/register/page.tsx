"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface SimpleFormData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  role: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<SimpleFormData>({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    role: "client",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [storedRole, setStoredRole] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    setAccessToken(token);
    setStoredRole(role);
    setTokenChecked(true);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("You must be logged in as an admin to register a new user.");
      return;
    }
    if (storedRole !== "admin") {
      setError("You must be logged in as an admin to register a new user.");
      return;
    }

    try {
      const response = await fetch(
        "https://ffmpeg-j3vv.onrender.com/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed.");
      }

      setSuccess("Registration successful!");
      setFormData({
        email: "",
        password: "",
        full_name: "",
        company_name: "",
        role: "client",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  if (!tokenChecked) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-[#0f1624] p-6">
        <div className="max-w-md w-full space-y-6 p-10 bg-[#0f1624] border border-purple-600 rounded-xl shadow-xl">
          <h2 className="text-center text-3xl font-extrabold text-purple-400">
            Register New User
          </h2>

          {error && (
            <p className="text-red-500 text-center text-sm font-semibold">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-center text-sm font-semibold">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              name="company_name"
              type="text"
              required
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input type="hidden" name="role" value={formData.role} />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg font-bold text-white hover:from-purple-700 hover:to-purple-900 transition duration-300"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegisterForm;
