// Fetches and caches the pinned (or overridden) Bondage College (BC) client
// scripts that the "bc" Vitest project loads into a real jsdom window, for tests
// that need real Asset/AssetGroup/Character data instead of hand-built fixtures.
//
// Used by both `npm run fetch-bc` (scripts/fetch-bc.mjs) and the "bc" project's
// Vitest globalSetup (test/setup/bc-global-setup.ts).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PIN_FILE = join(ROOT, "test", "bc-client.json");

/**
 * Files needed to load BC's asset system (AssetLoadAll()) without a browser.
 * Copied from BondageClub/Tools/Node/Common.js's NEEDED_FILES at the pinned
 * commit -- BC's own `assets:check` uses exactly this set to load
 * Female3DCG.js/Female3DCGExtended.js in isolation (see Tools/Node/AssetCheck.js).
 * Re-sync this list whenever test/bc-client.json's commit moves and asset
 * loading starts failing on a missing extended-item config.
 */
const NEEDED_FILES = [
	"Scripts/Common.js",
	"Scripts/Dialog.js",
	"Scripts/Pose.js",
	"Scripts/Asset.js",
	"Scripts/ExtendedItem.js",
	"Scripts/ModularItem.js",
	"Scripts/TypedItem.js",
	"Scripts/VariableHeight.js",
	"Scripts/VibratorMode.js",
	"Scripts/Property.js",
	"Scripts/TextItem.js",
	"Scripts/NoArch.js",
	"Scripts/PortalLink.js",
	"Screens/Inventory/Futuristic/Futuristic.js",
	"Screens/Inventory/ItemTorso/FuturisticHarness/FuturisticHarness.js",
	"Screens/Inventory/ItemNeckAccessories/CollarNameTag/CollarNameTag.js",
	"Screens/Inventory/ItemArms/FullLatexSuit/FullLatexSuit.js",
	"Screens/Inventory/ItemButt/InflVibeButtPlug/InflVibeButtPlug.js",
	"Screens/Inventory/ItemDevices/VacBedDeluxe/VacBedDeluxe.js",
	"Screens/Inventory/ItemDevices/WoodenBox/WoodenBox.js",
	"Screens/Inventory/ItemPelvis/SciFiPleasurePanties/SciFiPleasurePanties.js",
	"Screens/Inventory/ItemNeckAccessories/CollarShockUnit/CollarShockUnit.js",
	"Screens/Inventory/ItemVulva/ClitAndDildoVibratorbelt/ClitAndDildoVibratorbelt.js",
	"Screens/Inventory/ItemBreast/FuturisticBra/FuturisticBra.js",
	"Screens/Inventory/ItemArms/TransportJacket/TransportJacket.js",
	"Screens/Inventory/ItemMouth/FuturisticPanelGag/FuturisticPanelGag.js",
	"Screens/Inventory/ItemNeckAccessories/CollarAutoShockUnit/CollarAutoShockUnit.js",
	"Screens/Inventory/ItemArms/PrisonLockdownSuit/PrisonLockdownSuit.js",
	"Screens/Inventory/ItemPelvis/LoveChastityBelt/LoveChastityBelt.js",
	"Screens/Inventory/ItemButt/AnalBeads2/AnalBeads2.js",
	"Screens/Inventory/ItemDevices/LuckyWheel/LuckyWheel.js",
	"Screens/Inventory/ItemDevices/FuturisticCrate/FuturisticCrate.js",
	"Screens/Inventory/Cloth/CheerleaderTop/CheerleaderTop.js",
	"Screens/Inventory/ClothAccessory/Bib/Bib.js",
	"Screens/Inventory/BodyMarkings/BodyWritings/BodyWritings.js",
	"Screens/Inventory/FaceMarkings/FaceWritings/FaceWritings.js",
	"Screens/Inventory/ItemDevices/DollBox/DollBox.js",
	"Screens/Inventory/ItemDevices/PetBowl/PetBowl.js",
	"Screens/Inventory/ItemHead/DroneMask/DroneMask.js",
	"Screens/Inventory/ItemHandheld/Plushies/Plushies.js",
	"Screens/Inventory/ItemMisc/WoodenSign/WoodenSign.js",
	"Screens/Inventory/ItemHood/CanvasHood/CanvasHood.js",
	"Screens/Inventory/ItemPelvis/ObedienceBelt/ObedienceBelt.js",
	"Screens/Inventory/ItemPelvis/ModularChastityBelt/ModularChastityBelt.js",
	"Screens/Inventory/ItemNeckAccessories/CustomCollarTag/CustomCollarTag.js",
	"Screens/Inventory/ItemNeckAccessories/ElectronicTag/ElectronicTag.js",
	"Screens/Inventory/ItemNeckRestraints/PetPost/PetPost.js",
	"Screens/Inventory/ItemVulva/FuturisticVibrator/FuturisticVibrator.js",
	"Screens/Inventory/ItemVulva/TechnoChastityCage/TechnoChastityCage.js",
	"Screens/Inventory/ItemPelvis/FuturisticTrainingBelt/FuturisticTrainingBelt.js",
	"Screens/Inventory/ItemDevices/KabeshiriWall/KabeshiriWall.js",
	"Screens/Inventory/ItemDevices/FuckMachine/FuckMachine.js",
	"Screens/Inventory/ItemBreast/ForbiddenChastityBra/ForbiddenChastityBra.js",
	"Screens/Inventory/Suit/LatexCatsuit/LatexCatsuit.js",
	"Screens/Inventory/ItemNeck/FuturisticCollar/FuturisticCollar.js",
	"Screens/Inventory/ItemNeck/SlaveCollar/SlaveCollar.js",
	"Screens/Inventory/ItemDevices/WheelFortune/WheelFortune.js",
	"Screens/Inventory/ItemMisc/IntricatePadlock/IntricatePadlock.js",
	"Screens/Inventory/ItemMisc/TimerPadlock/TimerPadlock.js",
	"Screens/Inventory/ItemMisc/CombinationPadlock/CombinationPadlock.js",
	"Screens/Inventory/ItemMisc/HighSecurityPadlock/HighSecurityPadlock.js",
	"Screens/Inventory/ItemMisc/PasswordPadlock/PasswordPadlock.js",
	"Screens/Inventory/ItemMisc/SafewordPadlock/SafewordPadlock.js",
	"Screens/Inventory/ItemMisc/TimerPasswordPadlock/TimerPasswordPadlock.js",
	"Screens/Inventory/ItemMisc/MistressTimerPadlock/MistressTimerPadlock.js",
	"Screens/Inventory/ItemMisc/OwnerTimerPadlock/OwnerTimerPadlock.js",
	"Screens/Inventory/ItemMisc/OwnerPadlock/OwnerPadlock.js",
	"Screens/Inventory/ItemMisc/LoversTimerPadlock/LoversTimerPadlock.js",
	"Screens/Inventory/ItemMisc/FamilyPadlock/FamilyPadlock.js",
	"Screens/Inventory/ItemMisc/MistressPadlock/MistressPadlock.js",
	"Screens/Inventory/ItemMisc/ExclusivePadlock/ExclusivePadlock.js",
	"Screens/Inventory/ItemNeck/PetSuitShockCollar/PetSuitShockCollar.js",
	"Screens/Inventory/Wings/SteampunkWings/SteampunkWings.js",
	"Screens/Inventory/ItemFeet/NylonRope/NylonRope.js",
	"Screens/Inventory/ItemArms/NylonRope/NylonRope.js",
	"Screens/Inventory/ItemFeet/HempRope/HempRope.js",
	"Screens/Inventory/ItemArms/HempRope/HempRope.js",
	"Screens/Inventory/ItemPelvis/FuturisticChastityBelt/FuturisticChastityBelt.js",
	"Screens/Inventory/ItemNipples/LactationPump/LactationPump.js",
	"Screens/Inventory/ItemNeckRestraints/CollarLeash/CollarLeash.js",
	"Screens/Inventory/ItemDevices/Kennel/Kennel.js",
	"Assets/Female3DCG/Female3DCG.js",
	"Scripts/Drawing.js",
	"Scripts/Server.js",
	"Scripts/Item.js",
	"Assets/Female3DCG/Female3DCGExtended.js",
	"Screens/Room/Shop2/Shop2.js",
	"Scripts/Preference.js",
	"Scripts/Translation.js",
	"Scripts/Text.js",
	"Screens/Character/ItemColor/ItemColor.js",
	"Screens/Room/Crafting/Crafting.js",
	// NOTE: Common.js's NEEDED_FILES also lists "Scripts/Testing.js", but that
	// file is AssetCheck.js's *own* validation-report generator: at top level it
	// immediately calls TestingGetMissingColorLayersGroups(), which throws unless
	// TestingColorLayers/TestingColorGroups (populated from CSV files by
	// AssetCheck.js's vm context) already exist. Nothing else depends on it, so
	// it's dropped here rather than replicating that CSV setup for no benefit.
];

