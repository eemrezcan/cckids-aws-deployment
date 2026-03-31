import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

type IncomingMessage = {
  role: 'user' | 'model';
  text: string;
  id?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { input?: string; messages?: IncomingMessage[] };

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_GENAI_API_KEY missing' },
        { status: 500 },
      );
    }

    const input = body.input?.toString() ?? '';
    if (!input.trim()) {
      return NextResponse.json({ error: 'Empty input' }, { status: 400 });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const systemInstruction = `
Sen CCkids mobilya firmasının neşeli, uzman ve yardımsever iç mimar asistanısın.
Hedef kitlen kreş öğretmenleri ve ebeveynler.
Dilin samimi, çocuk ruhlu ama güven veren profesyonellikte olmalı.
Ürünlerimiz: Masalar, Sandalyeler, Dolaplar, Oyun Grupları.
Konular: Montessori eğitimi, sınıf güvenliği, renk psikolojisi, ergonomi.
Cevapların kısa, net ve emojilerle süslü olsun.
`;

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
      },
    });

    const text = response.text ?? '';

    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
