import React, { useState } from 'react';
import {
  AlertCircle,
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
  ShieldCheck,
  Clock,
  TrendingDown,
  Info,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Package,
  Activity,
  AlertTriangle,
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
  supplier?: string;
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
    lastMovement: '14:15 • Üretime Sevk (-65)',
    location: 'Depo A • Göz 02',
    lotNo: 'LOT-KAS-500-24',
    supplier: 'Öz Plastik San.',
  },
  {
    id: 'AMB-002',
    name: '1kg Vakumlu Peynir Kutusu (Şeffaf)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 1420,
    minStock: 300,
    lastMovement: '11:20 • Mal Kabul (+500)',
    location: 'Depo B • Raf 01',
    lotNo: 'LOT-KUT-1000-19',
    supplier: 'Ege Ambalaj A.Ş.',
  },
  {
    id: 'AMB-003',
    name: 'Kraft Dış Sevkiyat Kolisi (12li)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 480,
    minStock: 150,
    lastMovement: 'Dün • Üretime Sevk (-40)',
    location: 'Depo C • Palet 04',
    lotNo: 'LOT-KOL-12-88',
    supplier: 'Modern Oluklu Koli',
  },
  {
    id: 'AMB-004',
    name: 'Baskılı Ürün Gövde Etiketi (Kuşe)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 6500,
    minStock: 1000,
    lastMovement: '09:30 • Üretime Sevk (-500)',
    location: 'Etiket Kabini • Raf 01',
    lotNo: 'LOT-ETK-2026-05',
    supplier: 'Baskı Teknik Ltd.',
  },
  // Hammadde Grubu
  {
    id: 'HAM-001',
    name: 'Çiğ İnek Sütü (Yağlı %3.8)',
    category: 'HAMMADDE',
    unit: 'Litre',
    currentStock: 12500,
    minStock: 3000,
    lastMovement: '08:00 • Mal Kabul (+5,000)',
    location: 'Süt Siloları • Tank 01',
    lotNo: 'SUT-20260924-A',
    supplier: 'Bölge Çiftçiler Birliği',
  },
  {
    id: 'HAM-002',
    name: 'Doğal Sıvı Peynir Mayası (Şirden)',
    category: 'HAMMADDE',
    unit: 'Litre',
    currentStock: 45,
    minStock: 20,
    lastMovement: '10:15 • Üretime Sevk (-5)',
    location: 'Soğuk Oda • Dolap 03',
    lotNo: 'MAY-2026-091',
    supplier: 'BiyoKimya Gıda',
  },
  {
    id: 'HAM-003',
    name: 'İnce Salamura Tuzu (Gıda Tipi)',
    category: 'HAMMADDE',
    unit: 'Kg',
    currentStock: 1850,
    minStock: 500,
    lastMovement: 'Dün • Üretime Sevk (-150)',
    location: 'Kuru Depo • Bölme 01',
    lotNo: 'TUZ-2026-44',
    supplier: 'Kaya Tuzculuk',
  },
  {
    id: 'HAM-004',
    name: 'Kalsiyum Klorür Çözeltisi (%33)',
    category: 'HAMMADDE',
    unit: 'Kg',
    currentStock: 180,
    minStock: 50,
    lastMovement: 'Dün • Üretime Sevk (-20)',
    location: 'Katkı Deposu • Raf 02',
    lotNo: 'CAL-2026-12',
    supplier: 'Gıda Çözümleri A.Ş.',
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
  const [activeTab, setActiveTab] = useState<'AMBALAJ' | 'HAMMADDE'>('AMBALAJ');
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Günlük hareket kayıtları
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
      detail: 'İrsaliye: İRS-9821 • Kabul Onaylı',
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
  const [mkLot, setMkLot] = useState('LOT-2026-904');
  const [mkSkt, setMkSkt] = useState('2027-10-15');
  const [showQrPreview, setShowQrPreview] = useState(false);

  // Sevk & İade Formu
  const [sevkTab, setSevkTab] = useState<'EXIT' | 'RETURN'>('EXIT');
  const [sevkMaterialId, setSevkMaterialId] = useState('');
  const [exitQty, setExitQty] = useState('');
  const [exitLine, setExitLine] = useState('Kaşar Paketleme Hattı');
  const [exitPerson, setExitPerson] = useState('Ahmet Usta (Vardiya 1)');

  // İade & Fire Hesabı
  const [returnIssuedQty, setReturnIssuedQty] = useState('100');
  const [returnGoodQty, setReturnGoodQty] = useState('92');
  const [wasteReason, setWasteReason] = useState('Hatta Ezilme / Vakum Kaçağı');

  // Mobil Tarayıcı Simülasyonu
  const [mobileScannedItem, setMobileScannedItem] = useState<Material | null>(null);
  const [mobileFeedback, setMobileFeedback] = useState<string | null>(null);

  // Filtreleme
  const filteredMaterials = materials.filter((m) => {
    const matchesTab = m.category === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Kritik Stoktaki Ürün Kontrolü
  const kaseItem = materials.find((m) => m.id === 'AMB-001');
  const isKaseCritical = kaseItem ? kaseItem.currentStock < kaseItem.minStock : false;
  const criticalCount = materials.filter((m) => m.currentStock < m.minStock).length;

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
            lastMovement: `Bugün ${nowStr} • Mal Kabul (+${qtyNum})`,
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
        detail: `Parti: ${mkLot} • İrsaliye Kabul Edildi`,
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
      alert('Lütfen geçerli bir miktar giriniz.');
      return;
    }

    const currentItem = materials.find((m) => m.id === targetId);
    if (currentItem && currentItem.currentStock < qtyNum) {
      alert(`Yetersiz stok! Mevcut miktar: ${currentItem.currentStock} ${currentItem.unit}`);
      return;
    }

    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setMaterials((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            currentStock: Math.max(0, item.currentStock - qtyNum),
            lastMovement: `Bugün ${nowStr} • Üretime Sevk (-${qtyNum})`,
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
        detail: `${exitLine} • Teslim: ${exitPerson}`,
      },
      ...prev,
    ]);

    setShowSevkModal(false);
    setExitQty('');
  };

  // 3. Üretimden İade Al & Fire Hesabı
  const calculatedWaste = Math.max(0, Number(returnIssuedQty) - Number(returnGoodQty));

  const handleConfirmReturn = () => {
    const targetId = sevkMaterialId || selectedMaterial?.id || 'AMB-001';
    const goodNum = Number(returnGoodQty);
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const currentItem = materials.find((m) => m.id === targetId);

    if (goodNum > 0) {
      setMaterials((prev) =>
        prev.map((item) => {
          if (item.id === targetId) {
            return {
              ...item,
              currentStock: item.currentStock + goodNum,
              lastMovement: `Bugün ${nowStr} • Sağlam İade (+${goodNum})`,
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
          detail: 'Üretimden sağlam iade depoya alındı',
        },
        ...prev,
      ]);
    }

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
      setMobileFeedback(`-20 ${mobileScannedItem.unit} üretime sevk edildi`);
      setLogs((prev) => [
        {
          id: `mob-${Date.now()}`,
          time: nowStr,
          materialName: mobileScannedItem.name,
          type: 'ÇIKIŞ',
          qty: dropQty,
          unit: mobileScannedItem.unit,
          detail: 'Mobil El Terminali ile Hızlı Sevk',
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
      setMobileFeedback(`+15 ${mobileScannedItem.unit} depoya sağlam iade edildi`);
      setLogs((prev) => [
        {
          id: `mob-${Date.now()}`,
          time: nowStr,
          materialName: mobileScannedItem.name,
          type: 'İADE',
          qty: returnQty,
          unit: mobileScannedItem.unit,
          detail: 'Mobil El Terminali ile İade',
        },
        ...prev,
      ]);
    }

    setTimeout(() => {
      setMobileFeedback(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased selection:bg-zinc-200">
      {/* 1. ÜST BAR (MINIMALIST & SOFISTIKE) */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Başlık */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-zinc-900">Raven Stok</span>
                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
                  Prototip
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal leading-none mt-0.5">
                Peynir Üretim & Ambalaj Takip Sistemi
              </p>
            </div>
          </div>

          {/* Yetki Göstergesi & Butonlar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Kullanıcı Rozeti */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
              <span className="text-[11px]">
                Giriş Yapan: <strong className="font-semibold text-zinc-800">Depo Sorumlusu (Yetkili)</strong>
              </span>
            </div>

            {/* Mobil Tarayıcı Simülatör Butonu */}
            <button
              onClick={() => {
                setMobileScannedItem(materials.find((m) => m.id === 'AMB-001') || materials[0]);
                setShowMobileModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition shadow-xs active:scale-98"
            >
              <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
              <span>Mobil Tarayıcı</span>
            </button>

            {onSwitchToSystem && (
              <button
                onClick={onSwitchToSystem}
                className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 transition"
              >
                Tam Sistem →
              </button>
            )}
          </div>
        </div>

        {/* 2. KRİTİK STOK UYARI BANNER'I (ZARİF & DİKKAT ÇEKİCİ) */}
        {!bannerDismissed && isKaseCritical && (
          <div className="bg-amber-50 border-t border-b border-amber-200/70 px-4 py-2 text-xs">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[12px]">
                  <strong>Kritik Stok Uyarısı:</strong> 500gr Kase stoğu kritik eşiğin altına indi (Kalan: <strong>{kaseItem?.currentStock} Adet</strong> / Asgari: {kaseItem?.minStock} Adet).
                </span>
                <button
                  onClick={() => {
                    const target = materials.find((m) => m.id === 'AMB-001') || materials[0];
                    setSelectedMaterial(target);
                    setMkMaterialId(target.id);
                    setShowQrPreview(false);
                    setShowMalKabulModal(true);
                  }}
                  className="hidden md:inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-amber-950 ml-1"
                >
                  Hemen Mal Kabul Yap →
                </button>
              </div>

              <button
                onClick={() => setBannerDismissed(true)}
                className="text-amber-700/70 hover:text-amber-900 p-0.5"
                title="Kapat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI ÖZET KARTLARI (MINIMALIST KARELER) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Toplam Kalem</div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">8 Malzeme</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">4 Hammadde • 4 Ambalaj</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Kritik Stok</div>
            <div className="text-xl font-semibold text-amber-600 mt-1 flex items-center gap-1.5">
              <span>{criticalCount} Kalem</span>
              {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">500gr Kase takviye bekliyor</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Bugünkü Sevk</div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">1,070 Adet / Lt</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Üretim planına uygun</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Günlük Fire Oranı</div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">%1.2</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Hedef eşik: &lt; %3.0</div>
          </div>
        </div>

        {/* SEKME SEÇİMİ VE ANA AKSİYONLAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Segmented Control (Sekmeler) */}
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
            <button
              onClick={() => setActiveTab('AMBALAJ')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition ${
                activeTab === 'AMBALAJ'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ambalaj & Sarf Malzeme</span>
              {isKaseCritical && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('HAMMADDE')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition ${
                activeTab === 'HAMMADDE'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-zinc-500" />
              <span>Hammadde Deposu</span>
            </button>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const target = filteredMaterials[0] || materials[0];
                setSelectedMaterial(target);
                setMkMaterialId(target.id);
                setShowQrPreview(false);
                setShowMalKabulModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 text-xs font-medium shadow-xs transition active:scale-98"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              <span>Üretime Sevk / İade</span>
            </button>
          </div>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Malzeme adı, parti no veya raf ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-400 transition"
            />
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Kritik Seviye
            </span>
          </div>
        </div>

        {/* 3. ANA MALZEME LİSTESİ TABLOSU */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/75 text-zinc-500 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-200/80">
                <tr>
                  <th className="py-3 px-4">Malzeme Adı</th>
                  <th className="py-3 px-3">Kategori & Lokasyon</th>
                  <th className="py-3 px-3">Mevcut Stok</th>
                  <th className="py-3 px-3">Kritik Eşik</th>
                  <th className="py-3 px-3">Son Hareket</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMaterials.map((item) => {
                  const isCritical = item.currentStock < item.minStock;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-amber-50/40 hover:bg-amber-50/70'
                          : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      {/* Malzeme Adı & Kod */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-medium ${
                              isCritical ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {item.id.split('-')[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-2">
                              <span>{item.name}</span>
                              {isCritical && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Kritik
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                              {item.id} {item.lotNo && `• ${item.lotNo}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lokasyon */}
                      <td className="py-3.5 px-3">
                        <div className="text-zinc-700 font-medium">{item.location}</div>
                        <div className="text-[11px] text-zinc-400">{item.supplier}</div>
                      </td>

                      {/* Mevcut Stok */}
                      <td className="py-3.5 px-3">
                        <div
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isCritical ? 'text-amber-700 font-bold' : 'text-zinc-900'
                          }`}
                        >
                          {item.currentStock.toLocaleString('tr-TR')} {item.unit}
                        </div>
                        {isCritical && (
                          <div className="text-[10px] text-amber-600">
                            Eşiğin {item.minStock - item.currentStock} altı
                          </div>
                        )}
                      </td>

                      {/* Kritik Eşik */}
                      <td className="py-3.5 px-3 text-zinc-500 font-mono tabular-nums">
                        {item.minStock.toLocaleString('tr-TR')} {item.unit}
                      </td>

                      {/* Son Hareket */}
                      <td className="py-3.5 px-3 text-zinc-500">
                        {item.lastMovement}
                      </td>

                      {/* Hızlı İşlemler */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setMkMaterialId(item.id);
                              setShowQrPreview(false);
                              setShowMalKabulModal(true);
                            }}
                            title="Mal Kabul Yap & QR Bas"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setSevkMaterialId(item.id);
                              setSevkTab('EXIT');
                              setShowSevkModal(true);
                            }}
                            title="Üretime Sevk / İade"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setMkMaterialId(item.id);
                              setShowQrPreview(true);
                              setShowMalKabulModal(true);
                            }}
                            title="Termal Etiket Görüntüle"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
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

        {/* CANLI HAREKET GÜNLÜĞÜ (MINIMAL FEED) */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                Depo Hareket & Fire Akışı
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">Canlı simülasyon kayıtları</span>
          </div>

          <div className="divide-y divide-zinc-100 mt-1">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-zinc-400 text-[11px]">{log.time}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                      log.type === 'GİRİŞ'
                        ? 'bg-emerald-50 text-emerald-700'
                        : log.type === 'ÇIKIŞ'
                        ? 'bg-zinc-100 text-zinc-700'
                        : log.type === 'FİRE'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-medium text-zinc-800">{log.materialName}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-zinc-400 text-[11px] hidden sm:inline">{log.detail}</span>
                  <span className="font-mono font-semibold text-zinc-800">
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
      {/* MODALLAR (MINIMALIST & NET) */}
      {/* ========================================================================= */}

      {/* MODAL 1: MAL KABUL & QR BAS */}
      {showMalKabulModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-zinc-700" />
                <h3 className="font-semibold text-zinc-900 text-sm">Mal Kabul & Termal QR Baskı</h3>
              </div>
              <button
                onClick={() => setShowMalKabulModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Kabul Malzemesi</label>
                <select
                  value={mkMaterialId}
                  onChange={(e) => setMkMaterialId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentStock} {m.unit} mevcut)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Gelen Miktar</label>
                  <input
                    type="number"
                    placeholder="Örn: 500"
                    value={mkQty}
                    onChange={(e) => setMkQty(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Parti / Lot No</label>
                  <input
                    type="text"
                    value={mkLot}
                    onChange={(e) => setMkLot(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Son Kullanma Tarihi (SKT)</label>
                <input
                  type="date"
                  value={mkSkt}
                  onChange={(e) => setMkSkt(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrPreview(!showQrPreview)}
                  className="w-full py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrPreview ? 'Önizlemeyi Kapat' : '50x30mm Termal Etiket Tasarımını Önizle'}</span>
                </button>
              </div>

              {/* 50x30mm TERMAL ETİKET ÖNİZLEMESİ (GERÇEKÇİ & ZARİF) */}
              {showQrPreview && (
                <div className="p-3 bg-zinc-100/70 rounded-xl border border-zinc-200/80 flex flex-col items-center">
                  <div className="text-[10px] font-medium text-zinc-500 mb-2">
                    Zebra ZPL Standartlarında 50mm x 30mm Termal Çıktı
                  </div>

                  <div className="w-[270px] h-[162px] bg-white text-zinc-900 p-3 rounded shadow-xs border border-zinc-300 flex flex-col justify-between font-mono text-[9px] select-none">
                    <div className="border-b border-zinc-900 pb-1 flex justify-between items-center">
                      <span className="font-bold text-[10px] tracking-tight">RAVEN STOK</span>
                      <span className="text-[8px] bg-zinc-900 text-white px-1 font-semibold">KABUL</span>
                    </div>

                    <div className="flex gap-2 items-center py-1">
                      {/* Vektör QR Simülasyonu */}
                      <div className="w-14 h-14 bg-zinc-900 p-1 rounded flex items-center justify-center shrink-0">
                        <div className="w-full h-full bg-white p-0.5 flex flex-wrap gap-0.5 items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-zinc-900"></div>
                          <div className="w-2.5 h-2.5 bg-zinc-900"></div>
                          <div className="w-1 h-1 bg-zinc-900"></div>
                          <div className="w-2.5 h-2.5 bg-zinc-900"></div>
                          <div className="w-2 h-2 bg-zinc-900"></div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden space-y-0.5 leading-tight">
                        <div className="font-bold text-[10px] truncate text-zinc-900">
                          {materials.find((m) => m.id === (mkMaterialId || selectedMaterial?.id))?.name}
                        </div>
                        <div className="text-zinc-600">
                          KOD: <strong className="text-zinc-900">{mkMaterialId || selectedMaterial?.id}</strong>
                        </div>
                        <div className="text-zinc-600">
                          PARTİ: <strong className="text-zinc-900">{mkLot}</strong>
                        </div>
                        <div className="text-zinc-600">
                          SKT: <strong className="text-zinc-900">{mkSkt}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-zinc-300 pt-1 text-center text-[8px] text-zinc-500 font-sans">
                      *PRD-{mkMaterialId || selectedMaterial?.id}* • FEFO İZLENEBİLİR
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowMalKabulModal(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmMalKabul}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition"
              >
                Stoğa Ekle & Etiketi Bas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ÜRETİME SEVK / İADE */}
      {showSevkModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-zinc-700" />
                <h3 className="font-semibold text-zinc-900 text-sm">Üretim Hareket Modülü</h3>
              </div>
              <button
                onClick={() => setShowSevkModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* İki Sekmeli Kontrol */}
            <div className="px-5 pt-3 pb-1 border-b border-zinc-100 bg-zinc-50/50 flex gap-2">
              <button
                onClick={() => setSevkTab('EXIT')}
                className={`py-1.5 px-3 text-xs rounded-lg transition font-medium ${
                  sevkTab === 'EXIT'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Üretime Çıkış
              </button>
              <button
                onClick={() => setSevkTab('RETURN')}
                className={`py-1.5 px-3 text-xs rounded-lg transition font-medium ${
                  sevkTab === 'RETURN'
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Üretimden İade & Fire Hesabı
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Malzeme</label>
                <select
                  value={sevkMaterialId}
                  onChange={(e) => setSevkMaterialId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Mevcut: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {sevkTab === 'EXIT' ? (
                /* ÇIKIŞ FORMU */
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Çıkarılacak Miktar</label>
                    <input
                      type="number"
                      placeholder="Örn: 50"
                      value={exitQty}
                      onChange={(e) => setExitQty(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Hedef Üretim Hattı</label>
                      <select
                        value={exitLine}
                        onChange={(e) => setExitLine(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                      >
                        <option value="Kaşar Paketleme Hattı">Kaşar Paketleme Hattı</option>
                        <option value="Beyaz Peynir Hattı">Beyaz Peynir Hattı</option>
                        <option value="Tulum / Özel Seri">Tulum / Özel Seri</option>
                        <option value="Salamura Havuzu">Salamura Havuzu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Teslim Alan Usta</label>
                      <input
                        type="text"
                        value={exitPerson}
                        onChange={(e) => setExitPerson(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowSevkModal(false)}
                      className="px-3.5 py-1.5 text-xs text-zinc-600"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleConfirmExit}
                      className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition"
                    >
                      Çıkışı Onayla
                    </button>
                  </div>
                </>
              ) : (
                /* İADE VE FİRE FORMU */
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Hatta Verilen</label>
                      <input
                        type="number"
                        value={returnIssuedQty}
                        onChange={(e) => setReturnIssuedQty(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Sağlam Dönen</label>
                      <input
                        type="number"
                        value={returnGoodQty}
                        onChange={(e) => setReturnGoodQty(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* OTOMATİK HESAPLANAN FİRE KARTÇIĞI */}
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                        Otomatik Hesaplanan Fire
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Verilen ({returnIssuedQty}) - Sağlam ({returnGoodQty})
                      </div>
                    </div>
                    <div className="font-mono text-base font-bold text-rose-600">
                      {calculatedWaste} Adet
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Fire / Hasar Nedeni</label>
                    <select
                      value={wasteReason}
                      onChange={(e) => setWasteReason(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
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
                      className="px-3.5 py-1.5 text-xs text-zinc-600"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleConfirmReturn}
                      className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition"
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
      {/* 5. MOBİL TARAYICI MOCKUP (MINIMALIST & GERÇEKÇİ ÇERÇEVE) */}
      {/* ========================================================================= */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-[320px] bg-zinc-950 border border-zinc-800 rounded-[36px] shadow-2xl p-4 flex flex-col items-center text-white overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Dynamic Island / Kamera Çentiği */}
            <div className="w-20 h-4 bg-zinc-900 rounded-full mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-zinc-950"></div>
            </div>

            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Üst Bilgi */}
            <div className="w-full text-center pb-2 border-b border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-200">El Terminali QR Vizörü</span>
              <p className="text-[9px] text-zinc-500">Kamera çerçeveyi otomatik odaklar</p>
            </div>

            {/* Vizör Ekranı */}
            <div className="relative w-full h-40 bg-zinc-900/90 rounded-2xl my-3 border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
              {/* İnce Lazer Çizgisi */}
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] top-1/2 -translate-y-1/2 animate-pulse"></div>

              {/* Köşe Çizgileri */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>

              <div className="w-16 h-16 bg-white p-1 rounded flex items-center justify-center">
                <QrCode className="w-14 h-14 text-zinc-900" />
              </div>
              <span className="text-[9px] text-zinc-400 font-mono mt-1">PRD-{mobileScannedItem?.id}</span>
            </div>

            {/* Hızlı Seçim Butonları */}
            <div className="w-full mb-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setMobileScannedItem(materials.find((m) => m.id === 'AMB-001') || null)}
                  className={`text-[10px] py-1 px-1.5 rounded font-medium truncate border transition ${
                    mobileScannedItem?.id === 'AMB-001'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
                  }`}
                >
                  500gr Kase (Kritik)
                </button>
                <button
                  onClick={() => setMobileScannedItem(materials.find((m) => m.id === 'HAM-002') || null)}
                  className={`text-[10px] py-1 px-1.5 rounded font-medium truncate border transition ${
                    mobileScannedItem?.id === 'HAM-002'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Peynir Mayası
                </button>
              </div>
            </div>

            {/* Taranan Ürün Özeti & Aksiyon */}
            {mobileScannedItem && (
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 mb-2 text-xs">
                <div className="font-medium text-zinc-200 truncate">{mobileScannedItem.name}</div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1">
                  <span>Mevcut:</span>
                  <strong className="font-mono text-zinc-100">
                    {mobileScannedItem.currentStock} {mobileScannedItem.unit}
                  </strong>
                </div>

                {mobileFeedback && (
                  <div className="mt-1 text-[10px] text-emerald-400 font-medium text-center bg-emerald-950/40 p-1 rounded border border-emerald-800/40">
                    {mobileFeedback}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    onClick={() => handleMobileScanAction('EXIT')}
                    className="py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[10px]"
                  >
                    Sevk Et (-20)
                  </button>
                  <button
                    onClick={() => handleMobileScanAction('RETURN')}
                    className="py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[10px]"
                  >
                    İade Al (+15)
                  </button>
                </div>
              </div>
            )}

            <div className="text-[9px] text-zinc-500 text-center">
              Aksiyonlar arka plandaki ana tabloyu anında günceller.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
