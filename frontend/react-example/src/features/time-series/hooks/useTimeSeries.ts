import { eq, gte } from "@arkiv-network/sdk/query";
import { useQuery } from "@tanstack/react-query";
import { useArkivClient } from "@/features/arkiv-client/hooks/useArkivClient";
import { type HourlyStats, TimeSeriesStatsSchema } from "../types";

/**
 * Time series data for both gas prices and transactions is stored in the same
 * records, so this generic hook can be reused by both features.
 */
export function useTimeSeries(timeframe: "daily" | "hourly") {
	const { client, entityCreator, protocolVersion } = useArkivClient();
	return useQuery({
		queryKey: ["time-series-data", entityCreator, protocolVersion, timeframe],
		queryFn: async () => {
			const timestamp =
				timeframe === "hourly"
					? Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60) // 7 days ago
					: Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60); // 30 days ago
			const stats = await client
				.buildQuery()
				.where([
					eq("project", "EthDemo"),
					eq("EthDemo_version", protocolVersion),
					eq("EthDemo_dataType", "stats"),
					eq("EthDemo_statsType", timeframe),
					gte("EthDemo_statsTimestamp", timestamp),
				])
				.limit(timeframe === "daily" ? 30 : 7 * 24)
				.createdBy(entityCreator)
				.withPayload()
				.withAttributes()
				.fetch();
			return stats.entities
				.map((entity) => {
					try {
						return TimeSeriesStatsSchema.parse({
							arkivEntityKey: entity.key,
							timestamp: entity.attributes.find(
								(a) => a.key === "EthDemo_statsTimestamp",
							)?.value,
							...JSON.parse(entity.toText()),
						});
					} catch (error) {
						console.error(
							`Failed to parse ${timeframe} stats entity:`,
							error,
							"it will be skipped. Entity key:",
							entity.key,
						);
						return null;
					}
				})
				.filter((point): point is HourlyStats => point !== null)
				.toSorted((a, b) => a.timestamp - b.timestamp);
		},
	});
}
