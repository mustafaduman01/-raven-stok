import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  AlertTriangle,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Layers,
} from 'lucide-react';
import api, { API_URL } from '../api';
import { StockMovement, Product } from '../types';

export const ReportsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'movements' | 'returns' | 'traceability'>(
    'current',
  );

  const [currentStock, setCurrentStock] = useState<any[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [traceability, setTraceability] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, categoryFilter, typeFilter]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'current') {
        const url = categoryFilter
          ? `/api/reports/current-stock?category=${categoryFilter}`
          : '/api/reports/current-stock';
        const res = await api.get(url);
        setCurrentStock(res.data);
      } else if (activeTab === 'movements') {
        const url = typeFilter
          ? `/api/reports/movements?type=${typeFilter}`
          : '/api/reports/movements';
        const res = await api.get(url);
        setMovements(res.data);
      } else if (activeTab === 'returns') {
        const res = await api.get('/api/reports/returns');
        setReturns(res.data);
      } else if (activeTab === 'traceability') {
        const res = await api.get('/api/reports/traceability');
        setTraceability(res.data);
      }
    } catch (err) {
      console.error('Rapor yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`${API_URL}/api/reports/export/csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Dışa Aktar Butonu (FR-26) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Raporlama ve İzlenebilirlik (FR-21 – FR-26)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Anlık stok seviyeleri, hareket defteri, parti izlenebilirliği ve Excel/CSV dışa aktarma.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition shrink-0"
        >
          <Download className="w-4 h-4" /> Excel / CSV İndir (FR-26)
        </button>
      </div>

      {/* Sekmeler */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('current')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'current'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Anlık Stok Raporu (FR-21)
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'movements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Hareket Defteri (FR-22)
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          İade ve Fire Raporu (FR-23)
        </button>
        <button
          onClick={() => setActiveTab('traceability')}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'traceability'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Parti / Lot İzlenebilirliği (FR-25)
        </button>
      </div>

      {/* Sekme 1: Anlık Stok Raporu */}
      {activeTab === 'current' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border rounded-lg font-medium text-slate-700"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="HAMMADDE">Hammadde</option>
              <option value="AMBALAJ">Karton / Kase / Koli</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">Kod</th>
                  <th className="py-3 px-4">Ürün Adı</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Toplam Stok</th>
                  <th className="py-3 px-4">Kritik Eşik</th>
                  <th className="py-3 px-4">Depo Dağılımı</th>
                  <th className="py-3 px-4">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-xs">{item.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.totalStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {item.locations?.map((l: any) => `${l.locationName}: ${l.quantity}`).join(' | ') || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {item.isCritical ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Kritik
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sekme 2: Hareket Defteri */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-3 py-1.5 border rounded-lg font-medium text-slate-700"
            >
              <option value="">Tüm Hareket Türleri</option>
              <option value="ENTRY">Giriş (+)</option>
              <option value="PRODUCTION_EXIT">Çıkış / Üretime Verme (−)</option>
              <option value="RETURN">İade</option>
              <option value="WASTE">Fire / Zayiat</option>
              <option value="COUNT_ADJUST">Sayım Düzeltmesi</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">İşlem</th>
                  <th className="py-3 px-4">Ürün</th>
                  <th className="py-3 px-4">Miktar</th>
                  <th className="py-3 px-4">Parti No</th>
                  <th className="py-3 px-4">Personel / Alıcı</th>
                  <th className="py-3 px-4">Not / Detay</th>
                  <th className="py-3 px-4">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-xs">{m.type}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.product?.name}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {m.quantity} {m.product?.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{m.batch?.batchNo || '—'}</td>
                    <td className="py-3 px-4 text-xs">
                      <div>{m.user?.name}</div>
                      {m.recipientInfo && <div className="text-blue-600">{m.recipientInfo}</div>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{m.note || m.returnReason || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(m.timestamp).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sekme 3: İade ve Fire Raporu */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4">İade / Fire Türü</th>
                  <th className="py-3 px-4">Ürün</th>
                  <th className="py-3 px-4">Miktar</th>
                  <th className="py-3 px-4">İade Nedeni</th>
                  <th className="py-3 px-4">Stoğa Eklendi mi?</th>
                  <th className="py-3 px-4">İade Eden</th>
                  <th className="py-3 px-4">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Henüz iade veya fire kaydı bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        {r.isWaste ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-bold">
                            Fire / Hasarlı
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">
                            Sağlam İade
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.product?.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.quantity} {r.product?.unit}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {r.returnReason || 'Belirtilmedi'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {r.isWaste ? (
                          <span className="text-red-600 font-bold">Hayır (Zayiat)</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Evet (Stok +)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{r.user?.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(r.timestamp).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sekme 4: Parti / Lot İzlenebilirliği */}
      {activeTab === 'traceability' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
          <div className="space-y-4">
            {traceability.map((batch) => (
              <div key={batch.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <span className="font-mono text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                      Parti: {batch.batchNo}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">
                      {batch.product?.name} ({batch.product?.code})
                    </h4>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Giriş: {new Date(batch.entryDate).toLocaleDateString('tr-TR')}</div>
                    {batch.expiryDate && (
                      <div className="text-red-700 font-semibold">
                        SKT: {new Date(batch.expiryDate).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                    <div>
                      Kalan: <strong className="text-slate-900 font-bold">{batch.remainingQty} / {batch.initialQty} {batch.product?.unit}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-600 mb-1">Bu Partiye Ait Hareket Geçmişi:</div>
                <div className="space-y-1">
                  {batch.movements?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{m.type}</span>
                        <span className="font-bold text-blue-700">{m.quantity} {batch.product?.unit}</span>
                        {m.recipientInfo && <span className="text-slate-500">({m.recipientInfo})</span>}
                      </div>
                      <div className="text-slate-400">
                        {m.user?.name} - {new Date(m.timestamp).toLocaleTimeString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
