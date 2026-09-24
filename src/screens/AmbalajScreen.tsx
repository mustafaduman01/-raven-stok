import React, { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  Search,
  AlertTriangle,
  Printer,
  QrCode,
  Edit2,
  Eye,
  X,
  CheckCircle2,
} from 'lucide-react';
import api from '../api';
import { Product, Supplier, Location } from '../types';

export const AmbalajScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modallar
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showProductQrModal, setShowProductQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [productDetail, setProductDetail] = useState<any | null>(null);
  const [productQrData, setProductQrData] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Düzenleme Formu
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('adet');
  const [editMinStock, setEditMinStock] = useState<number>(300);
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Form Alanları
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('adet');
  const [newMinStock, setNewMinStock] = useState<number>(300);
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [batchNo, setBatchNo] = useState('');
  const [initialQty, setInitialQty] = useState<number>(1000);
  const [batchLocationId, setBatchLocationId] = useState('');
  const [labelQty, setLabelQty] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, supRes, locRes] = await Promise.all([
        api.get('/api/products?category=AMBALAJ'),
        api.get('/api/suppliers'),
        api.get('/api/locations'),
      ]);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
      setLocations(locRes.data);
      if (locRes.data.length > 0) setBatchLocationId(locRes.data[0].id);
    } catch (err) {
      console.error('Ambalaj verileri alınamadı:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const catRes = await api.get('/api/categories');
      const ambalajCat = catRes.data.find((c: any) => c.code === 'AMBALAJ');

      await api.post('/api/products', {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        categoryId: ambalajCat.id,
        unit: newUnit,
        minStock: Number(newMinStock),
        supplierId: newSupplierId || undefined,
        description: newDescription || undefined,
      });

      setShowProductModal(false);
      setNewCode('');
      setNewName('');
      fetchData();
      setSuccessMsg('Yeni karton/kase/koli kartı başarıyla açıldı.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ürün oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await api.put(`/api/products/${selectedProduct.id}`, {
        name: editName.trim(),
        unit: editUnit.trim().toLowerCase(),
        minStock: Number(editMinStock),
        supplierId: editSupplierId || null,
        description: editDescription || null,
      });

      setShowEditModal(false);
      fetchData();
      setSuccessMsg(`${selectedProduct.name} bilgileri başarıyla güncellendi.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ürün güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      const res = await api.post('/api/batches', {
        productId: selectedProduct.id,
        batchNo: batchNo.trim(),
        initialQty: Number(initialQty),
        locationId: batchLocationId,
        labelQty: labelQty ? Number(labelQty) : undefined,
      });

      setShowBatchModal(false);
      setBatchNo('');
      fetchData();
      setSuccessMsg(
        `Giriş başarılı: ${selectedProduct.name} için ${initialQty} ${selectedProduct.unit} stoğa eklendi. ${res.data.labels?.length || 0} adet QR etiket oluşturuldu.`,
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Parti kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Başlık ve Butonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Karton / Kase / Koli Stok Yönetimi</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plastik kase, teneke ambalaj, vakum poşeti ve koli sarf malzemeleri takibi (FR-01).
          </p>
        </div>

        <button
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni Ambalaj Kartı Aç
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Arama Barı */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ambalaj adı veya koduna göre ara..."
          className="w-full text-sm bg-transparent focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Kod</th>
                <th className="py-3 px-4">Ambalaj / Koli Adı</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4">Toplam Stok</th>
                <th className="py-3 px-4">Kritik Eşik</th>
                <th className="py-3 px-4">Tedarikçi</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 text-xs">
                    {p.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {p.name}
                    {p.description && (
                      <span className="text-xs text-slate-400 block font-normal">{p.description}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs uppercase">{p.unit}</td>
                  <td className="py-3 px-4 font-black text-slate-900 text-base">
                    {p.totalStock} {p.unit}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-600 font-semibold">{p.minStock} {p.unit}</span>
                    {p.isCritical && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" /> Kritik
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {p.supplier?.name || '—'}
                  </td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={async () => {
                        setSelectedProduct(p);
                        try {
                          const res = await api.get(`/api/products/${p.id}`);
                          setProductDetail(res.data);
                          setShowDetailModal(true);
                        } catch {
                          alert('Detaylar alınamadı.');
                        }
                      }}
                      className="px-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      title="Stok ve Lokasyon Detayı"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detay
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setEditName(p.name);
                        setEditUnit(p.unit);
                        setEditMinStock(p.minStock);
                        setEditSupplierId(p.supplierId || '');
                        setEditDescription(p.description || '');
                        setShowEditModal(true);
                      }}
                      className="px-2 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      title="Ürün Bilgilerini Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Düzenle
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedProduct(p);
                        try {
                          const res = await api.get(`/api/labels/product/${p.id}/qr`);
                          setProductQrData(res.data);
                          setShowProductQrModal(true);
                        } catch {
                          alert('QR kod alınamadı.');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                      title="Kutu / Raf Sabit QR Kodu"
                    >
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setShowBatchModal(true);
                        setBatchNo(`AMB-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`);
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Giriş & Etiket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Ambalaj Modalı */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Yeni Karton/Kase/Koli Kartı</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ürün Kodu *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: AMB-004"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ambalaj Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Vakumlu Peynir Poşeti 20x30"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Birim *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="adet">adet</option>
                    <option value="koli">koli</option>
                    <option value="paket">paket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kritik Stok Eşiği *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tedarikçi</label>
                <select
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seçilmedi</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  placeholder="Boyut, koli adedi, malzeme vb."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mal Kabul & Parti Modalı */}
      {showBatchModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Ambalaj Girişi & Etiket Üretimi</h3>
                <p className="text-xs text-slate-500">{selectedProduct.name} ({selectedProduct.code})</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parti / İrsaliye No *</label>
                  <input
                    type="text"
                    required
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giriş Miktarı ({selectedProduct.unit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={initialQty}
                    onChange={(e) => setInitialQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Depo / Lokasyon *</label>
                <select
                  value={batchLocationId}
                  onChange={(e) => setBatchLocationId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Etiket Adedi */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Her Etikete Düşen Paket/Koli Adedi ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={labelQty}
                  onChange={(e) => setLabelQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none font-bold"
                />
                <span className="text-[11px] text-blue-700 mt-1 block">
                  {labelQty > 0 ? Math.ceil(initialQty / labelQty) : 1} adet benzersiz QR kodlu etiket üretilecektir.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Girişi Onayla & Etiketleri Üret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ürün / Kutu / Raf QR Kod Modalı */}
      {showProductQrModal && productQrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Ambalaj / Kutu Sabit QR Kodu</h3>
              <button onClick={() => setShowProductQrModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={productQrData.qrDataUrl}
                alt={productQrData.product.code}
                className="w-44 h-44 object-contain bg-white p-2 border rounded-lg shadow-sm"
              />
              <span className="font-mono font-bold text-slate-900 text-sm mt-3">
                {productQrData.product.code}
              </span>
              <h4 className="font-extrabold text-slate-900 text-base mt-1">
                {productQrData.product.name}
              </h4>
              <span className="text-xs text-slate-500 mt-1">
                Mevcut Stok: {productQrData.product.totalStock} {productQrData.product.unit}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await api.get(`/api/labels/product/${productQrData.product.id}/zpl`);
                    const blob = new Blob([res.data.zpl], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `etiket_${productQrData.product.code}.zpl`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch {
                    alert('ZPL alınamadı.');
                  }
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                ZPL İndir
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ambalaj Kartı Düzenleme Modalı */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Ambalaj Kartını Düzenle</h3>
                <span className="text-xs font-mono text-slate-500 font-bold">{selectedProduct.code}</span>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ürün / Ambalaj Adı *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Birim *</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="adet">Adet</option>
                    <option value="koli">Koli</option>
                    <option value="paket">Paket</option>
                    <option value="palet">Palet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kritik Stok Eşiği *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Varsayılan Tedarikçi</label>
                <select
                  value={editSupplierId}
                  onChange={(e) => setEditSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Seçiniz (Opsiyonel)</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama / Not</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stok Detayı Modalı (Lokasyonlar ve Partiler) */}
      {showDetailModal && productDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  {productDetail.code}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{productDetail.name}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Özet Kartlar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border rounded-xl">
                <span className="text-xs text-slate-500 font-semibold block">Toplam Mevcut Stok</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {productDetail.totalStock} {productDetail.unit}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border rounded-xl">
                <span className="text-xs text-slate-500 font-semibold block">Kritik Eşik Seviyesi</span>
                <span className={`text-xl font-black mt-1 block ${productDetail.isCritical ? 'text-red-600' : 'text-slate-900'}`}>
                  {productDetail.minStock} {productDetail.unit}
                </span>
              </div>
            </div>

            {/* Lokasyon Bazlı Dağılım (FR-03) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Depo ve Lokasyon Dağılımı</h4>
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                {productDetail.stockLevels?.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Henüz lokasyon stoğu bulunmuyor.</div>
                ) : (
                  productDetail.stockLevels.map((sl: any) => (
                    <div key={sl.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <span className="font-semibold text-slate-800">{sl.location.name}</span>
                      <strong className="font-black text-slate-900 font-mono text-sm">
                        {sl.quantity} {productDetail.unit}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Giriş Yapılan Partiler */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kayıtlı Girişler ve Partiler</h4>
              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {productDetail.batches?.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Bu ambalaja ait giriş bulunmuyor.</div>
                ) : (
                  productDetail.batches.map((b: any) => (
                    <div key={b.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <strong className="font-mono text-slate-900 block">{b.batchNo}</strong>
                        <span className="text-[10px] text-slate-400">
                          Giriş Tarihi: {new Date(b.entryDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {b.remainingQty} {productDetail.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">kalan</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
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
