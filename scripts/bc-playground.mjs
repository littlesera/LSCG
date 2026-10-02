// A local, offline Bondage Club for seeing and clicking LSCG's UI in a real browser.
//
// Serves the BC client at the pinned commit (test/bc-client.json), fetching each file from gitgud on first use and
// caching it under .cache/bc-full-<sha>/. Two files are swapped out:
// - Scripts/lib/socket.io/socket.io.min.js -> test/playground/fake-server.js, a fake server: nothing reaches the real
//   one, and whatever the client sends is recorded on `window.Playground.sent`.
// - index.html gets test/playground/harness.js (login + helpers) and LSCG's dist/bundle.js appended.
//
//   npm run build && npm run playground      then open http://localhost:10003/
// Drive it with agent-browser; `Playground.login()` in the page logs in a test character (see harness.js).
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { rawUrl, readPinnedConfig } from "./bc-client.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.PORT ?? 10003);
const { repo, commit } = readPinnedConfig();
const CACHE = join(ROOT, ".cache", `bc-full-${commit.slice(0, 7)}`);

const TYPES = {
    ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg",
    ".woff2": "font/woff2", ".ttf": "font/ttf", ".csv": "text/csv", ".txt": "text/plain",
};

const OVERRIDES = {
    "Scripts/lib/socket.io/socket.io.min.js": join(ROOT, "test", "playground", "fake-server.js"),
};

// ponytail: fixed concurrency; gitgud rate-limits (429) bursts of hundreds, which fetchUpstream waits out.
const MAX_FETCHES = 4;
let active = 0;
const waiting = [];
async function limited(fn) {
    if (active >= MAX_FETCHES) await new Promise(resolve => waiting.push(resolve));
    active++;
    try { return await fn(); } finally { active--; waiting.shift()?.(); }
}

/** Fetches from gitgud, waiting out rate limits (429) and transient server errors. */
async function fetchUpstream(path) {
    for (let attempt = 0; ; attempt++) {
        const res = await limited(() => fetch(rawUrl(repo, commit, path)));
        if ((res.status !== 429 && res.status < 500) || attempt >= 8) return res;
        const wait = Number(res.headers.get("retry-after")) * 1000 || 1000 * 2 ** attempt;
        await new Promise(resolve => setTimeout(resolve, Math.min(wait, 30000)));
    }
}

/** A BC client file, from the cache or fetched once; null if upstream doesn't have it. */
async function bcFile(path) {
    const file = join(CACHE, ...path.split("/"));
    const missing = file + ".404";
    if (existsSync(file)) return readFileSync(file);
    if (existsSync(missing)) return null;
    const res = await fetchUpstream(path);
    mkdirSync(dirname(file), { recursive: true });
    if (res.status === 404) writeFileSync(missing, "404"); // BC probes for optional files; remember the misses
    if (!res.ok) return null;
    const body = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, body);
    return body;
}

async function handle(url) {
    if (url === "/" || url === "/BondageClub/") return { redirect: "/BondageClub/index.html" };
    if (url === "/lscg/bundle.js") return { body: readFileSync(join(ROOT, "dist", "bundle.js")), type: ".js" };
    if (url === "/playground/harness.js") return { body: readFileSync(join(ROOT, "test", "playground", "harness.js")), type: ".js" };
    if (!url.startsWith("/BondageClub/")) return null;

    const path = normalize(decodeURIComponent(url.slice("/BondageClub/".length))).replace(/\\/g, "/");
    if (path.startsWith("..")) return null;
    if (OVERRIDES[path]) return { body: readFileSync(OVERRIDES[path]), type: ".js" };

    const body = await bcFile(path);
    if (!body) return null;
    if (path === "index.html") {
        const html = body.toString("utf-8").replace("</body>",
            "\t<script src=\"/playground/harness.js\"></script>\n\t<script src=\"/lscg/bundle.js\"></script>\n</body>");
        return { body: html, type: ".html" };
    }
    return { body, type: extname(path) };
}

createServer(async (req, res) => {
    try {
        const out = await handle(new URL(req.url ?? "/", "http://x").pathname);
        if (!out) {
            res.writeHead(404).end();
        } else if (out.redirect) {
            res.writeHead(302, { Location: out.redirect }).end();
        } else {
            res.writeHead(200, { "Content-Type": TYPES[out.type] ?? "application/octet-stream", "Cache-Control": "no-store" }).end(out.body);
        }
    } catch (err) {
        console.error(req.url, err);
        res.writeHead(500).end(String(err));
    }
}).listen(PORT, () => console.log(`BC playground (BC ${commit.slice(0, 7)}): http://localhost:${PORT}/`));
