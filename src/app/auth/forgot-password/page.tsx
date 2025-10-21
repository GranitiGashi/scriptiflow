"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaCheckCircle, FaKey, FaArrowRight, FaInfoCircle } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const payload: any = { email };
      // If CAPTCHA is enabled on backend, you can attach token here
      // payload.captcha_token = (window as any).captchaToken || undefined;
      const res = await fetch(`${baseDomain}/api/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        console.error('Password reset error:', data);
        // Show error if there's a real problem
        if (res.status === 403) {
          setError('Request blocked. Please try again or contact support.');
          return;
        }
      }
      
      // Always show success to avoid enumeration
      setStatus('If an account exists, a recovery email has been sent.');
      setEmail('');
    } catch (e: any) {
      console.error('Network error:', e);
      // Show generic status regardless of error
      setStatus('If an account exists, a recovery email has been sent.');
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Forgot Password?</h1>
          <p className="text-blue-100 text-center text-sm">No worries, we'll send you reset instructions</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6 sm:p-8">
          {status ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Check Your Email! 📧</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{status}</p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 text-left">
                  <FaInfoCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">What to do next:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800 ml-1">
                      <li>Check your email inbox</li>
                      <li>Click the reset link we sent you</li>
                      <li>Create a new password</li>
                      <li>Sign in with your new password</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-6">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Back to Login</span>
                <FaArrowRight />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField(true)}
                      onBlur={() => setFocusedField(false)}
                      required
                      className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none ${
                        focusedField
                          ? 'border-blue-500 ring-4 ring-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <FaInfoCircle className="flex-shrink-0" />
                    We'll send password reset instructions to this email
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                  <div className="text-blue-600 flex-shrink-0 mt-0.5">
                    <FaInfoCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Security Notice</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      For security reasons, we won't disclose whether an email is registered with us. 
                      If you don't receive an email within 10 minutes, please check your spam folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Back to Login</span>
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => router.push('/signup')}
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


