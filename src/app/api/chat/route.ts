import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemInstruction = `
      Anda adalah Konsultan Bisnis Ritel Senior untuk platform E-commerce bernama 'Lumina'.
      Tugas Anda adalah memberikan saran strategis, analisis produk, dan wawasan operasional
      kepada pemilik toko. Gunakan bahasa Indonesia yang profesional, ramah, dan ringkas.
      Berikan rekomendasi yang berorientasi pada tindakan.
    `;

    // Convert messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Inject system instruction by prepending it to the user's first message if possible,
    // or passing it into the config if supported by this genai SDK version.
    // The @google/genai package supports `systemInstruction` in config.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const reply = response.text || "Maaf, saya tidak dapat merespons saat ini.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat AI Error:', error);
    return NextResponse.json(
      { error: 'Gagal merespons pesan', details: error.message },
      { status: 500 }
    );
  }
}
