// MapModule's enhanced lighting: turning the map into lights (fixed light-source objects, static-lighting effects,
// what characters carry or wear) and obstacles (walls by their neighbours, single pillars, doors open or shut), the
// ambient colour from the room filter, and the hooks that re-parse the map; plus the LightingEngine itself (light
// animations, computing light and vision masks on the main thread, as it does without a Web Worker, and a render
// pass against a recording canvas context).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { StateModule } from "Modules/states";
import { MapModule } from "Modules/map";
import { LightingEngine } from "Utilities/lighting.engine";
import type { Light } from "Utilities/lighting.types";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asChar = (C: FixtureCharacter) => C as any;

/** A canvas context that accepts any call or property, so the engine's drawing can run without a real canvas. */
function recordingContext() {
	const calls: string[] = [];
	const target: Record<string | symbol, unknown> = {};
	const proxy: unknown = new Proxy(target, {
		get: (t, key) => key in t ? t[key] : (...args: unknown[]) => { calls.push(String(key)); void args; return proxy; },
		set: (t, key, value) => { t[key] = value; return true; },
	});
	return { ctx: proxy as CanvasRenderingContext2D, calls };
}

/** A room from rows of characters: "#" wall, "D" door, "L" lamppost, "." floor. The player stands at "P". */
function room(rows: string[]) {
	const height = rows.length;
	const width = rows[0].length;
	const at = (x: number, y: number) => rows[y]?.[x] ?? " ";
	let px = 0, py = 0;
	rows.forEach((r, y) => { const x = r.indexOf("P"); if (x >= 0) { px = x; py = y; } });
	g.ChatRoomMapViewWidth = width;
	g.ChatRoomMapViewHeight = height;
	g.Player.MapData = { Pos: { X: px, Y: py } };
	g.ChatRoomData = { Admin: [], MapData: {} };
	g.ChatRoomMapViewIsWall = (x: number, y: number) => at(x, y) === "#";
	g.ChatRoomMapViewGetTileAtPos = (x: number, y: number) => (at(x, y) === "#" || at(x, y) === "D") ? { Type: "Wall" } : { Type: "Floor" };
	g.ChatRoomMapViewGetObjectAtPos = (x: number, y: number) => at(x, y) === "D" ? { Type: "WallPath", Style: "Wood" } : at(x, y) === "L" ? { ID: 2090 } : at(x, y) === "W" ? { Type: "WallPath", Style: "WoodOpen" } : null;
	g.ChatRoomMapViewGetCharacterAtPos = () => null;
	g.MapManager = { Map: { getTileId: () => 0, getEffects: (x: number, y: number) => at(x, y) === "S" ? [{ Type: "StaticLighting", Color: [10, 20, 30, 1] }] : [] } };
}

