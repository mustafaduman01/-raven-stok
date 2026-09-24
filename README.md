# 🧀 Peynir Üretim Tesisi — Stok, Ambalaj ve Fire Takip Paneli (Prototip)

Bu proje, modern bir peynir üretim tesisinin **hammadde, ambalaj, mal kabul, üretime sevk, iade, fire ve termal QR etiket yönetimini** simüle eden kurumsal web prototipidir.

**React 19 + TypeScript + Vite 8 + Tailwind CSS + Lucide Icons** mimarisiyle sıfır dış bağımlılıkla ve anlık mock state ile çalışacak şekilde geliştirilmiştir.

---

## 🚀 Canlı Özellikler

1. **Üst Bar & Yetki Göstergesi:**
   - Şirket başlığı ve kurumsal logo.
   - `Giriş Yapan: Depo Sorumlusu (Yetkili)` güvenlik rozeti.
   - 85 adet kalan kritik ürün için kırmızı/turuncu uyarı banner'ı.

2. **Kategori Sekmeleri:**
   - 📦 **Ambalaj & Sarf Malzeme (Adet):** 500gr Kase, 1kg Vakum Kutu, Kraft Koli, Ürün Etiketi vb.
   - 🥛 **Hammadde Deposu (Kg / Litre):** Çiğ Süt, Peynir Mayası, Salamura Tuzu, Kalsiyum Klorür vb.

3. **Ana Tablo & Stok Takibi:**
   - Malzeme adı, kod, parti no, mevcut stok, kritik asgari eşik, son hareket zamanı.
   - Kritik seviyenin altına inen (85 adet kalan) ürün satırında dikkat çekici uyarı zemin rengi ve animasyonlu `⚠️ Kritik` etiketi.
   - Arama kutusu ile isme, koda veya raf lokasyonuna göre anlık filtreleme.

4. **Tıklanabilir İnteraktif Modallar:**
   - **➕ Mal Kabul & QR Bas:** Miktar, parti no ve SKT girilerek stoğa malzeme ekleme; Zebra/ZPL uyumlu **50x30mm termal etiket önizleme**.
   - **↗️ Üretime Sevk / İade:**
     - *Üretime Çıkış:* Çıkış miktarını girince tablodaki stok anında düşer.
     - *Üretimden İade Al & Fire Hesapla:* Hatta verilen miktar ile sağlam dönen miktar girildiğinde sistem aradaki **fireyi otomatik hesaplar** (`Hesaplanan Fire: X Adet`) ve sağlam stoğu depoya geri ekler.

5. **📱 Mobil Kamera & QR Tarayıcı Simülasyonu:**
   - Sayfanın sağ altındaki yüzen butona tıklandığında gerçekçi bir akıllı telefon / el terminali çerçevesi açılır.
   - Hareketli lazer çizgisi ile sanal QR taranır; telefondan tek tuşla sevk/iade yapılabilir ve tablodaki stoklar anında güncellenir.

6. **Tam Sistem Geçişi:**
   - İstenildiğinde sağ üstteki butondan veya giriş ekranından NestJS API ve mobil uygulamayla entegre tam sürüme geçiş yapılabilir.

---

## 🛠️ Kurulum & Yerel Çalıştırma

Projeyi bilgisayarınızda çalıştırmak için:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# 3. Tarayıcınızda açın
http://localhost:5173
```

---

## 📦 Üretim Derlemesi (Build)

```bash
npm run build
```

Derlenen dosyalar `dist/` klasörüne çıkarılır ve göreceli yollar (`base: './'`) kullandığı için herhangi bir statik sunucuda veya GitHub Pages'te doğrudan çalışır.

---

## 🌐 GitHub'a Yükleme ve GitHub Pages ile Yayınlama

Projeyi GitHub'a yükleyip tek tıkla canlıya almak için:

```bash
# Git başlatın
git init
git add .
git commit -m "feat: Peynir Stok ve Fire Takip Paneli prototipi"

# GitHub reponuzu bağlayın (kendi repo linkinizi yazın)
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/peynir-stok-prototip.git
git push -u origin main
```

### GitHub Pages'i Aktif Etme:
1. GitHub reponuzda **Settings** > **Pages** menüsüne gidin.
2. **Build and deployment > Source** kısmını **GitHub Actions** olarak seçin.
3. Projede hazır bulunan `.github/workflows/deploy.yml` sayesinde her `git push` işleminde siteniz otomatik olarak `https://<kullanici-adiniz>.github.io/peynir-stok-prototip/` adresinde canlıya alınacaktır!

---

## 📄 Lisans
Bu proje prototip amaçlı hazırlanmıştır.
