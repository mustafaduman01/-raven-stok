import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Layers, CheckCircle2, QrCode } from 'lucide-react';
import api from '../api';
import { Batch, Label } from '../types';

export const LabelPrintScreen: React.FC = () => {
  const [mode, setMode] = useState<'batch' | 'product'>('batch');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [labelQty, setLabelQty] = useState<number>(25);
  const [labelCount, setLabelCount] = useState<number>(4);
  const [generatedLabels, setGeneratedLabels] = useState<any[]>([]);
  const [productQrData, setProductQrData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReprinting, setIsReprinting] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/api/batches');
      setBatches(res.data);
      if (res.data.length > 0) {
        setSelectedBatchId(res.data[0].id);
      }
    } catch (err) {
      console.error('Partiler alınamadı:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
      if (res.data.length > 0) {
        setSelectedProductId(res.data[0].id);
      }
    } catch (err) {
      console.error('Ürünler alınamadı:', err);
    }
  };

  const handleGenerateLabels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;
    setIsGenerating(true);

    try {
      const res = await api.post('/api/labels/generate', {
        batchId: selectedBatchId,
        quantity: Number(labelQty),
        count: Number(labelCount),
      });
      setGeneratedLabels(res.data);
      setProductQrData(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Etiket üretilemedi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProductQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setIsGenerating(true);

    try {
      const res = await api.get(`/api/labels/product/${selectedProductId}/qr`);
      setProductQrData(res.data);
      setGeneratedLabels([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ürün QR kodu üretilemedi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProductZpl = async () => {
    if (!selectedProductId) return;
    try {
      const res = await api.get(`/api/labels/product/${selectedProductId}/zpl`);
      const blob = new Blob([res.data.zpl], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urun_etiket_${productQrData?.product?.code || 'URUN'}.zpl`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('ZPL kodu alınamadı.');
    }
  };

  const handleReprint = async (labelId: string) => {
    setIsReprinting(labelId);
    try {
      const res = await api.post(`/api/labels/${labelId}/reprint`);
      setGeneratedLabels((prev) =>
        prev.map((l) => (l.id === labelId ? { ...l, reprintCount: res.data.reprintCount } : l)),
      );
      setTimeout(() => window.print(), 200);
    } catch (err) {
      alert('Yeniden basım başarısız.');
    } finally {
      setIsReprinting(null);
    }
  };

  const handleDownloadZpl = async (labelId: string, labelCode: string) => {
    try {
      const res = await api.get(`/api/labels/${labelId}/zpl`);
      const blob = new Blob([res.data.zpl], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiket_${labelCode}_${labelId.slice(0, 8)}.zpl`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('ZPL kodu alınamadı.');
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Yazdırma Kontrol Paneli (Yazıcıda gizlenir) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                <Printer className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-800">QR Etiket Üretimi ve Yazdırma</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Partiye özel UUID veya doğrudan Ürüne/Rafa özel sabit QR kod etiket baskısı.
            </p>
          </div>

          {(generatedLabels.length > 0 || productQrData) && (
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-sm shadow-md transition"
            >
              <Printer className="w-4 h-4" /> Yazdır
            </button>
          )}
        </div>

        {/* Mod Seçimi: Parti Etiketi vs Ürün/Raf Etiketi */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'batch'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📦 Parti / Mal Kabul Etiketi (UUID)
          </button>
          <button
            type="button"
            onClick={() => setMode('product')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'product'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏷️ Ürün / Raf / Kutu Sabit QR Kodu
          </button>
        </div>

        {mode === 'batch' ? (
          <form onSubmit={handleGenerateLabels} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Parti / Lot Seçiniz</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.product?.name} ({b.batchNo}) - Kalan: {b.remainingQty} {b.product?.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Etiket Başı Miktar</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={labelQty}
                onChange={(e) => setLabelQty(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Basılacak Etiket Adedi</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={labelCount}
                  onChange={(e) => setLabelCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-800 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shrink-0 shadow transition"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Oluştur'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleGenerateProductQr} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Ürünü Seçiniz</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} ({p.category?.name}) - Toplam: {p.totalStock} {p.unit}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow transition shrink-0"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ürün QR Kodu Üret'}
            </button>
          </form>
        )}
      </div>

      {/* Yazdırılabilir Etiket Alanı (printable-area) */}
      <div id="printable-area">
        {mode === 'product' && productQrData && (
          <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-lg page-break-inside-avoid print:border-black print:m-1">
            {/* Etiket Üst Başlık */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧀</span>
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                    SABİT ÜRÜN / RAF ETİKETİ
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">PEYNİR DEPO TAKİP SİSTEMİ</span>
                </div>
              </div>
              <span className="font-mono text-xs bg-slate-900 text-white px-2.5 py-1 rounded font-black">
                {productQrData.product.code}
              </span>
            </div>

            {/* Gövde: Büyük QR ve Ürün Bilgisi */}
            <div className="flex items-center gap-5">
              <div className="shrink-0 bg-white p-2 border-2 border-slate-900 rounded-xl shadow-inner">
                <img
                  src={productQrData.qrDataUrl}
                  alt={productQrData.product.code}
                  className="w-36 h-36 object-contain"
                />
              </div>

              <div className="space-y-2 text-left">
                <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                  {productQrData.product.name}
                </h3>
                <div className="text-xs text-slate-600">
                  Kategori: <strong className="text-slate-900">{productQrData.product.category}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Birim: <strong className="text-slate-900 uppercase">{productQrData.product.unit}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Kritik Eşik: <strong className="text-red-700">{productQrData.product.minStock} {productQrData.product.unit}</strong>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                  QR Değeri: {productQrData.product.code}
                </div>
              </div>
            </div>

            {/* Lokasyon Dökümü */}
            {productQrData.locations?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">DEPO VE LOKASYONLAR:</span>
                <div className="flex flex-wrap gap-2">
                  {productQrData.locations.map((loc: any, i: number) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                      {loc.name}: <strong>{loc.quantity} {productQrData.product.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Alt İşlemler */}
            <div className="border-t-2 border-slate-900 pt-3 mt-4 flex items-center justify-between text-xs text-slate-600">
              <span>Basım: {new Date().toLocaleDateString('tr-TR')}</span>
              <div className="print:hidden flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadProductZpl}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold transition"
                >
                  ZPL İndir
                </button>
                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold transition"
                >
                  Yazdır
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'batch' && generatedLabels.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 print:hidden">
            <QrCode className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">Lütfen yukarıdan parti seçerek etiket oluşturunuz.</p>
          </div>
        )}

        {mode === 'product' && !productQrData && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 print:hidden">
            <QrCode className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">Lütfen yukarıdan bir ürün seçip "Ürün QR Kodu Üret" butonuna basınız.</p>
          </div>
        )}

        {mode === 'batch' && generatedLabels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedLabels.map((lbl, idx) => (
              <div
                key={lbl.id}
                className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col justify-between relative page-break-inside-avoid print:border-black print:m-1"
                style={{ minHeight: '180px' }}
              >
                {/* Etiket Üst Başlık */}
                <div className="border-b border-slate-300 pb-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🧀</span>
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">
                      Peynir Depo Takip
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    {lbl.product?.code}
                  </span>
                </div>

                {/* Etiket Gövde: QR ve Bilgiler */}
                <div className="flex items-center gap-3">
                  {/* QR Kod Görseli (FR-08a: Hata düzeltme Q, en az 2x2 cm) */}
                  <div className="shrink-0 bg-white p-1 border border-slate-200 rounded">
                    <img
                      src={lbl.qrDataUrl}
                      alt="QR"
                      className="w-24 h-24 object-contain"
                    />
                  </div>

                  {/* Metin Bilgileri */}
                  <div className="text-left space-y-1 text-xs leading-tight">
                    <div className="font-bold text-slate-900 text-sm line-clamp-2">
                      {lbl.product?.name}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Parti No: </span>
                      <strong className="text-slate-900 font-mono">{lbl.batch?.batchNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Miktar: </span>
                      <strong className="text-slate-900 font-bold text-sm">
                        {lbl.quantity} {lbl.product?.unit}
                      </strong>
                    </div>
                    {lbl.batch?.expiryDate && (
                      <div>
                        <span className="text-slate-500 text-[10px]">SKT: </span>
                        <strong className="text-red-700 font-semibold">
                          {new Date(lbl.batch.expiryDate).toLocaleDateString('tr-TR')}
                        </strong>
                      </div>
                    )}
                    <div className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">
                      ID: {lbl.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                {/* Alt Çubuk */}
                <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Giriş: {new Date(lbl.createdAt).toLocaleDateString('tr-TR')}</span>
                  {lbl.reprintCount > 0 && (
                    <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded">
                      Yeniden Basım: {lbl.reprintCount}
                    </span>
                  )}
                  <div className="print:hidden flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadZpl(lbl.id, lbl.product?.code || 'URUN')}
                      className="text-slate-600 hover:text-slate-900 hover:underline font-semibold"
                      title="Zebra / Endüstriyel Yazıcı ZPL Dosyası"
                    >
                      ZPL İndir
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => handleReprint(lbl.id)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Tekrar Bas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
