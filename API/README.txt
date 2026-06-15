============================================================
  LUMINA — ML Forecasting API (Random Forest)
============================================================

⚠️  PENTING:
Setiap kali mau buka dashboard, pastikan API server 
jalan di terminal terpisah!

CARA MENJALANKAN:
-----------------
1. Buka terminal baru (PowerShell / CMD)
2. Jalankan perintah berikut:

   cd D:\LUMINA_CAPSTONE\API
   python -m uvicorn main:app --port 8000 --reload

3. Tunggu sampai muncul:
   "[OK] API activated - all endpoints ready."

4. Baru buka dashboard di browser:
   http://localhost:3000/admin/dashboard

CARA MEMATIKAN:
---------------
Tekan Ctrl+C di terminal API server.

============================================================
INFO
============================================================
- Model    : Random Forest
- Endpoint : http://localhost:8000
- Docs     : http://localhost:8000/docs
- Port     : 8000 (jangan diganti, sudah di-set di .env.local)
============================================================
