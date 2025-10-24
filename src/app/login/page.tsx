"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../../app/globals.css";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export interface User {
  id: string;
  email: string;
  role: "client" | "admin";
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  status: string;
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8081'

  // Check if base domain is configured
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BASE_DOMAIN) {
      console.warn('⚠️ NEXT_PUBLIC_BASE_DOMAIN is not set, using default:', baseDomain);
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userStr = localStorage.getItem('user');
        const expiresAt = localStorage.getItem('expires_at');

        // If we have tokens and user data
        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr);
          
          // Check if token is expired (with 5 min buffer)
          if (expiresAt) {
            const expirationTime = parseInt(expiresAt) * 1000; // Convert to milliseconds
            const now = Date.now();
            const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
            
            // If token is still valid, redirect to dashboard
            if (expirationTime - now > bufferTime) {
              console.log('User already logged in, redirecting to dashboard...');
              const dest = user.role === 'admin' ? '/dashboard/admin' : '/dashboard';
              router.push(dest);
              return;
            }
          } else {
            // No expiration time, but have tokens - assume valid and redirect
            console.log('User session found, redirecting to dashboard...');
            const dest = user.role === 'admin' ? '/dashboard/admin' : '/dashboard';
            router.push(dest);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
        // Clear invalid data
        localStorage.clear();
      } finally {
        setChecking(false);
      }
    };

    checkExistingSession();
  }, [router]);

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
          withCredentials: true,
        }
      );
      console.log("Login response:", response.data);

      localStorage.setItem("access_token", response.data?.access_token);
      localStorage.setItem("refresh_token", response.data?.refresh_token);
      localStorage.setItem("expires_at", response.data?.expires_at?.toString() || '');
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);

      setSuccess("Login successful! Redirecting...");
      setFormData({ email: "", password: "" });

      setTimeout(() => {
        const dest = response.data.user.role === 'admin' ? '/dashboard/admin' : '/dashboard';
        router.push(dest);
      }, 1000);
    } catch (err: any) {
      let errorMessage = "An error occurred";
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response?.data?.error || err.response?.data?.message || `Server error: ${err.response.status}`;
        console.error("Login error details:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Cannot connect to server. Please check your internet connection or try again later.";
        console.error("No response from server:", {
          url: `${baseDomain}/api/login`,
          error: err.message
        });
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
        console.error("Request setup error:", err.message);
      }
      
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/30 blur-3xl rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/20 blur-3xl rounded-full animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <NavigationBar />
      
      <section className="relative flex items-center justify-center px-6 py-20 md:py-28 min-h-screen">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Enhanced content */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 leading-tight">
                Welcome back to
                <span className="block">ScriptiFlow</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Sign in to access your dashboard, manage campaigns, and unlock powerful automation tools.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Advanced contact management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">Automated campaign workflows</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span className="text-gray-300">Real-time analytics dashboard</span>
              </div>
            </div>

            {/* Enhanced image section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80" 
                  alt="Dashboard Preview" 
                  className="w-full h-80 object-cover rounded-2xl border border-white/20 shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold">Your dashboard awaits</p>
                  <p className="text-gray-300 text-sm">Access powerful tools and insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced login form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
              {/* Form background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-300">Access your ScriptiFlow account</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit} method="post" autoComplete="off" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="username"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        className="w-full px-4 py-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    </div>
                    <div className="text-right">
                      <a href="/auth/forgot-password" className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-200">
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-green-400 text-sm text-center">{success}</p>
                    </div>
                  )}
                </form>

                {/* Additional info */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-center text-sm text-gray-400">
                    Don't have an account? 
                    <a href="/register" className="text-purple-300 hover:text-purple-200 ml-1 transition-colors duration-200">
                      Contact support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LoginForm;
