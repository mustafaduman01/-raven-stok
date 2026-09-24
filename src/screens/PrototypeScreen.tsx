import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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
  Bell,
  Download,
  Copy,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  UserCheck,
  BarChart3,
  ChevronDown,
  Shield,
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
  isCritical: boolean;
}

const INITIAL_MATERIALS: Material[] = [
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
    isCritical: true,
  },
  {
    id: 'HAM-002',
    name: 'Doğal Sıvı Peynir Mayası (Şirden)',
    category: 'HAMMADDE',
    unit: 'Litre',
    currentStock: 14, // KRİTİK SEVİYE
    minStock: 40,
    lastMovement: '10:15 • Üretime Sevk (-6)',
    location: 'Soğuk Oda • Dolap 03',
    lotNo: 'MAY-2026-091',
    supplier: 'BiyoKimya Gıda',
    isCritical: true,
  },
  {
    id: 'AMB-004',
    name: 'Baskılı Ürün Gövde Etiketi (Kuşe)',
    category: 'AMBALAJ',
    unit: 'Adet',
    currentStock: 650, // KRİTİK SEVİYE
    minStock: 1500,
    lastMovement: '09:30 • Üretime Sevk (-500)',
    location: 'Etiket Kabini • Raf 01',
    lotNo: 'LOT-ETK-2026-05',
    supplier: 'Baskı Teknik Ltd.',
    isCritical: true,
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
    isCritical: false,
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
    isCritical: false,
  },
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
    isCritical: false,
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
    isCritical: false,
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
    isCritical: false,
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

