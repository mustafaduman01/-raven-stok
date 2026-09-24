import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC<{ onOpenPrototype?: () => void }> = ({ onOpenPrototype }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.accessToken, res.data.user);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol ediniz.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 space-y-6">
        {/* Başlık ve Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-3xl mb-2">
            🧀
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Raven Stok
          </h1>
          <p className="text-sm text-slate-400">
            Peynir Üretim Tesisi Depo & Stok Takip Sistemi
          </p>
        </div>

        {/* Güvenlik Bilgilendirmesi (SEC-01) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Kapalı Sistem:</strong> Yalnızca yönetici tarafından tanımlanmış personeller giriş yapabilir.
          </span>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
            <span className="text-base leading-none">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              E-Posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad.soyad@peynirstok.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition duration-150 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Güvenli Giriş Yap'
            )}
          </button>
        </form>

        {/* Hızlı Demo Giriş Butonları */}
        <div className="border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-400 mb-2 font-medium text-center uppercase tracking-wider">
            Test Kullanıcıları ile Hızlı Doldur
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@peynirstok.com', 'Admin123!')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              Yönetici
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('depo@peynirstok.com', 'Depo123!')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              Depocu
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('uretim@peynirstok.com', 'Uretim123!')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              Üretim
            </button>
          </div>
          {onOpenPrototype && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenPrototype}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <span>✨</span>
                <span>Müşteri Prototipini Aç (Girişsiz Simülasyon)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
