import { chromium, type FullConfig } from "@playwright/test";

/** Loads the playground once before any test, so a cold cache (BC's files fetched from gitgud on first use) is
 *  paid for here, with a generous timeout, rather than inside the first test's. */
export default async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(600_000);
    await page.goto(config.projects[0].use.baseURL ?? "http://localhost:10003", { timeout: 600_000 });
    await page.waitForFunction(() => (window as any).LSCG && (window as any).Playground && (window as any).CurrentScreen === "Login", null, { timeout: 600_000 });
    await browser.close();
}
