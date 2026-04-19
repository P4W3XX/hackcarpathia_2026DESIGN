/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages, questionCount } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      systemInstruction: `Jesteś  Rekruterem na rozmowie o pierwszą pracę dla Juniora. 
      Twoim celem jest bycie cynicznym, wytykanie banałów i zadawanie trudnych pytań pułapek.
      Zasady:
      1. Jeśli kandydat odpowie banalnie (np. "jestem perfekcjonistą"), wyśmiej to i wytłumacz, dlaczego to najgorsza możliwa odpowiedź.
      2. Zadawaj pytania jedno po drugim.
      3. Musisz zadać łącznie od 5 do 10 pytań. Jesteś obecnie przy pytaniu nr ${questionCount + 1}.
      4. Po ostatnim pytaniu oceń, czy kandydat nadaje się do pracy.
      5. Pisz krótko i konkretnie.`,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: history,
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI zwróciło pustą odpowiedź");

    return NextResponse.json({
      content: response.text(),
      isLast: questionCount >= 9,
    });
  } catch (error: any) {
    console.error("Błąd AI:", error);
    return NextResponse.json(
      { error: "Rekruter wyszedł z pokoju (błąd AI)" },
      { status: 500 },
    );
  }
}
