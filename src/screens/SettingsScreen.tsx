import React, { useState } from 'react';
import { Settings, Send, Lock, CheckCircle2, AlertCircle, Bell, MessageSquare } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Telegram ve Bildirim Tercihleri
  const [telegramChatId, setTelegramChatId] = useState(user?.telegramChatId || '');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(!!user?.telegramChatId);

  // Şifre Değiştirme
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      await api.put(`/api/users/${user.id}`, {
        telegramChatId: telegramChatId.trim() || null,
        notificationPrefs: { push: pushEnabled, telegram: telegramEnabled },
      });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Telegram ve bildirim ayarlarınız kaydedildi.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Ayarlar kaydedilemedi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setFeedback({ type: 'success', message: 'Şifreniz başarıyla güncellendi.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Şifre değiştirilemedi.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
            <Settings className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kullanıcı Ayarları & Telegram (FR-20)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kritik stok bildirim kanalları tercihi ve güvenlik ayarları.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Telegram Bağlantısı (FR-20d) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-slate-800 text-base">Telegram Bot Bildirimleri (FR-20d)</h3>
        </div>

        <p className="text-xs text-slate-600">
          Stok seviyesi kritik eşiğin altına düştüğünde Telegram üzerinden anlık mesaj almak için Telegram Chat ID'nizi kaydediniz.
        </p>

        <form onSubmit={handleSaveTelegram} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Telegram Chat ID'niz
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Örn: 123456789"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shrink-0 shadow transition"
              >
                Kaydet
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              💡 Telegram'da @userinfobot botuna <code>/start</code> yazarak Chat ID numaranızı öğrenebilirsiniz.
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Web Push Bildirimleri (PWA)</span>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Telegram Mesaj Bildirimleri</span>
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Şifre Değiştir */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Lock className="w-5 h-5 text-slate-700" />
          <h3 className="font-bold text-slate-800 text-base">Şifremi Değiştir</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mevcut Şifre *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifre (En az 6 karakter) *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow transition"
            >
              Şifreyi Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
