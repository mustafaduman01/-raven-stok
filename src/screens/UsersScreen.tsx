import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  History,
} from 'lucide-react';
import api from '../api';
import { User } from '../types';

export const UsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Yeni Kullanıcı Formu
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'DEPO_SORUMLUSU' | 'URETIM_PERSONELI' | 'GORUNTULEYICI'>(
    'DEPO_SORUMLUSU',
  );
  const [telegramChatId, setTelegramChatId] = useState('');

  // Şifre Sıfırlama Formu
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/api/reports/movements?limit=50');
      // Audit kayıtları
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Audit log alınamadı:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', {
        name,
        email,
        password,
        role,
        telegramChatId: telegramChatId.trim() || undefined,
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setTelegramChatId('');
      fetchUsers();
      setSuccessMsg('Yeni kullanıcı hesabı başarıyla tanımlandı (SEC-01).');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kullanıcı oluşturulamadı.');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.put(`/api/users/${user.id}`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Durum güncellenemedi.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/api/users/${selectedUser.id}`, {
        password: newPassword,
      });
      setShowPasswordModal(false);
      setNewPassword('');
      setSuccessMsg(`${selectedUser.name} kullanıcısının şifresi güncellendi.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Şifre güncellenemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Kullanıcı & Yetki Yönetimi (SEC-01 – SEC-05)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Yalnızca yöneticinin hesap açabildiği kapalı devre kullanıcı ve rol denetimi (RBAC).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-600/20 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Yeni Personel Tanımla
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Ad Soyad</th>
                <th className="py-3 px-4">E-Posta</th>
                <th className="py-3 px-4">Rol (Yetki)</th>
                <th className="py-3 px-4">Telegram Chat ID</th>
                <th className="py-3 px-4">Durum (SEC-05)</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs font-mono">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {u.telegramChatId || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Pasif
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        u.isActive
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Pasife Al' : 'Aktifleştir'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowPasswordModal(true);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Şifre Sıfırla
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Personel Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Yeni Personel Tanımla (SEC-01)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ayşe Demir"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ad.soyad@peynirstok.com"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Başlangıç Şifresi *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kullanıcı Rolü (RBAC) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="ADMIN">Yönetici (Admin) - Tüm Yetkiler</option>
                  <option value="DEPO_SORUMLUSU">Depo Sorumlusu - Giriş/Çıkış/Etiket/Sayım</option>
                  <option value="URETIM_PERSONELI">Üretim Personeli - Okutma & Çıkış</option>
                  <option value="GORUNTULEYICI">Görüntüleyici - Sadece Raporlar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat ID (Opsiyonel)</label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Örn: 987654321"
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Personeli Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şifre Sıfırlama Modalı */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Şifre Sıfırla</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              <strong>{selectedUser.name}</strong> için yeni bir şifre belirleyiniz:
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifre (en az 6 karakter)..."
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Şifreyi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
