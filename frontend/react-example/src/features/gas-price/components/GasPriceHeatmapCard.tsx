import { useMemo } from "react";

import {
  HeatmapChart,
  type HeatmapCopy,
  type HeatmapDatum,
  type HeatmapStyleConfig,
  type HeatmapTheme,
  type HeatmapValueFormatters,
} from "@/components/HeatmapChart";

import { ARKIV_EXPLORER_BASE_URL } from "@/features/arkiv-client/constants";
import { useGasPriceChartData } from "../hooks/useGasPriceChartData";

type GasPriceHeatmapCardProps = {
  className?: string;
};
type GasHeatmapMeta = {
  arkivEntityKey?: string;
};

const GAS_HEATMAP_THEME: HeatmapTheme = {
  card: "bg-card",
  summaryText: "text-grey-600",
  mobileText: "text-sm text-grey-700",
  legendText: "text-grey-600",
  legendGradient: "bg-linear-to-r from-blue-100 via-blue-300 to-blue-600",
  daySelector: {
    base: "focus-visible:ring-blue-500/60",
    active: "bg-blue-600 text-white",
    inactive: "bg-grey-100 text-grey-700 hover:bg-grey-200",
  },
  table: {
    text: "text-grey-700",
    headerBorder: "border-grey-200",
    headerText: "text-grey-600",
    headerLabelText: "text-grey-500",
    hourBorder: "border-grey-100",
    hourText: "text-grey-500",
    cellBorder: "border-grey-100",
  },
  interactiveCell:
    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1",
  interactiveTile:
    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
  mobile: {
    section: "rounded-xl bg-grey-50 p-4",
    badge: "text-blue-600",
    cellHour: "text-blue-700/70",
    emptySection: "rounded-xl bg-grey-50 p-4 text-sm text-blue-700",
  },
};

const GAS_HEATMAP_STYLE_CONFIG: HeatmapStyleConfig = {
  emptyCell: {
    backgroundColor: "hsl(235 60% 96%)",
    color: "hsl(235 45% 45%)",
    borderColor: "hsl(235 40% 88%)",
  },
  getCellStyles: (value, { minValue, maxValue, hasAnyData }) => {
    if (!hasAnyData || maxValue === minValue) {
      return {
        backgroundColor: "hsl(235 65% 88%)",
        color: "hsl(235 50% 30%)",
        borderColor: "hsl(235 45% 80%)",
      };
    }

    const intensity = (value - minValue) / (maxValue - minValue || 1);
    const clamped = Math.min(1, Math.max(0, intensity));
    // Lightness range: 92% (empty) to 72% (max intensity) - less extreme
    const lightness = 92 - clamped * 20;
    const backgroundColor = `hsl(235 75% ${lightness}%)`;
    const color = "hsl(235 60% 25%)";
    const borderColor = `hsl(235 55% ${85 - clamped * 12}%)`;

    return { backgroundColor, color, borderColor };
  },
};

const GAS_HEATMAP_FORMATTERS: HeatmapValueFormatters<GasHeatmapMeta> = {
  cell: (value) => value.toFixed(4),
  summaryMin: (value) => value.toFixed(4),
  summaryMax: (value) => value.toFixed(4),
  summaryAvg: (value) => value.toFixed(4),
  tooltip: ({ value, dayLabel, hour }) => {
    const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
    return `${dayLabel} at ${hourLabel}: ${value.toFixed(4)} Gwei`;
  },
};

const GAS_HEATMAP_COPY: HeatmapCopy = {
  loading: "Loading hourly gas prices...",
  error: (error) =>
    error instanceof Error
      ? error.message
      : "Unable to load gas price heatmap.",
  empty: "Gas price heatmap data will appear shortly.",
  mobileRangeWithSelection: (summary) => (
    <>
      Hourly range for <strong>{summary.activeDayLabel}</strong>:{" "}
      <strong>{summary.minDisplay}</strong> –{" "}
      <strong>{summary.maxDisplay}</strong> Gwei
    </>
  ),
  mobileRangeWithoutSelection: "Select a day to view hourly gas prices.",
  desktopRange: (summary) => (
    <>
      Weekly hourly range: <strong>{summary.overallMinDisplay}</strong> –{" "}
      <strong>{summary.overallMaxDisplay}</strong> Gwei
    </>
  ),
  mobileHeaderBadge: (summary) => (
    <>
      {summary.minDisplay} – {summary.maxDisplay} Gwei
    </>
  ),
  mobileFooter: (summary) => <>Avg {summary.avgDisplay} Gwei</>,
  mobileFooterBadge: "24 hrs",
};

export function GasPriceHeatmapCard({ className }: GasPriceHeatmapCardProps) {
  const { data, isPending, isError, error } = useGasPriceChartData("hourly");

  const heatmapData = useMemo<HeatmapDatum<GasHeatmapMeta>[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((point) => ({
      day: point.day,
      hour: point.hour,
      value: point.averageGasPriceGwei,
      meta: { arkivEntityKey: point.arkivEntityKey },
    }));
  }, [data]);

  return (
    <HeatmapChart<GasHeatmapMeta>
      className={className}
      title="Gas Price Heatmap (7 days)"
      description="Visualize hourly gas price to spot the most affordable windows."
      data={heatmapData}
      isPending={isPending}
      isError={isError}
      error={error}
      copy={GAS_HEATMAP_COPY}
      formatters={GAS_HEATMAP_FORMATTERS}
      styleConfig={GAS_HEATMAP_STYLE_CONFIG}
      theme={GAS_HEATMAP_THEME}
      legend={{
        startLabel: "More affordable",
        endLabel: "More expensive",
      }}
      alwaysShowRange
      getCellHref={(datum) =>
        datum.meta?.arkivEntityKey
          ? `${ARKIV_EXPLORER_BASE_URL}/entity/${datum.meta.arkivEntityKey}?tab=data`
          : undefined
      }
      cellLinkTarget="_blank"
      cellLinkRel="noopener,noreferrer"
    />
  );
}
