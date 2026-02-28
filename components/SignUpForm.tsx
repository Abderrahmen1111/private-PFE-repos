'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Info, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

type AuthMode = 'magic' | 'password';

export function SignUpForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('magic');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMagicLoading(false);
    setMagicSent(true);
    console.log('Magic link sent to:', signUpData.email);
  };

  const handlePasswordSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempted with:', signUpData);
  };

  return (
    <div className="glass-effect rounded-2xl p-8 w-96">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
          Join Us
        </h1>
        <p className="text-muted-foreground text-sm mt-2">Create your account</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/50 mb-6">
        <button
          type="button"
          onClick={() => { setAuthMode('magic'); setMagicSent(false); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            authMode === 'magic'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles size={14} />
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('password')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            authMode === 'password'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
      </div>

      {/* ── Magic Link Flow ── */}
      {authMode === 'magic' && (
        <>
          {!magicSent ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                <Sparkles size={15} className="text-primary mt-0.5 shrink-0" />
                <span>Enter your name & email. We'll send a secure link to verify and activate your account.</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={signUpData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg input-glass border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={signUpData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={magicLoading}
                className="w-full button-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {magicLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending link…
                  </>
                ) : (
                  <>
                    Send Magic Link
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success state */
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail size={26} className="text-primary" />
              </div>
              <h2 className="text-foreground font-semibold text-lg">Check your inbox</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We sent a verification link to{' '}
                <span className="font-medium text-foreground">{signUpData.email}</span>.
                <br />Click it to activate your account.
              </p>
              <button
                type="button"
                onClick={() => { setMagicSent(false); setSignUpData({ fullName: '', email: '', password: '', confirmPassword: '' }); }}
                className="text-sm text-link font-medium mt-1"
              >
                Use a different email
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Password Flow ── */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={signUpData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg input-glass border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-9 pr-4 py-2 rounded-lg input-glass border"
                required
              />
            </div>
          </div>

          {/* Password — optional */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="group relative flex items-center">
                <Info size={13} className="text-muted-foreground cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex w-56 z-10 pointer-events-none">
                  <div className="bg-popover border border-border text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg text-center leading-relaxed">
                    Password is optional — use the{' '}
                    <span className="font-semibold text-primary">Magic Link</span> tab to sign up without one.
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border/60">
                optional
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={signUpData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Info size={11} className="shrink-0" />
              Leave blank to use passwordless sign‑in via email
            </p>
          </div>

          {/* Confirm Password — only shown if password is being set */}
          {signUpData.password.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={signUpData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                  required={signUpData.password.length > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signUpData.confirmPassword.length > 0 && signUpData.password !== signUpData.confirmPassword && (
                <p className="mt-1.5 text-[11px] text-destructive">Passwords don't match</p>
              )}
            </div>
          )}

          <button type="submit" className="w-full button-primary mt-2">
            Create Account
          </button>
        </form>
      )}

      {/* Footer */}
      {!magicSent && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-link font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}