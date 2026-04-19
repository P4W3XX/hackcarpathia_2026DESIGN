"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FileWarning,
  AlertTriangle,
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  X,
  FileSearch,
} from "lucide-react";

interface AnalysisResult {
  safetyScore: number;
  risks: string[];
  positives: string[];
  verdict: string;
}

export const ContractAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
    }
  };

  const handleAnalysis = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd serwera");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Błąd analizy:", error);
      alert("Wystąpił błąd podczas analizy pliku. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-10 text-center sm:text-left">
          <div className="p-5 bg-blue-600 rounded-[24px] text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              AI Strażnik Umowy
            </h2>
            <p className="text-slate-500 font-bold mt-1">
              Prześlij skan lub PDF umowy. Gemini sprawdzi kruczki prawne.
            </p>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          className={`relative border-2 border-dashed rounded-[32px] p-10 transition-all duration-300 group ${
            file
              ? "border-blue-500 bg-blue-50/30"
              : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            id="contract-upload"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <label
            htmlFor="contract-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {file ? (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="relative">
                  <FileText size={64} className="text-blue-600 mb-4" />
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-sm">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <span className="font-black text-slate-800 text-lg mb-1">
                  {file.name}
                </span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                  className="mt-4 px-4 py-2 bg-white text-red-500 rounded-xl text-xs font-black uppercase border border-red-100 hover:bg-red-50 transition-colors"
                >
                  Zmień plik
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload size={32} className="text-slate-400" />
                </div>
                <span className="text-xl font-black text-slate-800 mb-2">
                  Wybierz dokument
                </span>
                <p className="text-slate-400 font-medium text-center max-w-[280px]">
                  Kliknij tutaj, aby wybrać plik PDF lub zdjęcie Twojej umowy
                </p>
              </div>
            )}
          </label>
        </div>

        <button
          onClick={handleAnalysis}
          disabled={loading || !file}
          className="w-full mt-10 py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-[24px] font-black text-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Trwa analiza prawna...</span>
            </>
          ) : (
            <>
              <FileSearch size={24} />
              <span>Rozpocznij analizę bezpieczeństwa</span>
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Wynik Punktowy */}
          <div
            className={`p-8 rounded-[32px] border-2 flex flex-col sm:flex-row items-center gap-6 shadow-sm ${
              analysis.safetyScore >= 70
                ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                : "bg-red-50 border-red-100 text-red-900"
            }`}
          >
            <div
              className={`text-6xl font-black px-6 py-4 rounded-[24px] bg-white shadow-sm border ${
                analysis.safetyScore >= 70
                  ? "text-emerald-600 border-emerald-200"
                  : "text-red-600 border-red-200"
              }`}
            >
              {analysis.safetyScore}%
            </div>
            <div>
              <h3 className="text-2xl font-black mb-1">
                Ogólny wynik zaufania
              </h3>
              <p className="font-bold opacity-70">
                {analysis.safetyScore >= 70
                  ? "Umowa wydaje się bezpieczna i zgodna ze standardami."
                  : "Wykryto poważne zagrożenia lub błędy w umowie."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                  Ryzykowne zapisy
                </h4>
              </div>
              <ul className="space-y-4">
                {analysis.risks.map((risk, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm font-bold text-slate-600 leading-relaxed"
                  >
                    <span className="text-red-500 text-lg">•</span> {risk}
                  </li>
                ))}
                {analysis.risks.length === 0 && (
                  <li className="text-slate-400 italic text-sm font-bold">
                    Brak wykrytych ryzyk.
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                  Zgodność z prawem
                </h4>
              </div>
              <ul className="space-y-4">
                {analysis.positives.map((pos, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm font-bold text-slate-600 leading-relaxed"
                  >
                    <span className="text-emerald-500 text-lg">✓</span> {pos}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="bg-blue-600 px-3 py-1 rounded-lg text-xs uppercase tracking-widest">
                  Werdykt
                </span>
                Podsumowanie eksperta AI
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                {analysis.verdict}&quot;
              </p>
              <div className="mt-8 pt-8 border-t border-slate-800 flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <AlertTriangle size={14} /> Analiza ma charakter informacyjny i
                nie zastępuje profesjonalnej porady prawnej.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
