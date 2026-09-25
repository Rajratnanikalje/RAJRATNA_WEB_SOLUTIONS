import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { admin } from "../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [cooldown, setCooldown] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(
      () => setCooldown((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const messageFrom = (requestError, fallback) =>
    requestError.response?.data?.message || fallback;
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const signIn = async (event) => {
    event.preventDefault();
    if (!email || !password)
      return setError("Email and password are required.");
    setBusy(true);
    clearMessages();
    try {
      const response = await admin.login({ email, password });
      localStorage.setItem("rws_token", response.data.token);
      nav("/admin/dashboard");
    } catch (requestError) {
      setError(messageFrom(requestError, "Login failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    if (!email) return setError("Enter your admin email address.");
    setBusy(true);
    clearMessages();
    try {
      const response = await admin.forgotPassword({ email });
      setSuccess(response.data.message);
      setResetStep("otp");
      setCooldown(response.data.resendAfter || 60);
    } catch (requestError) {
      setError(
        messageFrom(requestError, "Could not send OTP. Please try again."),
      );
      if (requestError.response?.status === 429)
        setCooldown(requestError.response.data.retryAfter || 60);
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp))
      return setError("Enter the 6-digit OTP from your email.");
    setBusy(true);
    clearMessages();
    try {
      const response = await admin.verifyOtp({ email, otp });
      setResetToken(response.data.resetToken);
      setSuccess(response.data.message);
      setResetStep("password");
    } catch (requestError) {
      setError(
        messageFrom(requestError, "Could not verify OTP. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  const saveNewPassword = async () => {
    if (password.length < 8)
      return setError("New password must be at least 8 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    setBusy(true);
    clearMessages();
    try {
      const response = await admin.resetPassword({ resetToken, password });
      setSuccess(response.data.message);
      setTimeout(() => {
        setForgotMode(false);
        setResetStep("email");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setResetToken("");
        setSuccess("");
      }, 1400);
    } catch (requestError) {
      setError(
        messageFrom(
          requestError,
          "Could not reset password. Please request a new OTP.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitForgotPassword = (event) => {
    event.preventDefault();
    if (resetStep === "email") return sendOtp();
    if (resetStep === "otp") return verifyOtp();
    return saveNewPassword();
  };
  const goBack = () => {
    clearMessages();
    if (resetStep === "otp") return setResetStep("email");
    if (resetStep === "password") return setResetStep("otp");
    setForgotMode(false);
  };
  const heading = !forgotMode
    ? "Admin Login"
    : resetStep === "email"
      ? "Forgot Password"
      : resetStep === "otp"
        ? "Verify OTP"
        : "Choose a new password";

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
            <h1 className="text-2xl font-bold text-white">{heading}</h1>
          </div>
        </div>
        <form
          onSubmit={forgotMode ? submitForgotPassword : signIn}
          className="grid gap-4 mt-6"
        >
          {(!forgotMode || resetStep === "email") && (
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Email
              </label>
              <input
                required
                type="email"
                className="input"
                placeholder="admin@rajratnawebsolutions.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </div>
          )}
          {!forgotMode && (
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPw}
              onToggle={() => setShowPw((visible) => !visible)}
              autoComplete="current-password"
            />
          )}
          {forgotMode && resetStep === "otp" && (
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                6-digit OTP
              </label>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                className="input tracking-[.4em] text-center"
                placeholder="000000"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                autoComplete="one-time-code"
              />
            </div>
          )}
          {forgotMode && resetStep === "password" && (
            <>
              <PasswordInput
                label="New Password"
                value={password}
                onChange={setPassword}
                show={showPw}
                onToggle={() => setShowPw((visible) => !visible)}
                autoComplete="new-password"
              />
              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showPw}
                onToggle={() => setShowPw((visible) => !visible)}
                autoComplete="new-password"
              />
            </>
          )}
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
            {busy
              ? "Please wait..."
              : !forgotMode
                ? "Sign in"
                : resetStep === "email"
                  ? "Send OTP"
                  : resetStep === "otp"
                    ? "Verify OTP"
                    : "Reset password"}
          </button>
        </form>
        {forgotMode && resetStep === "otp" && (
          <button
            type="button"
            onClick={sendOtp}
            disabled={busy || cooldown > 0}
            className="mt-4 text-sm text-[#9fc2ff] disabled:text-slate-500 hover:text-white transition-colors"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
        )}
        <button
          type="button"
          onClick={
            forgotMode
              ? goBack
              : () => {
                  clearMessages();
                  setPassword("");
                  setConfirmPassword("");
                  setOtp("");
                  setForgotMode(true);
                }
          }
          className="mt-4 block text-sm text-[#9fc2ff] hover:text-white transition-colors"
        >
          {forgotMode ? "Back" : "Forgot password?"}
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

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 mb-1 block">
        {label}
      </label>
      <div className="relative">
        <input
          required
          type={show ? "text" : "password"}
          className="input pr-12"
          placeholder="••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={8}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
