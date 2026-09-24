import React from 'react';
import { X, CheckCheck, AlertTriangle, Info, Bell } from 'lucide-react';
import { Alert } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-lg">Bildirim Merkezi</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              {alerts.filter((a) => !a.isRead).length} yeni
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Bell className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
              <p className="text-sm">Henüz bir bildirim bulunmuyor.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border text-sm transition flex items-start gap-3 ${
                  alert.isRead
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-amber-50/60 border-amber-200 text-slate-900 shadow-sm'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.isRead ? 'text-slate-400' : 'text-amber-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(alert.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => onMarkAsRead(alert.id)}
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Okundu
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-4 h-4" /> Tümünü Okundu Say
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