describe("MapModule lighting", () => {
	let map: MapModule;
	let compute: ReturnType<typeof vi.spyOn>;

	beforeAll(() => {
		g.ChatRoomMapViewPerceptionRange = 4; // read while the module is constructed
		[, , map] = boot(new CoreModule(), new StateModule(), new MapModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true }, MagicModule: {} } });
		map.init();
		map.settings.enabled = true;
		map.settings.enhancedLighting = true;
		map.settings.hideDarkLights = false;
		map.mapLights = [];
		map.charLights = [];
		Object.assign(g, { ChatRoomMapViewPerceptionRange: 4, ChatRoomMapViewPerceptionRangeMax: 7, ChatRoomMapViewEditMode: "" });
		g.ChatRoomCharacter = [];
		compute = vi.spyOn(map.lightingEngine, "compute");
	});

	afterEach(() => compute.mockRestore());

	const obstacles = () => compute.mock.calls.at(-1)?.[1] ?? [];

	describe("ParseMapForObjects", () => {
		it("does nothing with enhanced lighting off, or no map", () => {
			map.settings.enhancedLighting = false;
			room(["P"]);
			map.ParseMapForObjects();
			map.settings.enhancedLighting = true;
			g.MapManager = { Map: { getTileId: () => { throw new Error("no map"); } } };
			map.ParseMapForObjects();
			expect(compute).not.toHaveBeenCalled();
		});

		it("lights a lamppost from its object, offset up the post", () => {
			room(["P.L"]);
			map.ParseMapForObjects();
			expect(map.mapLights).toHaveLength(1);
			expect(map.mapLights[0]).toMatchObject({ color: [200, 200, 200, 0.8], radius: map.TileUnit * 6 });
		});

		it("lights a static-lighting effect", () => {
			room(["P.S"]);
			map.ParseMapForObjects();
			expect(map.mapLights[0].color).toEqual([10, 20, 30, 1]);
			// Editing effects shows BC's own markers instead
			g.ChatRoomMapViewEditMode = "Effect";
			expect(map.ParseMapEffectsForLighting(2, 0, 0, 0)).toEqual([]);
			expect(map.EnhancedLightingEnabled).toBe(false);
		});

		it("an isolated wall is a pillar: an oval when zoomed in, a line zoomed out", () => {
			room(["P.#"]);
			map.ParseMapForObjects();
			expect(obstacles().map((o: { type: string }) => o.type)).toEqual(["oval"]);
			g.ChatRoomMapViewPerceptionRange = 12;
			map.ParseMapForObjects();
			expect(obstacles().map((o: { type: string }) => o.type)).toEqual(["line"]);
		});

		it("a run of wall gets its exposed sides", () => {
			room([
				"###",
				"#P.",
				"#..",
			]);
			map.ParseMapForObjects();
			expect(obstacles().length).toBeGreaterThan(3);
			expect(obstacles().every((o: { type: string }) => o.type === "line")).toBe(true);
		});

		it("a closed door blocks its top and the side facing the player; an always-open door only a wall above it", () => {
			room(["#D#", ".P."]);
			map.ParseMapForObjects();
			const closed = obstacles().length;
			room(["#W#", ".P."]);
			map.ParseMapForObjects();
			expect(obstacles().length).toBeLessThan(closed);
		});

		it("drops dark lights when asked", () => {
			room(["P.S"]);
			g.MapManager.Map.getEffects = () => [{ Type: "StaticLighting", Color: [0, 0, 0, 0] }];
			map.settings.hideDarkLights = true;
			map.ParseMapForObjects();
			expect(map.mapLights).toEqual([]);
		});
	});

	describe("character lights", () => {
		const hold = (C: FixtureCharacter, name: string, extra = {}) => wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: name }), extra));

		it("candles, cigarettes and screens light up whoever holds them", () => {
			const C = makeCharacter();
			hold(C, "CandleWax");
			expect(map.GetCharacterLights(asChar(C), 0, 0)[0].animType).toBe("flicker");
			hold(C, "Cigarette", { Property: { TypeRecord: { typed: 0 } } });
			expect(map.GetCharacterLights(asChar(C), 0, 0)[0].radius).toBe(map.TileUnit / 4);
			hold(C, "Smartphone");
			expect(map.GetCharacterLights(asChar(C), 0, 0)[0].fov).toBe(45);
		});

		it("glowing items pulse, and a flashlight's beam depends on its words and its holder", () => {
			const C = makeCharacter();
			wear(C, makeItem(makeAsset(makeGroup({ Name: "Necklace", Category: "Appearance" }), { Name: "Pendant" }), { Craft: { Name: "Glowing Pendant", Description: "" } }));
			wear(C, makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "Torch" }), { Craft: { Name: "Flashlight", Description: "wide beam" } }));
			const lights = map.GetCharacterLights(asChar(C), 0, 0);
			expect(lights.map(l => l.animType)).toEqual(["pulse", "none"]);
			expect(lights[1].fov).toBe(60);
			const mine = map.GetCharacterLights(asChar(player()), 0, 0);
			expect(mine).toEqual([]);
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "Torch2" }), { Craft: { Name: "narrow flashlight", Description: "" } }));
			expect(map.GetCharacterLights(asChar(player()), 0, 0)[0]).toMatchObject({ animType: "flashlight", fov: 20 });
		});

		it("an astral projection glows in its tint", () => {
			const C = makeCharacter({ LSCG: { MagicModule: { projectionTintColor: "#0f08" }, StateModule: { states: [{ type: "astral-projection", active: true, extensions: {} }] } } });
			const [light] = map.GetCharacterLights(asChar(C), 0, 0);
			expect(light.color).toEqual([0, 255, 0, 0x88 / 255]);
		});

		it("only characters in range are considered", () => {
			room(["P..."]);
			const near = addToRoom(Object.assign(makeCharacter({ MemberNumber: 5 }), { MapData: { Pos: { X: 1, Y: 0 } } }));
			const far = addToRoom(Object.assign(makeCharacter({ MemberNumber: 6 }), { MapData: { Pos: { X: 99, Y: 0 } } }));
			hold(near, "CandleWax");
			hold(far, "CandleWax");
			map.ParseOtherCharactersForLight();
			expect(map.charLights).toHaveLength(1);
		});

		it("RecomputeCharacterLights updates moving lights, or parses the map if there are none", () => {
			room(["P.L"]);
			const update = vi.spyOn(map.lightingEngine, "updateLights");
			map.RecomputeCharacterLights();
			expect(compute).toHaveBeenCalled();
			map.RecomputeCharacterLights();
			expect(update).toHaveBeenCalled();
			update.mockRestore();
		});
	});

	describe("hooks", () => {
		it("re-parse the map when the room or view changes", () => {
			room(["P.L"]);
			const parse = vi.spyOn(map, "ParseMapForObjects");
			for (const name of ["ChatRoomSyncRoomProperties", "ChatRoomMapViewUpdatePlayerFlag", "ChatRoomMapViewMouseWheel", "ChatRoomMapViewUpdateFlag", "CharacterLoadCanvas"])
				g[name](player());
			g.MouseIn.mockReturnValueOnce(true);
			g.ChatRoomMapViewClick();
			expect(parse).toHaveBeenCalledTimes(6);
			parse.mockRestore();
		});

		it("hide the vanilla effect colours and half fog while drawing the grid, then render", () => {
			map.settings.hideVanillaFog = true;
			g.ChatRoomMapFogIsActive = () => false;
			g.ChatRoomMapViewHasSuperPowers = () => false;
			g.MainCanvas = Object.assign(recordingContext().ctx, { canvas: { width: 2000, height: 1000 } });
			const render = vi.spyOn(map.lightingEngine, "render").mockImplementation(() => {});
			g.MouseX = 10; g.MouseY = 20;
			map.drawingMapFlag = true;
			expect([g.RgbaArrayToHTMLColor([1, 2, 3, 1]), g.DrawImageResize("Assets/Map/Tiles/Fog/Half.png")]).toEqual(["rgba(0,0,0,0)", true]);
			map.drawingMapFlag = false;
			g.ChatRoomMapViewDrawGrid();
			expect(render).toHaveBeenCalledOnce();
			expect(render.mock.calls[0][0].viewpoint).toBeUndefined();
			expect(map.lastMouseX).toBe(10);
			render.mockRestore();
		});

		it("the room's image filter tints the ambient light", () => {
			g.ChatRoomData = { Admin: [], Custom: { ImageFilter: "#102030" } };
			g.ChatRoomMapFogIsActive = () => true;
			g.ChatRoomMapViewHasSuperPowers = () => false;
			g.MainCanvas = Object.assign(recordingContext().ctx, { canvas: { width: 2000, height: 1000 } });
			const render = vi.spyOn(map.lightingEngine, "render").mockImplementation(() => {});
			g.ChatRoomMapViewDrawGrid();
			expect(render.mock.calls[0][0]).toMatchObject({ ambientColor: "rgba(16, 32, 48, 1)", viewpoint: map.viewpoint });
			render.mockRestore();
		});
	});
});

