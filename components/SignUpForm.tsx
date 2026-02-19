'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signUpData, setSignUpData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignUpData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sign up attempted with:', signUpData);
    };

    return (
        <div className="glass-effect rounded-2xl p-8 w-96">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
                    Join Us
                </h1>
                <p className="text-muted-foreground text-sm mt-2">Create your account</p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={signUpData.password}
                            onChange={handleSignUpChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 rounded-lg input-glass border pr-10"
                            required
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
                    <label className="block text-sm font-medium text-foreground mb-2">
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

                <button type="submit" className="w-full button-primary mt-6">
                    Create Account
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-link font-semibold"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
