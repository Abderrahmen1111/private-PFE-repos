'use client';

import React from "react"

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { login, signup } from '@/lib/actions/auth';

interface AuthCardProps {
  defaultFlipped?: boolean;
}

export function AuthCard({ defaultFlipped = false }: AuthCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(defaultFlipped);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [isPendingLogin, startLoginTransition] = useTransition();
  const [isPendingSignUp, startSignUpTransition] = useTransition();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    
    startLoginTransition(async () => {
      const formData = new FormData();
      formData.append('email', loginData.email);
      formData.append('password', loginData.password);
      
      const result = await login(formData);
      if (result?.error) {
        setLoginError(result.error);
      }
    });
  };

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
      if (result?.error) {
        setSignUpError(result.error);
      } else if (result?.success) {
        setSignUpSuccess(result.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    });
  };

  return (
    <div className="flip-container w-96" style={{ height: isFlipped ? '580px' : '430px', transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Login Form - Front Side */}
        <div className="flip-card-front glass-effect rounded-2xl p-8 flex flex-col justify-between">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-muted-foreground text-white mt-2">Sign in to continue</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg input-glass border"
                required
                disabled={isPendingLogin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full button-primary mt-6" disabled={isPendingLogin}>
              {isPendingLogin ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm text-white">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="text-link font-semibold"
              >
                Create one
              </button>
            </p>
          </div>
        </div>

        {/* Sign Up Form - Back Side */}
        <div className="flip-card-back glass-effect rounded-2xl p-8 flex flex-col justify-between">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Join Us
            </h1>
            <p className="text-muted-foreground text-sm text-white mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
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
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleSignUpChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg input-glass border"
                required
                disabled={isPendingSignUp}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  placeholder="��•••••••"
                  className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                  required
                  disabled={isPendingSignUp}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                  required
                  disabled={isPendingSignUp}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full button-primary mt-6" disabled={isPendingSignUp}>
              {isPendingSignUp ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm text-white">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="text-link font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
