import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Ensure the API key is passed correctly, handling potential undefined cases gracefully.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing-key" });

export async function POST(req: Request) {
  try {
    const { metrics, risks } = await req.json();
    
    const prompt = `
      Anda adalah "Lumina AI", sistem analis ritel tingkat Enterprise.
      Berdasarkan metrik dan risiko inventaris berikut, hasilkan 3 hingga 5 rekomendasi tindakan strategis.
      
      Metrik Saat Ini:
      Pendapatan: ${metrics?.totalRevenue}
      Pesanan: ${metrics?.totalOrders}
      
      Risiko Inventaris Teratas:
      ${JSON.stringify(risks?.slice(0, 5))}
      
      OUTPUT HARUS berupa raw JSON array (TANPA markdown backticks \`\`\`).
      Gunakan skema persis seperti ini untuk setiap object:
      {
        "action": "Nama Tindakan Singkat",
        "confidence": 85, // integer 0-100
        "severity": "CRITICAL", // enum: "LOW", "MEDIUM", "HIGH", "CRITICAL"
        "reasoning": ["Alasan logis 1", "Alasan logis 2"],
        "estimatedImpact": "Estimasi dampak bisnis operasional",
        "affectedProducts": ["Nama Produk 1"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawText = response.text || "[]";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let recommendations = [];
    try {
      recommendations = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Failed to parse AI JSON:", rawText);
      throw new Error("AI returned malformed JSON");
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json(
      { error: 'Gagal menjalankan analisis AI', details: error.message },
      { status: 500 }
    );
  }
}