export const PrototypeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'AMBALAJ' | 'HAMMADDE'>('ALL');
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

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
      detail: 'İrsaliye: İRS-9821 • Kabul Onaylandı',
    },
    {
      id: 'log-3',
      time: '10:15',
      materialName: 'Doğal Sıvı Peynir Mayası',
      type: 'ÇIKIŞ',
      qty: 6,
      unit: 'Litre',
      detail: 'Mayalama Kazanı 2 • Hasan Usta',
    },
  ]);

  // Modallar
  const [showMalKabulModal, setShowMalKabulModal] = useState(false);
  const [showSevkModal, setShowSevkModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // QR Kod State'i (Gerçek Base64 QR Image)
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [qrCopySuccess, setQrCopySuccess] = useState(false);

  // Mal Kabul Formu
  const [mkMaterialId, setMkMaterialId] = useState('AMB-001');
  const [mkQty, setMkQty] = useState('500');
  const [mkLot, setMkLot] = useState('LOT-2026-904');
  const [mkSkt, setMkSkt] = useState('2027-10-15');
  const [showPreviewInsideModal, setShowPreviewInsideModal] = useState(false);

  // Sevk & İade Formu
  const [sevkTab, setSevkTab] = useState<'EXIT' | 'RETURN'>('EXIT');
  const [sevkMaterialId, setSevkMaterialId] = useState('AMB-001');
  const [exitQty, setExitQty] = useState('50');
  const [exitLine, setExitLine] = useState('Kaşar Paketleme Hattı');
  const [exitPerson, setExitPerson] = useState('Ahmet Usta (Vardiya 1)');

  // İade & Fire Hesabı
  const [returnIssuedQty, setReturnIssuedQty] = useState('100');
  const [returnGoodQty, setReturnGoodQty] = useState('92');
  const [wasteReason, setWasteReason] = useState('Hatta Ezilme / Vakum Kaçağı');

  // Mobil Tarayıcı Simülasyonu
  const [mobileScannedItem, setMobileScannedItem] = useState<Material | null>(null);
  const [mobileFeedback, setMobileFeedback] = useState<string | null>(null);

  // Rol Simülasyonu (Depo, Üretim Şefi, Fabrika Müdürü)
  type UserRole = 'DEPO' | 'URETIM' | 'MUDUR';
  const [currentRole, setCurrentRole] = useState<UserRole>('DEPO');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Yeni Malzeme Kartı Modalı State'leri
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<'AMBALAJ' | 'HAMMADDE'>('AMBALAJ');
  const [newMatUnit, setNewMatUnit] = useState('Adet');
  const [newMatStock, setNewMatStock] = useState('500');
  const [newMatMinStock, setNewMatMinStock] = useState('150');
  const [newMatLocation, setNewMatLocation] = useState('Depo A • Göz 05');
  const [newMatSupplier, setNewMatSupplier] = useState('');
  const [newMatLot, setNewMatLot] = useState('LOT-2026-N01');

  // FEFO & Gıda Güvenliği / Parti İzlenebilirlik Modalı
  const [showFefoModal, setShowFefoModal] = useState(false);
  const [fefoMaterial, setFefoMaterial] = useState<Material | null>(null);

  // Günlük Fire & Zayiat Analiz Raporu Modalı
  const [showWasteReportModal, setShowWasteReportModal] = useState(false);

  // QR Kod Üretici (Gerçek QRCode Kütüphanesi ile)
  useEffect(() => {
    const activeItem = selectedMaterial || materials.find((m) => m.id === mkMaterialId) || materials[0];
    const qrPayload = JSON.stringify({
      code: `PRD-${activeItem.id}`,
      name: activeItem.name,
      lot: mkLot,
      skt: mkSkt,
      system: 'RAVEN-STOK',
    });

    QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setGeneratedQrDataUrl(url))
      .catch((err) => console.error('QR üretilemedi:', err));
  }, [selectedMaterial, mkMaterialId, mkLot, mkSkt, materials]);

  // Malzemeleri filtreleme
  const filteredMaterials = materials.filter((m) => {
    let matchesTab = true;
    if (activeTab === 'CRITICAL') matchesTab = m.currentStock < m.minStock;
    else if (activeTab === 'AMBALAJ') matchesTab = m.category === 'AMBALAJ';
    else if (activeTab === 'HAMMADDE') matchesTab = m.category === 'HAMMADDE';

    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Kritik Stok Sayısı
  const criticalItems = materials.filter((m) => m.currentStock < m.minStock);
  const criticalCount = criticalItems.length;

  // 0. Excel / CSV Dışa Aktarma (Türkçe Karakter Uyumlu BOM ile)
  const handleExportCSV = () => {
    const headers = [
      'Malzeme Kodu',
      'Malzeme Adı',
      'Kategori',
      'Birim',
      'Mevcut Stok',
      'Kritik Asgari Eşik',
      'Stok Durumu',
      'Depo / Raf Konumu',
      'Parti / Lot No',
      'Tedarikçi Firma',
      'Son Hareket Detayı',
    ];

    const rows = filteredMaterials.map((m) => [
      `"${m.id}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.category}"`,
      `"${m.unit}"`,
      m.currentStock,
      m.minStock,
      m.currentStock < m.minStock ? '"KRİTİK EŞİK ALTI"' : '"YETERLİ"',
      `"${m.location.replace(/"/g, '""')}"`,
      `"${(m.lotNo || '-').replace(/"/g, '""')}"`,
      `"${(m.supplier || '-').replace(/"/g, '""')}"`,
      `"${m.lastMovement.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    link.setAttribute('download', `raven-stok-envanter-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 0.b Yeni Malzeme Kartı Oluşturma
  const handleCreateMaterial = () => {
    if (currentRole !== 'DEPO') {
      alert('⚠️ Yetki Hatası: Yeni malzeme tanımlama yetkisi yalnızca Depo Sorumlusu rolüne aittir.');
      return;
    }
    if (!newMatName.trim()) {
      alert('Lütfen malzeme adını giriniz.');
      return;
    }

    const prefix = newMatCategory === 'AMBALAJ' ? 'AMB' : 'HAM';
    const sameCatCount = materials.filter((m) => m.category === newMatCategory).length + 1;
    const nextId = `${prefix}-00${sameCatCount}`;
    const stockNum = Number(newMatStock) || 0;
    const minStockNum = Number(newMatMinStock) || 50;

    const newMaterial: Material = {
      id: nextId,
      name: newMatName.trim(),
      category: newMatCategory,
      unit: newMatUnit,
      currentStock: stockNum,
      minStock: minStockNum,
      lastMovement: 'Yeni Malzeme Kartı Açıldı',
      location: newMatLocation.trim() || 'Depo Genel',
      supplier: newMatSupplier.trim() || 'Doğrudan Tedarik',
      lotNo: newMatLot.trim() || `LOT-${new Date().getFullYear()}-01`,
      isCritical: stockNum < minStockNum,
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-new`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        materialName: newMaterial.name,
        type: 'GİRİŞ',
        qty: stockNum,
        unit: newMaterial.unit,
        detail: `Yeni Kart Oluşturuldu • ${newMaterial.id} • ${newMaterial.location}`,
      },
      ...prev,
    ]);

    setShowNewMaterialModal(false);
    setNewMatName('');
    alert(`✅ Yeni malzeme kartı sisteme kaydedildi: ${newMaterial.name} (${newMaterial.id})`);
  };

  // 1. Mal Kabul İşlemi (Stoğu Arttırır)
  // 1.a Sadece Stoğa Ekle (Yazdırma Yapmaz)
  const handleOnlyAddStock = () => {
    if (currentRole === 'URETIM') {
      alert('⚠️ Yetki Sınırı: Mal kabul işlemi yalnızca Depo Sorumlusu tarafından yapılabilir. (Aktif Profil: Üretim Şefi)');
      return;
    }
    if (currentRole === 'MUDUR') {
      alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok verisi ekleyemez veya değiştiremez.');
      return;
    }

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
            isCritical: newStock < item.minStock,
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
        detail: `Parti: ${mkLot} • Stoğa Eklendi`,
      },
      ...prev,
    ]);

    setShowMalKabulModal(false);
    setShowPreviewInsideModal(false);
    alert(`✅ ${targetMat?.name} stoğuna ${qtyNum} ${targetMat?.unit} başarıyla eklendi.`);
  };

  // 1.b Stoğa Ekle ve QR Etiketini Bas (Yazıcı Penceresini Açar)
  const handleConfirmMalKabulAndPrint = () => {
    if (currentRole === 'URETIM') {
      alert('⚠️ Yetki Sınırı: Mal kabul işlemi yalnızca Depo Sorumlusu tarafından yapılabilir. (Aktif Profil: Üretim Şefi)');
      return;
    }
    if (currentRole === 'MUDUR') {
      alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok verisi ekleyemez veya değiştiremez.');
      return;
    }

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
            isCritical: newStock < item.minStock,
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
        detail: `Parti: ${mkLot} • Etiket Basıldı`,
      },
      ...prev,
    ]);

    setShowMalKabulModal(false);
    setShowPreviewInsideModal(false);
    if (targetMat) {
      setSelectedMaterial(targetMat);
    }
    setShowPrintLabelModal(true);

    setTimeout(() => {
      window.print();
    }, 350);
  };

  // 2. Üretime Sevk Çıkışı (Stoğu Azaltır)
  const handleConfirmExit = () => {
    if (currentRole === 'MUDUR') {
      alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok sevki yapamaz. Yalnızca izleme yetkisine sahiptir.');
      return;
    }

    const targetId = sevkMaterialId || selectedMaterial?.id || 'AMB-001';
    const qtyNum = Number(exitQty);
    if (!qtyNum || qtyNum <= 0) {
      alert('Lütfen geçerli bir çıkış miktarı giriniz.');
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
          const newStock = Math.max(0, item.currentStock - qtyNum);
          return {
            ...item,
            currentStock: newStock,
            lastMovement: `Bugün ${nowStr} • Üretime Sevk (-${qtyNum})`,
            isCritical: newStock < item.minStock,
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
    alert(`✅ ${currentItem?.name} stoktan ${qtyNum} ${currentItem?.unit} üretime sevk edildi.`);
  };

  // 3. Üretimden İade Al & Fire Hesabı
  const calculatedWaste = Math.max(0, Number(returnIssuedQty) - Number(returnGoodQty));

  const handleConfirmReturn = () => {
    if (currentRole === 'MUDUR') {
      alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili iade ve fire kaydı giremez.');
      return;
    }

    const targetId = sevkMaterialId || selectedMaterial?.id || 'AMB-001';
    const goodNum = Number(returnGoodQty);
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const currentItem = materials.find((m) => m.id === targetId);

    if (goodNum > 0) {
      setMaterials((prev) =>
        prev.map((item) => {
          if (item.id === targetId) {
            const newStock = item.currentStock + goodNum;
            return {
              ...item,
              currentStock: newStock,
              lastMovement: `Bugün ${nowStr} • Sağlam İade (+${goodNum})`,
              isCritical: newStock < item.minStock,
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
    alert(`✅ İade tamamlandı. ${goodNum} ${currentItem?.unit} depoya geri alındı. ${calculatedWaste} ${currentItem?.unit} fire kaydı sisteme işlendi.`);
  };

  // 4. Etiket Baskı Alma (Gerçek window.print simülasyonu)
  const handlePrintLabel = () => {
    window.print();
  };

  // 5. QR Görselini İndirme
  const handleDownloadQr = () => {
    if (!generatedQrDataUrl) return;
    const a = document.createElement('a');
    a.href = generatedQrDataUrl;
    a.download = `QR_${selectedMaterial?.id || 'RAVEN'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Mobil Tarama Aksiyonu
  const handleMobileScanAction = (action: 'EXIT' | 'RETURN') => {
    if (!mobileScannedItem) return;
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (action === 'EXIT') {
      const dropQty = 20;
      setMaterials((prev) =>
        prev.map((m) => {
          if (m.id === mobileScannedItem.id) {
            const newStock = Math.max(0, m.currentStock - dropQty);
            return { ...m, currentStock: newStock, isCritical: newStock < m.minStock };
          }
          return m;
        }),
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
        prev.map((m) => {
          if (m.id === mobileScannedItem.id) {
            const newStock = m.currentStock + returnQty;
            return { ...m, currentStock: newStock, isCritical: newStock < m.minStock };
          }
          return m;
        }),
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
      {/* 1. ÜST BAR & YETKİ GÖSTERGESİ */}
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
                  Prototip v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal leading-none mt-0.5">
                Peynir Üretim & Ambalaj Takip Sistemi
              </p>
            </div>
          </div>

          {/* Sağ Alan: Bildirim Çanı & Kullanıcı & Mobil */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Bildirim Çanı Butonu */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition"
                title="Stok Uyarıları ve Bildirimler"
              >
                <Bell className="w-4 h-4" />
                {criticalCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {criticalCount}
                  </span>
                )}
              </button>

              {/* Bildirim Açılır Penceresi (Dropdown) */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                    <span className="font-semibold text-xs text-zinc-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Aktif Depo Uyarıları ({criticalCount})
                    </span>
                    <button
                      onClick={() => setShowNotificationDrawer(false)}
                      className="text-zinc-400 hover:text-zinc-700 text-xs"
                    >
                      Kapat
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100 mt-1 max-h-72 overflow-y-auto">
                    {criticalItems.map((item) => (
                      <div key={item.id} className="py-2.5 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-zinc-900">{item.name}</div>
                          <div className="text-[11px] text-rose-600 font-medium">
                            Kalan: <strong>{item.currentStock} {item.unit}</strong> (Asgari Eşik: {item.minStock} {item.unit})
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{item.location}</div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMaterial(item);
                            setMkMaterialId(item.id);
                            setShowNotificationDrawer(false);
                            setShowMalKabulModal(true);
                          }}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-medium shrink-0"
                        >
                          Takviye Et
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('CRITICAL');
                        setShowNotificationDrawer(false);
                      }}
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium"
                    >
                      Kritik Ürünleri Tabloda Filtrele →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Kullanıcı / Rol Değiştirme Simülasyonu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-xs text-zinc-700 transition cursor-pointer"
                title="Kullanıcı Rolünü Değiştir"
              >
                <span
                  className={`w-2 h-2 rounded-full ring-2 ${
                    currentRole === 'DEPO'
                      ? 'bg-emerald-500 ring-emerald-500/20'
                      : currentRole === 'URETIM'
                      ? 'bg-blue-500 ring-blue-500/20'
                      : 'bg-purple-500 ring-purple-500/20'
                  }`}
                ></span>
                <span className="text-[11px]">
                  Giriş:{' '}
                  <strong className="font-semibold text-zinc-900">
                    {currentRole === 'DEPO'
                      ? 'Depo Sorumlusu'
                      : currentRole === 'URETIM'
                      ? 'Üretim Şefi'
                      : 'Fabrika Müdürü'}
                  </strong>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Rol Seçim Menüsü */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl border border-zinc-200 shadow-xl p-1.5 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                    Yetki & Rol Simülasyonu
                  </div>

                  <button
                    onClick={() => {
                      setCurrentRole('DEPO');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition mt-1 ${
                      currentRole === 'DEPO' ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-zinc-900">Depo Sorumlusu (Yetkili)</div>
                      <div className="text-[10px] text-zinc-500">Tam yetki: Mal kabul, sevk, QR etiket, yeni kart.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('URETIM');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition ${
                      currentRole === 'URETIM' ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-zinc-900">Üretim Şefi (Hat)</div>
                      <div className="text-[10px] text-zinc-500">Sadece üretime sevk ve sağlam iade/fire girişi.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('MUDUR');
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition ${
                      currentRole === 'MUDUR' ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-zinc-900">Fabrika Müdürü</div>
                      <div className="text-[10px] text-zinc-500">Salt-okunur mod. Excel raporu, FEFO ve fire analizi.</div>
                    </div>
                  </button>
                </div>
              )}
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
          </div>
        </div>

        {/* 2. KRİTİK STOK UYARI BANNER'I */}
        {!bannerDismissed && criticalCount > 0 && (
          <div className="bg-amber-50 border-t border-b border-amber-200/80 px-4 py-2 text-xs">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[12px]">
                  <strong>Kritik Stok Uyarısı:</strong> {criticalCount} ürün asgari seviyenin altına indi! (500gr Kase, Sıvı Maya, Kuşe Etiket).
                </span>
                <button
                  onClick={() => setActiveTab('CRITICAL')}
                  className="font-semibold underline underline-offset-2 hover:text-amber-950 ml-1 text-[11px]"
                >
                  Kritik Ürünleri Listele ({criticalCount}) →
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
        {/* KPI ÖZET KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Toplam Malzeme</div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">{materials.length} Kalem</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">4 Hammadde • 4 Ambalaj</div>
          </div>

          <div
            onClick={() => setActiveTab('CRITICAL')}
            className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs cursor-pointer hover:bg-rose-50/40 transition"
          >
            <div className="text-[11px] font-medium text-rose-600 uppercase tracking-wider flex items-center justify-between">
              <span>Kritik Stok Uyarısı</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <div className="text-xl font-bold text-rose-600 mt-1">
              {criticalCount} Ürün Azaldı
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">Filtrelemek için tıkla →</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Bugünkü Sevk</div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">1,070 Adet / Lt</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Üretim hatları aktif</div>
          </div>

          <div
            onClick={() => setShowWasteReportModal(true)}
            className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs cursor-pointer hover:border-zinc-300 hover:shadow-sm transition group"
            title="Detaylı Fire ve Zayiat Analiz Raporunu İncele"
          >
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Hesaplanan Fire</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-900 group-hover:underline font-semibold flex items-center gap-0.5">
                Rapor ↗
              </span>
            </div>
            <div className="text-xl font-semibold text-zinc-900 mt-1">%1.2</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Hedef: &lt; %3.0 (Tıkla & İncele)</div>
          </div>
        </div>

        {/* SEKME SEÇİMİ VE ANA AKSİYONLAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Segmented Control (Sekmeler) */}
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Tümü ({materials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold border border-rose-200'
                  : 'text-rose-600 hover:text-rose-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Kritik Stoklar ({criticalCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('AMBALAJ')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'AMBALAJ'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ambalaj & Sarf ({materials.filter((m) => m.category === 'AMBALAJ').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('HAMMADDE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'HAMMADDE'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-zinc-500" />
              <span>Hammadde Deposu ({materials.filter((m) => m.category === 'HAMMADDE').length})</span>
            </button>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (currentRole === 'URETIM') {
                  alert('⚠️ Yetki Hatası: Mal kabul ve QR etiketleme yalnızca Depo Sorumlusu yetkisindedir. (Aktif Profil: Üretim Şefi)');
                  return;
                }
                if (currentRole === 'MUDUR') {
                  alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok verisi ekleyemez.');
                  return;
                }
                const target = filteredMaterials[0] || materials[0];
                setSelectedMaterial(target);
                setMkMaterialId(target.id);
                setShowPreviewInsideModal(false);
                setShowMalKabulModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mal Kabul & QR Bas</span>
            </button>

            <button
              onClick={() => {
                if (currentRole !== 'DEPO') {
                  alert('⚠️ Yetki Hatası: Yeni malzeme tanımlama yetkisi yalnızca Depo Sorumlusu rolüne aittir.');
                  return;
                }
                setShowNewMaterialModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 text-xs font-medium shadow-xs transition active:scale-98"
            >
              <Package className="w-3.5 h-3.5 text-zinc-600" />
              <span>+ Yeni Malzeme</span>
            </button>

            <button
              onClick={() => {
                if (currentRole === 'MUDUR') {
                  alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok sevki veya iadesi yapamaz.');
                  return;
                }
                const target = filteredMaterials[0] || materials[0];
                setSelectedMaterial(target);
                setSevkMaterialId(target.id);
                setSevkTab('EXIT');
                setShowSevkModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 text-xs font-medium shadow-xs transition active:scale-98"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
              <span>Üretime Sevk / İade</span>
            </button>
          </div>
        </div>

        {/* ARAMA ÇUBUĞU & EXCEL DIŞA AKTAR */}
        <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-[11px] text-zinc-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Kritik Eşik Altı
              </span>
            </div>

            {/* 1. EXCEL / CSV İNDİR BUTONU */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-medium transition active:scale-98"
              title="Mevcut stok listesini Excel uyumlu CSV olarak indir"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel / CSV İndir</span>
            </button>
          </div>
        </div>

        {/* 3. ANA MALZEME LİSTESİ TABLOSU */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/75 text-zinc-500 uppercase text-[10px] font-semibold tracking-wider border-b border-zinc-200/80">
                <tr>
                  <th className="py-3 px-4">Malzeme Adı & Kod</th>
                  <th className="py-3 px-3">Kategori & Lokasyon</th>
                  <th className="py-3 px-3">Mevcut Stok</th>
                  <th className="py-3 px-3">Kritik Eşik</th>
                  <th className="py-3 px-3">Son Hareket</th>
                  <th className="py-3 px-4 text-right">QR & İşlemler</th>
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
                          ? 'bg-rose-50/30 hover:bg-rose-50/60'
                          : 'hover:bg-zinc-50/60'
                      }`}
                    >
                      {/* Malzeme Adı & Kod */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-medium ${
                              isCritical ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {item.id.split('-')[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-2">
                              <span>{item.name}</span>
                              {isCritical && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                  Kritik
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{item.id} {item.lotNo && `• ${item.lotNo}`}</span>
                              <button
                                onClick={() => {
                                  setFefoMaterial(item);
                                  setShowFefoModal(true);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-1.5 py-0.5 rounded font-sans font-medium transition cursor-pointer"
                                title="Gıda Güvenliği, FEFO & Parti İzlenebilirlik Kartını İncele"
                              >
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>FEFO İzle</span>
                              </button>
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
                            isCritical ? 'text-rose-600 font-bold' : 'text-zinc-900'
                          }`}
                        >
                          {item.currentStock.toLocaleString('tr-TR')} {item.unit}
                        </div>
                        {isCritical && (
                          <div className="text-[10px] text-rose-500 font-medium">
                            Asgari eşiğin {item.minStock - item.currentStock} {item.unit} altında!
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

                      {/* Hızlı İşlemler & QR Bas */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Kod Göster & Yazdır Butonu */}
                          <button
                            onClick={() => {
                              setSelectedMaterial(item);
                              setShowPrintLabelModal(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium transition"
                            title="Gerçek QR Kod ve Termal Etiket Baskısı Al"
                          >
                            <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                            <span>QR Bas</span>
                          </button>

                          {/* Hızlı Mal Kabul */}
                          <button
                            onClick={() => {
                              if (currentRole === 'URETIM') {
                                alert('⚠️ Yetki Hatası: Mal kabul ve QR etiketleme yalnızca Depo Sorumlusu yetkisindedir. (Aktif Profil: Üretim Şefi)');
                                return;
                              }
                              if (currentRole === 'MUDUR') {
                                alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili stok verisi ekleyemez.');
                                return;
                              }
                              setSelectedMaterial(item);
                              setMkMaterialId(item.id);
                              setShowPreviewInsideModal(false);
                              setShowMalKabulModal(true);
                            }}
                            title="Mal Kabul Yap"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Üretime Sevk / İade */}
                          <button
                            onClick={() => {
                              if (currentRole === 'MUDUR') {
                                alert('🔒 Salt-Okunur Mod: Fabrika Müdürü profili üretim sevki veya iade yapamaz.');
                                return;
                              }
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CANLI HAREKET GÜNLÜĞÜ */}
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
      {/* MODALLAR */}
      {/* ========================================================================= */}

      {/* MODAL: ÖZEL GERÇEK QR KOD & TERMAL ETİKET BASKI MODALI */}
      {showPrintLabelModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-zinc-700" />
                <h3 className="font-semibold text-zinc-900 text-sm">QR Kod & 50x30mm Termal Etiket</h3>
              </div>
              <button
                onClick={() => setShowPrintLabelModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center space-y-4">
              {/* TERMAL ETİKET (50mm x 30mm Gerçek Boyut Tasarımı) */}
              <div
                id="printable-area"
                className="w-[280px] h-[168px] bg-white text-zinc-950 p-3 rounded-lg border-2 border-zinc-900 shadow-md flex flex-col justify-between font-mono select-none"
              >
                <div className="border-b-2 border-zinc-900 pb-1 flex justify-between items-center text-[10px]">
                  <span className="font-extrabold tracking-tight">RAVEN STOK SİSTEMİ</span>
                  <span className="bg-zinc-900 text-white px-1.5 py-0.2 text-[8px] font-bold">FEFO ONAYLI</span>
                </div>

                <div className="flex gap-2.5 items-center py-1">
                  {/* GERÇEK VEKTÖREL QR KOD RESMİ */}
                  {generatedQrDataUrl ? (
                    <img
                      src={generatedQrDataUrl}
                      alt="Gerçek QR Kod"
                      className="w-16 h-16 border border-zinc-200 rounded shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-zinc-100 animate-pulse rounded"></div>
                  )}

                  <div className="flex-1 overflow-hidden space-y-0.5 text-[9px] leading-tight">
                    <div className="font-bold text-[11px] truncate text-zinc-950 font-sans">
                      {selectedMaterial.name}
                    </div>
                    <div>
                      KOD: <strong className="font-bold">PRD-{selectedMaterial.id}</strong>
                    </div>
                    <div>
                      PARTİ: <strong>{selectedMaterial.lotNo || 'LOT-2026-01'}</strong>
                    </div>
                    <div>
                      MEVCUT: <strong>{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                    </div>
                    <div>
                      KONUM: <strong>{selectedMaterial.location}</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-1 flex justify-between items-center text-[8px] text-zinc-600 font-sans">
                  <span>*PRD-{selectedMaterial.id}*</span>
                  <span>Tarih: 24.09.2026</span>
                </div>
              </div>

              {/* Bilgilendirme */}
              <p className="text-[11px] text-zinc-500 text-center max-w-xs">
                Bu QR kod telefon kamerası veya endüstriyel el terminaliyle taranabilir.
              </p>

              {/* Aksiyon Butonları */}
              <div className="w-full grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handlePrintLabel}
                  className="py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Yazdır (Baskı Al)</span>
                </button>

                <button
                  onClick={handleDownloadQr}
                  className="py-2.5 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>💾 QR İndir (PNG)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: MAL KABUL & QR BAS */}
      {showMalKabulModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-zinc-700" />
                <h3 className="font-semibold text-zinc-900 text-sm">Mal Kabul & Stok Girişi</h3>
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
                <label className="block text-xs font-medium text-zinc-600 mb-1">Giriş Yapılacak Malzeme</label>
                <select
                  value={mkMaterialId}
                  onChange={(e) => {
                    setMkMaterialId(e.target.value);
                    const found = materials.find((m) => m.id === e.target.value);
                    if (found) setSelectedMaterial(found);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Mevcut: {m.currentStock} {m.unit})
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-mono"
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
                  onClick={() => setShowPreviewInsideModal(!showPreviewInsideModal)}
                  className="w-full py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showPreviewInsideModal ? 'Etiket Önizlemesini Kapat' : '50x30mm QR Termal Etiketi Önizle'}</span>
                </button>
              </div>

              {/* Modal İçinde Gerçek QR Etiket Önizleme */}
              {showPreviewInsideModal && (
                <div className="p-3 bg-zinc-100/70 rounded-xl border border-zinc-200/80 flex flex-col items-center">
                  <div className="w-[270px] h-[162px] bg-white text-zinc-900 p-3 rounded shadow-xs border border-zinc-300 flex flex-col justify-between font-mono text-[9px] select-none">
                    <div className="border-b border-zinc-900 pb-1 flex justify-between items-center">
                      <span className="font-bold text-[10px] tracking-tight">RAVEN STOK</span>
                      <span className="text-[8px] bg-zinc-900 text-white px-1 font-semibold">KABUL ONAY</span>
                    </div>

                    <div className="flex gap-2 items-center py-1">
                      {generatedQrDataUrl ? (
                        <img src={generatedQrDataUrl} alt="QR Kod" className="w-14 h-14 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-zinc-200"></div>
                      )}

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
                        <div className="text-zinc-600">
                          MİKTAR: <strong className="text-zinc-900">{mkQty} Adet/Kg</strong>
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
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition"
              >
                İptal
              </button>
              <button
                onClick={handleOnlyAddStock}
                className="px-4 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-medium shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-600" />
                <span>Stoğa Ekle</span>
              </button>
              <button
                onClick={handleConfirmMalKabulAndPrint}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Stoğa Ekle & QR Bas</span>
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
                Üretime Çıkış (-Stok)
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
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-mono"
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
                      Çıkışı Onayla (-Stok Düş)
                    </button>
                  </div>
                </>
              ) : (
                /* İADE VE FİRE FORMU */
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Hatta Verilen Miktar</label>
                      <input
                        type="number"
                        value={returnIssuedQty}
                        onChange={(e) => setReturnIssuedQty(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Sağlam Dönen Miktar</label>
                      <input
                        type="number"
                        value={returnGoodQty}
                        onChange={(e) => setReturnGoodQty(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* OTOMATİK HESAPLANAN FİRE KARTÇIĞI */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                        Otomatik Hesaplanan Fire / Zayiat
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Verilen ({returnIssuedQty}) - Sağlam ({returnGoodQty}) = Fire
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

      {/* MODAL 3: MOBİL TARAYICI MOCKUP */}
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

              {generatedQrDataUrl ? (
                <img src={generatedQrDataUrl} alt="QR Tarama" className="w-16 h-16 p-1 bg-white rounded" />
              ) : (
                <QrCode className="w-14 h-14 text-white" />
              )}
              <span className="text-[9px] text-zinc-400 font-mono mt-1">
                PRD-{mobileScannedItem?.id || 'AMB-001'}
              </span>
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
                  Sıvı Maya (Kritik)
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
              Aksiyonlar ana tablonun stoğunu anlık değiştirir.
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: YENİ MALZEME KARTI AÇMA */}
      {showNewMaterialModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-800" />
                <h3 className="font-semibold text-zinc-900 text-sm">Yeni Malzeme Kartı Tanımla</h3>
              </div>
              <button
                onClick={() => setShowNewMaterialModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Malzeme Adı & Tanımı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: 250gr Süzme Peynir Kabı veya Termize Süt"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Kategori</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as 'AMBALAJ' | 'HAMMADDE')}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                  >
                    <option value="AMBALAJ">Ambalaj & Sarf Malzeme</option>
                    <option value="HAMMADDE">Hammadde Deposu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Ölçü Birimi</label>
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                  >
                    <option value="Adet">Adet</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Koli">Koli</option>
                    <option value="Teneke">Teneke</option>
                    <option value="Rulo">Rulo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Başlangıç Mevcut Stoğu</label>
                  <input
                    type="number"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Kritik Asgari Eşik</label>
                  <input
                    type="number"
                    value={newMatMinStock}
                    onChange={(e) => setNewMatMinStock(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Depo Raf / Lokasyon</label>
                  <input
                    type="text"
                    value={newMatLocation}
                    onChange={(e) => setNewMatLocation(e.target.value)}
                    placeholder="Örn: Depo B • Raf 04"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Tedarikçi Firma</label>
                  <input
                    type="text"
                    value={newMatSupplier}
                    onChange={(e) => setNewMatSupplier(e.target.value)}
                    placeholder="Örn: Star Plastik San."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Başlangıç Parti/Lot No</label>
                <input
                  type="text"
                  value={newMatLot}
                  onChange={(e) => setNewMatLot(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs text-zinc-900 font-mono"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewMaterialModal(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCreateMaterial}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Malzeme Kartını Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GIDA GÜVENLİĞİ & FEFO / PARTİ İZLENEBİLİRLİK KARTI */}
      {showFefoModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Gıda Güvenliği & FEFO İzlenebilirlik Kartı</h3>
                  <p className="text-[10px] text-zinc-500">Tarım Bakanlığı & HACCP Standartlarına Uygun Parti Takibi</p>
                </div>
              </div>
              <button
                onClick={() => setShowFefoModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Ürün Kimliği Başlığı */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/70 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                    {fefoMaterial?.category} • {fefoMaterial?.id}
                  </div>
                  <div className="font-semibold text-zinc-900 text-sm mt-0.5">{fefoMaterial?.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Konum: {fefoMaterial?.location} • Tedarikçi: {fefoMaterial?.supplier}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400">Toplam Stok</div>
                  <div className="text-base font-bold font-mono text-zinc-900">
                    {fefoMaterial?.currentStock} {fefoMaterial?.unit}
                  </div>
                </div>
              </div>

              {/* HACCP & Sertifikasyon Rozetleri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-emerald-900">
                  <div className="font-semibold text-[11px] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HACCP Onaylı</span>
                  </div>
                  <div className="text-[10px] text-emerald-700/80 mt-0.5">TR-34-K-092144 No'lu izin</div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/70 text-blue-900">
                  <div className="font-semibold text-[11px] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Soğuk Zincir Uygun</span>
                  </div>
                  <div className="text-[10px] text-blue-700/80 mt-0.5">+4°C İdeal İklimlendirme</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800">
                  <div className="font-semibold text-[11px] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Mikrobiyoloji</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Parti Şahit Numunesi Alındı</div>
                </div>
              </div>

              {/* FEFO Sıralı Partiler (İlk Biten İlk Çıkar) */}
              <div>
                <div className="text-xs font-semibold text-zinc-800 mb-2 flex items-center justify-between">
                  <span>Parti / Lot Dağılımı (FEFO Kuralı: Son Kullanımı En Yakın Parti İlk Tüketilir)</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Otomatik Sıralı</span>
                </div>

                <div className="space-y-2">
                  {/* Parti 1 - Öncelikli Sevk */}
                  <div className="p-3 rounded-xl border-2 border-amber-300 bg-amber-50/30 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 text-xs">
                          {fefoMaterial?.lotNo || 'LOT-2026-904'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-200">
                          🚨 ÖNCELİKLİ ÇIKIŞ (FEFO #1)
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 mt-1">
                        Kabul: 12.08.2026 • SKT: <strong>15.10.2026 (21 Gün Kaldı)</strong>
                      </div>
                      <div className="text-[10px] text-zinc-400">İrsaliye: İRS-4821 • Tedarikçi Analiz Raporu: Geçerli</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-zinc-900">
                        {Math.max(1, Math.round((fefoMaterial?.currentStock || 100) * 0.4))} {fefoMaterial?.unit}
                      </div>
                      <button
                        onClick={() => {
                          setShowFefoModal(false);
                          if (fefoMaterial) {
                            setSelectedMaterial(fefoMaterial);
                            setSevkMaterialId(fefoMaterial.id);
                            setSevkTab('EXIT');
                            setShowSevkModal(true);
                          }
                        }}
                        className="mt-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-medium transition"
                      >
                        Sevk Et →
                      </button>
                    </div>
                  </div>

                  {/* Parti 2 - Güvenli Stok */}
                  <div className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 text-xs">
                          {fefoMaterial?.lotNo ? `${fefoMaterial.lotNo}-REZ` : 'LOT-2026-942'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium border border-zinc-200">
                          Rezerv Stok (FEFO #2)
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 mt-1">
                        Kabul: 18.09.2026 • SKT: <strong>15.04.2027 (203 Gün Kaldı)</strong>
                      </div>
                      <div className="text-[10px] text-zinc-400">İrsaliye: İRS-5104 • Soğuk Hava Deposu</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-zinc-700">
                        {Math.max(1, Math.round((fefoMaterial?.currentStock || 100) * 0.6))} {fefoMaterial?.unit}
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-1">Sırada Bekliyor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end">
              <button
                onClick={() => setShowFefoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: GÜNLÜK FİRE, ZAYİAT VE HURDA ANALİZ RAPORU */}
      {showWasteReportModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Günlük Fire & Zayiat Analiz Raporu</h3>
                  <p className="text-[10px] text-zinc-500">Peynir İşleme & Ambalajlama Hatları Vardiya Sonu Değerlendirmesi</p>
                </div>
              </div>
              <button
                onClick={() => setShowWasteReportModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* 4 Ana Metrik */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="text-[10px] text-zinc-500 uppercase font-medium">Toplam Sevk</div>
                  <div className="text-base font-bold font-mono text-zinc-900 mt-0.5">1,070</div>
                  <div className="text-[10px] text-zinc-400">Adet/Litre</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="text-[10px] text-emerald-700 uppercase font-medium">Sağlam Çıkan</div>
                  <div className="text-base font-bold font-mono text-emerald-800 mt-0.5">1,057</div>
                  <div className="text-[10px] text-emerald-600">%98.79 Verim</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80">
                  <div className="text-[10px] text-rose-700 uppercase font-medium">Toplam Fire</div>
                  <div className="text-base font-bold font-mono text-rose-800 mt-0.5">13 Adet</div>
                  <div className="text-[10px] text-rose-600">Zayiat/Hurda</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 text-white">
                  <div className="text-[10px] text-zinc-400 uppercase font-medium">Fire Oranı</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">%1.21</div>
                  <div className="text-[10px] text-zinc-300">Hedef &lt; %3.0 (Başarılı)</div>
                </div>
              </div>

              {/* Hat Bazında Fire Dağılımı */}
              <div>
                <div className="font-semibold text-zinc-800 mb-2">Üretim Hatlarına Göre Fire Dağılımı</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-zinc-700">Kaşar Paketleme Hattı</span>
                      <span className="font-mono text-zinc-600">8 Adet (%61.5)</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '61.5%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-zinc-700">Vakumlu Beyaz Peynir Hattı</span>
                      <span className="font-mono text-zinc-600">3 Adet (%23.1)</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '23.1%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-zinc-700">Tulum & Yöresel Hattı</span>
                      <span className="font-mono text-zinc-600">2 Adet (%15.4)</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hata & Zayiat Nedenleri */}
              <div>
                <div className="font-semibold text-zinc-800 mb-2">Zayiat / Hurda Nedenleri Analizi</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex justify-between items-center">
                    <span className="text-zinc-600">Hatta Ezilme / Vakum Kaçağı</span>
                    <strong className="font-mono text-zinc-900">%54 (7 Adet)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex justify-between items-center">
                    <span className="text-zinc-600">Koli / Kutu Yırtılması</span>
                    <strong className="font-mono text-zinc-900">%23 (3 Adet)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex justify-between items-center">
                    <span className="text-zinc-600">Hatalı Barkod / Baskı Kayması</span>
                    <strong className="font-mono text-zinc-900">%15 (2 Adet)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex justify-between items-center">
                    <span className="text-zinc-600">Yere Düşme / Hijyen İhlali</span>
                    <strong className="font-mono text-zinc-900">%8 (1 Adet)</strong>
                  </div>
                </div>
              </div>

              {/* Kalite Şefi Değerlendirme Notu */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] leading-relaxed">
                <span className="font-semibold text-zinc-800">Kalite Güvence Notu:</span> Kaşar paketleme hattındaki 3 numaralı vakum çenesinde sıcaklık ayarı kontrol edildi ve kalibre edildi. Günlük toplam ambalaj zayiat oranı kabul edilebilir fabrika limitinin (%3.0) oldukça altında kalmıştır.
              </div>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Raporu CSV Olarak İndir</span>
              </button>

              <button
                onClick={() => setShowWasteReportModal(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
