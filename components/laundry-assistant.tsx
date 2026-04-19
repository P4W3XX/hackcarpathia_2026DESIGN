/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from "react";
import {
  Shirt,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

export const LaundryAssistant = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeLabel = async () => {
    if (!imagePreview) return;
    setLoading(true);

    try {
      const base64Data = imagePreview.split(",")[1];
      const mimeType = imagePreview.split(";")[0].split(":")[1];

      const response = await fetch("/api/laundry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Błąd analizy zdjęcia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 mb-4 sm:p-8 space-y-6">
      <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                  <Camera size={24} />
                </div>
                Skaner Metek AI
              </h2>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setResult(null);
                  }}
                  className="text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Usuń zdjęcie
                </button>
              )}
            </div>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all"
              >
                <Upload className="text-slate-500 mb-2" size={40} />
                <p className="text-slate-400 font-medium">
                  Wgraj zdjęcie metki
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  AI odczyta symbole za Ciebie
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-64 border border-slate-700">
                <img
                  src={imagePreview}
                  alt="Metka"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                  <button
                    onClick={analyzeLabel}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {loading ? "Analizuję symbole..." : "Analizuj zdjęcie"}
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-center">
            {result ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {result.fabric}
                  </span>
                  <span className="text-3xl font-black text-slate-900">
                    {result.temp}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Program
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {result.program}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Detergent
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {result.detergent}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Instrukcja krok po kroku
                  </p>
                  {result.tips.map((tip: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="text-blue-500 mt-1">•</span> {tip}
                    </div>
                  ))}
                </div>

                {result.warning && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex gap-2 italic">
                    <span>⚠️</span> {result.warning}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-600">
                <Shirt size={48} className="mx-auto mb-4 opacity-10" />
                <p>Czekam na zdjęcie Twojej metki...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
