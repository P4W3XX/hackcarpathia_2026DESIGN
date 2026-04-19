"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
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
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  symptoms: string[];
  notes: string;
}

interface DiseaseRisk {
  disease: string;
  probability: number;
  description: string;
  severity: "low" | "medium" | "high";
}

const DISEASE_DATABASE: { [key: string]: DiseaseRisk[] } = {
  "ból głowy, gorączka, kaszел": [
    {
      disease: "Grypa",
      probability: 85,
      description: "Potencjalna infekcja wirusowa",
      severity: "high",
    },
    {
      disease: "Przeziębienie",
      probability: 70,
      description: "Infekcja wirusowa górnych dróg oddechowych",
      severity: "medium",
    },
    {
      disease: "COVID-19",
      probability: 60,
      description: "Należy wykonać test",
      severity: "high",
    },
  ],
  "ból gardła, kaszel": [
    {
      disease: "Angina",
      probability: 75,
      description: "Niezbędna wizyta u lekarza",
      severity: "high",
    },
    {
      disease: "Faringitis",
      probability: 70,
      description: "Zapalenie gardła",
      severity: "medium",
    },
  ],
  "wysypka, swędzenie": [
    {
      disease: "Egzema",
      probability: 65,
      description: "Zapalenie skóry",
      severity: "medium",
    },
    {
      disease: "Alergia",
      probability: 80,
      description: "Przyczyn może być wiele",
      severity: "medium",
    },
    {
      disease: "Dermatitis",
      probability: 70,
      description: "Zapalenie dermy",
      severity: "medium",
    },
  ],
  "zmęczenie, osłabienie": [
    {
      disease: "Anemia",
      probability: 60,
      description: "Niedobór żelaza",
      severity: "high",
    },
    {
      disease: "Hipotyreoza",
      probability: 55,
      description: "Problem z tarczycą",
      severity: "medium",
    },
    {
      disease: "Depresja",
      probability: 40,
      description: "Zaburzenie psychiczne",
      severity: "high",
    },
  ],
};

