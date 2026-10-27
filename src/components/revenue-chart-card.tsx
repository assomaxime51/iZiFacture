"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Check,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pencil,
  Sparkles,
  TrendingUp,
  X,
} from "@/components/icons";

type PeriodKey = "12m" | "s1" | "s2" | "t2";

interface PeriodConfig {
  label: string;
  subLabel: string;
  months: string[];
  data: number[];
  currentValue: string;
  change: string;
  isPositive: boolean;
}

const periodConfigs: Record<PeriodKey, PeriodConfig> = {
  "12m": {
    label: "12 derniers mois",
    subLabel: "Comparaison sur les 12 derniers mois",
    months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
    data: [38, 48, 42, 58, 52, 70, 61, 79, 73, 88, 81, 96],
    currentValue: "1 180k",
    change: "+14,6 %",
    isPositive: true,
  },
  s1: {
    label: "Semestre 1 (Jan - Juin)",
    subLabel: "Données du premier semestre 2024",
    months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
    data: [38, 48, 42, 58, 52, 70],
    currentValue: "940k",
    change: "+8,2 %",
    isPositive: true,
  },
  s2: {
    label: "Semestre 2 (Juil - Déc)",
    subLabel: "Données prévisionnelles du deuxième semestre",
    months: ["Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
    data: [61, 79, 73, 88, 81, 96],
    currentValue: "1 180k",
    change: "+14,6 %",
    isPositive: true,
  },
  t2: {
    label: "Trimestre 2 (Avr - Juin)",
    subLabel: "Données du deuxième trimestre 2024",
    months: ["Avr", "Mai", "Juin"],
    data: [58, 52, 70],
    currentValue: "1 050k",
    change: "+11,3 %",
    isPositive: true,
  },
};

export default function RevenueChartCard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("12m");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState("1 500 000");
  const [tempGoal, setTempGoal] = useState("1 500 000");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const current = periodConfigs[selectedPeriod];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCsv = () => {
    setMenuOpen(false);
    // Generate CSV data
    const headers = ["Mois", "Encaissement (FCFA)", "Indice"];
    const rows = current.months.map((m, idx) => [
      m,
      `${(current.data[idx] * 12500).toLocaleString("fr-FR")} FCFA`,
      current.data[idx],
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `evolution_encaissements_${selectedPeriod}_izifacture.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Export CSV téléchargé avec succès !");
  };

  const handleExportPdf = () => {
    setMenuOpen(false);
    showToast("Génération du rapport PDF en cours...");
    setTimeout(() => {
      showToast("Rapport PDF exporté avec succès !");
    }, 1000);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setMonthlyGoal(tempGoal);
    setShowGoalModal(false);
    showToast(`Objectif mensuel mis à jour : ${tempGoal} FCFA`);
  };

  // SVG Chart calculation
  const totalCount = current.data.length;
  const step = totalCount > 1 ? 100 / (totalCount - 1) : 100;
  const points = current.data
    .map((val, idx) => `${idx * step} ${108 - val}`)
    .join(" ");
  const areaPoints = `0 108 ${points} 100 108`;

  return (
    <article className="animate-rise relative rounded-2xl border border-[#e7ece7] bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(34,63,44,.025)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-rise">
          <Check size={15} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title & 3-dots Menu */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] font-bold tracking-[-0.03em] text-[#17221d]">
              Évolution des encaissements
            </h3>
            <span className="rounded-md bg-[#edf6ef] px-2 py-0.5 text-[10px] font-bold text-[#4f8665]">
              {current.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8a968e]">{current.subLabel}</p>
        </div>

        {/* 3 dots action menu */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label="Options du graphique"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`rounded-lg p-2 transition ${
              menuOpen
                ? "bg-[#edf6ef] text-[#4f8665]"
                : "text-[#8a968e] hover:bg-[#f3f5f1] hover:text-[#17221d]"
            }`}
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Menu Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-xl border border-[#e2e7e2] bg-white shadow-xl animate-rise">
              {/* Period selection */}
              <div className="border-b border-[#e7ece7] p-2">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#829087]">
                  Période
                </p>
                {(Object.keys(periodConfigs) as PeriodKey[]).map((key) => {
                  const item = periodConfigs[key];
                  const isSelected = selectedPeriod === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedPeriod(key);
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#edf6ef] text-[#4f8665]"
                          : "text-[#17221d] hover:bg-[#f7f9f6]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check size={13} />}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="p-2 space-y-0.5">
                <button
                  onClick={handleExportCsv}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#17221d] hover:bg-[#f7f9f6] transition"
                >
                  <Download size={14} className="text-[#829087]" />
                  <span>Exporter en CSV</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#17221d] hover:bg-[#f7f9f6] transition"
                >
                  <FileText size={14} className="text-[#829087]" />
                  <span>Exporter le rapport PDF</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setTempGoal(monthlyGoal);
                    setShowGoalModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#17221d] hover:bg-[#f7f9f6] transition"
                >
                  <Pencil size={14} className="text-[#829087]" />
                  <span>Modifier l&apos;objectif mensuel</span>
                </button>
                <Link
                  href="/reports"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#4f8665] hover:bg-[#edf6ef] transition"
                >
                  <Eye size={14} />
                  <span>Voir le rapport complet</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart and stats side-by-side */}
      <div className="flex overflow-x-auto">
        {/* SVG Curve Chart */}
        <div className="relative h-[178px] min-w-[300px] flex-1 sm:min-w-[440px]">
          {/* Y-axis labels */}
          <div className="absolute inset-0 flex flex-col justify-between pb-7 pt-2 text-[10px] text-[#9aa69e]">
            <span>1 000k</span>
            <span>750k</span>
            <span>500k</span>
            <span>250k</span>
            <span>0</span>
          </div>

          {/* SVG Canvas */}
          <svg
            viewBox="0 0 100 120"
            preserveAspectRatio="none"
            className="absolute inset-x-8 bottom-7 top-2 h-[140px] w-[calc(100%-40px)] overflow-visible"
          >
            {/* Grid horizontal lines */}
            <line x1="0" x2="100" y1="108" y2="108" stroke="#e7ece7" strokeWidth="0.7" />
            <line x1="0" x2="100" y1="81" y2="81" stroke="#edf1ed" strokeWidth="0.7" strokeDasharray="1 2" />
            <line x1="0" x2="100" y1="54" y2="54" stroke="#edf1ed" strokeWidth="0.7" strokeDasharray="1 2" />
            <line x1="0" x2="100" y1="27" y2="27" stroke="#edf1ed" strokeWidth="0.7" strokeDasharray="1 2" />

            {/* Area Fill */}
            <polygon points={areaPoints} fill="#dcecdf" opacity=".75" className="transition-all duration-300" />

            {/* Line Stroke */}
            <polyline
              points={points}
              fill="none"
              stroke="#4f8665"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Interactive Data Dots */}
            {current.data.map((val, idx) => {
              const cx = idx * step;
              const cy = 108 - val;
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? "3.5" : "2"}
                    fill="#4f8665"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="cursor-pointer transition-all duration-150 hover:r-4"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* X-axis months */}
          <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] text-[#9aa69e]">
            {current.months.map((month, idx) => (
              <span
                key={month}
                className={`transition ${
                  hoveredIndex === idx ? "font-bold text-[#4f8665]" : ""
                }`}
              >
                {month}
              </span>
            ))}
          </div>
        </div>

        {/* Summary side box */}
        <div className="hidden w-[140px] shrink-0 flex-col justify-center border-l border-[#e7ece7] pl-6 sm:flex">
          <span className="text-[11px] text-[#8a968e]">Ce mois-ci</span>
          <strong className="mt-1 font-display text-[21px] font-extrabold tracking-[-.05em] text-[#17221d]">
            {current.currentValue}
          </strong>
          <span
            className={`mt-2 flex items-center gap-1 text-[11px] font-bold ${
              current.isPositive ? "text-[#4f8665]" : "text-[#ba5d51]"
            }`}
          >
            {current.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {current.change}
          </span>
          <div className="mt-3 pt-3 border-t border-[#f0f3ef]">
            <span className="text-[9px] text-[#9aa69e] uppercase font-bold tracking-wider">Objectif</span>
            <p className="text-[11px] font-semibold text-[#55635a]">{monthlyGoal} F</p>
          </div>
        </div>
      </div>

      {/* Goal Edit Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setShowGoalModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#e2e7e2] bg-white p-6 shadow-2xl animate-rise">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-base font-bold text-[#17221d]">
                Modifier l&apos;objectif mensuel
              </h4>
              <button
                onClick={() => setShowGoalModal(false)}
                className="rounded-lg p-1 text-[#829087] hover:bg-[#eceee9]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#728078] mb-4">
              Définissez votre cible de chiffre d&apos;affaires ou d&apos;encaissements pour le mois en cours.
            </p>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17221d] mb-1.5">
                  Montant de l&apos;objectif (FCFA)
                </label>
                <input
                  type="text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  placeholder="Ex: 1 500 000"
                  className="w-full rounded-xl border border-[#e7ece7] px-3.5 py-2.5 text-sm font-semibold text-[#17221d] outline-none focus:border-[#4f8665] focus:ring-2 focus:ring-[#dcecdf]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-xl border border-[#e7ece7] px-4 py-2 text-xs font-bold text-[#55635a] hover:bg-[#f3f5f1]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4f8665] px-4 py-2 text-xs font-bold text-white hover:bg-[#3f7053]"
                >
                  Enregistrer l&apos;objectif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
