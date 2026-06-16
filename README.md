<div align="center">
  <h1 align="center">L U M I N A</h1>
  <h3>✨ Enterprise E-Commerce & AI-Powered Inventory Platform ✨</h3>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini AI" />
  </p>
</div>

<br/>

## 🌟 Pengenalan Produk

Lumina adalah platform e-commerce mutakhir yang memadukan pengalaman berbelanja seamless bagi pelanggan dengan kecerdasan buatan (AI) tingkat enterprise untuk manajemen inventaris. Dibangun sebagai Capstone Project, platform ini memberdayakan pemilik UMKM dengan analitik prediktif, otomatisasi tata kelola stok, dan asisten bisnis virtual untuk pengambilan keputusan yang lebih tajam.

## 🚀 Keunggulan & Fitur Utama

- **🛍️ Modern Storefront:** Antarmuka toko visual (grid layout) yang elegan, responsif, dilengkapi sistem penyaringan dinamis, keranjang belanja, dan proses checkout intuitif.

- **🔮 ML Prediction (Prediksi Barang):** Integrasi algoritma Machine Learning tingkat lanjut untuk memprediksi tren permintaan barang di masa depan, menganalisis pola penjualan historis, serta memproyeksikan kebutuhan stok secara akurat untuk meminimalisir risiko _overselling_ atau _stockout_.

- **🧠 Mesin Prediksi Inventaris (AI):** Memantau ketersediaan stok secara cerdas, memproyeksikan permintaan aktual vs prediksi, dan memberikan peringatan otomatis (Inventory Alerts Engine) sebelum stok habis.

- **🤖 Lumina Assistant (Chat AI):** Asisten virtual yang terintegrasi langsung dengan pangkalan data toko untuk memberikan konsultasi bisnis, wawasan pesanan, dan laporan metrik secara real-time.

- **📊 Eksekutif Dashboard & Analitik:** Visualisasi data komprehensif mulai dari intelijen corong pelanggan (funnel), peta panas penjualan (sales heatmap), hingga analisis margin keuntungan.

- **⚡ Performa & Skalabilitas:** Dibangun di atas fondasi Next.js 14 (App Router) dan Supabase untuk menjamin kecepatan render, keamanan autentikasi, serta pengelolaan pangkalan data yang solid.

## 🔗 Tautan

**1. Deployment (Website Lumina)**

```bash
https://project-capstone-lumina.vercel.app/
```

**2. Gdrive Model Machine Learning**

```bash
https://drive.google.com/drive/folders/1FXx1-lwSfo6rFtxdA0ebm_b0pxiBhwoO?usp=sharing
```

**3. Google Colab Model Machine Learning**

```bash
https://colab.research.google.com/drive/1P5-S_YJPPaOrZ1vMfm36-zMPxliWQUyC?usp=sharing
```

## 🛠️ Panduan Menjalankan Lumina

Berikut adalah panduan langkah demi langkah untuk menginstal dan menjalankan aplikasi Lumina di lingkungan lokal Anda:

1. Persiapan Environment dan IDE

- Pastikan Anda telah menginstal Node.js dan Git di sistem Anda.
- Buka VS Code (Visual Studio Code).
- Buka terminal terintegrasi di dalam VS Code.
- Jalankan perintah clone repository jika Anda belum mengunduh kode sumber:

```bash
git clone https://github.com/DioAbiyyuZidaneGinting/LUMINA_CAPSTONE.git
```

- Masuk ke direktori proyek menggunakan perintah:

```bash
cd lumina_capstone
```

2. Konfigurasi Kredensial Sistem

- Buat sebuah file baru dengan nama .env.local di dalam folder utama repository (sejajar dengan file package.json).

- Masukkan konfigurasi API Key dari Supabase dan Google Gemini yang diperlukan untuk menjalankan basis data dan fitur kecerdasan buatan:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GEMINI_API_KEY=...


NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth-callback
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

```

3. Install Dependencies

- Pastikan terminal Anda masih berada di dalam direktori lumina_capstone.

- Jalankan perintah berikut untuk mengunduh seluruh pustaka yang dibutuhkan:

```bash
npm install
```

- Tunggu hingga indikator proses instalasi di terminal selesai 100%.

4. Menjalankan Server Development

- Setelah instalasi berhasil, jalankan perintah berikut untuk menyalakan server lokal:

```bash
npm run dev
```

- Tunggu hingga muncul pesan konfirmasi di terminal yang menandakan server telah beroperasi (biasanya ditandai dengan keterangan ready in X ms).

5. Testing & Mengakses Aplikasi

- Buka peramban web (browser) pilihan Anda (disarankan Google Chrome).

- Untuk mengakses halaman Toko Pelanggan (Storefront), kunjungi tautan: http://localhost:3000

- Untuk mengakses Dashboard Administrator, kunjungi tautan: http://localhost:3000/admin

- Gunakan akun admin

```bash
email: email yang kamu masukkan di clerk
Password: password kamu
```

- Catatan: Biarkan terminal VS Code tetap berjalan selama proses pengujian aplikasi.

## LUMINA — ML Forecasting API (Random Forest)

**⚠️ PENTING:**
Setiap kali mau buka dashboard, pastikan API server
jalan di terminal terpisah!

## CARA MENJALANKAN:

- Buka terminal baru (PowerShell / CMD)
- Jalankan perintah berikut:

```bash
   cd D:\LUMINA_CAPSTONE\API
   python -m uvicorn main:app --port 8000 --reload
```

- Tunggu sampai muncul:
  "[OK] API activated - all endpoints ready."

- Lalu buka dashboard di browser:
  http://localhost:3000/admin/dashboard

## CARA MEMATIKAN:

- Tekan Ctrl+C di terminal API server.

## INFO

- Model : Random Forest
- Endpoint : http://localhost:8000
- Docs : http://localhost:8000/docs
- Port : 8000 (jangan diganti, sudah di-set di .env.local)

<br/>

<div align="center">
  <i>Dirancang dan dikembangkan dengan dedikasi oleh TIM CAPSTONE PJK-GM008</i><br/>
  <b>Pijak in collaboration with IBM Skillsbuild</b>
</div>
