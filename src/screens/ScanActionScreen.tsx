import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  CloudUpload,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api';

interface QueuedAction {
  id: string;
  labelId: string;
  actionType: 'PRODUCTION_EXIT' | 'ENTRY' | 'RETURN' | 'WASTE';
  quantity: number;
  recipientInfo?: string;
  returnReason?: string;
  isWaste?: boolean;
  note?: string;
  idempotencyKey: string;
  productName: string;
  timestamp: string;
}

export const ScanActionScreen: React.FC = () => {
  const [actionType, setActionType] = useState<'PRODUCTION_EXIT' | 'ENTRY' | 'RETURN' | 'WASTE'>(
    'PRODUCTION_EXIT',
  );
  const [labelIdInput, setLabelIdInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Form alanları
  const [quantity, setQuantity] = useState<number | ''>('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [returnReason, setReturnReason] = useState('artan');
  const [isWaste, setIsWaste] = useState(false);
  const [note, setNote] = useState('');

  // Çevrimdışı Kuyruk Durumu (NFR-07)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<QueuedAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Kamera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Çevrimdışı Kuyruğu Yükle ve Ağ Durumunu Dinle (NFR-07)
  useEffect(() => {
    const savedQueue = localStorage.getItem('peynir_offline_queue');
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch {
        // Hatalı veri varsa geç
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      triggerSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveQueue = (newQueue: QueuedAction[]) => {
    setOfflineQueue(newQueue);
    localStorage.setItem('peynir_offline_queue', JSON.stringify(newQueue));
  };

  // Sesli Geri Bildirim (FR-08b)
  const playBeep = (isSuccess: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // AudioContext engelliyse
    }
  };

  // Kamera Başlat / Durdur
  useEffect(() => {
    if (isCameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );

      scanner.render(
        (decodedText) => {
          handleCodeDetected(decodedText);
          setIsCameraActive(false);
          scanner.clear();
        },
        () => {},
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isCameraActive]);

  const handleCodeDetected = (code: string) => {
    const cleanCode = code.trim();
    setLabelIdInput(cleanCode);
    fetchPreview(cleanCode);
  };

  // Ön İzleme Sorgusu (FR-07, FR-08)
  const fetchPreview = async (code: string) => {
    if (!code) return;
    setIsLoadingPreview(true);
    setFeedback(null);
    setScanResult(null);

    try {
      const res = await api.get(`/api/stock/scan/${code}`);
      setScanResult(res.data);
      setQuantity(res.data.label.quantity);
      playBeep(true);
    } catch (err: any) {
      playBeep(false);
      const msg = err.response?.data?.message || 'Okutulan QR kod sistemde bulunamadı (FR-10).';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Çevrimdışı Kuyruğu Sunucuya Eşitle (NFR-07)
  const triggerSyncQueue = async () => {
    const currentQueue = JSON.parse(localStorage.getItem('peynir_offline_queue') || '[]');
    if (currentQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const remainingQueue: QueuedAction[] = [];
    let syncedCount = 0;

    for (const item of currentQueue) {
      try {
        await api.post('/api/stock/scan-action', {
          labelId: item.labelId,
          actionType: item.actionType,
          quantity: item.quantity,
          recipientInfo: item.recipientInfo,
          returnReason: item.returnReason,
          isWaste: item.isWaste,
          note: item.note,
          idempotencyKey: item.idempotencyKey,
        });
        syncedCount++;
      } catch (err: any) {
        // Çakışma (409) ise zaten işlenmiştir; değilse kuyrukta tut
        if (err.response?.status !== 409) {
          remainingQueue.push(item);
        }
      }
    }

    saveQueue(remainingQueue);
    setIsSyncing(false);

    if (syncedCount > 0) {
      setFeedback({
        type: 'success',
        message: `Çevrimdışı kuyruktaki ${syncedCount} adet stok hareketi sunucuya başarıyla senkronize edildi.`,
      });
      playBeep(true);
    }
  };

  // Stok Hareketi Gönderme
  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult) return;

    setIsProcessing(true);
    setFeedback(null);

    const idempotencyKey = `scan_${scanResult.label.id}_${Date.now()}`;
    const targetQty = quantity !== '' ? Number(quantity) : scanResult.label.quantity;

    // Eğer çevrimdışı ise doğrudan yerel kuyruğa yaz (NFR-07)
    if (!isOnline) {
      const queuedItem: QueuedAction = {
        id: `queue_${Date.now()}`,
        labelId: scanResult.label.id,
        actionType,
        quantity: targetQty,
        recipientInfo: recipientInfo.trim() || undefined,
        returnReason: actionType === 'RETURN' ? returnReason : undefined,
        isWaste: actionType === 'RETURN' ? isWaste : actionType === 'WASTE',
        note: note.trim() || undefined,
        idempotencyKey,
        productName: scanResult.product.name,
        timestamp: new Date().toISOString(),
      };

      const updated = [...offlineQueue, queuedItem];
      saveQueue(updated);
      setIsProcessing(false);
      playBeep(true);

      setFeedback({
        type: 'warning',
        message: `📡 Çevrimdışı Mod (NFR-07): ${scanResult.product.name} için işlem cihaz hafızasına kaydedildi. Bağlantı geldiğinde otomatik sunucuya iletilecek.`,
      });

      setScanResult(null);
      setLabelIdInput('');
      setRecipientInfo('');
      setNote('');
      return;
    }

    try {
      const res = await api.post('/api/stock/scan-action', {
        labelId: scanResult.label.id,
        actionType,
        quantity: targetQty,
        recipientInfo: recipientInfo.trim() || undefined,
        returnReason: actionType === 'RETURN' ? returnReason : undefined,
        isWaste: actionType === 'RETURN' ? isWaste : actionType === 'WASTE',
        note: note.trim() || undefined,
        idempotencyKey,
      });

      playBeep(true);
      setFeedback({
        type: 'success',
        message: `${res.data.product.name}: ${actionType === 'PRODUCTION_EXIT' ? 'Üretime çıkış' : actionType === 'RETURN' ? 'İade' : 'Giriş'} işlemi başarıyla yapıldı. Yeni Toplam Stok: ${res.data.product.newTotalStock} ${res.data.product.unit}`,
      });

      setScanResult(null);
      setLabelIdInput('');
      setRecipientInfo('');
      setNote('');
    } catch (err: any) {
      playBeep(false);
      // Ağ hatası ise kuyruğa almayı teklif et veya doğrudan al
      if (!err.response) {
        const queuedItem: QueuedAction = {
          id: `queue_${Date.now()}`,
          labelId: scanResult.label.id,
          actionType,
          quantity: targetQty,
          recipientInfo: recipientInfo.trim() || undefined,
          returnReason: actionType === 'RETURN' ? returnReason : undefined,
          isWaste: actionType === 'RETURN' ? isWaste : actionType === 'WASTE',
          note: note.trim() || undefined,
          idempotencyKey,
          productName: scanResult.product.name,
          timestamp: new Date().toISOString(),
        };
        saveQueue([...offlineQueue, queuedItem]);
        setFeedback({
          type: 'warning',
          message: 'Sunucuya ulaşılamadı. Okutma çevrimdışı kuyruğa alındı (NFR-07).',
        });
        setScanResult(null);
        setLabelIdInput('');
      } else {
        const msg = err.response?.data?.message || 'İşlem gerçekleştirilemedi.';
        setFeedback({ type: 'error', message: msg });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Çevrimdışı / Çevrimiçi Durum Çubuğu (NFR-07) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Wifi className="w-4 h-4 text-emerald-600" /> Çevrimiçi (Sunucu Bağlantısı Aktif)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
              <WifiOff className="w-4 h-4 text-amber-600" /> Çevrimdışı Mod (NFR-07: Depo Kuyruğu Aktif)
            </span>
          )}
        </div>

        {offlineQueue.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {offlineQueue.length} bekleyen hareket
            </span>
            <button
              onClick={triggerSyncQueue}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              {isSyncing ? 'Eşitleniyor...' : 'Şimdi Senkronize Et'}
            </button>
          </div>
        )}
      </div>

      {/* 1. İşlem Modu Seçimi (Bölüm 8) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          1. İşlem Türünü Seçiniz
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActionType('PRODUCTION_EXIT');
              setIsWaste(false);
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold text-sm transition ${
              actionType === 'PRODUCTION_EXIT'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>Çıkış (Üretime Verme)</span>
            <span className={`text-[11px] font-normal ${actionType === 'PRODUCTION_EXIT' ? 'text-blue-100' : 'text-slate-400'}`}>
              Stok düşer (−)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActionType('RETURN')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold text-sm transition ${
              actionType === 'RETURN'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>İade İşlemi</span>
            <span className={`text-[11px] font-normal ${actionType === 'RETURN' ? 'text-slate-900' : 'text-slate-400'}`}>
              Sağlam (+) / Fire
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActionType('ENTRY');
              setIsWaste(false);
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold text-sm transition ${
              actionType === 'ENTRY'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5" />
            <span>Depo Girişi</span>
            <span className={`text-[11px] font-normal ${actionType === 'ENTRY' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Stok artar (+)
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActionType('WASTE');
              setIsWaste(true);
            }}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 font-bold text-sm transition ${
              actionType === 'WASTE'
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-5 h-5" />
            <span>Fire / Zayiat</span>
            <span className={`text-[11px] font-normal ${actionType === 'WASTE' ? 'text-red-100' : 'text-slate-400'}`}>
              Kayıp / Hasar
            </span>
          </button>
        </div>
      </div>

      {/* 2. QR Kod Okutma Alanı */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. QR Kodu Okutunuz veya UUID Giriniz (FR-08)
          </label>
          <button
            type="button"
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isCameraActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            {isCameraActive ? 'Kamerayı Kapat' : 'Kamera ile Tara'}
          </button>
        </div>

        {isCameraActive && (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <div id="qr-reader-container" className="max-w-xs mx-auto overflow-hidden rounded-lg bg-black"></div>
            <p className="text-xs text-slate-400 mt-2">Kameranızı etiketteki QR koda doğrultunuz.</p>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={labelIdInput}
              onChange={(e) => setLabelIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchPreview(labelIdInput);
                }
              }}
              placeholder="El okuyucu ile okutunuz veya UUID yapıştırınız..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="button"
            disabled={!labelIdInput || isLoadingPreview}
            onClick={() => fetchPreview(labelIdInput)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
          >
            {isLoadingPreview ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Sorgula
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedback.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : feedback.type === 'warning' ? (
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-semibold">{feedback.message}</div>
        </div>
      )}

      {/* 3. Okunan Ürün Kartı ve İşlem Onayı */}
      {scanResult && (
        <form onSubmit={handleProcessAction} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                {scanResult.product.code}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {scanResult.product.name}
              </h3>
              <p className="text-xs text-slate-500">
                Kategori: <strong className="text-slate-700">{scanResult.product.category}</strong> | Parti No: <strong className="text-slate-700">{scanResult.batch.batchNo}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-semibold">Mevcut Toplam Stok</span>
              <div className="text-2xl font-black text-slate-900">
                {scanResult.product.totalStock} {scanResult.product.unit}
              </div>
              {scanResult.product.isCritical && (
                <span className="inline-block text-[11px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                  ⚠️ Kritik Eşik Altı ({scanResult.product.minStock} {scanResult.product.unit})
                </span>
              )}
            </div>
          </div>

          {/* FIFO / FEFO Uyarısı (FR-04, FR-12) */}
          {scanResult.fifoWarning && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                {scanResult.fifoWarning}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                İşlem Yapılacak Miktar ({scanResult.product.unit})
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Etiketteki orijinal miktar: {scanResult.label.quantity} {scanResult.product.unit}
              </span>
            </div>

            {actionType === 'PRODUCTION_EXIT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kim Aldı / Hangi Üretim İçin? (FR-12) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  placeholder="Örn: Mehmet Usta - Kaşar Kazanı 2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {actionType === 'RETURN' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    İade Nedeni (FR-13)
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="artan">Artan / Fazla Ürün</option>
                    <option value="hatalı">Hatalı Ürün / Boyut</option>
                    <option value="hasarlı">Hasarlı / Kirli Ambalaj</option>
                    <option value="bozuk">Bozuk / Kokmuş Hammadde</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="isWaste"
                    checked={isWaste}
                    onChange={(e) => setIsWaste(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <label htmlFor="isWaste" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Bu ürün hasarlı/kullanılamaz; stoğa eklenmesin, doğrudan fire/zayiat olarak kaydedilsin.
                  </label>
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                İşlem Notu (Opsiyonel)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Varsa özel açıklama giriniz..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setScanResult(null)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-6 py-2.5 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2 ${
                actionType === 'PRODUCTION_EXIT'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : actionType === 'RETURN'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isProcessing ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'İşlemi Onayla ve Kaydet'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
