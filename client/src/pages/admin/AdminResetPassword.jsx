import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { admin } from "../../services/api";

export default function AdminResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError("New password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const response = await admin.resetPassword({ token, password });
      setSuccess(response.data.message);
      setTimeout(() => navigate("/admin/login", { replace: true }), 1400);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not reset password. Please request a new link.");
    } finally {
      setBusy(false);
    }
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
            <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 mt-6">
          <input type="password" className="input" placeholder="New password (minimum 8 characters)" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required minLength={8} />
          <input type="password" className="input" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} />
          {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100 flex gap-2 items-center"><AlertCircle size={14} /><span>{error}</span></div>}
          {success && <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{success}</div>}
          <button type="submit" className="primary" disabled={busy || !token}>{busy ? "Updating..." : "Reset password"}</button>
        </form>
      </div>
    </div>
  );
}
