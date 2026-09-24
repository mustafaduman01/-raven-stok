import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  QrCode,
  Printer,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentScreen: string;
  onSelectScreen: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isDepo = user?.role === 'DEPO_SORUMLUSU' || isAdmin;
  const isUretim = user?.role === 'URETIM_PERSONELI';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Gösterge Paneli',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'URETIM_PERSONELI', 'GORUNTULEYICI'],
    },
    {
      id: 'scan-action',
      label: 'QR Okut & İşlem Yap',
      icon: QrCode,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'URETIM_PERSONELI'],
      highlight: true,
    },
    {
      id: 'hammadde',
      label: 'Hammadde Stokları',
      icon: Layers,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'URETIM_PERSONELI', 'GORUNTULEYICI'],
    },
    {
      id: 'ambalaj',
      label: 'Karton / Kase / Koli',
      icon: Package,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'URETIM_PERSONELI', 'GORUNTULEYICI'],
    },
    {
      id: 'label-print',
      label: 'Etiket / QR Basımı',
      icon: Printer,
      roles: ['ADMIN', 'DEPO_SORUMLUSU'],
    },
    {
      id: 'count',
      label: 'Stok Sayımı',
      icon: ClipboardList,
      roles: ['ADMIN', 'DEPO_SORUMLUSU'],
    },
    {
      id: 'reports',
      label: 'Raporlar & Geçmiş',
      icon: BarChart3,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'GORUNTULEYICI'],
    },
    {
      id: 'users',
      label: 'Kullanıcı Yönetimi',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'Ayarlar & Telegram',
      icon: Settings,
      roles: ['ADMIN', 'DEPO_SORUMLUSU', 'URETIM_PERSONELI', 'GORUNTULEYICI'],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || ''),
  );

  return (
    <>
      {/* Mobil Karartma */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out overflow-y-auto flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between pb-2 md:hidden">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Menü
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectScreen(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : item.highlight
                      ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>Peynir Stok Takip v1.0</p>
          <p className="mt-0.5 text-slate-600">Kapalı Devre Güvenli Depo</p>
        </div>
      </aside>
    </>
  );
};
