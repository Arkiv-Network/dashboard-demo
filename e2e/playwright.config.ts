import { defineConfig } from "@playwright/test";

declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

const BASE_URL =
  process?.env.BASE_URL ??
  "https://eth-dashboard.demos.arkiv.network/showcase/";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: 2,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1600, height: 1800 },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
