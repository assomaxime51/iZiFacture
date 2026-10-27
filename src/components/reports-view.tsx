"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Download,
  FileText,
  PieChart,
  Sparkles,
  TrendingUp,
} from "@/components/icons";
import { fetchFactures } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { formatXof } from "@/data/app-data";

type PeriodType = "Ce mois-ci" | "Ce trimestre" | "12 derniers mois";
type ChartType = "bars" | "line";

interface ChartBarData {
  label: string;
  invoiced: number; // in FCFA
  collected: number; // in FCFA
}

interface PeriodReportData {
  title: string;
  subtitle: string;
  revenue: string;
  revenueChange: string;
  isRevenueUp: boolean;
  paid: string;
  paidChange: string;
  isPaidUp: boolean;
  pending: string;
  pendingChange: string;
  isPendingUp: boolean;
  bars: ChartBarData[];
  maxScale: number; // for calculating bar height
}

const emptyReport: PeriodReportData = {
  title: "Aucune donnée pour le moment",
  subtitle: "Vos rapports financiers apparaîtront ici dès que vous aurez des factures et des paiements.",
  revenue: "0 FCFA",
  revenueChange: "0 %",
  isRevenueUp: true,
  paid: "0 FCFA",
  paidChange: "0 %",
  isPaidUp: true,
  pending: "0 FCFA",
  pendingChange: "0 %",
  isPendingUp: false,
  maxScale: 1,
  bars: [],
};

const reportsData: Record<PeriodType, PeriodReportData> = {
  "Ce mois-ci": emptyReport,
  "Ce trimestre": emptyReport,
  "12 derniers mois": emptyReport,
};

