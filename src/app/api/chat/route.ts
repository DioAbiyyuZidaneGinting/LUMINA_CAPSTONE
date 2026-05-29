import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing-key" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Fetch live sales, product, and customer context in parallel
    const [
      ordersCountRes,
      productsCountRes,
      customersCountRes,
      revDataRes,
      recentOrdersRes,
      productsListRes,
      recentCustomersRes
    ] = await Promise.all([
      supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("customers").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total_amount"),
      supabaseAdmin.from("orders").select("total_amount, created_at, id").order("created_at", { ascending: false }).limit(10),
      supabaseAdmin.from("products").select("name, price, stock, category").order("created_at", { ascending: false }).limit(10),
      supabaseAdmin.from("customers").select("name, email, city, created_at").order("created_at", { ascending: false }).limit(10)
    ]);

    const totalOrdersCount = ordersCountRes.count || 0;
    const totalProductsCount = productsCountRes.count || 0;
    const totalCustomersCount = customersCountRes.count || 0;
    
    const revData = revDataRes.data || [];
    const totalRevenue = revData.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const recentOrders = recentOrdersRes.data || [];
    const productsList = productsListRes.data || [];
    const recentCustomers = recentCustomersRes.data || [];

    // 2. Build the system instruction feeding the model this live context
    const systemInstruction = `
      Anda adalah Konsultan Bisnis Ritel Senior untuk platform E-commerce bernama 'Lumina'.
      Tugas Anda adalah memberikan saran strategis, analisis produk, dan wawasan operasional
      kepada pemilik toko. Gunakan bahasa Indonesia yang profesional, ramah, dan ringkas.
      Berikan rekomendasi yang berorientasi pada tindakan.
      
      ATURAN TAMPILAN PENTING:
      - DILARANG MENGGUNAKAN SIMBOL BINTANG (*) ATAU FORMAT HURUF TEBAL GANDA (**) dalam teks respons Anda untuk menjaga nilai estetika. 
      - Sebagai gantinya, gunakan huruf kapital (CAPITAL LETTERS) untuk penekanan kata penting atau gunakan spasi/paragraf baru untuk struktur.
      - Respons Anda harus ringkas dan to-the-point (maksimal 3-4 kalimat per respons). Sampaikan hal-hal paling penting yang menjawab pertanyaan dengan tepat.

      Berikut adalah data real-time autentik dari database toko saat ini:
      - Total Pendapatan Toko: Rp ${totalRevenue.toLocaleString("id-ID")}
      - Total Transaksi/Pesanan Sukses: ${totalOrdersCount}
      - Nilai Rata-rata Pesanan (AOV): Rp ${(totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0).toLocaleString("id-ID")}
      - Total Pelanggan Terdaftar: ${totalCustomersCount}
      - Total Produk dalam Katalog: ${totalProductsCount}
      
      Pesanan Terbaru (maksimal 10):
      ${JSON.stringify(recentOrders.map(o => ({ id: `LUM-${o.id.substring(0, 8)}`, total_amount: o.total_amount, created_at: o.created_at })))}
      
      Katalog Produk Terbaru (maksimal 10):
      ${JSON.stringify(productsList.map(p => ({ name: p.name, price: p.price, stock: p.stock, category: p.category })))}
      
      Pelanggan Terbaru (maksimal 10):
      ${JSON.stringify(recentCustomers.map(c => ({ name: c.name, email: c.email, city: c.city })))}
      
      Gunakan data di atas untuk menjawab pertanyaan spesifik tentang penjualan, stok, pendapatan, atau pesanan. Jangan pernah mengarang data jika tidak ada dalam daftar di atas.
    `;

    // Convert messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let reply = response.text || "Maaf, saya tidak dapat merespons saat ini.";
    
    // Safety replacement to prevent stars from entering UI
    reply = reply.replace(/\*/g, "");

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat AI Error:', error);
    return NextResponse.json(
      { error: 'Gagal merespons pesan', details: error.message },
      { status: 500 }
    );
  }
}
