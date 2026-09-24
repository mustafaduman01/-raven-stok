import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Box,
  Layers,
  QrCode,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  X,
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  History,
  ScanLine,
  TrendingDown,
  Sparkles,
  Info,
  Calendar,
  Factory,
} from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: 'HAMMADDE' | 'AMBALAJ';
  unit: string;
  currentStock: number;
  minStock: number;
  lastMovement: string;
  location: string;
  lotNo?: string;
}

const INITIAL_MATERIALS: Material[] = [
  // Ambalaj Grubu
  {
    id: 'AMB-001',
    name: '500gr Klasik Peynir Kasesi',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 85, // KRİTİK SEVİYE
    minStock: 250,
    lastMovement: '24.09.2026 14:15 - Sevk (-65)',
    location: 'Ambalaj Deposu A-02',
    lotNo: 'LOT-KAS-500-24',
  },
  {
    id: 'AMB-002',
    name: '1kg Vakumlu Peynir Kutusu (Şeffaf)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 1420,
    minStock: 300,
    lastMovement: '24.09.2026 11:20 - Giriş (+500)',
    location: 'Ambalaj Deposu B-01',
    lotNo: 'LOT-KUT-1000-19',
  },
  {
    id: 'AMB-003',
    name: 'Kraft Dış Sevkiyat Kolisi (12li)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 480,
    minStock: 150,
    lastMovement: '23.09.2026 17:00 - Sevk (-40)',
    location: 'Ambalaj Deposu C-04',
    lotNo: 'LOT-KOL-12-88',
  },
  {
    id: 'AMB-004',
    name: 'Baskılı Ürün Gövde Etiketi (Kuşe)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 6500,
    minStock: 1000,
    lastMovement: '24.09.2026 09:30 - Sevk (-500)',
    location: 'Etiket Dolabı E-01',
    lotNo: 'LOT-ETK-2026-05',
  },
  // Hammadde Grubu
  {
    id: 'HAM-001',
    name: 'Çiğ İnek Sütü (Yağlı %3.8)',
    category: 'HAMMADDE',
    unit: 'Litre',
    currentStock: 12500,
    minStock: 3000,
    lastMovement: '24.09.2026 08:00 - Giriş (+5000)',
    location: 'Süt Siloları Tank-1',
    lotNo: 'SUT-20260924-A',
  },
  {
    id: 'HAM-002',
    name: 'Doğal Sıvı Peynir Mayası (Şirden)',
    category: 'HAMMADDE',
    unit: 'Litre',
    currentStock: 45,
    minStock: 20,
    lastMovement: '24.09.2026 10:15 - Sevk (-5)',
    location: 'Soğuk Depo Maya Dolabı',
    lotNo: 'MAY-2026-091',
  },
  {
    id: 'HAM-003',
    name: 'İnce Salamura Tuzu (Gıda Tipi)',
    category: 'HAMMADDE',
    unit: 'Kg',
    currentStock: 1850,
    minStock: 500,
    lastMovement: '22.09.2026 16:45 - Sevk (-150)',
    location: 'Tuz Deposu R-01',
    lotNo: 'TUZ-2026-44',
  },
  {
    id: 'HAM-004',
    name: 'Kalsiyum Klorür Çözeltisi (%33)',
    category: 'HAMMADDE',
    unit: 'Kg',
    currentStock: 180,
    minStock: 50,
    lastMovement: '23.09.2026 13:00 - Sevk (-20)',
    location: 'Kimyasal/Katkı Odası',
    lotNo: 'CAL-2026-12',
  },
];

interface LogEntry {
  id: string;
  time: string;
  materialName: string;
  type: 'GİRİŞ' | 'ÇIKIŞ' | 'İADE' | 'FİRE';
  qty: number;
  unit: string;
  detail: string;
}

