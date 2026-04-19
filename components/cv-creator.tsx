/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import {
  FileUser,
  Sparkles,
  Download,
  Loader2,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const CvCreator = () => {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [cvContent, setCvContent] = useState<any | null>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    targetRole: "",
    experience: "",
    skills: "",
    education: "",
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, fullName: user?.name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Błąd serwera:", errorText);
        throw new Error("Serwer nie odpowiedział poprawnie.");
      }

      const data = await response.json();
      setCvContent(data);
    } catch (error) {
      console.error("Błąd:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!cvRef.current) return;
    setLoading(true);

    try {
      const html = cvRef.current.outerHTML;

      const fileName = `CV_${
        user?.name?.replace(/\s+/g, "_") || "SmartStart"
      }.pdf`;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html, fileName }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Błąd PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <FileUser size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Kreator CV AI
              </h2>
              <p className="text-slate-400 font-bold text-sm uppercase">
                Dane z Twojego profilu są dodawane automatycznie
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 opacity-60">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                  Pobrane z bazy
                </span>
                <p className="font-bold text-slate-800 text-sm">{user?.name}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                  Lokalizacja
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {user?.city_name}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">
                Stanowisko docelowe
              </label>
              <input
                placeholder="np. Senior Frontend Developer"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) =>
                  setFormData({ ...formData, targetRole: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">
                Twoje doświadczenie (surowe punkty)
              </label>
              <textarea
                placeholder="Napisz krótko co robiłeś, AI zamieni to w język sukcesu..."
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none h-32 resize-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase ml-2 mb-2 block">
                Umiejętności (oddziel przecinkiem)
              </label>
              <input
                placeholder="np. React, Tailwind, Project Management"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !formData.targetRole}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              Generuj CV
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="sticky top-8">
          <div className="flex justify-between items-center mb-6 px-4">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
              Live Preview
            </h3>
            {cvContent && (
              <button
                onClick={downloadPdf}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Download size={18} /> Pobierz PDF
              </button>
            )}
          </div>

          <div className="bg-slate-200 rounded-[40px] p-2 sm:p-4 overflow-hidden shadow-inner flex justify-center items-start min-h-[700px]">
            {cvContent ? (
              <div
                ref={cvRef}
                className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl origin-top scale-[0.4] sm:scale-[0.55] lg:scale-[0.65] xl:scale-[0.8]"
              >
                <div className="border-b-4 border-slate-900 pb-12 mb-12">
                  <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    {user?.name}
                  </h1>
                  <div className="flex items-center gap-6 text-slate-500 font-bold text-xl uppercase tracking-widest">
                    <span className="text-indigo-600">
                      {formData.targetRole}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-2">
                      <MapPin size={20} /> {user?.city_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-16">
                  <div className="col-span-2 space-y-12">
                    <section>
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                        Doświadczenie zawodowe
                      </h2>
                      <div className="space-y-8">
                        {cvContent.experience_bullets.map(
                          (point: string, i: number) => (
                            <div key={i} className="flex gap-4 group">
                              <div className="mt-1.5 w-4 h-4 rounded-full border-2 border-indigo-500 group-hover:bg-indigo-500 transition-colors shrink-0" />
                              <p className="text-slate-700 font-medium text-lg leading-relaxed">
                                {point}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                        O mnie
                      </h2>
                      <p className="text-slate-600 font-medium leading-relaxed italic text-lg leading-relaxed">
                        {cvContent.bio}
                      </p>
                    </section>

                    <section>
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                        Skille
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {cvContent.skills_array.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-700 text-sm uppercase"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center animate-pulse">
                  <FileUser size={48} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-black text-sm uppercase tracking-widest">
                  Wypełnij formularz, aby AI stworzyło podgląd
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