/**
 * Loaded after NEEDED_FILES + AssetLoadAll(): character/inventory/activity/chat
 * logic the "unit" tier fakes but this tier exercises for real. Character.js's
 * CharacterCreate() and CharacterGetEffects() are pure enough (no canvas access
 * at call time for the boolean checks this tier cares about) to use directly.
 */
const EXTRA_FILES = [
	"Scripts/Character.js",
	"Scripts/Inventory.js",
	"Scripts/Activity.js",
	"Scripts/Speech.js",
	"Screens/Online/ChatRoom/ChatRoom.js",
];

export const ALL_FILES = [...NEEDED_FILES, ...EXTRA_FILES];

function readPin() {
	return JSON.parse(readFileSync(PIN_FILE, "utf-8"));
}

export function rawUrl(repo, sha, path) {
	const base = repo.replace(/\.git$/, "");
	return `${base}/-/raw/${sha}/BondageClub/${path}`;
}

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
	return res.text();
}

function cacheDirFor(gameVersion, sha) {
	return join(ROOT, ".cache", `bc-${gameVersion}-${sha.slice(0, 7)}`);
}

async function downloadInto(dir, repo, sha, gameVersionForGuard, { allowVersionMismatch = false } = {}) {
	mkdirSync(dir, { recursive: true });

	// Game.js first: cheap, and its GameVersion is the guard everything else
	// depends on being right before we spend time fetching ~80 more files.
	const gameJsPath = join(dir, "Scripts", "Game.js");
	if (!existsSync(gameJsPath)) {
		const text = await fetchText(rawUrl(repo, sha, "Scripts/Game.js"));
		mkdirSync(dirname(gameJsPath), { recursive: true });
		writeFileSync(gameJsPath, text);
	}
	const gameVersionMatch = readFileSync(gameJsPath, "utf-8").match(/GameVersion\s*=\s*"([^"]+)"/);
	const actualGameVersion = gameVersionMatch?.[1];
	if (!actualGameVersion) throw new Error(`Could not find GameVersion in fetched Scripts/Game.js (${gameJsPath})`);
	if (gameVersionForGuard && actualGameVersion !== gameVersionForGuard) {
		const message = `BC client at ${sha} reports GameVersion "${actualGameVersion}", expected "${gameVersionForGuard}" (test/bc-client.json). Was the wrong commit pinned?`;
		if (allowVersionMismatch) console.warn(`bc-client: ${message}`);
		else throw new Error(message);
	}

	for (const relPath of ALL_FILES) {
		const dest = join(dir, ...relPath.split("/"));
		if (existsSync(dest)) continue;
		const text = await fetchText(rawUrl(repo, sha, relPath));
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, text);
	}

	return actualGameVersion;
}

