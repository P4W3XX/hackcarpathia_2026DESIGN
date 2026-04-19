/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import {
  FileUser,
  Sparkles,
  Download,
  Loader2,
  MapPin,
} from "lucide-react";
import { useUserStore } from "@/store/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
                <FileUser className="size-5" />
              </div>
              <div>
                <CardTitle>Kreator CV AI</CardTitle>
                <CardDescription>
                  Dane z Twojego profilu są dodawane automatycznie.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted border border-border rounded-md">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Pobrane z bazy
                </span>
                <p className="font-medium text-foreground text-sm truncate">
                  {user?.name || "—"}
                </p>
              </div>
              <div className="p-3 bg-muted border border-border rounded-md">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                  Lokalizacja
                </span>
                <p className="font-medium text-foreground text-sm truncate">
                  {user?.city_name || "—"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Stanowisko docelowe</Label>
              <Input
                placeholder="np. Senior Frontend Developer"
                value={formData.targetRole}
                onChange={(e) =>
                  setFormData({ ...formData, targetRole: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Twoje doświadczenie (surowe punkty)
              </Label>
              <textarea
                placeholder="Napisz krótko co robiłeś, AI zamieni to w język sukcesu..."
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                className="w-full min-h-28 p-3 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Umiejętności (oddziel przecinkiem)
              </Label>
              <Input
                placeholder="np. React, Tailwind, Project Management"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.targetRole}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generuj CV
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-7">
        <div className="sticky top-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live Preview
            </h3>
            {cvContent && (
              <Button onClick={downloadPdf} size="sm">
                <Download className="size-4" /> Pobierz PDF
              </Button>
            )}
          </div>

          <div className="bg-muted rounded-lg p-4 sm:p-6 overflow-hidden border border-border flex justify-center items-start min-h-[700px]">
            {cvContent ? (
              <div
                ref={cvRef}
                className="bg-background text-foreground w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl origin-top scale-[0.4] sm:scale-[0.55] lg:scale-[0.65] xl:scale-[0.8]"
              >
                <div className="border-b-2 border-foreground pb-8 mb-10">
                  <h1 className="text-5xl font-bold text-foreground tracking-tight mb-3">
                    {user?.name}
                  </h1>
                  <div className="flex items-center gap-5 text-muted-foreground text-base uppercase tracking-widest font-medium">
                    <span className="text-primary font-semibold">
                      {formData.targetRole}
                    </span>
                    <span className="size-1.5 rounded-full bg-border" />
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4" /> {user?.city_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-12">
                  <div className="col-span-2">
                    <section>
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-6">
                        Doświadczenie zawodowe
                      </h2>
                      <div className="space-y-6">
                        {cvContent.experience_bullets.map(
                          (point: string, i: number) => (
                            <div key={i} className="flex gap-3">
                              <div className="mt-2 size-3 rounded-full border-2 border-primary shrink-0" />
                              <p className="text-foreground text-base leading-relaxed">
                                {point}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-5">
                        O mnie
                      </h2>
                      <p className="text-foreground leading-relaxed italic text-sm">
                        {cvContent.bio}
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em] mb-5">
                        Umiejętności
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {cvContent.skills_array.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-muted rounded-md border border-border text-foreground text-xs font-medium uppercase"
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
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="size-20 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <FileUser className="size-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">
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
