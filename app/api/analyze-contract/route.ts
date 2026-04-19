/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Brak klucza API GEMINI_API_KEY w .env" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nie przesłano pliku" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
        Jesteś polskim ekspertem prawa pracy. Przeanalizuj przesłaną umowę.
        
        BARDZO WAŻNE: Odpowiedz WYŁĄCZNIE w formacie JSON. Nie dodawaj żadnych wstępów ani podsumowań.
        
        Struktura JSON:
        {
            "safetyScore": liczba 0-100,
            "risks": ["ryzyko 1", "ryzyko 2"],
            "positives": ["zaleta 1", "zaleta 2"],
            "verdict": "Twoja opinia"
        }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const startJson = text.indexOf("{");
    const endJson = text.lastIndexOf("}");

    if (startJson === -1 || endJson === -1) {
      throw new Error("Model AI nie wygenerował poprawnego formatu danych.");
    }

    const cleanJson = text.substring(startJson, endJson + 1);

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (e) {
      console.error("Błąd parsowania tekstu od AI:", text);
      return NextResponse.json(
        { error: "Błąd formatowania odpowiedzi przez AI" },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("BŁĄD API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