export default function ReportsView() {
  const { entreprise } = useAuth();
  const [period, setPeriod] = useState<PeriodType>("Ce mois-ci");
  const [chartType, setChartType] = useState<ChartType>("bars");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFactures(undefined, undefined, entreprise?.id);
        setInvoices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors du chargement des rapports:", error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [entreprise?.id]);

  const isEmptyState = !loading && invoices.length === 0;

  const currentReport = useMemo(() => {
    if (loading) return emptyReport;
    if (invoices.length === 0) return emptyReport;

    const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    const paidRevenue = invoices
      .filter((invoice) => invoice.status === "Payee")
      .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);
    const pendingRevenue = invoices
      .filter((invoice) => invoice.status === "Envoyee" || invoice.status === "En retard")
      .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);

    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Jui", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const monthData = Array.from({ length: 6 }, (_, idx) => {
      const monthIndex = new Date().getMonth() - (5 - idx);
      const normalizedMonth = (monthIndex + 12) % 12;
      const year = new Date().getFullYear() + (monthIndex < 0 ? -1 : 0);
      const monthName = `${monthLabels[normalizedMonth]} ${year}`;
      const monthValue = invoices
        .filter((invoice) => {
          if (!invoice.date) return false;
          const invoiceDate = new Date(invoice.date);
          return invoiceDate.getMonth() === normalizedMonth && invoiceDate.getFullYear() === year;
        })
        .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0);

      return {
        label: monthName,
        invoiced: monthValue,
        collected: invoices
          .filter((invoice) => {
            if (!invoice.date) return false;
            const invoiceDate = new Date(invoice.date);
            return invoiceDate.getMonth() === normalizedMonth && invoiceDate.getFullYear() === year && invoice.status === "Payee";
          })
          .reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0),
      };
    });

    const maxScale = Math.max(1, ...monthData.map((month) => month.invoiced));

    return {
      title: "Vue générale",
      subtitle: "Synthèse basée sur les factures enregistrées dans votre espace de travail.",
      revenue: formatXof(totalRevenue),
      revenueChange: "+0 %",
      isRevenueUp: true,
      paid: formatXof(paidRevenue),
      paidChange: "+0 %",
      isPaidUp: true,
      pending: formatXof(pendingRevenue),
      pendingChange: "0 %",
      isPendingUp: false,
      maxScale,
      bars: monthData,
    };
  }, [invoices, loading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCsv = () => {
    if (isEmptyState) {
      showToast("Aucune donnée à exporter pour le moment.");
      return;
    }

    const headers = ["Période", "Total Facturé (FCFA)", "Total Encaissé (FCFA)", "Solde en attente (FCFA)"];
    const rows = currentReport.bars.map((b) => [
      b.label,
      b.invoiced,
      b.collected,
      b.invoiced - b.collected,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rapport_financier_${period.toLowerCase().replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Rapport financier CSV exporté avec succès !");
  };

  // SVG calculations for line chart
  const step =
    currentReport.bars.length > 1
      ? 100 / (currentReport.bars.length - 1)
      : 100;

  if (isEmptyState) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-white p-1.5 shadow-sm">
            {(["Ce mois-ci", "Ce trimestre", "12 derniers mois"] as PeriodType[]).map((item) => (
              <button
                key={item}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition duration-150 ${
                  period === item
                    ? "bg-[#4f8665] text-white shadow-sm"
                    : "text-[#728078] hover:bg-[#f3f7f2] hover:text-[#17221d]"
                }`}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-[#829087] opacity-60"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>

        <div className="ds-card flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#edf6ef] text-[#4f8665]">
            <BarChart3 size={28} />
          </div>
          <h3 className="font-display text-2xl font-bold text-[#17221d]">Aucun rapport pour le moment</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#728078]">
            Dès que vous créerez des factures et enregistrerez des paiements, vos chiffres et graphiques apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }
  
  const invoicedPoints = currentReport.bars
    .map(
      (b, i) =>
        `${i * step} ${100 - (b.invoiced / currentReport.maxScale) * 85}`
    )
    .join(" ");

  const collectedPoints = currentReport.bars
    .map(
      (b, i) =>
        `${i * step} ${100 - (b.collected / currentReport.maxScale) * 85}`
    )
    .join(" ");

  const collectedAreaPoints = `0 100 ${collectedPoints} 100 100`;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#17221d] px-4 py-3 text-xs font-bold text-white shadow-xl animate-rise">
          <Check size={16} className="text-[#b7d8bf]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-white p-1.5 shadow-sm">
          {(["Ce mois-ci", "Ce trimestre", "12 derniers mois"] as PeriodType[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => {
                  setPeriod(item);
                  setHoveredBarIndex(null);
                }}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition duration-150 ${
                  period === item
                    ? "bg-[#4f8665] text-white shadow-sm"
                    : "text-[#728078] hover:bg-[#f3f7f2] hover:text-[#17221d]"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-[#17221d] hover:border-[#c8d8ca] hover:bg-[#f3f7f2] transition"
          >
            <Download size={14} className="text-[#4f8665]" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* KPI Cards (3 Cards) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Chiffre d'affaires */}
        <article className="ds-card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e1f3e6] text-[#2d7b4c]">
              <TrendingUp size={16} />
            </span>
            <span className="rounded-full bg-[#e1f3e6] px-2 py-0.5 text-[10px] font-bold text-[#2d7b4c]">
              Facturé
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#829087]">Chiffre d&apos;affaires</p>
          <strong className="mt-1 block font-display text-2xl font-extrabold tracking-[-.04em] text-ink">
            {currentReport.revenue}
          </strong>
          <span className="mt-2 flex items-center gap-1 text-xs font-bold text-[#4f8665]">
            {currentReport.isRevenueUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {currentReport.revenueChange}{" "}
            <span className="font-normal text-[#829087]">vs. période précédente</span>
          </span>
        </article>

        {/* Factures payées */}
        <article className="ds-card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e4eef8] text-[#3c6c91]">
              <BarChart3 size={16} />
            </span>
            <span className="rounded-full bg-[#e4eef8] px-2 py-0.5 text-[10px] font-bold text-[#3c6c91]">
              Encaissé
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#829087]">Factures payées</p>
          <strong className="mt-1 block font-display text-2xl font-extrabold tracking-[-.04em] text-ink">
            {currentReport.paid}
          </strong>
          <span className="mt-2 flex items-center gap-1 text-xs font-bold text-[#3c6c91]">
            <ArrowUpRight size={14} />
            {currentReport.paidChange}{" "}
            <span className="font-normal text-[#829087]">vs. période précédente</span>
          </span>
        </article>

        {/* En attente */}
        <article className="ds-card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#fbefdb] text-[#ba8540]">
              <FileText size={16} />
            </span>
            <span className="rounded-full bg-[#fbefdb] px-2 py-0.5 text-[10px] font-bold text-[#ba8540]">
              À recouvrer
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#829087]">En attente de paiement</p>
          <strong className="mt-1 block font-display text-2xl font-extrabold tracking-[-.04em] text-ink">
            {currentReport.pending}
          </strong>
          <span className="mt-2 flex items-center gap-1 text-xs font-bold text-[#ba8540]">
            <ArrowDownRight size={14} />
            {currentReport.pendingChange}{" "}
            <span className="font-normal text-[#829087]">vs. période précédente</span>
          </span>
        </article>
      </div>

      {/* Main Chart Section */}
      <section className="ds-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-ink">
                Évolution des revenus
              </h2>
              <span className="rounded-md bg-[#edf6ef] px-2.5 py-0.5 text-xs font-bold text-[#4f8665]">
                {currentReport.title}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#829087]">{currentReport.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#4f8665]" />
                <span className="text-[#55635a]">Facturé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#82aeca]" />
                <span className="text-[#55635a]">Encaissé</span>
              </div>
            </div>

            {/* View Switcher (Bars / Line) */}
            <div className="flex items-center rounded-lg border border-line bg-[#f7f8f4] p-0.5">
              <button
                onClick={() => setChartType("bars")}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  chartType === "bars"
                    ? "bg-white text-[#17221d] shadow-xs"
                    : "text-[#829087] hover:text-[#17221d]"
                }`}
              >
                Colonnes
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  chartType === "line"
                    ? "bg-white text-[#17221d] shadow-xs"
                    : "text-[#829087] hover:text-[#17221d]"
                }`}
              >
                Courbe
              </button>
            </div>
          </div>
        </div>

        {/* Active Hover Tooltip Indicator */}
        {hoveredBarIndex !== null && currentReport.bars[hoveredBarIndex] && (
          <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl bg-[#f7f9f6] border border-[#dcecdf] px-4 py-2.5 animate-rise">
            <span className="text-xs font-bold text-ink">
              📅 {currentReport.bars[hoveredBarIndex].label}
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-[#2d7b4c]">
                Facturé :{" "}
                <strong>
                  {currentReport.bars[hoveredBarIndex].invoiced.toLocaleString("fr-FR")}{" "}
                  FCFA
                </strong>
              </span>
              <span className="text-[#3c6c91]">
                Encaissé :{" "}
                <strong>
                  {currentReport.bars[hoveredBarIndex].collected.toLocaleString("fr-FR")}{" "}
                  FCFA
                </strong>
              </span>
              <span className="text-[#ba8540]">
                Attente :{" "}
                <strong>
                  {(
                    currentReport.bars[hoveredBarIndex].invoiced -
                    currentReport.bars[hoveredBarIndex].collected
                  ).toLocaleString("fr-FR")}{" "}
                  FCFA
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Diagram Rendering Area */}
        <div className="mt-6">
          {chartType === "bars" ? (
            /* Bar Chart View */
            <div className="relative">
              {/* Y-Axis guide lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] text-[#a6b0aa]">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right">
                    {(currentReport.maxScale / 1000).toFixed(0)}k
                  </span>
                  <div className="h-px flex-1 bg-[#e7ece7] border-t border-dashed border-[#e7ece7]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right">
                    {((currentReport.maxScale * 0.75) / 1000).toFixed(0)}k
                  </span>
                  <div className="h-px flex-1 bg-[#f0f3f0] border-t border-dashed border-[#f0f3f0]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right">
                    {((currentReport.maxScale * 0.5) / 1000).toFixed(0)}k
                  </span>
                  <div className="h-px flex-1 bg-[#f0f3f0] border-t border-dashed border-[#f0f3f0]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right">
                    {((currentReport.maxScale * 0.25) / 1000).toFixed(0)}k
                  </span>
                  <div className="h-px flex-1 bg-[#f0f3f0] border-t border-dashed border-[#f0f3f0]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right">0</span>
                  <div className="h-px flex-1 bg-[#e7ece7]" />
                </div>
              </div>

              {/* Bars container */}
              <div className="relative ml-14 flex h-60 items-end gap-2 sm:gap-4 pb-8 pt-4">
                {currentReport.bars.map((bar, idx) => {
                  const invoicedHeightPercent = Math.min(
                    100,
                    Math.max(8, (bar.invoiced / currentReport.maxScale) * 100)
                  );
                  const collectedHeightPercent = Math.min(
                    100,
                    Math.max(6, (bar.collected / currentReport.maxScale) * 100)
                  );
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={bar.label}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className={`group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer transition-all duration-200 ${
                        isHovered ? "scale-[1.02]" : ""
                      }`}
                    >
                      {/* Bar Pair */}
                      <div className="flex w-full max-w-[50px] items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Invoiced Bar (Green) */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isHovered
                              ? "bg-[#3e7555] shadow-md"
                              : "bg-[#4f8665] opacity-90"
                          }`}
                          style={{ height: `${invoicedHeightPercent}%` }}
                          title={`Facturé: ${bar.invoiced.toLocaleString("fr-FR")} FCFA`}
                        />

                        {/* Collected Bar (Blue) */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isHovered
                              ? "bg-[#6597b8] shadow-md"
                              : "bg-[#82aeca] opacity-90"
                          }`}
                          style={{ height: `${collectedHeightPercent}%` }}
                          title={`Encaissé: ${bar.collected.toLocaleString("fr-FR")} FCFA`}
                        />
                      </div>

                      {/* X-axis Label */}
                      <span
                        className={`absolute -bottom-6 w-full truncate text-center text-[10px] sm:text-[11px] font-semibold transition ${
                          isHovered ? "font-bold text-[#4f8665]" : "text-[#829087]"
                        }`}
                      >
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Line Curve View */
            <div className="relative">
              <div className="relative ml-8 h-60 pb-8 pt-4">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="h-full w-full overflow-visible"
                >
                  {/* Grid Lines */}
                  <line x1="0" x2="100" y1="100" y2="100" stroke="#e7ece7" strokeWidth="0.8" />
                  <line x1="0" x2="100" y1="75" y2="75" stroke="#f0f3f0" strokeWidth="0.8" strokeDasharray="1 2" />
                  <line x1="0" x2="100" y1="50" y2="50" stroke="#f0f3f0" strokeWidth="0.8" strokeDasharray="1 2" />
                  <line x1="0" x2="100" y1="25" y2="25" stroke="#f0f3f0" strokeWidth="0.8" strokeDasharray="1 2" />

                  {/* Area fill for collected */}
                  <polygon
                    points={collectedAreaPoints}
                    fill="#e1f3e6"
                    opacity="0.6"
                    className="transition-all duration-300"
                  />

                  {/* Line Invoiced (Green) */}
                  <polyline
                    points={invoicedPoints}
                    fill="none"
                    stroke="#4f8665"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* Line Collected (Blue) */}
                  <polyline
                    points={collectedPoints}
                    fill="none"
                    stroke="#82aeca"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* Data Points */}
                  {currentReport.bars.map((b, idx) => {
                    const cx = idx * step;
                    const cyInvoiced =
                      100 - (b.invoiced / currentReport.maxScale) * 85;
                    const cyCollected =
                      100 - (b.collected / currentReport.maxScale) * 85;
                    const isHovered = hoveredBarIndex === idx;

                    return (
                      <g
                        key={idx}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={cx}
                          cy={cyInvoiced}
                          r={isHovered ? "4.5" : "3"}
                          fill="#4f8665"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-150"
                        />
                        <circle
                          cx={cx}
                          cy={cyCollected}
                          r={isHovered ? "4.5" : "3"}
                          fill="#82aeca"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis months */}
                <div className="mt-2 flex justify-between text-[10px] sm:text-[11px] font-semibold text-[#829087]">
                  {currentReport.bars.map((bar, idx) => (
                    <span
                      key={bar.label}
                      className={
                        hoveredBarIndex === idx ? "font-bold text-[#4f8665]" : ""
                      }
                    >
                      {bar.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Additional Analysis Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods Distribution */}
        <article className="ds-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                Modes d&apos;encaissement
              </h3>
              <p className="text-xs text-[#829087]">Répartition par moyen de paiement</p>
            </div>
            <PieChart size={18} className="text-[#829087]" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-ink">Virements bancaires</span>
                <span className="text-[#4f8665] font-bold">62 % (6 050 000 FCFA)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#eef1ee]">
                <div className="h-2 rounded-full bg-[#4f8665]" style={{ width: "62%" }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-ink">Mobile Money (Wave / Orange Money)</span>
                <span className="text-[#3c6c91] font-bold">23 % (2 245 000 FCFA)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#eef1ee]">
                <div className="h-2 rounded-full bg-[#82aeca]" style={{ width: "23%" }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span className="text-ink">Chèques & Espèces</span>
                <span className="text-[#ba8540] font-bold">15 % (1 465 000 FCFA)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#eef1ee]">
                <div className="h-2 rounded-full bg-[#e1b56c]" style={{ width: "15%" }} />
              </div>
            </div>
          </div>
        </article>

        {/* Recovery Performance */}
        <article className="ds-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                Taux de recouvrement
              </h3>
              <p className="text-xs text-[#829087]">Efficacité des règlements clients</p>
            </div>
            <Sparkles size={18} className="text-[#4f8665]" />
          </div>

          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#edf6ef] border border-[#dcecdf]">
              <span className="font-display text-2xl font-extrabold text-[#2d7b4c]">
                88 %
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-ink">Excellent ratio d&apos;encaissement</p>
              <p className="text-[#728078]">
                Délai moyen de règlement : <strong>18 jours</strong> (contre 24 jours au trimestre précédent).
              </p>
              <p className="text-[#2d7b4c] font-semibold">
                +4,2 % d&apos;amélioration de la trésorerie.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
