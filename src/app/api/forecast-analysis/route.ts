import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing-key" });

export async function POST(req: Request) {
  try {
    const { chartData, language } = await req.json();

    const isID = language === "ID";

    const prompt = `
      Anda adalah "Lumina AI", sistem analis ritel tingkat Enterprise.
      Berdasarkan data run-time checkout transaksi historis (Actual Demand) dan proyeksi stok ke depan (Forecasted Demand) di bawah ini, berikan 1 paragraf analisis strategis ringkas dan rekomendasi pengisian stok yang sangat konkret.
      
      Bahasa Output: ${isID ? "Bahasa Indonesia" : "English"}

      Data Runtun Waktu (Time-series Data):
      ${JSON.stringify(chartData)}

      Instruksi Output:
      - Hasil analisis harus berupa teks deskriptif profesional.
      - Maksimum 3-4 kalimat.
      - Berikan rekomendasi spesifik: apakah harus menaikkan stok, melakukan flash sale jika ada kelebihan, atau menjaga stabilitas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const recommendation = response.text || (isID ? "Gagal menghasilkan rekomendasi AI." : "Failed to generate AI recommendation.");

    return NextResponse.json({ recommendation });
  } catch (error: any) {
    console.error('Forecast Analysis Route Error:', error);
    return NextResponse.json(
      { error: 'Gagal menjalankan analisis AI', details: error.message },
      { status: 500 }
    );
  }
}
