import { useMemo } from "react";

import {
  HeatmapChart,
  type HeatmapCopy,
  type HeatmapDatum,
  type HeatmapStyleConfig,
  type HeatmapTheme,
  type HeatmapValueFormatters,
} from "@/components/HeatmapChart";

import { useTransactionHeatmap } from "../hooks/useTransactionHeatmap";

type TransactionHeatmapCardProps = {
  className?: string;
};
type TransactionHeatmapMeta = {
  arkivEntityKey?: string;
};

const TRANSACTION_HEATMAP_THEME: HeatmapTheme = {
  card: "bg-card",
  summaryText: "text-grey-600",
  mobileText: "text-sm text-grey-700",
  legendText: "text-grey-600",
  legendGradient: "bg-linear-to-r from-orange-100 via-orange-300 to-orange-600",
  daySelector: {
    base: "focus-visible:ring-orange-500/60",
    active: "bg-orange-600 text-white",
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
    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-1",
  interactiveTile:
    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2",
  mobile: {
    section: "rounded-xl bg-grey-50 p-4",
    badge: "text-orange-600",
    cellHour: "text-grey-600/80",
    emptySection: "rounded-xl bg-grey-50 p-4 text-sm text-grey-600",
  },
};

const TRANSACTION_HEATMAP_STYLE_CONFIG: HeatmapStyleConfig = {
  emptyCell: {
    backgroundColor: "hsl(25 100% 96%)",
    color: "hsl(25 60% 35%)",
    borderColor: "hsl(25 70% 88%)",
  },
  getCellStyles: (value, { maxValue, hasAnyData }) => {
    if (!hasAnyData || maxValue === 0) {
      return {
        backgroundColor: "hsl(25 100% 94%)",
        color: "hsl(25 60% 35%)",
        borderColor: "hsl(25 70% 85%)",
      };
    }

    const intensity = value / maxValue;
    const clamped = Math.min(1, Math.max(0, intensity));
    // Lightness range: 95% (empty) to 70% (max intensity) - less extreme
    const lightness = 95 - clamped * 25;
    const backgroundColor = `hsl(25 90% ${lightness}%)`;
    const color = "hsl(25 70% 25%)";
    const borderColor = `hsl(25 80% ${85 - clamped * 15}%)`;

    return { backgroundColor, color, borderColor };
  },
};

const TRANSACTION_HEATMAP_FORMATTERS: HeatmapValueFormatters = {
  cell: (value) => value.toLocaleString(),
  summaryMin: (value) => Math.round(value).toLocaleString(),
  summaryMax: (value) => Math.round(value).toLocaleString(),
  summaryAvg: (value) => Math.round(value).toLocaleString(),
  tooltip: ({ value, dayLabel, hour }) => {
    const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
    return `${dayLabel} at ${hourLabel}: ${Math.round(
      value
    ).toLocaleString()} tx`;
  },
};

const TRANSACTION_HEATMAP_COPY: HeatmapCopy = {
  loading: "Loading hourly breakdown...",
  error: (error) =>
    error instanceof Error ? error.message : "Unable to load heatmap data.",
  empty: "Heatmap data will appear once transactions are recorded.",
  mobileRangeWithSelection: (summary) => (
    <>
      Hourly throughput for <strong>{summary.activeDayLabel}</strong>:{" "}
      <strong>{summary.minDisplay}</strong> –{" "}
      <strong>{summary.maxDisplay}</strong> tx/h
    </>
  ),
  mobileRangeWithoutSelection: "Select a day to inspect hourly throughput.",
  desktopRange: (summary) => (
    <>
      Weekly hourly range: <strong>{summary.overallMinDisplay}</strong> –{" "}
      <strong>{summary.overallMaxDisplay}</strong> tx/h
    </>
  ),
  mobileHeaderBadge: (summary) => (
    <>
      {summary.minDisplay} – {summary.maxDisplay} tx
    </>
  ),
  mobileFooter: (summary) => <>Avg {summary.avgDisplay} tx</>,
  mobileFooterBadge: "24 hrs",
};

export function TransactionHeatmapCard({
  className,
}: TransactionHeatmapCardProps) {
  const { data, isPending, isError, error } = useTransactionHeatmap();

  const heatmapData = useMemo<HeatmapDatum<TransactionHeatmapMeta>[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((point) => ({
      day: point.day,
      hour: point.hour,
      value: point.transactionCount,
      meta: { arkivEntityKey: point.arkivEntityKey },
    }));
  }, [data]);

  return (
    <HeatmapChart<TransactionHeatmapMeta>
      className={className}
      title="Transactions Heatmap (7 days)"
      description="Hourly transaction density helps surface congestion windows and quiet periods."
      data={heatmapData}
      isPending={isPending}
      isError={isError}
      error={error}
      copy={TRANSACTION_HEATMAP_COPY}
      formatters={TRANSACTION_HEATMAP_FORMATTERS}
      styleConfig={TRANSACTION_HEATMAP_STYLE_CONFIG}
      theme={TRANSACTION_HEATMAP_THEME}
      legend={{
        startLabel: "Lower activity",
        endLabel: "Higher activity",
      }}
      alwaysShowRange
      getCellHref={(datum) =>
        datum.meta?.arkivEntityKey
          ? `https://explorer.infurademo.hoodi.arkiv.network/entity/${datum.meta.arkivEntityKey}?tab=data`
          : undefined
      }
      cellLinkTarget="_blank"
      cellLinkRel="noopener,noreferrer"
    />
  );
}
