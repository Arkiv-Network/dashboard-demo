import { expect, type Locator, type Page, test } from "@playwright/test";

const DEFAULT_DASHBOARD_URL =
  "https://eth-dashboard.demos.arkiv.network/showcase/";
const MAX_LATEST_BLOCK_AGE_MS = 90_000; // 90 seconds
const MAX_DAILY_SERIES_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours
const MAX_HOURLY_SERIES_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function resolveDashboardUrl(rawUrl?: string) {
  if (!rawUrl) {
    return DEFAULT_DASHBOARD_URL;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return DEFAULT_DASHBOARD_URL;
  }

  if (trimmed.includes("/showcase/")) {
    return trimmed;
  }

  return `${trimmed.replace(/\/+$/, "")}/showcase/`;
}

function parseUiDate(rawValue: string) {
  const normalizedValue = rawValue.replace(/\sat\s/i, " ").trim();
  const timestamp = Date.parse(normalizedValue);
  expect(Number.isNaN(timestamp)).toBeFalsy();
  return new Date(timestamp);
}

function getCardByTitle(page: Page, title: string) {
  return page.getByText(title, { exact: true }).locator("xpath=..");
}

function getTodayLabel() {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date());
}

async function gotoDashboard(page: Page) {
  await page.goto(
    resolveDashboardUrl(process?.env.DASHBOARD_URL ?? process?.env.BASE_URL),
    {
      waitUntil: "networkidle",
    },
  );

  await expect(
    page.getByRole("heading", { name: /Ethereum Dashboard powered by/i }),
  ).toBeVisible();
}

async function hoverLastCurvePoint(chart: Locator) {
  const curve = chart.locator(".recharts-curve").first();
  if ((await curve.count()) === 0) {
    throw new Error("Unable to find a curve element to hover for tooltip");
  }
  const curveBox = await curve.boundingBox();
  if (!curveBox) {
    throw new Error("Unable to determine curve position for tooltip hover");
  }
  // Hover over the rightmost point of the curve to trigger the tooltip for the latest data point
  await curve.hover({
    position: {
      x: curveBox.width - 1,
      y: curveBox.height / 2,
    },
  });
}

async function readVisibleTooltipText(
  page: Page,
  chart: Locator,
  label: string,
) {
  await chart.scrollIntoViewIfNeeded();

  // If the chart has bars, hover over the last bar
  // otherwise find the SVG path inside the area chart
  // and hover over it's end
  const lastBar = chart.locator(".recharts-rectangle").last();
  if ((await lastBar.count()) > 0) {
    await lastBar.hover();
  } else {
    await hoverLastCurvePoint(chart);
  }

  await page.waitForTimeout(300);

  const tooltips = await page
    .locator(".recharts-tooltip-wrapper")
    .evaluateAll((nodes) =>
      nodes
        .filter((node) => getComputedStyle(node).visibility !== "hidden")
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean),
    );

  const matchingTooltip = tooltips.find((tooltip) => tooltip.includes(label));
  if (matchingTooltip) {
    return matchingTooltip;
  }

  throw new Error(`Unable to find a visible tooltip for chart label: ${label}`);
}

