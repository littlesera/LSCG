import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 10003);

// UI tests: LSCG's real bundle (run `npm run build` first) inside a real, offline Bondage Club served by
// scripts/bc-playground.mjs. See test/README.md ("The playground").
export default defineConfig({
    testDir: "test/ui",
    testMatch: "**/*.spec.ts",
    globalSetup: "./test/ui/global-setup.ts",
    timeout: 120_000,
    expect: { timeout: 10_000 },
    // Each test gets its own page and its own in-browser fake account; the playground server only serves static files,
    // so tests can run side by side. CI runners are small and the tests are timing-sensitive, so it gets fewer.
    workers: process.env.CI ? 2 : 4,
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "test/.out/ui-report" }]] : "list",
    outputDir: "test/.out/ui-results",
    use: {
        baseURL: `http://localhost:${PORT}`,
        viewport: { width: 1600, height: 800 },
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: {
        command: "node scripts/bc-playground.mjs",
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
