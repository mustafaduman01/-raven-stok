import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationModal } from './components/NotificationModal';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ScanActionScreen } from './screens/ScanActionScreen';
import { HammaddeScreen } from './screens/HammaddeScreen';
import { AmbalajScreen } from './screens/AmbalajScreen';
import { LabelPrintScreen } from './screens/LabelPrintScreen';
import { CountScreen } from './screens/CountScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { UsersScreen } from './screens/UsersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PrototypeScreen } from './screens/PrototypeScreen';
import api from './api';
import { Alert } from './types';

const MainLayout: React.FC<{ onSwitchToPrototype?: () => void }> = ({ onSwitchToPrototype }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000); // 30 saniyede bir bildirimleri tazele
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/api/notifications');
      setAlerts(res.data);
    } catch {
      // Sessizce geç
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🧀</span>
          <span className="text-sm font-semibold text-slate-400">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onOpenPrototype={onSwitchToPrototype} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} />;
      case 'scan-action':
        return <ScanActionScreen />;
      case 'hammadde':
        return <HammaddeScreen />;
      case 'ambalaj':
        return <AmbalajScreen />;
      case 'label-print':
        return <LabelPrintScreen />;
      case 'count':
        return <CountScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'users':
        return <UsersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={alerts.filter((a) => !a.isRead).length}
        onOpenPrototype={onSwitchToPrototype}
      />

      <div className="flex flex-1">
        <Sidebar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderScreen()}
        </main>
      </div>

      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

export default function App() {
  return <PrototypeScreen />;
}
