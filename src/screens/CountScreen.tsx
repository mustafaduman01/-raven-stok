import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';
import { Product, Location } from '../types';

export const CountScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [countedQty, setCountedQty] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, locRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/locations'),
      ]);
      setProducts(prodRes.data);
      setLocations(locRes.data);
      if (prodRes.data.length > 0) setSelectedProductId(prodRes.data[0].id);
      if (locRes.data.length > 0) setSelectedLocationId(locRes.data[0].id);
    } catch (err) {
      console.error('Veriler alınamadı:', err);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentStockLevel = selectedProduct?.stockLevels?.find(
    (sl) => sl.locationId === selectedLocationId,
  );
  const systemQty = currentStockLevel ? currentStockLevel.quantity : 0;
  const diff = countedQty !== '' ? Number(countedQty) - systemQty : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLocationId || countedQty === '') return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.post('/api/stock/count-adjust', {
        productId: selectedProductId,
        locationId: selectedLocationId,
        countedQuantity: Number(countedQty),
        note: note.trim() || 'Periyodik Sayım Düzeltmesi',
      });

      setFeedback({
        type: 'success',
        message: `Sayım kaydedildi: ${selectedProduct?.name} için yeni stok ${res.data.newQuantity} ${selectedProduct?.unit} olarak güncellendi. (Fark: ${res.data.diff > 0 ? '+' : ''}${res.data.diff})`,
      });
      setCountedQty('');
      setNote('');
      fetchInitialData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Sayım düzeltmesi kaydedilemedi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Periyodik Stok Sayımı (FR-14)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fiziki depo sayımı ile sistem stoğunu eşitleme ve sayım farkını kayıt altına alma.
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

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sayım Yapılan Ürün</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Depo / Lokasyon</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Karşılaştırma Kutusu */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 text-center gap-2">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Sistemdeki Stok</span>
            <div className="text-xl font-black text-slate-800 mt-1">
              {systemQty} {selectedProduct?.unit}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Fiziki Sayım</span>
            <div className="text-xl font-black text-purple-700 mt-1">
              {countedQty !== '' ? countedQty : '—'} {selectedProduct?.unit}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase block">Sayım Farkı</span>
            <div
              className={`text-xl font-black mt-1 ${
                diff === 0 ? 'text-slate-500' : diff > 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {countedQty !== '' ? (diff > 0 ? `+${diff}` : diff) : '—'} {selectedProduct?.unit}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tespit Edilen Gerçek Miktar ({selectedProduct?.unit}) *
          </label>
          <input
            type="number"
            step="any"
            min="0"
            required
            value={countedQty}
            onChange={(e) => setCountedQty(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Depoda sayılan miktar..."
            className="w-full px-3.5 py-2.5 border rounded-xl text-base font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Sayım Notu / Gerekçe *
          </label>
          <input
            type="text"
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Ay sonu hammadde deposu fiziki sayım mutabakatı"
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || countedQty === ''}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Sayımı Onayla & Stoğu Düzelt'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
