import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const go = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await admin.login({ email, password });
      localStorage.setItem("rws_token", r.data.token);
      nav("/admin/dashboard");
    } catch (z) {
      setError(z.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const requestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Enter your admin email address.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await admin.forgotPassword({ email });
      setSuccess(response.data.message);
    } catch (z) {
      setError(z.response?.data?.message || "Could not request a reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setForgotMode((mode) => !mode);
    setError("");
    setSuccess("");
  };

  return (
    <div className="admin-shell min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="hero-orb hero-orb--one" />
      <div className="hero-orb hero-orb--two" />
      <div className="hero-orb hero-orb--three" />

      <div className="glass-premium rounded-3xl p-8 w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#78a9ff] to-[#3b82f6] flex items-center justify-center shadow-[0_0_20px_rgba(120,169,255,.4)]">
            <ShieldCheck size={24} className="text-slate-900" />
          </div>
          <div>
            <div className="label">CONTROL CENTER</div>
            <h1 className="text-2xl font-bold text-white">{forgotMode ? "Reset Password" : "Admin Login"}</h1>
          </div>
        </div>

        <form onSubmit={forgotMode ? requestReset : go} className="grid gap-4 mt-6">
          {!forgotMode && <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Email
            </label>
            <input
              required
              type="email"
              className="input"
              placeholder="admin@rajratnawebsolutions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>}

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                className="input pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100 flex gap-2 items-center">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              {success}
            </div>
          )}

          <button type="submit" className="primary" disabled={busy}>
            {busy ? (forgotMode ? "Sending..." : "Signing in...") : (forgotMode ? "Send reset link" : "Sign in")}
          </button>
        </form>

        <button type="button" onClick={switchMode} className="mt-4 text-sm text-[#9fc2ff] hover:text-white transition-colors">
          {forgotMode ? "Back to sign in" : "Forgot password?"}
        </button>

        <div className="text-center mt-6">
          <span className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} RAJRATNA WEB SOLUTIONS
          </span>
        </div>
      </div>
    </div>
  );
}