test.describe("React dashboard nightly checks", () => {
  test("renders all dashboard sections with populated user-visible values", async ({
    page,
  }) => {
    await gotoDashboard(page);

    for (const sectionId of [
      "blocks",
      "glm-transfers",
      "transactions",
      "gas",
    ]) {
      await expect(page.locator(`section#${sectionId}`)).toBeVisible();
    }

    await expect(
      getCardByTitle(page, "Latest block").getByText(/^#\d+$/),
    ).toBeVisible();
    await expect(
      getCardByTitle(page, "Avg Daily Transactions").getByText(/[\d,]+/),
    ).toBeVisible();
    await expect(
      getCardByTitle(page, "Avg Gas (30d)").getByText(/\d+\.\d+ Gwei/),
    ).toBeVisible();
    await expect(
      getCardByTitle(page, "Current Gas Price").getByText(/\d+\.\d+ Gwei/),
    ).toBeVisible();

    await expect(page.getByText("Unavailable", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText(
        /Something went wrong|Unable to load|No block data is available yet/i,
      ),
    ).toHaveCount(0);

    await expect(page.locator("section#blocks tbody tr").first()).toBeVisible();
    await expect(
      page.locator("section#glm-transfers [data-slot='chart']:visible").first(),
    ).toBeVisible();
    await expect(
      page.locator("section#transactions [data-slot='chart']:visible").nth(1),
    ).toBeVisible();
    await expect(page.locator("section#gas table a").first()).toBeVisible();
  });

  test("shows fresh latest Ethereum blocks in the blocks table", async ({
    page,
  }) => {
    await gotoDashboard(page);

    const rowLocator = page.locator("section#blocks tbody tr");
    await expect(rowLocator.first()).toBeVisible();
    await expect(rowLocator).toHaveCount(10);

    const rows = await rowLocator.evaluateAll((nodes) =>
      nodes
        .slice(0, 5)
        .map((row) =>
          Array.from(
            row.querySelectorAll("td"),
            (cell) => cell.textContent?.trim() ?? "",
          ),
        ),
    );

    const firstRow = rows[0];
    expect(firstRow).toBeDefined();
    expect(firstRow?.[0]).toMatch(/^#\d+$/);

    const firstTimestamp = parseUiDate(firstRow?.[1] ?? "");
    const latestBlockAgeMs = Date.now() - firstTimestamp.getTime();
    expect(latestBlockAgeMs).toBeLessThanOrEqual(MAX_LATEST_BLOCK_AGE_MS);

    const parsedRows = rows.map((row) => ({
      blockNumber: Number(row[0]?.replace("#", "")),
      timestamp: parseUiDate(row[1] ?? ""),
      transactionCount: Number(row[4]?.replace(/,/g, "")),
    }));

    for (let index = 0; index < parsedRows.length - 1; index += 1) {
      expect(parsedRows[index]?.blockNumber).toBeGreaterThan(
        parsedRows[index + 1]?.blockNumber ?? 0,
      );
      expect(parsedRows[index]?.timestamp.getTime()).toBeGreaterThan(
        parsedRows[index + 1]?.timestamp.getTime() ?? 0,
      );
      expect(parsedRows[index]?.transactionCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("keeps the daily transaction and gas charts within the latest completed day", async ({
    page,
  }) => {
    await gotoDashboard(page);

    const transactionChart = page
      .locator("section#transactions [data-slot='chart']:visible")
      .first();
    const gasChart = page
      .locator("section#transactions [data-slot='chart']:visible")
      .nth(1);

    const transactionTooltip = await readVisibleTooltipText(
      page,
      transactionChart,
      "Transactions",
    );
    const gasTooltip = await readVisibleTooltipText(
      page,
      gasChart,
      "Average Gwei",
    );

    const transactionDate = parseUiDate(
      transactionTooltip
        .slice(0, transactionTooltip.indexOf("Transactions"))
        .trim(),
    );
    const gasDate = parseUiDate(
      gasTooltip.slice(0, gasTooltip.indexOf("Average Gwei")).trim(),
    );

    expect(Date.now() - transactionDate.getTime()).toBeLessThanOrEqual(
      MAX_DAILY_SERIES_AGE_MS,
    );
    expect(Date.now() - gasDate.getTime()).toBeLessThanOrEqual(
      MAX_DAILY_SERIES_AGE_MS,
    );
  });

  test("shows current-day GLM transfer activity and current heatmap dates", async ({
    page,
  }) => {
    await gotoDashboard(page);

    const glmChart = page
      .locator("section#glm-transfers [data-slot='chart']:visible")
      .first();
    const glmTooltip = await readVisibleTooltipText(
      page,
      glmChart,
      "Transfer Count",
    );
    const glmTimestamp = parseUiDate(
      glmTooltip.slice(0, glmTooltip.indexOf("Transfer Count")).trim(),
    );

    expect(Date.now() - glmTimestamp.getTime()).toBeLessThanOrEqual(
      MAX_HOURLY_SERIES_AGE_MS,
    );

    const todayLabel = getTodayLabel();
    const gasSection = page.locator("section#gas");

    await expect(
      gasSection.getByText("Transactions Heatmap (7 days)", { exact: true }),
    ).toBeVisible();
    await expect(
      gasSection.getByText("Gas Price Heatmap (7 days)", { exact: true }),
    ).toBeVisible();
    await expect(
      gasSection.locator("th", { hasText: todayLabel }).first(),
    ).toBeVisible();
    await expect(
      gasSection.getByText(/Weekly hourly range:/).first(),
    ).toBeVisible();
    await expect(gasSection.locator("table a").first()).toBeVisible();
  });
});
