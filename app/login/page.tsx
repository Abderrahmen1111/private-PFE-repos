'use client';

import { AuthCard } from '@/components/AuthCard';

export default function LoginPage() {
    return (
        <main className="relative min-h-screen bg-gradient-mesh overflow-hidden flex items-center justify-center">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary gradient orb */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 animate-pulse" />

                {/* Secondary gradient orb */}
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-40 animate-pulse animation-delay-2000" />

                {/* Tertiary gradient orb */}
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-30" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <AuthCard />

                {/* Footer text */}
                <p className="text-muted-foreground text-xs mt-12 text-center max-w-sm">
                </p>
            </div>
        </main>
    );
}
