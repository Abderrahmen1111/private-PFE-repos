'use client';

import React from "react";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Info, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { login, signup } from '@/lib/actions/auth';

// ─── You'll need to add these two server actions alongside login/signup ────────
// sendLoginMagicLink(formData: FormData): Promise<{ error?: string; success?: boolean }>
// sendSignupMagicLink(formData: FormData): Promise<{ error?: string; success?: boolean }>
import { sendLoginMagicLink, sendSignupMagicLink } from '@/lib/actions/auth';

type AuthMode = 'magic' | 'password';

interface AuthCardProps {
  defaultFlipped?: boolean;
}

export function AuthCard({ defaultFlipped = false }: AuthCardProps) {
  const router = useRouter();

  // ── Card flip ──
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);

  // ── Auth mode per side ──
  const [loginMode, setLoginMode] = useState<AuthMode>('magic');
  const [signupMode, setSignupMode] = useState<AuthMode>('magic');

  // ── Visibility toggles ──
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Magic link sent states ──
  const [loginMagicSent, setLoginMagicSent] = useState(false);
  const [signupMagicSent, setSignupMagicSent] = useState(false);

  // ── Error / success messages ──
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [loginMagicError, setLoginMagicError] = useState<string | null>(null);
  const [signupMagicError, setSignupMagicError] = useState<string | null>(null);

  // ── Transitions ──
  const [isPendingLogin, startLoginTransition] = useTransition();
  const [isPendingSignUp, startSignUpTransition] = useTransition();
  const [isPendingLoginMagic, startLoginMagicTransition] = useTransition();
  const [isPendingSignupMagic, startSignupMagicTransition] = useTransition();

  // ── Form data ──
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });

  // ── Handlers ──
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  // Password login
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    startLoginTransition(async () => {
      const formData = new FormData();
      formData.append('email', loginData.email);
      formData.append('password', loginData.password);
      const result = await login(formData);
      if (result?.error) setLoginError(result.error);
    });
  };

  // Magic link — login
  const handleLoginMagic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMagicError(null);
    startLoginMagicTransition(async () => {
      const formData = new FormData();
      formData.append('email', loginData.email);
      const result = await sendLoginMagicLink(formData);
      if (result?.error) setLoginMagicError(result.error);
      else setLoginMagicSent(true);
    });
  };

  // Password sign-up
  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpSuccess(null);
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Les mots de passe ne correspondent pas');
      return;
    }
    startSignUpTransition(async () => {
      const formData = new FormData();
      formData.append('fullName', signUpData.fullName);
      formData.append('email', signUpData.email);
      formData.append('password', signUpData.password);
      formData.append('confirmPassword', signUpData.confirmPassword);
      const result = await signup(formData);
      if (result?.error) setSignUpError(result.error);
      else if (result?.success) {
        setSignUpSuccess(result.message);
        setTimeout(() => router.push('/login'), 2000);
      }
    });
  };

  // Magic link — sign-up
  const handleSignupMagic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupMagicError(null);
    startSignupMagicTransition(async () => {
      const formData = new FormData();
      formData.append('fullName', signUpData.fullName);
      formData.append('email', signUpData.email);
      const result = await sendSignupMagicLink(formData);
      if (result?.error) setSignupMagicError(result.error);
      else setSignupMagicSent(true);
    });
  };

  // ── Dynamic height: taller when password mode (more fields) ──
  const getHeight = () => {
    if (!isFlipped) {
      // Login side
      if (loginMode === 'magic') return loginMagicSent ? '340px' : '400px';
      return '430px';
    } else {
      // Signup side
      if (signupMode === 'magic') return signupMagicSent ? '380px' : '480px';
      // password mode: show confirm only when typing
      return signUpData.password.length > 0 ? '620px' : '560px';
    }
  };

  return (
    <div
      className="flip-container w-96"
      style={{ height: getHeight(), transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
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
              onClick={() => { setLoginMode('magic'); setLoginMagicSent(false); setLoginMagicError(null); }}
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
              onClick={() => setLoginMode('password')}
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
                  {/* Info banner */}
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
                /* Magic sent success */
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
                    onClick={() => { setLoginMagicSent(false); setLoginData({ email: '', password: '' }); }}
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
                    disabled={isPendingLogin}
                  />
                </div>
              </div>

              <div>
                {/* Label row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-white">Password</label>
                    {/* Info tooltip */}
                    <div className="group relative flex items-center">
                      <Info size={13} className="text-white/40 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 z-20 pointer-events-none">
                        <div className="bg-zinc-900 border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 shadow-xl text-center leading-relaxed">
                          Password is optional — switch to{' '}
                          <span className="font-semibold text-purple-300">Magic Link</span> for passwordless sign‑in.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-white/40 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
                      optional
                    </span>
                  </div>
                  <button type="button" className="text-xs text-purple-300 hover:text-purple-200 transition-colors">
                    Forgot?
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
                    disabled={isPendingLogin}
                    // ← not required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/40">
                  <Info size={11} className="shrink-0" />
                  Leave blank to receive a magic link instead
                </p>
              </div>

              <button
                type="submit"
                className="w-full button-primary disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPendingLogin}
              >
                {isPendingLogin ? 'Signing in…' : 'Sign In'}
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
                  onClick={() => setIsFlipped(true)}
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
              onClick={() => { setSignupMode('magic'); setSignupMagicSent(false); setSignupMagicError(null); }}
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
              onClick={() => setSignupMode('password')}
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
                /* Magic sent success */
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
                    onClick={() => { setSignupMagicSent(false); setSignUpData({ fullName: '', email: '', password: '', confirmPassword: '' }); }}
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
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm">
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
                  />
                </div>
              </div>

              {/* Password — optional */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <div className="group relative flex items-center">
                    <Info size={13} className="text-white/40 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-52 z-20 pointer-events-none">
                      <div className="bg-zinc-900 border border-white/10 text-white/80 text-xs rounded-lg px-3 py-2 shadow-xl text-center leading-relaxed">
                        Password is optional — switch to{' '}
                        <span className="font-semibold text-purple-300">Magic Link</span> to register without one.
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-white/40 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
                    optional
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                    disabled={isPendingSignUp}
                    // ← not required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/40">
                  <Info size={11} className="shrink-0" />
                  Leave blank to use passwordless sign‑in via email
                </p>
              </div>

              {/* Confirm Password — only shown when typing a password */}
              {signUpData.password.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                      required={signUpData.password.length > 0}
                      disabled={isPendingSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {signUpData.confirmPassword.length > 0 && signUpData.password !== signUpData.confirmPassword && (
                    <p className="mt-1.5 text-[11px] text-red-400">Passwords don't match</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full button-primary disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPendingSignUp}
              >
                {isPendingSignUp ? 'Creating account…' : 'Create Account'}
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
                  onClick={() => setIsFlipped(false)}
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