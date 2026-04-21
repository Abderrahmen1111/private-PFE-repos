'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Info, Sparkles, ArrowRight, Loader2, CheckCircle2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type AuthMode = 'magic' | 'password';

interface AuthCardProps {
  defaultFlipped?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH HELPER
// Returns 0–4: 0 = empty, 1 = too short, 2 = weak, 3 = fair, 4 = strong
// ─────────────────────────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

const STRENGTH_LABELS = ['', 'Too short', 'Weak', 'Fair', 'Strong'];
const STRENGTH_COLORS = [
  '',
  'bg-red-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-500',
];
const STRENGTH_TEXT = [
  '',
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-green-400',
];

// ─────────────────────────────────────────────────────────────────────────────
// RESET HELPERS — clear all error/success states
// ─────────────────────────────────────────────────────────────────────────────

function emptyLoginState() {
  return { email: '', password: '' };
}
function emptySignUpState() {
  return { fullName: '', email: '', password: '', confirmPassword: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function AuthCard({ defaultFlipped = false }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || undefined;

  // ── Card flip ──────────────────────────────────────────────────────────────
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);

  // ── Auth mode per side ─────────────────────────────────────────────────────
  const [loginMode, setLoginMode] = useState<AuthMode>('magic');
  const [signupMode, setSignupMode] = useState<AuthMode>('magic');

  // ── Visibility toggles ─────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Magic link sent states ─────────────────────────────────────────────────
  const [loginMagicSent, setLoginMagicSent] = useState(false);
  const [signupMagicSent, setSignupMagicSent] = useState(false);

  // ── Messages ───────────────────────────────────────────────────────────────
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [loginMagicError, setLoginMagicError] = useState<string | null>(null);
  const [signupMagicError, setSignupMagicError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Single pending state (only one action runs at a time) ──────────────────
  const [isPendingLogin, startLoginTransition] = useTransition();
  const [isPendingSignUp, startSignUpTransition] = useTransition();
  const [isPendingLoginMagic, startLoginMagicTransition] = useTransition();
  const [isPendingSignupMagic, startSignupMagicTransition] = useTransition();

  // ── Form data ──────────────────────────────────────────────────────────────
  const [loginData, setLoginData] = useState(emptyLoginState);
  const [signUpData, setSignUpData] = useState(emptySignUpState);

  // ─────────────────────────────────────────────────────────────────────────────
  // FLIP — reset all errors on both sides when flipping
  // ─────────────────────────────────────────────────────────────────────────────

  const flipToSignup = useCallback(() => {
    setLoginError(null);
    setLoginMagicError(null);
    setForgotSent(false);
    setIsFlipped(true);
  }, []);

  const flipToLogin = useCallback(() => {
    setSignUpError(null);
    setSignUpSuccess(null);
    setSignupMagicError(null);
    setIsFlipped(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Password login ─────────────────────────────────────────────────────────
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);

    // FIX: If no password entered, guide user to magic link instead of failing
    if (!loginData.password.trim()) {
      setLoginMode('magic');
      return;
    }

    startLoginTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password
          })
        });
        const result = await res.json();

        if (!res.ok) {
          setLoginError(result.error || 'Invalid credentials');
        } else {
          // Login successful - redirect to dashboard or specified URL
          const destination = redirectTo || '/';
          router.push(destination);
        }
      } catch (err) {
        setLoginError('An unexpected error occurred');
      }
    });
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = () => {
    if (!loginData.email.trim()) {
      setLoginError('Enter your email above first, then click Forgot.');
      return;
    }
    startLoginMagicTransition(async () => {
      try {
        const res = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginData.email })
        });
        const result = await res.json();
        
        if (!res.ok) {
          setLoginError(result.error || 'Failed to send link');
        } else {
          setForgotSent(true);
          setLoginError(null);
        }
      } catch (err) {
        setLoginError('An unexpected error occurred');
      }
    });
  };

  // ── Magic link — login ─────────────────────────────────────────────────────
  const handleLoginMagic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMagicError(null);
    startLoginMagicTransition(async () => {
      try {
        const res = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginData.email })
        });
        const result = await res.json();
        
        if (!res.ok) setLoginMagicError(result.error || 'Failed to send link');
        else setLoginMagicSent(true);
      } catch (err) {
        setLoginMagicError('An unexpected error occurred');
      }
    });
  };

  // ── Password sign-up ───────────────────────────────────────────────────────
  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpSuccess(null);

    // Client-side validation before hitting the server
    if (signUpData.password && signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }
    if (signUpData.password && signUpData.password.length < 8) {
      setSignUpError('Password must be at least 8 characters.');
      return;
    }

    startSignUpTransition(async () => {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: signUpData.fullName,
            email: signUpData.email,
            password: signUpData.password
          })
        });
        const result = await res.json();

        if (!res.ok) {
          setSignUpError(result.error || 'Failed to sign up');
        } else {
          setSignUpSuccess(result.message ?? 'Account created! Check your email.');
          // FIX: Don't redirect — flip to login side so user can sign in
          setTimeout(() => {
            flipToLogin();
          }, 2500);
        }
      } catch (err) {
        setSignUpError('An unexpected error occurred');
      }
    });
  };

  // ── Magic link — sign-up ───────────────────────────────────────────────────
  const handleSignupMagic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupMagicError(null);
    startSignupMagicTransition(async () => {
      try {
        const res = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signUpData.email,
            fullName: signUpData.fullName
          })
        });
        const result = await res.json();
        
        if (!res.ok) setSignupMagicError(result.error || 'Failed to send link');
        else setSignupMagicSent(true);
      } catch (err) {
        setSignupMagicError('An unexpected error occurred');
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PASSWORD STRENGTH
  // ─────────────────────────────────────────────────────────────────────────────

  const pwStrength = getPasswordStrength(signUpData.password);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flip-container w-full max-w-md">
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>

        {/* ════════════════════════════════════════
            FRONT — LOGIN
        ════════════════════════════════════════ */}
        <div className="flip-card-front glass-effect rounded-2xl p-8 flex flex-col justify-between overflow-hidden">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-white/60 text-sm mt-1">Sign in to continue</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMode('magic');
                setLoginMagicSent(false);
                setLoginMagicError(null);
                setLoginError(null);
                setForgotSent(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginMode === 'magic'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Sparkles size={13} />
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setLoginMagicError(null);
                setLoginError(null);
                setForgotSent(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginMode === 'password'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Password
            </button>
          </div>

          {/* ── Magic link flow ── */}
          {loginMode === 'magic' && (
            <>
              {!loginMagicSent ? (
                <form onSubmit={handleLoginMagic} className="space-y-4 flex-1">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white/70">
                    <Sparkles size={14} className="text-purple-300 mt-0.5 shrink-0" />
                    <span>We'll email you a secure sign‑in link — no password needed.</span>
                  </div>

                  {loginMagicError && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                      {loginMagicError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                        required
                        disabled={isPendingLoginMagic}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPendingLoginMagic}
                    className="w-full button-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPendingLoginMagic ? (
                      <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    ) : (
                      <>Send Magic Link <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
                    <Mail size={26} className="text-purple-300" />
                  </div>
                  <h2 className="text-white font-semibold text-lg">Check your inbox</h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    We sent a magic link to{' '}
                    <span className="font-medium text-white">{loginData.email}</span>.
                    <br />It expires in 10 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMagicSent(false);
                      setLoginData(emptyLoginState());
                    }}
                    className="text-sm text-purple-300 font-medium hover:text-purple-200 transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Password flow ── */}
          {loginMode === 'password' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1">
              {loginError && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {loginError}
                </div>
              )}

              {/* FIX: Forgot password sent confirmation */}
              {forgotSent && !loginError && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  Login link sent! Check your inbox.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                    required
                    disabled={isPendingLogin || isPendingLoginMagic}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  {/* FIX: Forgot button now has a real action */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isPendingLoginMagic}
                    className="text-xs text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50"
                  >
                    {isPendingLoginMagic ? 'Sending…' : 'Forgot?'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                    required
                    disabled={isPendingLogin}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* FIX: Hint is informational only — password is now required */}
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/40">
                  <Info size={11} className="shrink-0" />
                  No password? Switch to Magic Link above.
                </p>
              </div>

              <button
                type="submit"
                className="w-full button-primary disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPendingLogin}
              >
                {isPendingLogin ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          {!loginMagicSent && (
            <div className="mt-5 text-center">
              <p className="text-white/50 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={flipToSignup}
                  className="text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                >
                  Create one
                </button>
              </p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════
            BACK — SIGN UP
        ════════════════════════════════════════ */}
        <div className="flip-card-back glass-effect rounded-2xl p-8 flex flex-col justify-between overflow-hidden">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Join Us
            </h1>
            <p className="text-white/60 text-sm mt-1">Create your account</p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setSignupMode('magic');
                setSignupMagicSent(false);
                setSignupMagicError(null);
                setSignUpError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                signupMode === 'magic'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Sparkles size={13} />
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => {
                setSignupMode('password');
                setSignupMagicError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                signupMode === 'password'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Password
            </button>
          </div>

          {/* ── Magic link flow ── */}
          {signupMode === 'magic' && (
            <>
              {!signupMagicSent ? (
                <form onSubmit={handleSignupMagic} className="space-y-4 flex-1">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-white/10 border border-white/10 text-sm text-white/70">
                    <Sparkles size={14} className="text-purple-300 mt-0.5 shrink-0" />
                    <span>Enter your name & email. We'll send a verification link to activate your account.</span>
                  </div>

                  {signupMagicError && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                      {signupMagicError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={signUpData.fullName}
                      onChange={handleSignUpChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg input-glass border"
                      required
                      disabled={isPendingSignupMagic}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                        required
                        disabled={isPendingSignupMagic}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPendingSignupMagic}
                    className="w-full button-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPendingSignupMagic ? (
                      <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    ) : (
                      <>Send Magic Link <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 space-y-3 flex-1">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto">
                    <Mail size={26} className="text-purple-300" />
                  </div>
                  <h2 className="text-white font-semibold text-lg">Check your inbox</h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    We sent a verification link to{' '}
                    <span className="font-medium text-white">{signUpData.email}</span>.
                    <br />Click it to activate your account.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupMagicSent(false);
                      setSignUpData(emptySignUpState());
                    }}
                    className="text-sm text-purple-300 font-medium hover:text-purple-200 transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Password flow ── */}
          {signupMode === 'password' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 flex-1">
              {signUpError && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {signUpError}
                </div>
              )}
              {signUpSuccess && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {signUpSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={signUpData.fullName}
                  onChange={handleSignUpChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg input-glass border"
                  required
                  disabled={isPendingSignUp}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                    required
                    disabled={isPendingSignUp}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <div className="group relative flex items-center">
                    <Info size={13} className="text-white/40 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 z-20 pointer-events-none">
                      <div className="bg-zinc-900 border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 shadow-xl text-center leading-relaxed">
                        Min. 8 characters. Use uppercase, numbers & symbols for a stronger password.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                    required
                    disabled={isPendingSignUp}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {signUpData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            pwStrength >= level
                              ? STRENGTH_COLORS[pwStrength]
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-medium transition-colors ${STRENGTH_TEXT[pwStrength]}`}>
                      {STRENGTH_LABELS[pwStrength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password — shown only when typing a password */}
              {signUpData.password.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>

                  <div
                    onClick={() => {
                      const inp = document.getElementById('confirm-pw-input') as HTMLInputElement;
                      inp?.focus();
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid',
                      borderColor: signUpData.confirmPassword.length === 0
                        ? 'rgba(255,255,255,0.15)'
                        : signUpData.password.startsWith(signUpData.confirmPassword)
                          ? 'rgba(74,222,128,0.55)'
                          : 'rgba(248,113,113,0.55)',
                      borderRadius: 10,
                      minHeight: 42,
                      padding: '0 40px 0 16px',
                      cursor: 'text',
                      transition: 'border-color 0.2s',
                      gap: 6,
                      flexWrap: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Hidden real input — captures keystrokes only */}
                    <input
                      id="confirm-pw-input"
                      type={showConfirmPassword ? 'text' : 'text'}
                      name="confirmPassword"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                      disabled={isPendingSignUp}
                      autoComplete="new-password"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 1,
                        height: 1,
                        padding: 0,
                        border: 'none',
                        outline: 'none',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Show mode: real readable text */}
                    {showConfirmPassword && (
                      <span style={{
                        fontSize: 14,
                        color: 'white',
                        letterSpacing: '0.05em',
                        userSelect: 'none',
                        flex: 1,
                      }}>
                        {signUpData.confirmPassword || ''}
                      </span>
                    )}

                    {/* Dot mode: one colored dot per typed character + blinking caret */}
                    {!showConfirmPassword && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flex: 1,
                        flexWrap: 'nowrap',
                        overflow: 'hidden',
                      }}>
                        {signUpData.confirmPassword.split('').map((typedChar, i) => {
                          const isCorrect = typedChar === signUpData.password[i];
                          return (
                            <span
                              key={i}
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                flexShrink: 0,
                                display: 'inline-block',
                                backgroundColor: isCorrect ? '#4ade80' : '#f87171',
                                boxShadow: isCorrect
                                  ? '0 0 6px rgba(74,222,128,0.7)'
                                  : '0 0 6px rgba(248,113,113,0.7)',
                                transition: 'background-color 0.12s',
                              }}
                            />
                          );
                        })}
                        {/* Blinking caret — always after the last dot */}
                        <span style={{
                          display: 'inline-block',
                          width: 1.5,
                          height: 16,
                          borderRadius: 1,
                          backgroundColor: signUpData.password.startsWith(signUpData.confirmPassword)
                            ? '#4ade80'
                            : '#f87171',
                          animation: 'confirm-caret-blink 1s step-end infinite',
                          flexShrink: 0,
                        }} />
                        <style>{`
                          @keyframes confirm-caret-blink {
                            0%, 100% { opacity: 1; }
                            50%       { opacity: 0; }
                          }
                        `}</style>
                      </span>
                    )}

                    {/* Eye toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirmPassword(!showConfirmPassword);
                        setTimeout(() => {
                          (document.getElementById('confirm-pw-input') as HTMLInputElement)?.focus();
                        }, 0);
                      }}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        zIndex: 3,
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Final message */}
                  {signUpData.confirmPassword.length > 0 &&
                    signUpData.confirmPassword.length === signUpData.password.length &&
                    signUpData.password !== signUpData.confirmPassword && (
                      <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                        <Info size={11} className="shrink-0" />
                        Passwords don't match
                      </p>
                    )}
                  {signUpData.confirmPassword.length > 0 &&
                    signUpData.password === signUpData.confirmPassword && (
                      <p className="mt-1.5 text-[11px] text-green-400 flex items-center gap-1">
                        <CheckCircle2 size={11} className="shrink-0" />
                        Passwords match
                      </p>
                    )}
                </div>
              )}

              <button
                type="submit"
                className="w-full button-primary disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPendingSignUp}
              >
                {isPendingSignUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          {/* Footer */}
          {!signupMagicSent && (
            <div className="mt-5 text-center">
              <p className="text-white/50 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={flipToLogin}
                  className="text-purple-300 font-semibold hover:text-purple-200 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}