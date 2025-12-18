import { HighlightCard } from "@/components/HighlightCard";
import { useLatestBlocks } from "../hooks/useLatestBlocks";

export function LatestBlockHighlight() {
  const { data, isLoading, isError } = useLatestBlocks();
  const latestBlock = data?.[0];

  if (isLoading) {
    return (
      <HighlightCard
        title="Latest block"
        variant="orange"
        value={
          <span className="block h-7 w-32 animate-pulse rounded bg-white/30" />
        }
      />
    );
  }

  if (isError || !latestBlock) {
    return (
      <HighlightCard
        title="Latest block"
        value="Unavailable"
        variant="orange"
        isError
      />
    );
  }

  return (
    <HighlightCard
      title="Latest block"
      value={`#${latestBlock.blockNumber}`}
      variant="orange"
    />
  );
}
