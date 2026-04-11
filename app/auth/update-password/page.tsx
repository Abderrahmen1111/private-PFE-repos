'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { updateUserPassword } from '@/lib/actions/auth';
import { toast } from 'sonner';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères');
      return;
    }

    startTransition(async () => {
      const result = await updateUserPassword(formData.password);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        setSuccess(true);
        toast.success('Mot de passe mis à jour avec succès');
        setTimeout(() => router.push('/profile/user?tab=settings'), 2000);
      }
    });
  };

  return (
    <main className="relative min-h-screen bg-gradient-mesh overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40 animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-effect rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
          {success ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Mot de passe mis à jour !</h1>
              <p className="text-white/60 font-medium">
                Votre nouveau mot de passe a été enregistré. Redirection vers votre profil...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-7 h-7 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight mb-2">Choisir un nouveau mot de passe</h1>
                <p className="text-white/60 text-sm font-medium">Sécurisez votre compte avec un mot de passe fort</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-black text-white/40 tracking-widest mb-3 ml-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-5 pr-12 py-4 rounded-2xl input-glass border text-sm font-bold"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-white/40 tracking-widest mb-3 ml-1">Confirmer le mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl input-glass border text-sm font-bold"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      'Sauvegarder le mot de passe'
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/profile/user?tab=settings')}
                  className="w-full py-4 text-white/40 hover:text-white text-[10px] uppercase font-black tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={12} />
                  Retour aux paramètres
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
