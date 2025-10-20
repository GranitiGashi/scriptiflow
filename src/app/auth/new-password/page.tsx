"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaLock, FaShieldAlt } from "react-icons/fa";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

export default function NewPasswordPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength checker
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '', bgColor: '' };
    
    let score = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 12;
    
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    if (isLongEnough) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    if (score === 4) return { score, label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
  }, [password]);

  // Password requirements checker
  const requirements = useMemo(() => [
    { met: password.length >= 12, text: 'At least 12 characters' },
    { met: /[a-z]/.test(password), text: 'Lowercase letter' },
    { met: /[A-Z]/.test(password), text: 'Uppercase letter' },
    { met: /[0-9]/.test(password), text: 'Number' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'Special character' },
  ], [password]);

  // Capture tokens from Supabase email link (#access_token=...&refresh_token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const params = new URLSearchParams(hash.slice(1));
      const access = params.get('access_token');
      const refresh = params.get('refresh_token');
      const expiresAt = params.get('expires_at');
      if (access && refresh) {
        // Store tokens only in memory during this tab session
        try {
          (window as any).__pw_tmp_access = access;
          (window as any).__pw_tmp_refresh = refresh;
          if (expiresAt) (window as any).__pw_tmp_expires = expiresAt;
        } catch {}
        // Remove hash from URL
        try { window.history.replaceState(null, '', window.location.pathname); } catch {}
      }
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const access = (typeof window !== 'undefined' ? (window as any).__pw_tmp_access : null) as string | null;
      const refresh = (typeof window !== 'undefined' ? (window as any).__pw_tmp_refresh : null) as string | null;
      if (!access || !refresh) {
        setError('Missing session. Use the email link from your inbox.');
        setLoading(false);
        return;
      }
      const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
      const mode = sp ? (sp.get('mode') || undefined) : undefined;
      const state = sp ? (sp.get('state') || undefined) : undefined;
      const res = await fetch(`${baseDomain}/api/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access}`, 'x-refresh-token': refresh },
        body: JSON.stringify({ password, mode, state }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to set password');
      }
      setStatus('Password updated. You can now log in.');
      // Clear temporary tokens from memory only
      try { (window as any).__pw_tmp_access = null; (window as any).__pw_tmp_refresh = null; (window as any).__pw_tmp_expires = null; } catch {}
      setTimeout(() => router.push('/login'), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Set New Password</h1>
          <p className="text-blue-100 text-center text-sm">Create a strong password to secure your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6 sm:p-8">
          {status ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-gray-600 mb-4">{status}</p>
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">Redirecting to login...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full border-2 rounded-xl px-4 py-3 pr-12 transition-all duration-200 focus:outline-none ${
                      focusedField === 'password'
                        ? 'border-blue-500 ring-4 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-bold ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.bgColor
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {password && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-3">Password Requirements:</p>
                    <div className="space-y-2">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {req.met ? (
                            <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                          ) : (
                            <FaTimesCircle className="text-gray-300 text-sm flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs ${
                              req.met ? 'text-green-700 font-medium' : 'text-gray-500'
                            }`}
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`w-full border-2 rounded-xl px-4 py-3 pr-12 transition-all duration-200 focus:outline-none ${
                      focusedField === 'confirm'
                        ? 'border-blue-500 ring-4 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      confirm && password !== confirm
                        ? 'border-red-300 bg-red-50'
                        : ''
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirm && (
                  <div className="mt-2 flex items-center gap-2">
                    {password === confirm ? (
                      <>
                        <FaCheckCircle className="text-green-500 text-sm" />
                        <span className="text-xs text-green-700 font-medium">Passwords match!</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500 text-sm" />
                        <span className="text-xs text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaTimesCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !password || !confirm || password !== confirm}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                  <div className="text-blue-600 flex-shrink-0 mt-0.5">
                    <FaShieldAlt size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Security Tip</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Use a unique password that you don't use for any other accounts. 
                      Consider using a password manager to generate and store complex passwords securely.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Back to Login Link */}
        {!status && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


