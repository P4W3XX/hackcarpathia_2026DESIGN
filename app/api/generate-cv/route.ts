/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { targetRole, experience, skills, fullName, city } = await req.json();


    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Jesteś ekspertem HR. Napisz profesjonalną treść CV.
      Imię: ${fullName}, Miasto: ${city}.
      Aplikuje na: ${targetRole}.
      Doświadczenie: ${experience}.
      Skille: ${skills}.

      Zwróć JSON z polami:
      - bio: Krótkie podsumowanie zawodowe (ok. 300 znaków).
      - experience_bullets: Tablica 4-6 punktów z profesjonalnie opisanym doświadczeniem.
      - skills_array: Tablica rozszerzonych umiejętności (dodaj pasujące techniczne skille do tych podanych).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json(JSON.parse(response.text()));
  } catch (error: any) {
    console.error("DETALE BŁĘDU AI:", error.message);

    return NextResponse.json(
      { error: "Błąd serwera AI", details: error.message },
      { status: 500 },
    );
  }
}
