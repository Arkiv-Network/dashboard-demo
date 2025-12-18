import { useMemo } from "react";
import { HighlightCard } from "@/components/HighlightCard";
import { useGasPriceChartData } from "../hooks/useGasPriceChartData";

export default function AverageGasPriceHighlight() {
  const { data, isLoading, isError } = useGasPriceChartData("daily");
  const average = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    const total = data.reduce(
      (sum, point) => sum + point.averageGasPriceGwei,
      0
    );
    return total / data.length;
  }, [data]);

  if (isLoading || !average) {
    return (
      <HighlightCard
        title="Avg Gas (30d)"
        variant="blue"
        value={
          <span className="block h-7 w-32 animate-pulse rounded bg-white/30" />
        }
      />
    );
  }

  if (isError || isNaN(average)) {
    return (
      <HighlightCard
        title="Avg Gas (30d)"
        value="Unavailable"
        variant="blue"
        isError
      />
    );
  }

  return (
    <HighlightCard
      title="Avg Gas (30d)"
      value={`${average.toFixed(3)} Gwei`}
      variant="blue"
    />
  );
}