export function resolveLatestSha(repo) {
	const out = execFileSync("git", ["ls-remote", repo, "refs/heads/master"], { encoding: "utf-8" });
	const sha = out.split(/\s+/)[0];
	if (!sha) throw new Error(`Could not resolve master HEAD for ${repo} via git ls-remote`);
	return sha;
}

/**
 * Resolves the BC client directory to use, downloading (and caching) it if
 * needed. Returns { dir, gameVersion, sha, source }.
 *
 * Env overrides:
 * - BC_CLIENT_DIR=<path>: use an existing local checkout as-is. The version
 *   guard still runs (against Scripts/Game.js in that directory) but never
 *   throws -- a local dev checkout is the developer's own responsibility.
 * - BC_CLIENT=latest: resolve BondageClub's `master` HEAD instead of the pin.
 *   Beta versions are allowed, and a GameVersion mismatch against
 *   test/bc-client.json only warns (that's the point -- to see breakage
 *   before the pin is bumped to match).
 */
export async function ensureBcClient() {
	const pin = readPin();

	const dirOverride = process.env.BC_CLIENT_DIR;
	if (dirOverride) {
		const gameJsPath = join(dirOverride, "Scripts", "Game.js");
		if (!existsSync(gameJsPath)) throw new Error(`BC_CLIENT_DIR=${dirOverride} has no Scripts/Game.js`);
		const gameVersion = readFileSync(gameJsPath, "utf-8").match(/GameVersion\s*=\s*"([^"]+)"/)?.[1] ?? "unknown";
		if (gameVersion !== pin.gameVersion) {
			console.warn(`bc-client: BC_CLIENT_DIR reports GameVersion "${gameVersion}", pin expects "${pin.gameVersion}"`);
		}
		return { dir: dirOverride, gameVersion, sha: "local", source: "BC_CLIENT_DIR" };
	}

	if (process.env.BC_CLIENT === "latest") {
		const sha = resolveLatestSha(pin.repo);
		const dir = cacheDirFor("latest", sha);
		const gameVersion = await downloadInto(dir, pin.repo, sha, pin.gameVersion, { allowVersionMismatch: true });
		return { dir, gameVersion, sha, source: "latest" };
	}

	const dir = cacheDirFor(pin.gameVersion, pin.commit);
	const gameVersion = await downloadInto(dir, pin.repo, pin.commit, pin.gameVersion);
	return { dir, gameVersion, sha: pin.commit, source: "pinned" };
}

export function readPinnedConfig() {
	return readPin();
}