describe("LightingEngine", () => {
	const light = (over: Partial<Light> = {}): Light => ({ id: "l", x: 50, y: 50, radius: 40, color: [200, 100, 50, 0.8], ...over });

	it("animates each kind of light around its base values", () => {
		const engine = new LightingEngine();
		const lights = (["pulse", "flicker", "hover", "glitch", "flashlight", "none"] as const).map(animType => light({ animType }));
		engine.updateAnimations(lights, { x: 50, y: 0 });
		engine.updateAnimations(lights, { x: 50, y: 0 });
		expect(lights.slice(0, 5).every(l => l._animState?.baseRadius === 40)).toBe(true);
		expect(lights[4].angle).toBeCloseTo(-90);
		expect(lights[5]._animState).toBeUndefined();
		engine.disableSpatialAnimations = true;
		engine.updateAnimations(lights);
		expect(lights[0].radius).toBe(40);
	});

	it("computes light and vision masks without a worker, and updates moving lights", () => {
		const engine = new LightingEngine();
		const lamp = light();
		engine.compute([lamp], [{ type: "rectangle", topLeft: { x: 70, y: 0 }, bottomRight: { x: 80, y: 100 } }], { x: 50, y: 50, radius: 100 });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		expect(internals.lightMaskCache.l.length).toBeGreaterThan(0);
		expect(Math.max(...internals.lightMaskCache.l.map((p: { x: number }) => p.x))).toBeCloseTo(70);
		expect(internals.visionMaskCache.length).toBeGreaterThan(0);
		lamp.x = 20;
		engine.updateLights([lamp], undefined);
		expect(Math.min(...internals.lightMaskCache.l.map((p: { x: number }) => p.x))).toBeCloseTo(-20);
	});

	it("renders lights, the vision mask and dark lights onto the main canvas", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		const light1 = recordingContext();
		const vision = recordingContext();
		internals.lightCtx = light1.ctx;
		internals.visionCtx = vision.ctx;
		const main = recordingContext();
		const lights = [light(), light({ id: "dark", color: [0, 0, 0, 1] }), light({ id: "beam", animType: "flashlight", angle: 0, fov: 30 })];
		engine.compute(lights, [], { x: 50, y: 50, radius: 100 });
		engine.render({ mainCtx: main.ctx, width: 100, height: 100, lights, viewpoint: { x: 50, y: 50, radius: 100 } });
		expect(light1.calls).toContain("fillRect");
		expect(vision.calls).toContain("fill");
		expect(main.calls).toContain("drawImage");
	});
});
