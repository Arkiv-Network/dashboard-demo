import { AlertCircle, ChevronRight, ExternalLink } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import * as z from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ARKIV_EXPLORER_BASE_URL } from "@/features/arkiv-client/constants";
import { cn } from "@/lib/utils";
import { useBlockDetails } from "../hooks/useBlockDetails";
import { useLatestBlocks } from "../hooks/useLatestBlocks";

type BlockSearchCardProps = {
  className?: string;
};

type FieldDescriptor = {
  label: string;
  value: string | number;
  linkTo?: string;
};

const BlockNumberStringSchema = z.string().refine((val) => {
  const parsed = Number(val);
  return (
    !Number.isNaN(parsed) &&
    Number.isFinite(parsed) &&
    parsed >= 0 &&
    val.trim() !== ""
  );
}, "Invalid block number");

export function BlockSearchCard({ className }: BlockSearchCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchNumber, setSearchNumber] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: latestBlocks, isPending: isLoadingRange } = useLatestBlocks();

  const {
    data: blockDetails,
    isPending,
    isError,
    error,
  } = useBlockDetails(searchNumber);

  // Only show loading state on initial load, not on refetches
  const showLoadingState = isLoadingRange && !latestBlocks;

  // Set default search number to the max indexed block when range is available
  const latestBlock = latestBlocks?.[0];
  useEffect(() => {
    if (latestBlock && searchNumber === null) {
      setSearchNumber(String(latestBlock.blockNumber));
      setInputValue(String(latestBlock.blockNumber));
    }
  }, [latestBlock, searchNumber]);

  let fieldDescriptors: FieldDescriptor[] = [];
  if (blockDetails) {
    fieldDescriptors = [
      { label: "Timestamp", value: String(blockDetails.timestamp) },
      {
        label: "Miner",
        value: `${blockDetails.miner.slice(0, 8)}…${blockDetails.miner.slice(-6)}`,
        linkTo: `https://etherscan.io/address/${blockDetails.miner}`,
      },
      {
        label: "Base Fee (Gwei)",
        value: Number(blockDetails.baseFeePerGas) / 1_000_000_000, // wei -> gwei
      },
      {
        label: "Gas Used",
        value: Number(blockDetails.gasUsed).toLocaleString(),
      },
      {
        label: "Tx Count",
        value: blockDetails.transactionCount.toLocaleString(),
      },
      {
        label: "Size",
        value: `${(Number(blockDetails.size) / 1024).toFixed(1)} KB`,
      },
      {
        label: "Parent Hash",
        value: `${blockDetails.parentHash.slice(0, 8)}…${blockDetails.parentHash.slice(-6)}`,
      },
      {
        label: "Arkiv Entity",
        value: `${blockDetails.arkivEntityKey.slice(0, 8)}…${blockDetails.arkivEntityKey.slice(
          -6,
        )}`,
        linkTo: `${ARKIV_EXPLORER_BASE_URL}/entity/${blockDetails.arkivEntityKey}?tab=data`,
      },
    ];
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setFormError("Please enter a block number");
      setSearchNumber("");
      return;
    }

    const parseResult = BlockNumberStringSchema.safeParse(trimmed);
    if (!parseResult.success) {
      setFormError(
        parseResult.error.issues[0]?.message || "Invalid block number",
      );
      setSearchNumber("");
      return;
    }

    if (
      latestBlock &&
      Number(parseResult.data) > Number(latestBlock.blockNumber)
    ) {
      setFormError(
        `Block number exceeds latest indexed block (${latestBlock.blockNumber})`,
      );
      setSearchNumber("");
      return;
    }

    setSearchNumber(parseResult.data);
  }

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Block Explorer</CardTitle>
            <CardDescription>
              Search for Ethereum block details by block number.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <search>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col w-full ">
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Block number"
                  inputMode="numeric"
                  className=" bg-white/80"
                  placeholder="Enter block number"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  disabled={showLoadingState}
                />
                <Button
                  type="submit"
                  className="shrink-0"
                  disabled={showLoadingState}
                >
                  Search
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              {formError && (
                <p className="mt-1 text-sm text-destructive">{formError}</p>
              )}
            </div>
          </form>
        </search>
        <div className="mt-6 space-y-4">
          {showLoadingState ? (
            <div className="flex min-h-36 items-center justify-center text-sm text-muted-foreground">
              Loading block explorer...
            </div>
          ) : !searchNumber ? null : isPending ? (
            <div className="flex min-h-36 items-center justify-center text-sm text-muted-foreground">
              Looking up block details...
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span>
                {error instanceof Error
                  ? error.message
                  : "We could not find that block."}
              </span>
            </div>
          ) : blockDetails ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground">Block Number</span>
                <a
                  href={`https://etherscan.io/block/${blockDetails.blockNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-lg font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  #{blockDetails.blockNumber}
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                {fieldDescriptors.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-grey-50 px-3 py-2"
                  >
                    <dt className="text-muted-foreground mb-1 uppercase tracking-wide">
                      {item.label}
                    </dt>
                    <dd className="font-medium text-sm break-all text-slate-900">
                      {item.linkTo ? (
                        <a
                          href={item.linkTo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 inline-flex items-center justify-center gap-1"
                        >
                          {item.value}
                          <ExternalLink className="size-4" />
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : blockDetails === null ? (
            <div className="flex min-h-36 items-center justify-center text-sm text-muted-foreground">
              Block #{searchNumber} not found. Perhaps it has not been indexed
              yet.
            </div>
          ) : (
            <div className="flex min-h-36 items-center justify-center text-sm text-muted-foreground">
              Enter a block number to see full details.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
