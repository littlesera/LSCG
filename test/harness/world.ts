// Boots real LSCG module instances against the fake BC in bc-lite.ts, the way
// src/main.tsx's init_modules() boots them against the real game.
//
// Lifecycle used by test files:
//   beforeAll:  world.boot(new CoreModule(), new ConsentModule(), ...)   -- once
//   beforeEach: world.resetWorld()                                       -- per test
//
// boot() is meant to run once per file: hookFunction("Player.CanWalk", ...) installs
// the SDK's router directly onto the *object* window.Player is at that moment, so
// re-booting fresh module instances every test would stack duplicate hooks onto the
// same globals without ever removing the old ones. resetWorld() therefore only
// resets *data* (Player's fields, ChatRoomCharacter, spy call histories), never
// module registration. A module with ephemeral cross-test state of its own (e.g.
// ConsentModule.sentOffers) should be reset explicitly by the test file -- see its
// public fields, or a `.Clear()` method where one exists (StateModule has one).
import type { BaseModule } from "base";
import { registerModule, modulesMap } from "modules";
import { installBcLite, resetBcLiteSpies, type BcLite } from "./bc-lite";
import { makeCharacter, resetAssetRegistry, type CharacterFlags, type FixtureCharacter } from "./fixtures";

let bootedModules: BaseModule[] = [];
let bc: BcLite = installBcLite();

/** Registers + init/load/run the given module instances, once, for this test file. */
export function boot<T extends BaseModule[]>(...instances: T): T {
	bc = installBcLite();
	// main.tsx sets Player.LSCG (from parsed settings, or {}) before init_modules()
	// runs; BaseModule.init()/registerDefaultSettings() assume it already exists.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	if (!g.Player.LSCG) g.Player.LSCG = {};
	for (const m of instances) registerModule(m);
	for (const m of instances) m.init();
	for (const m of instances) m.load();
	for (const m of instances) m.run();
	bootedModules = bootedModules.concat(instances);
	return instances;
}

/** Looks up a booted module the same way modules.ts's getModule<T>() does. */
export function booted<T extends BaseModule>(ctorName: string): T {
	return modulesMap.get(ctorName) as T;
}

/**
 * Resets per-test *data*: Player's fields (mutated in place -- see setup/globals.ts
 * for why), the room roster, the asset registry, and every bc-lite spy's call
 * history. Does not touch module registration or a module's own instance state.
 *
 * `playerOverrides` is handy for capture-and-replay two-player scenarios: e.g.
 * `resetWorld({ MemberNumber: target.MemberNumber, LSCG: {} })` to re-play a
 * captured packet "as" whoever was on the other end of it.
 */
export function resetWorld(playerOverrides: Omit<Partial<FixtureCharacter>, "flags"> & { flags?: Partial<CharacterFlags> } = {}): FixtureCharacter {
	resetBcLiteSpies();
	bc.ServerSend.mockClear();
	bc.ChatRoomSendLocal.mockClear();
	bc.ChatRoomCharacterUpdate.mockClear();
	bc.ServerPlayerExtensionSettingsSync.mockClear();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	const { flags: freshFlags, ...freshRest } = makeCharacter({
		MemberNumber: g.Player.MemberNumber,
		LSCG: {},
		...playerOverrides,
		flags: { isPlayer: true, ...playerOverrides.flags },
	});
	// Data fields are reset freely, but a *method* already on Player is left alone: any
	// StateModule (or similar) dotted hookFunction("Player.CanWalk", ...) installs the SDK's
	// router directly onto that property the moment it's first hooked, and overwriting it
	// here would silently disable the hook for the rest of the file. The methods themselves
	// (fixtures.ts) read `this.flags`/`this.X`, so mutating `flags` (and the other data
	// fields) in place is enough to keep both hooked and unhooked methods correct.
	for (const key of Object.keys(g.Player)) {
		if (typeof g.Player[key] !== "function" && key !== "flags") delete g.Player[key];
	}
	for (const [key, value] of Object.entries(freshRest)) {
		if (typeof value !== "function") g.Player[key] = value;
	}
	if (!g.Player.flags) g.Player.flags = {};
	for (const key of Object.keys(g.Player.flags)) delete g.Player.flags[key];
	Object.assign(g.Player.flags, freshFlags);

	g.ChatRoomCharacter = [];
	resetAssetRegistry();
	document.body.innerHTML = "";
	return g.Player as FixtureCharacter;
}

/** Adds a fixture character to the room roster (what getCharacter()/ChatRoomCharacter.find look at). */
export function addToRoom(C: FixtureCharacter): FixtureCharacter {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	((globalThis as any).ChatRoomCharacter as FixtureCharacter[]).push(C);
	return C;
}

export function currentBcLite(): BcLite {
	return bc;
}

/**
 * `globalThis.Player` typed as the fixture it actually is. bc-stubs' ambient
 * `declare var Player: PlayerCharacter` (the real BC shape) is what plain
 * `globalThis.Player` resolves to in a test file, which doesn't know about
 * fixture-only fields like `OwnerMemberNumber` or `flags` -- use this instead
 * of casting inline every time one of those needs setting after resetWorld().
 */
export function player(): FixtureCharacter {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (globalThis as any).Player as FixtureCharacter;
}

export { bootedModules };
