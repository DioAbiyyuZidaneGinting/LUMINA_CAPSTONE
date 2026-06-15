import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing-key" });

// Models to try in order (fallback chain)
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const MAX_RETRIES = 2;

async function generateWithRetry(prompt: string): Promise<string> {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        return response.text || '';
      } catch (err: any) {
        const status = err?.status || err?.response?.status;
        const isOverloaded = status === 503 || status === 429;

        console.warn(
          `[Forecast AI] ${model} attempt ${attempt}/${MAX_RETRIES} failed` +
          `${isOverloaded ? ' (overloaded)' : ''}: ${err.message?.slice(0, 100)}`
        );

        // If overloaded, try next model immediately
        if (isOverloaded && attempt === MAX_RETRIES) break;

        // Brief delay before retry
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
        }
      }
    }
  }
  throw new Error('Semua model Gemini sedang tidak tersedia. Coba lagi nanti.');
}

export async function POST(req: Request) {
  try {
    const { chartData, language, mlModelConnected, modelName } = await req.json();

    const isID = language === "ID";

    const mlContext = mlModelConnected
      ? `Data prediksi dihasilkan oleh model Machine Learning "${modelName || 'ML Model'}" yang sudah di-train menggunakan dataset Brazilian E-Commerce.`
      : `Data prediksi dihasilkan berdasarkan perhitungan statistik sederhana dari data transaksi.`;

    const prompt = `
      Anda adalah "Lumina AI", sistem analis ritel tingkat Enterprise.
      ${mlContext}
      Berdasarkan data run-time checkout transaksi historis (Actual Demand) dan proyeksi stok ke depan (Forecasted Demand) di bawah ini, berikan 1 paragraf analisis strategis ringkas dan rekomendasi pengisian stok yang sangat konkret.
      
      Bahasa Output: ${isID ? "Bahasa Indonesia" : "English"}

      Data Runtun Waktu (Time-series Data):
      ${JSON.stringify(chartData)}

      Instruksi Output:
      - Hasil analisis harus berupa teks deskriptif profesional.
      - Maksimum 3-4 kalimat.
      - Berikan rekomendasi spesifik: apakah harus menaikkan stok, melakukan flash sale jika ada kelebihan, atau menjaga stabilitas.
    `;

    const recommendation = await generateWithRetry(prompt);

    return NextResponse.json({
      recommendation: recommendation || (isID ? "Gagal menghasilkan rekomendasi AI." : "Failed to generate AI recommendation."),
    });
  } catch (error: any) {
    console.error('Forecast Analysis Route Error:', error.message);
    return NextResponse.json(
      { error: 'Gagal menjalankan analisis AI', details: error.message },
      { status: 500 }
    );
  }
}
