import { useMemo } from "react";
import { HighlightCard } from "@/components/HighlightCard";
import { useTransactionHistory } from "../hooks/useTransactionHistory";

export default function AverageTransactionsHighlight() {
  const { data, isLoading, isError } = useTransactionHistory();
  const average = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    const total = data.reduce((sum, point) => sum + point.transactionCount, 0);
    return total / data.length;
  }, [data]);

  if (isLoading || !average) {
    return (
      <HighlightCard
        title="Avg Daily Transactions"
        variant="orange"
        value={
          <span className="block h-7 w-32 animate-pulse rounded bg-white/30" />
        }
      />
    );
  }

  if (isError || isNaN(average)) {
    return (
      <HighlightCard
        title="Avg Daily Transactions"
        value="Unavailable"
        variant="orange"
        isError
      />
    );
  }

  return (
    <HighlightCard
      title="Avg Daily Transactions"
      value={average.toLocaleString()}
      variant="orange"
    />
  );
}
