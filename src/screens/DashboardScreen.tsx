import React, { useEffect, useState } from 'react';
import {
  Layers,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  QrCode,
  Printer,
  ChevronRight,
} from 'lucide-react';
import api from '../api';
import { Product, StockMovement } from '../types';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, movRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/reports/movements?limit=8'),
      ]);
      setProducts(prodRes.data);
      setMovements(movRes.data);
    } catch (err) {
      console.error('Dashboard verileri alınamadı:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hammaddeList = products.filter((p) => p.category?.code === 'HAMMADDE');
  const ambalajList = products.filter((p) => p.category?.code === 'AMBALAJ');
  const criticalProducts = products.filter((p) => p.isCritical);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">
            <ArrowDownLeft className="w-3 h-3" /> Giriş (+)
          </span>
        );
      case 'PRODUCTION_EXIT':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
            <ArrowUpRight className="w-3 h-3" /> Çıkış (−)
          </span>
        );
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
            <RotateCcw className="w-3 h-3" /> İade
          </span>
        );
      case 'WASTE':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
            Fire / Zayiat
          </span>
        );
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Karşılama ve Hızlı Butonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Depo Genel Durumu</h2>
          <p className="text-sm text-slate-500">
            Peynir üretim tesisinin anlık stok, kritik eşikler ve hareket akışı.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('scan-action')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition"
          >
            <QrCode className="w-4 h-4" /> QR Okut & İşlem Yap
          </button>
          <button
            onClick={() => onNavigate('label-print')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition"
          >
            <Printer className="w-4 h-4" /> Etiket Bas
          </button>
        </div>
      </div>

      {/* Kritik Stok Uyarısı Banner (FR-17, FR-18) */}
      {criticalProducts.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Dikkat: {criticalProducts.length} adet ürün kritik stok seviyesinin altında!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {criticalProducts.map((p) => `${p.name} (${p.totalStock} ${p.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg shrink-0 transition"
          >
            Raporu İncele &rarr;
          </button>
        </div>
      )}

      {/* Metrik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hammadde Kartı */}
        <div
          onClick={() => onNavigate('hammadde')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hammadde</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{hammaddeList.length}</span>
            <span className="text-xs text-slate-500 font-medium">Kalem Ürün</span>
          </div>
          <div className="mt-3 text-xs text-blue-600 flex items-center gap-1 font-medium">
            Hammadde deposunu gör <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Ambalaj Kartı */}
        <div
          onClick={() => onNavigate('ambalaj')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Karton / Kase / Koli</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{ambalajList.length}</span>
            <span className="text-xs text-slate-500 font-medium">Kalem Ürün</span>
          </div>
          <div className="mt-3 text-xs text-blue-600 flex items-center gap-1 font-medium">
            Ambalaj stoğunu gör <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Kritik Stok Sayısı */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kritik Stoklar</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              criticalProducts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{criticalProducts.length}</span>
            <span className="text-xs text-slate-500 font-medium">Eşik Altı</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 font-medium">
            {criticalProducts.length > 0 ? 'Yöneticiye Telegram iletildi' : 'Tüm stoklar güvenli'}
          </div>
        </div>

        {/* Son Hareket Sayısı */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Son Hareketler</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{movements.length}</span>
            <span className="text-xs text-slate-500 font-medium">Kayıtlı İşlem</span>
          </div>
          <div className="mt-3 text-xs text-blue-600 flex items-center gap-1 font-medium">
            Ledger hareketlerini gör <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Son Stok Hareketleri Akışı */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Son Depo Hareketleri (Ledger Akışı)</h3>
            <p className="text-xs text-slate-500">QR okutma, giriş, çıkış ve iade kayıtları</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Tümünü Gör
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">İşlem Türü</th>
                <th className="py-3 px-4">Ürün</th>
                <th className="py-3 px-4">Miktar</th>
                <th className="py-3 px-4">Parti No</th>
                <th className="py-3 px-4">İşlemi Yapan / Alan</th>
                <th className="py-3 px-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Henüz kayıtlı bir stok hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">{getMovementBadge(m.type)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {m.product?.name}
                      <span className="text-xs text-slate-400 block font-normal">{m.product?.code}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {m.quantity} {m.product?.unit}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {m.batch?.batchNo || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700">
                      <div className="font-medium">{m.user?.name}</div>
                      {m.recipientInfo && (
                        <div className="text-[11px] text-blue-600">Alıcı: {m.recipientInfo}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(m.timestamp).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
