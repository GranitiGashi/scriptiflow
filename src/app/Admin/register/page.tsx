"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface SimpleFormData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  role: string;
  permissions: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<SimpleFormData>({
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    role: "client",
    permissions: "basic",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [storedRole, setStoredRole] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080'
  const [inviteMode, setInviteMode] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    setAccessToken(token);
    setStoredRole(role);
    setTokenChecked(true);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (inviteMode) {
        // Use admin invite flow: user receives email to set their own password (no initial password stored)
        const response = await fetch(`${baseDomain}/api/admin/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
            company_name: formData.company_name,
            role: formData.role,
            permissions: formData.role === 'admin' ? { tier: '*' } : { tier: formData.permissions },
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Invite failed.');
        }
        setSuccess('Invitation sent. Ask the user to check their email to set a password.');
      } else {
        // Keep legacy direct-signup path
        const response = await fetch(`${baseDomain}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            permissions: formData.role === 'admin' ? { tier: '*' } : { tier: formData.permissions },
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Registration failed.');
        }
        setSuccess('Registration successful!');
      }

      setFormData({
        email: "",
        password: "",
        full_name: "",
        company_name: "",
        role: "client",
        permissions: "basic",
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  if (!tokenChecked) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-6">
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
            <div className="flex items-center justify-between">
              <label className="text-purple-300 text-sm">Send invite (user sets password)</label>
              <input
                type="checkbox"
                checked={inviteMode}
                onChange={(e) => setInviteMode(e.target.checked)}
                className="h-4 w-4 accent-purple-600"
                title="If enabled, an email invite is sent and the user sets their password."
              />
            </div>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {!inviteMode && (
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 pr-12 rounded-lg bg-[#1e253f] border border-purple-600 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            )}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-purple-300 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white focus:outline-none">
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-purple-300 mb-1">Permissions</label>
                <select name="permissions" value={formData.permissions} onChange={handleChange} className="w-full p-3 rounded-lg bg-[#1e253f] border border-purple-600 text-white focus:outline-none">
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
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
