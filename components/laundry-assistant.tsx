/* eslint-disable @next/next/no-img-element */
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
  Thermometer,
  Droplets,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    } catch {
      alert("Błąd analizy zdjęcia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
              <Camera className="size-5" />
            </div>
            <div className="flex-1">
              <CardTitle>Skaner Metek AI</CardTitle>
              <CardDescription>
                Wgraj zdjęcie metki, a AI odczyta symbole za Ciebie.
              </CardDescription>
            </div>
            {imagePreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImagePreview(null);
                  setResult(null);
                }}
              >
                <RefreshCw className="size-3.5" />
                Usuń zdjęcie
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {!imagePreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg h-64 w-full flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-all"
                >
                  <div className="size-12 rounded-full bg-accent text-primary flex items-center justify-center">
                    <Upload className="size-5" />
                  </div>
                  <p className="text-foreground font-medium">
                    Wgraj zdjęcie metki
                  </p>
                  <p className="text-muted-foreground text-xs">
                    AI odczyta symbole za Ciebie
                  </p>
                </button>
              ) : (
                <div className="relative rounded-lg overflow-hidden h-64 border border-border">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Metka"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent">
                    <Button
                      onClick={analyzeLabel}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {loading ? "Analizuję symbole..." : "Analizuj zdjęcie"}
                    </Button>
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

            <Card className="bg-muted/30">
              <CardContent className="h-full flex flex-col justify-center">
                {result ? (
                  <div className="space-y-5 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="inline-flex items-center rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
                        {result.fabric}
                      </span>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Thermometer className="size-5 text-primary" />
                        <span className="text-2xl font-bold">
                          {result.temp}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-background border border-border rounded-md">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">
                          Program
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {result.program}
                        </p>
                      </div>
                      <div className="p-3 bg-background border border-border rounded-md">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-0.5">
                          Detergent
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {result.detergent}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide flex items-center gap-1.5">
                        <Droplets className="size-3.5" />
                        Instrukcja krok po kroku
                      </p>
                      {result.tips.map((tip: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="text-primary mt-0.5 shrink-0">
                            &bull;
                          </span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>

                    {result.warning && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-xs flex gap-2 items-start">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span className="italic">{result.warning}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Shirt className="size-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Czekam na zdjęcie Twojej metki...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
