/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback } from "react";
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Receipt,
  User,
  Building2,
  ShoppingBag,
  Wallet,
  CalendarClock,
  Clock,
} from "lucide-react";
import { Menu } from "@/components/menu";
import { JobsPage } from "@/components/jobs-page";
import { careerLevels } from "./data/jobs";
import { UserProgress, CareerPath } from "./types";
import JobFinderSalaryDashboard from "./salary-calculator/page";
import { CareerAiPath } from "@/components/career-path";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContractAnalyzer } from "@/components/contract-analyzer";
import { CvCreator } from "@/components/cv-creator";
import { DoctorsAppointments } from "@/components/doctors-appointments";
import { InterviewSimulator } from "@/components/interview-simulator";
import { LaundryAssistant } from "@/components/laundry-assistant";

// Static user progress data
const userProgress: UserProgress = {
  currentLevel: 2,
  completedRequirements: {
    1: [0, 1, 2, 3],
    2: [0, 1, 2, 3, 4],
    3: [0, 1],
    4: [],
  },
  acquiredSkills: {
    1: [0, 1, 2, 3],
    2: [0, 1, 2, 3, 4],
    3: [0, 1],
    4: [],
  },
  experienceYears: 3,
};

const calculateCurrentLevel = (
  progress: UserProgress,
  levels: typeof careerLevels,
): UserProgress => {
  let calculatedLevel = levels.length - 1;
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    const levelNumber = level.level;
    const completedReqs = progress.completedRequirements[levelNumber] || [];
    const completedSkills = progress.acquiredSkills[levelNumber] || [];
    const allRequirementsCompleted =
      completedReqs.length === level.requirements.length;
    const allSkillsCompleted = completedSkills.length === level.skills.length;
    if (!allRequirementsCompleted || !allSkillsCompleted) {
      calculatedLevel = i;
      break;
    }
  }
  return { ...progress, currentLevel: calculatedLevel };
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "jobs"
    | "career"
    | "salary-calculator"
    | "taxes"
    | "doctors"
    | "contract-analyzer"
    | "cv-creator"
    | "interview"
    | "laundry"
  >("salary-calculator");

  const [isMenuExpanded, setIsMenuExpanded] = useState(true);

  const handleToggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev);
  }, []);

  const progressWithCalculatedLevel = calculateCurrentLevel(
    userProgress,
    careerLevels,
  );

  const homeTiles = [
    {
      icon: Briefcase,
      title: "Porównaj oferty",
      description:
        "Łatwo porównuj warunki zatrudnienia, wynagrodzenie i benefity.",
      page: "jobs" as const,
    },
    {
      icon: TrendingUp,
      title: "Ścieżka rozwoju",
      description: "Poznaj wymagania do awansu i wyższych zarobków dzięki AI.",
      page: "career" as const,
    },
    {
      icon: CheckCircle2,
      title: "Walidacja formularza",
      description:
        "Sprawdź, czy formularz jest poprawnie wypełniony i zgodny z wymogami.",
      page: "contract-analyzer" as const,
    },
  ];

  return (
    <main className="flex min-h-screen bg-background">
      <Menu
        onNavigate={setCurrentPage}
        isExpanded={isMenuExpanded}
        onToggleMenu={handleToggleMenu}
      />

      <div
        className={cn(
          "flex-1 overflow-auto transition-all duration-500 ease-in-out",
          isMenuExpanded ? "ml-72" : "ml-20",
        )}
      >
        {currentPage === "jobs" && <JobsPage />}

        {currentPage === "career" && (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto text-center pt-12 px-6">
              <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight text-balance">
                Twoja Ścieżka Awansu
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Wykorzystujemy sztuczną inteligencję, aby przeanalizować Twoje
                dane i stworzyć plan, który zaprowadzi Cię do wymarzonych
                zarobków.
              </p>
            </div>
            <CareerAiPath />
          </div>
        )}

        {currentPage === "home" && (
          <div className="min-h-screen bg-background p-8 animate-in fade-in duration-500">
            <div className="max-w-5xl mx-auto">
              <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
                  Witaj w panelu analiz
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl text-pretty">
                  Wybierz funkcję z menu po lewej stronie, aby rozpocząć pracę z
                  narzędziami do analizy ofert pracy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {homeTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <Card
                      key={tile.title}
                      onClick={() => setCurrentPage(tile.page)}
                      className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
                    >
                      <CardHeader>
                        <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary mb-2">
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-lg">{tile.title}</CardTitle>
                        <CardDescription>{tile.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Otwórz <ArrowRight className="size-4" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentPage === "salary-calculator" && <JobFinderSalaryDashboard />}

        {currentPage === "contract-analyzer" && (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto text-center pt-12 px-6 mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight text-balance">
                Audyt Prawny AI
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Nie daj się oszukać. Nasz algorytm prześwietli każdą stronę
                Twojej przyszłej umowy.
              </p>
            </div>
            <ContractAnalyzer />
          </div>
        )}

        {currentPage === "cv-creator" && (
          <div className="animate-in fade-in duration-500">
            <CvCreator />
          </div>
        )}

        {currentPage === "taxes" && <TaxesPage />}

        {currentPage === "doctors" && <DoctorsAppointments />}

        {currentPage === "interview" && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-500 w-full">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight text-balance">
                Zdobądź swoją pierwszą pracę
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Spróbuj odpowiedzieć tak, żeby otrzymać posadę.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <InterviewSimulator />
            </div>
          </div>
        )}

        {currentPage === "laundry" && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-500 w-full">
            <div className="max-w-6xl mx-auto text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight text-balance">
                Mistrz Prania
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Wgraj zdjęcie metki, a AI podpowie jak wyprać Twoje ubrania.
              </p>
            </div>
            <LaundryAssistant />
          </div>
        )}
      </div>
    </main>
  );
}

function TaxesPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
              <Receipt className="size-5" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
              Podatki i Terminy
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl text-pretty">
            Kompleksowy przewodnik po odprowadzaniu podatków w Polsce z
            terminami i instrukcjami dla pracowników i przedsiębiorców.
          </p>
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <User className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Podatek Dochodowy od Osób Fizycznych (PIT)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="transition-all hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-primary">
                  PIT-37 (Pracownik)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  label="Stawka podatku"
                  value="17% lub 32% (w zależności od dochodu)"
                />
                <InfoRow
                  label="Termin złożenia"
                  value="Do 30 kwietnia roku następnego"
                  highlight
                />
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Co zawiera:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Dochody ze stanowiska pracy</li>
                    <li>Dodatkowe źródła dochodów</li>
                    <li>Ulga na dziecko</li>
                  </ul>
                </div>
                <InfoRow
                  label="Gdzie złożyć"
                  value="US (Urząd Skarbowy) lub online na podatki.gov.pl"
                />
              </CardContent>
            </Card>

            <Card className="transition-all hover:border-primary hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-primary">
                  PIT-36 (Przedsiębiorca)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow
                  label="Stawka podatku"
                  value="19% lub system ryczałtowy"
                />
                <InfoRow
                  label="Termin złożenia"
                  value="Do 30 kwietnia roku następnego"
                  highlight
                />
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Co zawiera:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Przychody z prowadzonej działalności</li>
                    <li>Rachunki i faktury</li>
                    <li>Koszty uzyskania przychodu</li>
                  </ul>
                </div>
                <InfoRow
                  label="Wymagane dokumenty"
                  value="KPiR, faktury, umowy"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Podatek Dochodowy od Osób Prawnych (CIT)
            </h2>
          </div>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <InfoRow
                label="Stawka podatku"
                value="19% dla spółek"
                emphasis
              />
              <InfoRow
                label="Termin złożenia"
                value="Do 31 marca roku następnego"
                highlight
              />
              <InfoRow
                label="Płatności zaliczkowe"
                value="Miesięczne lub kwartalne (zależy od przychodu)"
              />
              <InfoRow
                label="Gdzie złożyć"
                value="US lub elektronicznie na podatki.gov.pl"
              />
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Podatek od Towarów i Usług (VAT)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <VatCard
              rate="23%"
              description="Stawka obowiązkowa dla większości towarów i usług"
              example="np. elektronika, ubrania, przetworzone produkty spożywcze"
            />
            <VatCard
              rate="8%"
              description="Stawka obniżona dla wybranych towarów"
              example="np. artykuły spożywcze, opakowania"
            />
            <VatCard
              rate="5%"
              description="Stawka preferencyjna dla produktów pierwszej potrzeby"
              example="np. pieczywo, produkty mleczne, zioła medyczne"
            />
          </div>
          <Card>
            <CardContent>
              <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Terminy raportowania VAT
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow
                  label="Miesięczne rozliczenia"
                  value="Przed 25. dniem miesiąca następnego"
                />
                <InfoRow
                  label="Kwartalne rozliczenia"
                  value="Przed 25. dniem miesiąca następnego po zakończeniu kwartału"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Wallet className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Składki Ubezpieczeniowe
            </h2>
          </div>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-foreground mb-3">
                  Pracownik płaci:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Emerytura</span>
                    <span className="font-semibold text-primary">9.76%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Renta</span>
                    <span className="font-semibold text-primary">1.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Chorobowa</span>
                    <span className="font-semibold text-primary">2.45%</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-border text-foreground">
                    <span className="font-semibold">Razem</span>
                    <span className="font-bold">~13.71%</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-3">
                  Pracodawca płaci:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Emerytura</span>
                    <span className="font-semibold text-primary">9.76%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Renta wypadkowa</span>
                    <span className="font-semibold text-primary">6.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wypadkowa</span>
                    <span className="font-semibold text-primary">0.1%</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-border text-foreground">
                    <span className="font-semibold">Razem</span>
                    <span className="font-bold">~16.36%</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-5">
            <CalendarClock className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Najważniejsze Terminy w Roku
            </h2>
          </div>
          <div className="space-y-3">
            <DeadlineRow
              date="25 marca"
              text="Termin wpłaty CIT za poprzedni rok"
            />
            <DeadlineRow
              date="30 kwietnia"
              text="Złożenie PIT-37 / PIT-36 za poprzedni rok"
            />
            <DeadlineRow
              date="Cały rok"
              text="Miesięczne / kwartalne rozliczenia VAT"
            />
            <DeadlineRow
              date="10. każdego miesiąca"
              text="Wpłata składek ZUS dla przedsiębiorców"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
  emphasis,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="font-semibold text-foreground mb-0.5">{label}:</p>
      <p
        className={cn(
          "text-muted-foreground",
          highlight && "text-primary font-semibold",
          emphasis && "text-foreground font-semibold",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function VatCard({
  rate,
  description,
  example,
}: {
  rate: string;
  description: string;
  example: string;
}) {
  return (
    <Card className="transition-all hover:border-primary hover:shadow-md">
      <CardContent>
        <div className="text-4xl font-bold text-primary mb-3">{rate}</div>
        <p className="text-sm text-foreground mb-3 leading-relaxed">
          {description}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {example}
        </p>
      </CardContent>
    </Card>
  );
}

function DeadlineRow({ date, text }: { date: string; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary transition-all">
      <div className="flex size-9 items-center justify-center rounded-md bg-accent text-primary shrink-0">
        <CalendarClock className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-primary mr-2">{date}</span>
        <span className="text-sm text-foreground">&mdash; {text}</span>
      </div>
    </div>
  );
}

// Legacy export for any external reference
export type { CareerPath };
