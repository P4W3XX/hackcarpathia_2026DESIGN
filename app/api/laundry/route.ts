/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Zanalizuj zdjęcie metki ubrania. 
      1. Rozpoznaj symbole prania (temperatura, pranie ręczne/mechaniczne).
      2. Rozpoznaj symbole suszenia i prasowania.
      3. Na podstawie symboli i opisu materiału (jeśli jest widoczny), przygotuj instrukcję.

      Zwróć JSON:
      {
        "fabric": "rozpoznany materiał lub 'nieznany'",
        "temp": "zalecana temp",
        "program": "nazwa programu",
        "detergent": "rekomendowany środek",
        "tips": ["porada 1", "porada 2", "porada 3"],
        "warning": "krytyczne ostrzeżenie"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Błąd Vision:", error);
    return NextResponse.json({ error: "Nie udało się odczytać metki" }, { status: 500 });
  }
}