export const PrototypeScreen: React.FC<{ onSwitchToSystem?: () => void }> = ({ onSwitchToSystem }) => {
  const [activeTab, setActiveTab] = useState<'HAMMADDE' | 'AMBALAJ'>('AMBALAJ');
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      time: '14:15',
      materialName: '500gr Klasik Peynir Kasesi',
      type: 'ÇIKIŞ',
      qty: 65,
      unit: 'Adet',
      detail: 'Kaşar Paketleme Hattı (Ali Usta)',
    },
    {
      id: 'log-2',
      time: '11:20',
      materialName: '1kg Vakumlu Peynir Kutusu (Şeffaf)',
      type: 'GİRİŞ',
      qty: 500,
      unit: 'Adet',
      detail: 'Mal Kabul (Öz Ambalaj San.)',
    },
  ]);

  // Modallar
  const [showMalKabulModal, setShowMalKabulModal] = useState(false);
  const [showSevkModal, setShowSevkModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Mal Kabul Formu
  const [mkMaterialId, setMkMaterialId] = useState('');
  const [mkQty, setMkQty] = useState('');
  const [mkLot, setMkLot] = useState('LOT-202609-902');
  const [mkSkt, setMkSkt] = useState('2027-09-30');
  const [showQrPreview, setShowQrPreview] = useState(false);

  // Sevk & İade Formu
  const [sevkTab, setSevkTab] = useState<'EXIT' | 'RETURN'>('EXIT');
  const [sevkMaterialId, setSevkMaterialId] = useState('');
  const [exitQty, setExitQty] = useState('');
  const [exitLine, setExitLine] = useState('Beyaz Peynir Paketleme');
  const [exitPerson, setExitPerson] = useState('Mehmet Usta');

  // İade & Fire Hesabı
  const [returnIssuedQty, setReturnIssuedQty] = useState('100'); // Verilen miktar
  const [returnGoodQty, setReturnGoodQty] = useState('92'); // Sağlam dönen miktar
  const [wasteReason, setWasteReason] = useState('Hatta Ezilme / Vakum Kaçağı');

  // Bildirim Banner'ı (Kritik Stok)
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Mobil Tarayıcı Simülasyonu
  const [mobileScannedItem, setMobileScannedItem] = useState<Material | null>(null);
  const [mobileFeedback, setMobileFeedback] = useState<string | null>(null);

  // Filtrelenmiş liste
  const filteredMaterials = materials.filter((m) => {
    const matchesTab = m.category === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Kritik stoktaki 500gr Kase kontrolü
  const kaseItem = materials.find((m) => m.id === 'AMB-001');
  const isKaseCritical = kaseItem ? kaseItem.currentStock < kaseItem.minStock : false;

  // 1. Mal Kabul İşlemi
  const handleConfirmMalKabul = () => {
    const targetId = mkMaterialId || selectedMaterial?.id || 'AMB-001';
    const qtyNum = Number(mkQty);
    if (!qtyNum || qtyNum <= 0) {
      alert('Lütfen geçerli bir miktar giriniz.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          const newStock = item.currentStock + qtyNum;
          return {
            ...item,
            currentStock: newStock,
            lastMovement: `Bugün ${nowStr} - Mal Kabul (+${qtyNum})`,
            lotNo: mkLot || item.lotNo,
          };
        }
        return item;
      }),
    );

    const targetMat = materials.find((m) => m.id === targetId);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: nowStr,
        materialName: targetMat?.name || 'Ürün',
        type: 'GİRİŞ',
        qty: qtyNum,
        unit: targetMat?.unit || 'Adet',
        detail: `Parti: ${mkLot} (Depoya Giriş Yapıldı)`,
      },
      ...prev,
    ]);

    setShowMalKabulModal(false);
    setShowQrPreview(false);
    setMkQty('');
  };

  // 2. Üretime Sevk Çıkışı
  const handleConfirmExit = () => {
    const targetId = sevkMaterialId || selectedMaterial?.id || 'AMB-001';
    const qtyNum = Number(exitQty);
    if (!qtyNum || qtyNum <= 0) {
      alert('Lütfen geçerli bir çıkış miktarı giriniz.');
      return;
    }

    const currentItem = materials.find((m) => m.id === targetId);
    if (currentItem && currentItem.currentStock < qtyNum) {
      alert(`Yetersiz stok! Mevcut stok: ${currentItem.currentStock} ${currentItem.unit}`);
      return;
    }

    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            currentStock: Math.max(0, item.currentStock - qtyNum),
            lastMovement: `Bugün ${nowStr} - Üretime Sevk (-${qtyNum})`,
          };
        }
        return item;
      }),
    );

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: nowStr,
        materialName: currentItem?.name || 'Ürün',
        type: 'ÇIKIŞ',
        qty: qtyNum,
        unit: currentItem?.unit || 'Adet',
        detail: `${exitLine} - Teslim: ${exitPerson}`,
      },
      ...prev,
    ]);

    setShowSevkModal(false);
    setExitQty('');
  };

  // 3. Üretimden İade Al & Fire Kaydet
  const calculatedWaste = Math.max(0, Number(returnIssuedQty) - Number(returnGoodQty));

  const handleConfirmReturn = () => {
    const targetId = sevkMaterialId || selectedMaterial?.id || 'AMB-001';
    const goodNum = Number(returnGoodQty);
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const currentItem = materials.find((m) => m.id === targetId);

    // Sağlam olan adedi stoğa geri ekle
    if (goodNum > 0) {
      setMaterials((prev) =>
        prev.map((item) => {
          if (item.id === targetId) {
            return {
              ...item,
              currentStock: item.currentStock + goodNum,
              lastMovement: `Bugün ${nowStr} - Üretimden İade (+${goodNum})`,
            };
          }
          return item;
        }),
      );

      setLogs((prev) => [
        {
          id: `log-${Date.now()}-ret`,
          time: nowStr,
          materialName: currentItem?.name || 'Ürün',
          type: 'İADE',
          qty: goodNum,
          unit: currentItem?.unit || 'Adet',
          detail: 'Sağlam kalan iade stoğa geri eklendi',
        },
        ...prev,
      ]);
    }

    // Fire varsa fire kaydı düş
    if (calculatedWaste > 0) {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-wst`,
          time: nowStr,
          materialName: currentItem?.name || 'Ürün',
          type: 'FİRE',
          qty: calculatedWaste,
          unit: currentItem?.unit || 'Adet',
          detail: `Sebep: ${wasteReason}`,
        },
        ...prev,
      ]);
    }

    setShowSevkModal(false);
  };

  // Mobil Tarama Aksiyonu
  const handleMobileScanAction = (action: 'EXIT' | 'RETURN') => {
    if (!mobileScannedItem) return;
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (action === 'EXIT') {
      const dropQty = 20;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === mobileScannedItem.id
            ? { ...m, currentStock: Math.max(0, m.currentStock - dropQty) }
            : m,
        ),
      );
      setMobileFeedback(`✅ 20 ${mobileScannedItem.unit} üretime sevk edildi!`);
      setLogs((prev) => [
        {
          id: `mob-${Date.now()}`,
          time: nowStr,
          materialName: mobileScannedItem.name,
          type: 'ÇIKIŞ',
          qty: dropQty,
          unit: mobileScannedItem.unit,
          detail: 'Mobil QR Okutma ile Hızlı Çıkış',
        },
        ...prev,
      ]);
    } else {
      const returnQty = 15;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === mobileScannedItem.id ? { ...m, currentStock: m.currentStock + returnQty } : m,
        ),
      );
      setMobileFeedback(`✅ 15 ${mobileScannedItem.unit} sağlam iade olarak depoya alındı!`);
      setLogs((prev) => [
        {
          id: `mob-${Date.now()}`,
          time: nowStr,
          materialName: mobileScannedItem.name,
          type: 'İADE',
          qty: returnQty,
          unit: mobileScannedItem.unit,
          detail: 'Mobil QR Okutma ile Sağlam İade',
        },
        ...prev,
      ]);
    }

    setTimeout(() => {
      setMobileFeedback(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* 1. ÜST BAR & YETKİ SİMÜLASYONU */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/10">
              🧀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  SÜTÇÜOĞLU PEYNİRCİLİK
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Prototip Simülatörü
                </span>
              </div>
              <p className="text-xs text-slate-400">Hammadde, Ambalaj & Fire Takip Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Yetki Etiketi */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Giriş Yapan: <strong className="text-white">Depo Sorumlusu (Yetkili)</strong>
              </span>
            </div>

            {/* Mobil Kamera Butonu (Üst Bar) */}
            <button
              onClick={() => {
                setMobileScannedItem(materials.find((m) => m.id === 'AMB-001') || materials[0]);
                setShowMobileModal(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobil Tarayıcı</span>
            </button>

            {onSwitchToSystem && (
              <button
                onClick={onSwitchToSystem}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                Tam Sisteme Geç
              </button>
            )}
          </div>
        </div>

        {/* KRİTİK STOK UYARI BANNER'I */}
        {!bannerDismissed && isKaseCritical && (
          <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-inner animate-pulse">
            <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-200" />
              <span>
                <strong>Kritik Stok Uyarısı:</strong> 500gr Kase stoğu kritik eşiğin altına indi! (Kalan: {kaseItem?.currentStock} Adet / Asgari: {kaseItem?.minStock} Adet)
              </span>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/80 hover:text-white ml-2 p-1"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Hızlı İstatistik & Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* 2. SEKMELER (TABS) */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('HAMMADDE')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'HAMMADDE'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Hammadde Deposu (Kg/Lt)</span>
            </button>

            <button
              onClick={() => setActiveTab('AMBALAJ')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'AMBALAJ'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Ambalaj & Sarf (Adet)</span>
              {isKaseCritical && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-0.5"></span>
              )}
            </button>
          </div>

          {/* Ana Butonlar (Mal Kabul & Sevk) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const target = filteredMaterials[0] || materials[0];
                setSelectedMaterial(target);
                setMkMaterialId(target.id);
                setShowQrPreview(false);
                setShowMalKabulModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Mal Kabul & QR Bas</span>
            </button>

            <button
              onClick={() => {
                const target = filteredMaterials[0] || materials[0];
                setSelectedMaterial(target);
                setSevkMaterialId(target.id);
                setSevkTab('EXIT');
                setShowSevkModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-amber-900/30 transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Üretime Sevk / İade</span>
            </button>
          </div>
        </div>

        {/* Arama & Bilgi Satırı */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Malzeme adı, kod veya raf ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-end">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal Seviye
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kritik Eşik Altı
            </span>
          </div>
        </div>

        {/* 3. ANA TABLO & MALZEME LİSTESİ */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Malzeme Adı & Kod</th>
                  <th className="py-3.5 px-3">Kategori & Lokasyon</th>
                  <th className="py-3.5 px-3">Mevcut Stok</th>
                  <th className="py-3.5 px-3">Kritik Eşik</th>
                  <th className="py-3.5 px-3">Son Hareket</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredMaterials.map((item) => {
                  const isCritical = item.currentStock < item.minStock;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-4 border-amber-500'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Malzeme Adı */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              isCritical ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.category === 'AMBALAJ' ? '📦' : '🥛'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {item.name}
                              {isCritical && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                  ⚠️ Kritik
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Kod: <code className="text-amber-400/90">{item.id}</code>
                              {item.lotNo && ` • Parti: ${item.lotNo}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Lokasyon */}
                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="text-xs font-semibold text-slate-200">
                          {item.category === 'AMBALAJ' ? 'Ambalaj / Kutu' : 'Hammadde'}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.location}</div>
                      </td>

                      {/* Mevcut Stok */}
                      <td className="py-3.5 px-3">
                        <div
                          className={`text-sm sm:text-base font-extrabold ${
                            isCritical ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.currentStock.toLocaleString('tr-TR')} {item.unit}
                        </div>
                        {isCritical && (
                          <div className="text-[10px] text-red-400 font-bold">
                            Eşiğin {item.minStock - item.currentStock} {item.unit} altında!
                          </div>
                        )}
                      </td>

                      {/* Kritik Eşik */}
                      <td className="py-3.5 px-3 text-slate-400">
                        {item.minStock.toLocaleString('tr-TR')} {item.unit}
                      </td>

                      {/* Son Hareket */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-300">{item.lastMovement}</div>
                      </td>

                      {/* İşlemler Butonları */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Hızlı Mal Kabul */}
                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setMkMaterialId(item.id);
                              setShowQrPreview(false);
                              setShowMalKabulModal(true);
                            }}
                            title="Mal Kabul Yap & QR Bas"
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Üretime Sevk / İade */}
                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setSevkMaterialId(item.id);
                              setSevkTab('EXIT');
                              setShowSevkModal(true);
                            }}
                            title="Üretime Çıkış Yap veya İade Al"
                            className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 border border-amber-800/40 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Termal QR Etiketi */}
                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setMkMaterialId(item.id);
                              setShowQrPreview(true);
                              setShowMalKabulModal(true);
                            }}
                            title="Termal QR Etiketi Önizle"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CANLI HAREKET & FİRE GÜNLÜĞÜ (MOCK LOGS) */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Anlık Simülasyon Hareket & Fire Akışı</h3>
            </div>
            <span className="text-[11px] text-slate-400">Son yapılan işlemler canlı düşer</span>
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-500 text-[11px]">{log.time}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      log.type === 'GİRİŞ'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : log.type === 'ÇIKIŞ'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : log.type === 'FİRE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-semibold text-slate-200">{log.materialName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{log.detail}</span>
                  <span className="font-extrabold text-white">
                    {log.type === 'ÇIKIŞ' || log.type === 'FİRE' ? '-' : '+'}
                    {log.qty} {log.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. TIKLANABİLİR MODALLAR (SİMÜLASYON) */}
      {/* ========================================================================= */}

      {/* MODAL 1: MAL KABUL & QR BAS */}
      {showMalKabulModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Mal Kabul & Termal QR Bas</h3>
              </div>
              <button
                onClick={() => setShowMalKabulModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Malzeme Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kabul Edilecek Malzeme:
                </label>
                <select
                  value={mkMaterialId}
                  onChange={(e) => setMkMaterialId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category} - Mevcut: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Miktar & Parti No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gelen Miktar:
                  </label>
                  <input
                    type="number"
                    placeholder="Örn: 500"
                    value={mkQty}
                    onChange={(e) => setMkQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parti / Lot No:</label>
                  <input
                    type="text"
                    value={mkLot}
                    onChange={(e) => setMkLot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Son Kullanma Tarihi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Son Kullanma Tarihi (SKT):
                </label>
                <input
                  type="date"
                  value={mkSkt}
                  onChange={(e) => setMkSkt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* QR Etiket Önizleme Butonu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrPreview(!showQrPreview)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{showQrPreview ? 'Önizlemeyi Gizle' : '50x30mm QR Termal Etiket Önizle'}</span>
                </button>
              </div>

              {/* 50x30mm TERMAL ETİKET ÖNİZLEME ALANI */}
              {showQrPreview && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
                  <div className="text-[11px] font-bold text-slate-400 mb-2">
                    🖨️ Zebra ZPL Endüstriyel Termal Etiket (50mm x 30mm Örnek)
                  </div>
                  {/* Etiket Kartı */}
                  <div className="w-[280px] h-[168px] bg-white text-black p-2.5 rounded shadow-lg border border-slate-300 flex flex-col justify-between font-mono text-[9px] leading-tight select-none">
                    <div className="border-b border-black pb-1 flex justify-between items-center">
                      <span className="font-extrabold text-[10px]">SÜTÇÜOĞLU PEYNİR</span>
                      <span className="text-[8px] bg-black text-white px-1 font-bold">KABUL ONAYLI</span>
                    </div>

                    <div className="flex gap-2 items-center py-1">
                      {/* Simüle QR Kod */}
                      <div className="w-16 h-16 bg-black p-1 rounded flex items-center justify-center flex-shrink-0">
                        <div className="w-full h-full bg-white p-0.5 flex flex-wrap gap-0.5 items-center justify-center">
                          <div className="w-3 h-3 bg-black"></div>
                          <div className="w-3 h-3 bg-black"></div>
                          <div className="w-1 h-1 bg-black"></div>
                          <div className="w-3 h-3 bg-black"></div>
                          <div className="w-2 h-2 bg-black"></div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden space-y-0.5">
                        <div className="font-black text-[10px] truncate">
                          {materials.find((m) => m.id === (mkMaterialId || selectedMaterial?.id))?.name}
                        </div>
                        <div>
                          KOD: <strong>{mkMaterialId || selectedMaterial?.id}</strong>
                        </div>
                        <div>
                          PARTİ: <strong>{mkLot}</strong>
                        </div>
                        <div>
                          SKT: <strong>{mkSkt}</strong>
                        </div>
                        <div>
                          MİKTAR: <strong>{mkQty || '500'} Adet/Kg</strong>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-black pt-0.5 text-center text-[8px] font-bold text-slate-800">
                      *PRD-{mkMaterialId || selectedMaterial?.id}* | FEFO İZLENEBİLİR
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Alt Butonlar */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowMalKabulModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmMalKabul}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
              >
                Stoğa Ekle & Etiketi Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ÜRETİME SEVK / İADE */}
      {showSevkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Başlığı & Sekmeler */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Üretim Hareket Modülü</h3>
              </div>
              <button onClick={() => setShowSevkModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İki Sekme: Üretime Çıkış vs Üretimden İade Al */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
              <button
                onClick={() => setSevkTab('EXIT')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  sevkTab === 'EXIT'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Üretime Çıkış Yap (Stoktan Düş)
              </button>
              <button
                onClick={() => setSevkTab('RETURN')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  sevkTab === 'RETURN'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Üretimden İade Al & Fire Hesapla
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Malzeme Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İşlem Yapılacak Malzeme:</label>
                <select
                  value={sevkMaterialId}
                  onChange={(e) => setSevkMaterialId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Mevcut Stok: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* SEKME 1: ÜRETİME ÇIKIŞ FORMU */}
              {sevkTab === 'EXIT' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Çıkarılacak Miktar:
                    </label>
                    <input
                      type="number"
                      placeholder="Örn: 50"
                      value={exitQty}
                      onChange={(e) => setExitQty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hedef Üretim Hattı:
                      </label>
                      <select
                        value={exitLine}
                        onChange={(e) => setExitLine(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Kaşar Peynir Hattı">Kaşar Peynir Hattı</option>
                        <option value="Beyaz Peynir Paketleme">Beyaz Peynir Paketleme</option>
                        <option value="Tulum / Özel Peynir Hattı">Tulum / Özel Peynir Hattı</option>
                        <option value="Salamura Havuzu">Salamura Havuzu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Teslim Alan Usta / Personel:
                      </label>
                      <input
                        type="text"
                        value={exitPerson}
                        onChange={(e) => setExitPerson(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Onayladığınızda malzeme derhal sistem stoğundan düşülecektir.</span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowSevkModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleConfirmExit}
                      className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-900/40"
                    >
                      Çıkışı Onayla (-Stok Düş)
                    </button>
                  </div>
                </>
              ) : (
                /* SEKME 2: ÜRETİMDEN İADE AL & FİRE HESAPLA */
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hatta Verilen Miktar:
                      </label>
                      <input
                        type="number"
                        value={returnIssuedQty}
                        onChange={(e) => setReturnIssuedQty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Sağlam Dönen Miktar:
                      </label>
                      <input
                        type="number"
                        value={returnGoodQty}
                        onChange={(e) => setReturnGoodQty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* OTOMATİK HESAPLANAN FİRE KUTUSU */}
                  <div className="bg-red-950/40 border border-red-500/50 p-3.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-red-300">
                      <span className="font-semibold flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        Hesaplanan Fire / Zayiat:
                      </span>
                      <strong className="text-base font-extrabold text-red-400">
                        {calculatedWaste} Adet/Birim
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      (Verilen: {returnIssuedQty} - Sağlam İade: {returnGoodQty} = Fire:{' '}
                      {calculatedWaste})
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fire / Hasar Sebebi:
                    </label>
                    <select
                      value={wasteReason}
                      onChange={(e) => setWasteReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="Hatta Ezilme / Vakum Kaçağı">Hatta Ezilme / Vakum Kaçağı</option>
                      <option value="Koli / Kutu Yırtılması">Koli / Kutu Yırtılması</option>
                      <option value="Hatalı Barkod / Baskı Kayması">Hatalı Barkod / Baskı Kayması</option>
                      <option value="Yere Düşme / Hijyen İhlali">Yere Düşme / Hijyen İhlali</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowSevkModal(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleConfirmReturn}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-900/40"
                    >
                      Sağlamı Stoğa Al & Fireyi Kaydet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MOBİL GÖRÜNÜM & KAMERA / QR TARAYICI SİMÜLASYONU */}
      {/* ========================================================================= */}

      {/* Sağ Altta Yüzen Mobil Simülatör Butonu */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setMobileScannedItem(materials.find((m) => m.id === 'AMB-001') || materials[0]);
            setShowMobileModal(true);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-2xl shadow-indigo-500/50 transition-all transform hover:scale-105 active:scale-95 border border-indigo-400/40"
        >
          <Smartphone className="w-5 h-5 animate-bounce" />
          <span>📱 Mobil QR Tarayıcı Simülasyonu</span>
        </button>
      </div>

      {/* MOBİL TELEFON MOCKUP MODALI */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="relative w-full max-w-[340px] bg-slate-950 border-4 border-slate-700 rounded-[38px] shadow-2xl p-4 flex flex-col items-center overflow-hidden">
            {/* Telefon Ahizesi ve Kamera Çentiği */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mb-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900"></div>
              <div className="w-8 h-1.5 rounded-full bg-slate-900"></div>
            </div>

            {/* Kapat Butonu */}
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Telefon Ekran Başlığı */}
            <div className="w-full text-center pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-amber-400">📱 El Terminali / Kamera Vizörü</span>
              <p className="text-[9px] text-slate-400">Karekod Çerçevesi Otomatik Okunuyor</p>
            </div>

            {/* VİZÖR & LAZER ANİMASYONU */}
            <div className="relative w-full h-44 bg-slate-900 rounded-2xl my-3 border-2 border-dashed border-amber-500/60 overflow-hidden flex flex-col items-center justify-center">
              {/* Hareketli Lazer Çizgisi */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse top-1/2 -translate-y-1/2"></div>

              {/* Köşe Hedef İşaretleri */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>

              {/* QR Kodu Temsili */}
              <div className="w-20 h-20 bg-white p-1 rounded shadow flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-1">PRD-{mobileScannedItem?.id}</span>
            </div>

            {/* Simüle Okutma Seçenekleri */}
            <div className="w-full mb-2">
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                Örnek Ürün Barkodu Okut:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setMobileScannedItem(materials.find((m) => m.id === 'AMB-001') || null)}
                  className={`text-[10px] py-1 px-1.5 rounded font-semibold truncate border ${
                    mobileScannedItem?.id === 'AMB-001'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  500gr Kase (Kritik)
                </button>
                <button
                  onClick={() => setMobileScannedItem(materials.find((m) => m.id === 'HAM-002') || null)}
                  className={`text-[10px] py-1 px-1.5 rounded font-semibold truncate border ${
                    mobileScannedItem?.id === 'HAM-002'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  Peynir Mayası
                </button>
              </div>
            </div>

            {/* Taranan Ürün Detayı & Aksiyon */}
            {mobileScannedItem && (
              <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mb-2 text-xs">
                <div className="font-bold text-white text-xs truncate">{mobileScannedItem.name}</div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Mevcut:</span>
                  <strong className="text-amber-300">
                    {mobileScannedItem.currentStock} {mobileScannedItem.unit}
                  </strong>
                </div>

                {mobileFeedback && (
                  <div className="mt-1 text-[10px] text-emerald-400 font-bold text-center bg-emerald-950/60 p-1 rounded border border-emerald-500/30">
                    {mobileFeedback}
                  </div>
                )}

                {/* Mobil Hızlı Aksiyon Butonları */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    onClick={() => handleMobileScanAction('EXIT')}
                    className="py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] text-center"
                  >
                    Üretime Çık (-20)
                  </button>
                  <button
                    onClick={() => handleMobileScanAction('RETURN')}
                    className="py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] text-center"
                  >
                    Sağlam İade (+15)
                  </button>
                </div>
              </div>
            )}

            <div className="text-[9px] text-slate-500 text-center">
              Telefonda yapılan işlemler arkada ana tabloyu anında günceller.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
