import React from 'react';
import { LogOut, Bell, User as UserIcon, Shield, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onOpenPrototype?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  unreadCount,
  onOpenPrototype,
}) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">Yönetici</span>;
      case 'DEPO_SORUMLUSU':
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Depo Sorumlusu</span>;
      case 'URETIM_PERSONELI':
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Üretim</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">Görüntüleyici</span>;
    }
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Menüyü Aç"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧀</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
                Peynir Depo Takip
              </h1>
              <p className="text-xs text-amber-400 font-medium">Stok & QR Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Müşteri Prototip Butonu */}
          {onOpenPrototype && (
            <button
              onClick={onOpenPrototype}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              title="Müşteri Prototip Simülatörüne Geç"
            >
              <span>✨</span>
              <span className="hidden md:inline">Müşteri Prototipi</span>
            </button>
          )}

          {/* Bildirim Çanı */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Bildirimler"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Kullanıcı Profili */}
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white">{user?.name}</div>
              <div>{getRoleBadge(user?.role)}</div>
            </div>
          </div>

          {/* Çıkış Yap */}
          <button
            onClick={logout}
            className="flex items-center gap-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition ml-1"
            title="Güvenli Çıkış"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  );
};
