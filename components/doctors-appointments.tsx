"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, Plus, X, AlertCircle, CheckCircle, Calendar, Clock, User } from "lucide-react";
import { toast } from "react-toastify";

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
  icon: string;
}

const DISEASE_DATABASE: { [key: string]: DiseaseRisk[] } = {
  "ból głowy, gorączka, kaszель": [
    { disease: "Grypa", probability: 85, description: "Potencjalna infekcja wirusowa", severity: "high", icon: "🦠" },
    { disease: "Przeziębienie", probability: 70, description: "Infekcja wirusowa górnych dróg oddechowych", severity: "medium", icon: "🤧" },
    { disease: "COVID-19", probability: 60, description: "Należy wykonać test", severity: "high", icon: "⚠️" },
  ],
  "ból gardła, kaszel": [
    { disease: "Angina", probability: 75, description: "Niezbędna wizyta u lekarza", severity: "high", icon: "🔴" },
    { disease: "Faringitis", probability: 70, description: "Zapalenie gardła", severity: "medium", icon: "🤕" },
  ],
  "wysypka, swędzenie": [
    { disease: "Egzema", probability: 65, description: "Zapalenie skóry", severity: "medium", icon: "💔" },
    { disease: "Alergia", probability: 80, description: "Przyczyn może być wiele", severity: "medium", icon: "🦟" },
    { disease: "Dermatitis", probability: 70, description: "Zapalenie dermy", severity: "medium", icon: "🔴" },
  ],
  "zmęczenie, osłabienie": [
    { disease: "Anemii", probability: 60, description: "Niedobór żelaza", severity: "high", icon: "😴" },
    { disease: "Hipotirydyzm", probability: 55, description: "Problem z tarczycą", severity: "medium", icon: "⚡" },
    { disease: "Depresja", probability: 40, description: "Zaburzenie psychiczne", severity: "high", icon: "😔" },
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

  // Check for upcoming appointments and generate notifications
  useEffect(() => {
    const checkAppointments = () => {
      const today = new Date();

      appointments.forEach((apt) => {
        const aptDate = new Date(apt.date);
        const daysUntil = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Toast notification for today
        if (daysUntil === 0) {
          toast.error(
            <div className="flex flex-col">
              <div className="font-bold text-black">Wizyta dzisiaj! </div>
              <div className="text-sm text-black">{apt.doctor} • {apt.time}</div>
            </div>,
            {
              autoClose: 7000,
            }
          );
        }
        // Toast notification for tomorrow
        else if (daysUntil === 1) {
          toast.warning(
            <div className="flex flex-col">
              <div className="font-bold text-black">Jutro wizyta!</div>
              <div className="text-sm text-black">{apt.doctor} • {new Date(apt.date).toLocaleDateString('pl-PL')}</div>
            </div>,
            {
              autoClose: 7000,
            }
          );
        }
        // Toast reminder for appointments in 7 days
        else if (daysUntil === 7) {
          toast.info(
            <div className="flex flex-col">
              <div className="font-bold">Wizyta za 7 dni 🔔</div>
              <div className="text-sm">{apt.doctor} • {new Date(apt.date).toLocaleDateString('pl-PL')}</div>
            </div>,
            {
              autoClose: 6000,
            }
          );
        }
      });
    };

    checkAppointments();
    // Check every hour
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

      // Predict diseases based on symptoms
      const symptomKey = formData.symptoms.toLowerCase();
      let predictedRisks: DiseaseRisk[] = [];
      
      for (const [key, diseases] of Object.entries(DISEASE_DATABASE)) {
        if (symptomKey.includes(key.split(",")[0].toLowerCase()) || 
            symptomKey.includes(key.split(",")[1]?.toLowerCase()) ||
            symptomKey.includes(key.split(",")[2]?.toLowerCase())) {
          predictedRisks = [...predictedRisks, ...diseases];
        }
      }

      if (predictedRisks.length === 0) {
        predictedRisks = [
          { disease: "Potrzebna konsultacja", probability: 50, description: "Objawy wymagają badania lekarskiego", severity: "medium", icon: "🔍" },
        ];
      }

      setPredictedDiseases(predictedRisks.sort((a, b) => b.probability - a.probability));
      setFormData({ date: "", time: "", doctor: "", specialty: "", symptoms: "", notes: "" });
      setShowForm(false);
    }
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-700";
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-green-50 border-green-200 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Wizyty u Lekarza</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Planuj wizyty i monitoruj swoje zdrowie. System przewiduje potencjalne choroby na podstawie symptomów.
          </p>
        </div>

        {/* Add Appointment Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Dodaj nową wizytę
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Zaplanuj wizytę</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Data wizyty"
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Godzina"
              />
              <input
                type="text"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Imię i nazwisko lekarza"
              />
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Specjalność (np. Kardiolog)"
              />
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:col-span-2"
                placeholder="Objawy (rozdzielone przecinkami, np: ból głowy, gorączka, kaszel)"
                rows={3}
              />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:col-span-2"
                placeholder="Dodatkowe notatki"
                rows={3}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAppointment}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                Zaplanuj wizytę
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Predicted Diseases */}
        {predictedDiseases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              Analiza objawów
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictedDiseases.slice(0, 6).map((disease, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${getSeverityColor(disease.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl">{disease.icon}</div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{disease.probability}%</p>
                      <p className="text-xs opacity-75">Prawdopodobieństwo</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{disease.disease}</h3>
                  <p className="text-sm opacity-90">{disease.description}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-sm mt-4">
              ⚠️ Ta analiza jest tylko informacyjna. Zawsze skonsultuj się z lekarzem przed podjęciem decyzji medycznych.
            </p>
          </div>
        )}

        {/* Appointments List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Moje wizyty ({appointments.length})
          </h2>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Nie masz jeszcze zaplanowanych wizyt</p>
              </div>
            ) : (
              appointments.map((apt) => {
                const aptDate = new Date(apt.date);
                const today = new Date();
                const daysUntil = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <User className="w-5 h-5" />
                          <span className="font-semibold text-slate-900">{apt.doctor}</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                          {apt.specialty}
                        </span>
                        {daysUntil >= 0 && daysUntil <= 7 && (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            daysUntil === 0 
                              ? "bg-red-100 text-red-700" 
                              : daysUntil === 1 
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {daysUntil === 0 ? "Dzisiaj!" : daysUntil === 1 ? "Jutro" : `Za ${daysUntil} dni`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mb-3 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(apt.date).toLocaleDateString("pl-PL")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      {apt.symptoms.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-600 mb-2">Objawy:</p>
                          <div className="flex flex-wrap gap-2">
                            {apt.symptoms.map((symptom, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {apt.notes && (
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">Notatki:</span> {apt.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Porady zdrowotne
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li>✓ Regularnie odwiedzaj dentystę (co 6 miesięcy)</li>
            <li>✓ Rób badania profilaktyczne raz w roku</li>
            <li>✓ Utrzymuj zdrową dietę i aktywność fizyczną</li>
            <li>✓ Śpij regularnie 7-8 godzin dziennie</li>
            <li>✓ Monitoruj swoje objawy i nie ignoruj niepokojących zmian</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