export const DoctorsAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      date: "2026-04-20",
      time: "10:00",
      doctor: "Dr Anna Nowak",
      specialty: "Internista",
      symptoms: ["ból głowy", "zmęczenie"],
      notes: "Pierwsze badanie.",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    doctor: "",
    specialty: "",
    symptoms: "",
    notes: "",
  });

  const [predictedDiseases, setPredictedDiseases] = useState<DiseaseRisk[]>([]);

  useEffect(() => {
    const checkAppointments = () => {
      const today = new Date();

      appointments.forEach((apt) => {
        const aptDate = new Date(apt.date);
        const daysUntil = Math.ceil(
          (aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntil === 0) {
          toast.error(
            <div className="flex flex-col">
              <div className="font-semibold">Wizyta dzisiaj!</div>
              <div className="text-sm">
                {apt.doctor} &bull; {apt.time}
              </div>
            </div>,
            { autoClose: 7000 },
          );
        } else if (daysUntil === 1) {
          toast.warning(
            <div className="flex flex-col">
              <div className="font-semibold">Jutro wizyta</div>
              <div className="text-sm">
                {apt.doctor} &bull;{" "}
                {new Date(apt.date).toLocaleDateString("pl-PL")}
              </div>
            </div>,
            { autoClose: 7000 },
          );
        } else if (daysUntil === 7) {
          toast.info(
            <div className="flex flex-col">
              <div className="font-semibold">Wizyta za 7 dni</div>
              <div className="text-sm">
                {apt.doctor} &bull;{" "}
                {new Date(apt.date).toLocaleDateString("pl-PL")}
              </div>
            </div>,
            { autoClose: 6000 },
          );
        }
      });
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 3600000);
    return () => clearInterval(interval);
  }, [appointments]);

  const handleAddAppointment = () => {
    if (formData.date && formData.time && formData.doctor) {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        date: formData.date,
        time: formData.time,
        doctor: formData.doctor,
        specialty: formData.specialty,
        symptoms: formData.symptoms.split(",").map((s) => s.trim()),
        notes: formData.notes,
      };

      setAppointments([...appointments, newAppointment]);

      const symptomKey = formData.symptoms.toLowerCase();
      let predictedRisks: DiseaseRisk[] = [];

      for (const [key, diseases] of Object.entries(DISEASE_DATABASE)) {
        if (
          symptomKey.includes(key.split(",")[0].toLowerCase()) ||
          symptomKey.includes(key.split(",")[1]?.toLowerCase()) ||
          symptomKey.includes(key.split(",")[2]?.toLowerCase())
        ) {
          predictedRisks = [...predictedRisks, ...diseases];
        }
      }

      if (predictedRisks.length === 0) {
        predictedRisks = [
          {
            disease: "Potrzebna konsultacja",
            probability: 50,
            description: "Objawy wymagają badania lekarskiego",
            severity: "medium",
          },
        ];
      }

      setPredictedDiseases(
        predictedRisks.sort((a, b) => b.probability - a.probability),
      );
      setFormData({
        date: "",
        time: "",
        doctor: "",
        specialty: "",
        symptoms: "",
        notes: "",
      });
      setShowForm(false);
    }
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return ShieldAlert;
      case "medium":
        return Thermometer;
      default:
        return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
              <Stethoscope className="size-5" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
              Wizyty u Lekarza
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl text-pretty">
            Planuj wizyty i monitoruj swoje zdrowie. System przewiduje
            potencjalne choroby na podstawie symptomów.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          size="lg"
          className="mb-6"
        >
          <Plus className="size-4" />
          Dodaj nową wizytę
        </Button>

        {showForm && (
          <Card className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle>Zaplanuj wizytę</CardTitle>
              <CardDescription>
                Podaj szczegóły wizyty i objawy, aby uzyskać analizę.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Data wizyty</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Godzina</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Imię i nazwisko lekarza
                  </Label>
                  <Input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) =>
                      setFormData({ ...formData, doctor: e.target.value })
                    }
                    placeholder="Dr Jan Kowalski"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Specjalność</Label>
                  <Input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    placeholder="np. Kardiolog"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">Objawy</Label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData({ ...formData, symptoms: e.target.value })
                    }
                    placeholder="Rozdzielone przecinkami: ból głowy, gorączka, kaszel"
                    rows={3}
                    className="w-full p-3 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-sm font-medium">
                    Dodatkowe notatki
                  </Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full p-3 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button onClick={handleAddAppointment}>
                  Zaplanuj wizytę
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Anuluj
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {predictedDiseases.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle className="size-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Analiza objawów
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictedDiseases.slice(0, 6).map((disease, idx) => {
                const Icon = severityIcon(disease.severity);
                return (
                  <Card
                    key={idx}
                    className={cn(
                      disease.severity === "high" &&
                        "border-destructive/40 bg-destructive/5",
                    )}
                  >
                    <CardContent>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-md",
                            disease.severity === "high"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent text-primary",
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-foreground">
                            {disease.probability}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prawdopodobieństwo
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {disease.disease}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {disease.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs mt-4 flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              Ta analiza jest tylko informacyjna. Zawsze skonsultuj się z
              lekarzem przed podjęciem decyzji medycznych.
            </p>
          </div>
        )}

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Moje wizyty ({appointments.length})
            </h2>
          </div>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <div className="size-16 rounded-full bg-accent text-primary flex items-center justify-center mb-3">
                    <Stethoscope className="size-7" />
                  </div>
                  <p className="text-muted-foreground">
                    Nie masz jeszcze zaplanowanych wizyt.
                  </p>
                </CardContent>
              </Card>
            ) : (
              appointments.map((apt) => {
                const aptDate = new Date(apt.date);
                const today = new Date();
                const daysUntil = Math.ceil(
                  (aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                );

                return (
                  <Card
                    key={apt.id}
                    className="transition-all hover:border-primary hover:shadow-md"
                  >
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                              <User className="size-4 text-primary" />
                              <span>{apt.doctor}</span>
                            </div>
                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                              {apt.specialty}
                            </span>
                            {daysUntil >= 0 && daysUntil <= 7 && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                                  daysUntil === 0
                                    ? "bg-destructive/10 text-destructive border border-destructive/30"
                                    : "bg-accent text-primary border border-primary/30",
                                )}
                              >
                                {daysUntil === 0
                                  ? "Dzisiaj!"
                                  : daysUntil === 1
                                    ? "Jutro"
                                    : `Za ${daysUntil} dni`}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-5 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-4" />
                              <span>
                                {new Date(apt.date).toLocaleDateString("pl-PL")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-4" />
                              <span>{apt.time}</span>
                            </div>
                          </div>

                          {apt.symptoms.filter(Boolean).length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide font-semibold">
                                Objawy
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {apt.symptoms.filter(Boolean).map((symptom, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
                                  >
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {apt.notes && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                Notatki:
                              </span>{" "}
                              {apt.notes}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteAppointment(apt.id)}
                          className="shrink-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                          aria-label="Usuń wizytę"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-primary" />
              <CardTitle>Porady zdrowotne</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm text-foreground">
              {[
                "Regularnie odwiedzaj dentystę (co 6 miesięcy)",
                "Rób badania profilaktyczne raz w roku",
                "Utrzymuj zdrową dietę i aktywność fizyczną",
                "Śpij regularnie 7–8 godzin dziennie",
                "Monitoruj swoje objawy i nie ignoruj niepokojących zmian",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
