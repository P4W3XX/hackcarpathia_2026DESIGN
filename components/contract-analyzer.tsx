"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  FileSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  const isSafe = analysis && analysis.safetyScore >= 70;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle>AI Strażnik Umowy</CardTitle>
              <CardDescription>
                Prześlij skan lub PDF umowy &mdash; sprawdzimy kruczki prawne.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <label
            htmlFor="contract-upload"
            className={cn(
              "relative block border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
              file
                ? "border-primary bg-accent/50"
                : "border-border hover:border-primary hover:bg-muted/50",
            )}
          >
            <input
              type="file"
              id="contract-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <FileText className="size-12 text-primary" />
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                </div>
                <p className="font-semibold text-foreground mb-1 truncate max-w-full">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                >
                  Zmień plik
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="size-14 rounded-full bg-accent text-primary flex items-center justify-center mb-3">
                  <Upload className="size-6" />
                </div>
                <p className="font-semibold text-foreground mb-1">
                  Wybierz dokument
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Kliknij, aby wybrać plik PDF lub zdjęcie Twojej umowy.
                </p>
              </div>
            )}
          </label>

          <Button
            onClick={handleAnalysis}
            disabled={loading || !file}
            size="lg"
            className="w-full mt-5"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin size-4" />
                Trwa analiza prawna...
              </>
            ) : (
              <>
                <FileSearch className="size-4" />
                Rozpocznij analizę bezpieczeństwa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card
            className={cn(
              "border-2",
              isSafe ? "border-primary" : "border-destructive",
            )}
          >
            <CardContent className="flex flex-col sm:flex-row items-center gap-5 py-6">
              <div
                className={cn(
                  "text-5xl font-bold px-6 py-4 rounded-lg border-2 min-w-[140px] text-center",
                  isSafe
                    ? "text-primary border-primary bg-accent"
                    : "text-destructive border-destructive bg-destructive/10",
                )}
              >
                {analysis.safetyScore}%
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  Ogólny wynik zaufania
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSafe
                    ? "Umowa wydaje się bezpieczna i zgodna ze standardami."
                    : "Wykryto poważne zagrożenia lub błędy w umowie."}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-4" />
                  </div>
                  <CardTitle className="text-sm uppercase tracking-wide">
                    Ryzykowne zapisy
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.risks.map((risk, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-foreground leading-relaxed"
                    >
                      <span className="text-destructive mt-0.5 shrink-0">
                        &bull;
                      </span>
                      <span>{risk}</span>
                    </li>
                  ))}
                  {analysis.risks.length === 0 && (
                    <li className="text-muted-foreground italic text-sm">
                      Brak wykrytych ryzyk.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <CardTitle className="text-sm uppercase tracking-wide">
                    Zgodność z prawem
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.positives.map((pos, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-foreground leading-relaxed"
                    >
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-foreground text-background border-foreground">
            <CardContent className="py-6 relative overflow-hidden">
              <ShieldCheck className="absolute top-4 right-4 size-24 opacity-5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-semibold">
                    Werdykt
                  </span>
                  <h3 className="text-lg font-semibold">
                    Podsumowanie eksperta AI
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-background/85">
                  {analysis.verdict}
                </p>
                <div className="mt-5 pt-5 border-t border-background/20 flex items-center gap-2 text-[11px] uppercase tracking-wider text-background/60">
                  <AlertTriangle className="size-3.5" />
                  Analiza ma charakter informacyjny i nie zastępuje
                  profesjonalnej porady prawnej.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
