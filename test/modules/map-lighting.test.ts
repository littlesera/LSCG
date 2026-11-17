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
import { room } from "../harness/map-fixtures";
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
	const light = (over: Partial<Light> = {}): Light => ({ id: "l", x: 50, y: 50, radius: 40, color: [200, 100, 50, 0.8], ...over });

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

		it("allLights is the map lights then the character lights, rebuilt only when either list changes", () => {
			const a = light({ id: "a" }), b = light({ id: "b" }), c = light({ id: "c" });
			map.mapLights = [a];
			map.charLights = [b];
			const first = map.allLights;
			expect(first).toEqual([a, b]);
			expect(map.allLights).toBe(first);
			map.mapLights.push(c);
			expect(map.allLights).toEqual([a, c, b]);
			map.charLights = [];
			expect(map.allLights).toEqual([a, c]);
		});

		it("lights a lamppost from its object, offset up the post", () => {
			room(["P.L"]);
			map.ParseMapForObjects();
			expect(map.mapLights).toHaveLength(1);
			// World space (tiles): two tiles right of the player, the post's light raised 1.4 tiles, reaching 6 tiles
			expect(map.mapLights[0]).toMatchObject({ color: [200, 200, 200, 0.8], radius: 6, tileX: 2, tileY: 0 });
			expect(map.mapLights[0].x).toBeCloseTo(2.5);
			expect(map.mapLights[0].y).toBeCloseTo(0.5 - 1.4);
		});

		it("builds lights for the whole map, and draws only those inside the window around the player", () => {
			// The window is lightingVisionMax tiles either way (10 at the default range)
			room(["P" + ".".repeat(9) + "S"]);
			map.ParseMapForObjects();
			expect(map.mapLights).toHaveLength(1);
			expect(map.visibleLights).toHaveLength(1);
			room(["P" + ".".repeat(10) + "S"]);
			map.ParseMapForObjects();
			expect(map.mapLights).toHaveLength(1);
			expect(map.visibleLights).toHaveLength(0);
		});

		it("brings a distant light back once the player is near it", () => {
			room(["P" + ".".repeat(10) + "S"]);
			map.ParseMapForObjects();
			expect(map.visibleLights).toHaveLength(0);
			g.Player.MapData.Pos.X = 5;
			expect(map.visibleLights).toHaveLength(1);
		});

		it("keeps a light that is further to the side when the map is wider (BC R134)", () => {
			g.ChatRoomMapViewSplitPosition = 2000;
			room(["P" + ".".repeat(12) + "S"]);
			map.ParseMapForObjects();
			expect(map.visibleLights).toHaveLength(1);
			g.ChatRoomMapViewSplitPosition = 1000;
			expect(map.visibleLights).toHaveLength(0);
			delete g.ChatRoomMapViewSplitPosition;
		});

		it("does not rebuild the walls or lights when the player walks, or when the zoom changes within a pillar style", () => {
			room(["#####", "#P.L#", "#...#", "#####"]);
			map.ParseMapForObjects();
			const lights = map.mapLights;
			compute.mockClear();
			const parse = vi.spyOn(map, "ParseMapForObjects");
			g.Player.MapData.Pos.X = 2;
			g.ChatRoomMapViewUpdatePlayerFlag(player());
			g.ChatRoomMapViewPerceptionRange = 7;
			g.ChatRoomMapViewMouseWheel(player());
			expect(parse).not.toHaveBeenCalled();
			expect(map.mapLights).toBe(lights);
			expect(compute).not.toHaveBeenCalled();
			parse.mockRestore();
		});

		it("recomputes when the player passes a door (its blocked side depends on it), but not for other moves", () => {
			room(["#D#####", ".P....."]);
			map.ParseMapForObjects();
			compute.mockClear();
			const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
			// Moving to the right of the door changes which side of it is blocked: the walls are recomputed
			g.Player.MapData.Pos.X = 3;
			g.ChatRoomMapViewUpdatePlayerFlag(player());
			expect(compute).toHaveBeenCalledTimes(1);
			// Moving on, still to the right of it, only moves the vision
			g.Player.MapData.Pos.X = 4;
			g.ChatRoomMapViewUpdatePlayerFlag(player());
			expect(compute).toHaveBeenCalledTimes(1);
			expect(update).toHaveBeenCalledTimes(1);
			update.mockRestore();
		});

		it("describes the same geometry wherever the player stands and however far it is zoomed", () => {
			const layout = ["#######", "#P....#", "#..L..#", "#######"];
			const snapshot = () => JSON.stringify({ lights: map.mapLights.map(l => [l.id, l.x, l.y, l.radius]), walls: obstacles() });
			room(layout);
			map.ParseMapForObjects();
			const home = snapshot();
			g.Player.MapData.Pos = { X: 5, Y: 2 };
			g.ChatRoomMapViewPerceptionRange = 8;
			map.ParseMapForObjects();
			expect(snapshot()).toBe(home);
		});

		it("builds no lights for BC's blank lighting effect, which every tile without other lighting carries", () => {
			room(["P.L.."]);
			const blank = { Type: "StaticLighting", Color: [0, 0, 0, 0] };
			const shadow = { Type: "StaticLighting", Color: [0, 0, 0, 0.2] };
			g.MapManager.Map.getEffects = (x: number) => [x === 3 ? shadow : blank];
			map.ParseMapForObjects();
			// the lamppost and the one real shadow remain; the other tiles' blank effects are not lights
			expect(map.mapLights.map(l => l.color)).toEqual([[200, 200, 200, 0.8], [0, 0, 0, 0.2]]);
			expect(compute.mock.calls.at(-1)?.[0]).toHaveLength(2);
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
			expect(map.GetCharacterLights(asChar(C), 0, 0)[0].radius).toBe(0.25);
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

		it("takes lights from every character, and draws only those near the player", () => {
			room(["P..."]);
			const near = addToRoom(Object.assign(makeCharacter({ MemberNumber: 5 }), { MapData: { Pos: { X: 1, Y: 0 } } }));
			const far = addToRoom(Object.assign(makeCharacter({ MemberNumber: 6 }), { MapData: { Pos: { X: 30, Y: 0 } } }));
			hold(near, "CandleWax");
			hold(far, "CandleWax");
			map.ParseOtherCharactersForLight();
			expect(map.charLights).toHaveLength(2);
			expect(map.visibleLights).toHaveLength(1);
			expect(map.visibleLights[0].tileX).toBe(1);
		});

		it("RecomputeCharacterLights updates only the characters' lights, not the map's or the walls", () => {
			room(["P.L"]);
			map.ParseMapForObjects();
			compute.mockClear();
			const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
			map.RecomputeCharacterLights();
			expect(update).toHaveBeenCalledWith(map.charLights);
			expect(compute).not.toHaveBeenCalled();
			update.mockRestore();
		});
	});

	describe("hooks", () => {
		describe("re-parsing the map only when something it depends on changed", () => {
			let parse: ReturnType<typeof vi.spyOn>;
			const triggers = ["ChatRoomSyncRoomProperties", "ChatRoomMapViewUpdatePlayerFlag", "ChatRoomMapViewMouseWheel", "ChatRoomMapViewUpdateFlag"];

			beforeEach(() => {
				room(["P.L"]);
				g.ChatRoomData = { Admin: [], MapData: { Tiles: "a", Objects: "b", Effects: "c" } };
				map.CheckMapDataChanged();
				map.RequestParse(true);
				parse = vi.spyOn(map, "ParseMapForObjects");
			});
			afterEach(() => parse.mockRestore());

			it("skips every trigger while nothing changed", () => {
				for (const name of triggers) g[name](player());
				g.MouseIn.mockReturnValueOnce(true);
				g.ChatRoomMapViewClick();
				expect(parse).not.toHaveBeenCalled();
			});

			it("always parses when the map view is activated", () => {
				Object.assign(g, { ChatRoomMapViewName: "Map", ChatRoomViews: { Map: {} }, ChatRoomActiveView: null });
				g.ChatRoomActivateView("Map");
				expect(parse).toHaveBeenCalledTimes(1);
			});

			it("only updates the vision polygon when the player moved, once for that move", () => {
				const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
				g.Player.MapData.Pos.X += 1;
				g.ChatRoomMapViewUpdatePlayerFlag(player());
				g.ChatRoomMapViewUpdatePlayerFlag(player());
				expect(parse).not.toHaveBeenCalled();
				expect(update).toHaveBeenCalledTimes(1);
				expect(update).toHaveBeenCalledWith([], expect.objectContaining({ radius: 8 }));
				update.mockRestore();
			});

			it("only moves the viewpoint when the zoom changes within the same pillar style", () => {
				const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
				g.ChatRoomMapViewPerceptionRange = 6;
				g.ChatRoomMapViewMouseWheel(player());
				expect(parse).not.toHaveBeenCalled();
				expect(update).toHaveBeenCalledTimes(1);
				update.mockRestore();
			});

			it("rebuilds the walls when the zoom changes how lone pillars are drawn", () => {
				g.ChatRoomMapViewPerceptionRange = 12;
				g.ChatRoomMapViewMouseWheel(player());
				expect(parse).toHaveBeenCalledTimes(1);
			});

			it("does nothing when the map is resized (BC R134): only the camera changes", () => {
				const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
				g.ChatRoomMapViewSplitPosition = 1400;
				g.ChatRoomMapViewUpdatePlayerFlag(player());
				expect(parse).not.toHaveBeenCalled();
				expect(update).not.toHaveBeenCalled();
				delete g.ChatRoomMapViewSplitPosition;
				update.mockRestore();
			});

			it("parses when the room's map data changed, e.g. a wall was edited", () => {
				g.ChatRoomData.MapData.Tiles = "changed";
				g.ChatRoomSyncRoomProperties(player());
				expect(parse).toHaveBeenCalledTimes(1);
				g.ChatRoomSyncRoomProperties(player());
				expect(parse).toHaveBeenCalledTimes(1);
			});

			it("notices a map change on the next draw, as when an editor saves", () => {
				g.ChatRoomData.MapData.Objects = "edited";
				map.CheckMapDataChanged();
				map.RequestParse();
				expect(parse).toHaveBeenCalledTimes(1);
			});

			it("ignores a map save that wrote the same content into new strings", () => {
				g.ChatRoomData.MapData = { Tiles: "a".slice(), Objects: ["b"].join(""), Effects: ["c"].join("") };
				map.CheckMapDataChanged();
				map.RequestParse();
				expect(parse).not.toHaveBeenCalled();
			});

			it("does nothing when there is no map data yet", () => {
				g.ChatRoomData = { Admin: [] };
				expect(() => map.CheckMapDataChanged()).not.toThrow();
			});
		});

		describe("character lights", () => {
			it("a character's canvas loading refreshes character lights (debounced), not the whole map", () => {
				room(["P.L"]);
				const parse = vi.spyOn(map, "ParseMapForObjects");
				const refresh = vi.spyOn(map, "debouncedCharacterLightRefresh");
				g.CharacterLoadCanvas(player());
				expect(refresh).toHaveBeenCalledTimes(1);
				expect(parse).not.toHaveBeenCalled();
				parse.mockRestore();
				refresh.mockRestore();
			});

			it("recomputes only when what characters hold or wear changed", () => {
				room(["P.L"]);
				const C = makeCharacter({ MemberNumber: 7, Appearance: [] });
				g.ChatRoomCharacter = [asChar(C)];
				const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
				map.RefreshCharacterLightsIfChanged();
				expect(update).toHaveBeenCalledTimes(1);
				map.RefreshCharacterLightsIfChanged();
				expect(update).toHaveBeenCalledTimes(1);
				wear(C, makeItem(makeAsset(makeGroup({ Name: "Necklace", Category: "Appearance" }), { Name: "Pendant" }), { Craft: { Name: "Glowing Pendant", Description: "" } }));
				map.RefreshCharacterLightsIfChanged();
				expect(update).toHaveBeenCalledTimes(2);
				update.mockRestore();
			});

			it("does nothing with enhanced lighting off", () => {
				room(["P.L"]);
				map.settings.enhancedLighting = false;
				const update = vi.spyOn(map.lightingEngine, "updateLights").mockImplementation(() => {});
				map.RefreshCharacterLightsIfChanged();
				expect(update).not.toHaveBeenCalled();
				update.mockRestore();
			});
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

	// BC R134 lets the player resize the map (ChatRoomMapViewSplitPosition, 500 to 2000, 1000 by default) and centres the
	// player's tile in it. R133 always draws a 1000 px map and has no such variable.
	describe("map statistics overlay", () => {
		afterEach(() => {
			map.lightingEngine.setHudMode("off");
			try { localStorage.removeItem("LSCG_MAP_STATS"); localStorage.removeItem("LSCG_DEV"); } catch { /* none */ }
		});

		it("steps off, stats, debug, off, and can be set directly", () => {
			expect(map.StatsMode).toBe("off");
			expect(map.SetStatsMode()).toBe("stats");
			expect(map.SetStatsMode()).toBe("debug");
			expect(map.SetStatsMode()).toBe("off");
			expect(map.SetStatsMode("debug")).toBe("debug");
			expect(map.StatsMode).toBe("debug");
			// something that is not a mode steps on instead
			expect(map.SetStatsMode("nonsense")).toBe("off");
		});

		it("is available from the console as lscgPerf.hud()", () => {
			expect(typeof g.lscgPerf.hud).toBe("function");
			expect(g.lscgPerf.hud()).toBe("stats");
			expect(g.lscgPerf.hud("off")).toBe("off");
			expect(typeof g.lscgPerf.snapshot).toBe("function");
		});

		it("is remembered between reloads in a development build, and only there", () => {
			map.SetStatsMode("stats");
			expect(localStorage.getItem("LSCG_MAP_STATS")).toBe("stats");
			map.lightingEngine.setHudMode("off");
			map.RestoreStatsMode(); // not a development build
			expect(map.StatsMode).toBe("off");
			localStorage.setItem("LSCG_DEV", "1");
			map.RestoreStatsMode();
			expect(map.StatsMode).toBe("stats");
			map.SetStatsMode("off");
			expect(localStorage.getItem("LSCG_MAP_STATS")).toBeNull();
		});

		it("Alt+Shift+L steps it in a development build, and does nothing otherwise", () => {
			const press = (extra: Partial<KeyboardEventInit> = {}) => g.GameKeyDown(new KeyboardEvent("keydown", { code: "KeyL", altKey: true, shiftKey: true, ...extra }));
			press();
			expect(map.StatsMode).toBe("off"); // not a development build
			localStorage.setItem("LSCG_DEV", "1");
			expect(press()).toBe(true);
			expect(map.StatsMode).toBe("stats");
			press({ shiftKey: false });
			press({ altKey: false });
			press({ code: "KeyP" });
			expect(map.StatsMode).toBe("stats"); // other keys leave it alone
			press();
			expect(map.StatsMode).toBe("debug");
		});
	});

	describe("on a resizable map (BC R134)", () => {
		afterEach(() => { delete g.ChatRoomMapViewSplitPosition; });

		it("is 1000 px wide when the client has no split (R133)", () => {
			delete g.ChatRoomMapViewSplitPosition;
			expect(map.MapWidth).toBe(1000);
		});

		it.each([500, 1000, 1500, 2000])("centres the player's tile in a %i px wide map, as DrawGrid does", (split) => {
			g.ChatRoomMapViewSplitPosition = split;
			room(["...P."]);
			const T = map.TileUnit;
			// BC: OffsetX = (Width - TileSize) / 2, ScreenX = (X - PlayerX) * TileSize + OffsetX
			expect(map.ScreenX(3)).toBeCloseTo((split - T) / 2);
			expect(map.ScreenX(4)).toBeCloseTo((split - T) / 2 + T);
			expect(map.ScreenY(0)).toBeCloseTo((1000 - T) / 2 - 0 * T);
		});

		it("matches the old fixed formula at the default 1000 px split, at any zoom", () => {
			for (const range of [1, 4, 12, 20]) {
				g.ChatRoomMapViewPerceptionRange = range;
				g.ChatRoomMapViewSplitPosition = 1000;
				room(["...P."]);
				const T = map.TileUnit;
				expect(map.ScreenX(5)).toBeCloseTo((5 - 3) * T + range * T);
				expect(map.ScreenY(2)).toBeCloseTo(2 * T + range * T);
			}
		});

		it.each([500, 1000, 2000])("casts vision from the player's tile and lights a %i px map through the camera", (split) => {
			g.ChatRoomMapViewSplitPosition = split;
			room(["...P."]);
			const T = map.TileUnit;
			expect(map.viewpoint.x).toBeCloseTo(3.5);
			expect(map.viewpoint.y).toBeCloseTo(0.5 - 50 / T);
			expect(map.viewpoint.radius).toBe(8);
			// The player's tile lands in the middle of the drawn map
			expect(map.camera.x + 3 * map.camera.scale).toBeCloseTo((split - T) / 2);
			g.ChatRoomMapFogIsActive = () => true;
			g.ChatRoomMapViewHasSuperPowers = () => false;
			g.MainCanvas = Object.assign(recordingContext().ctx, { canvas: { width: 2000, height: 1000 } });
			g.MouseX = 10; g.MouseY = 20;
			const render = vi.spyOn(map.lightingEngine, "render").mockImplementation(() => {});
			g.ChatRoomMapViewDrawGrid();
			expect(render.mock.calls[0][0]).toMatchObject({ width: split, height: 1000, view: { scale: T } });
			expect(render.mock.calls[0][0].view!.x).toBeCloseTo(-3 * T + (split - T) / 2);
			expect(render.mock.calls[0][0].viewpoint).toMatchObject({ radius: 8 });
			render.mockRestore();
		});

		it("places a light on its tile for the current split", () => {
			g.ChatRoomMapViewSplitPosition = 2000;
			room(["P.L"]);
			map.ParseMapForObjects();
			const T = map.TileUnit;
			// World position is the tile; the camera puts the player's tile (0) in the middle of 2000 px.
			expect(map.mapLights[0].x).toBeCloseTo(2.5);
			expect(map.camera.x + map.mapLights[0].x * map.camera.scale).toBeCloseTo((2000 - T) / 2 + 2 * T + T / 2);
		});

		it("the camera agrees with ScreenX and ScreenY (BC's own tile placement), at any zoom, split and position", () => {
			for (const [range, split, px, py] of [[4, 1000, 3, 2], [12, 1000, 0, 0], [8, 2000, 7, 5], [2, 500, 1, 9]] as const) {
				g.ChatRoomMapViewPerceptionRange = range;
				g.ChatRoomMapViewSplitPosition = split;
				room(["P"]);
				g.Player.MapData.Pos = { X: px, Y: py };
				const cam = map.camera;
				expect(cam.x + 11 * cam.scale).toBeCloseTo(map.ScreenX(11));
				expect(cam.y + 4 * cam.scale).toBeCloseTo(map.ScreenY(4));
			}
		});

		it("looks further to the sides on a wide map, since more columns are on screen", () => {
			g.ChatRoomMapViewWidth = 40;
			g.ChatRoomMapViewSplitPosition = 1000;
			expect(map.lightingVisionMaxX).toBe(map.lightingVisionMax);
			g.ChatRoomMapViewSplitPosition = 2000;
			const extra = Math.ceil(1000 / (2 * map.TileUnit));
			expect(map.lightingVisionMaxX).toBe(Math.min(map.lightingVisionMax + extra, 40));
			expect(map.lightingVisionMaxX).toBeGreaterThan(map.lightingVisionMax);
		});

	});
});

describe("LightingEngine", () => {
	const light = (over: Partial<Light> = {}): Light => ({ id: "l", x: 50, y: 50, radius: 40, color: [200, 100, 50, 0.8], ...over });

	it("keeps a light's animation phase when the map is parsed again and the light object is rebuilt", () => {
		const engine = new LightingEngine();
		const first = light({ id: "L_3_4_x", animType: "flicker" });
		engine.updateAnimations([first]);
		const seed = first._animState!.seed;
		// A re-parse builds a fresh object for the same lamp, possibly at a new screen position
		const rebuilt = light({ id: "L_3_4_x", animType: "flicker", x: 200, y: 90 });
		engine.updateAnimations([rebuilt]);
		expect(rebuilt._animState!.seed).toBe(seed);
		expect(rebuilt._animState!.baseX).toBe(200);
		// A different lamp gets its own phase
		const other = light({ id: "L_9_9_x", animType: "flicker" });
		engine.updateAnimations([other]);
		expect(other._animState!.seed).not.toBe(seed);
	});

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

	it("renders world-space lights through the view transform, and skips lights that cannot reach the lit area", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		const lightRec = recordingContext();
		const visionRec = recordingContext();
		const setTransform = vi.fn();
		const fillRect = vi.fn();
		// The ambient fill is a fillRect over the whole layer; only count the lights' boxes
		const lightBoxes = () => fillRect.mock.calls.filter(c => !(c[0] === 0 && c[1] === 0 && c[2] === 100 && c[3] === 100));
		Object.assign(lightRec.ctx, { setTransform, fillRect });
		internals.lightCtx = lightRec.ctx;
		internals.visionCtx = visionRec.ctx;
		const square = new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
		internals.lightMaskCache = { near: square, far: square };
		const near = light({ id: "near", x: 5, y: 5, radius: 2 });
		const far = light({ id: "far", x: 50, y: 50, radius: 2 });
		// 10 canvas px per world unit, 100 px lit: the visible world is 0 to 10 each way
		engine.render({ mainCtx: recordingContext().ctx, width: 100, height: 100, lights: [near, far], view: { scale: 10, x: 0, y: 0 } });
		expect(setTransform).toHaveBeenCalledWith(10, 0, 0, 10, 0, 0);
		expect(lightBoxes()).toEqual([[3, 3, 4, 4]]); // the near light's box in world units

		// The camera moving to the far light brings it in and takes the near one out
		fillRect.mockClear();
		engine.render({ mainCtx: recordingContext().ctx, width: 100, height: 100, lights: [near, far], view: { scale: 10, x: -450, y: -450 } });
		expect(lightBoxes()).toEqual([[48, 48, 4, 4]]);
	});

	it("still pans by `camera` when no view is given", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		const lightRec = recordingContext();
		const setTransform = vi.fn();
		Object.assign(lightRec.ctx, { setTransform });
		internals.lightCtx = lightRec.ctx;
		internals.visionCtx = recordingContext().ctx;
		engine.render({ mainCtx: recordingContext().ctx, width: 100, height: 100, lights: [], camera: { x: 30, y: 40 } });
		// no lights, so only ambient; drawLights still sets the transform for each pass
		expect(setTransform).toHaveBeenCalledWith(1, 0, 0, 1, -30, -40);
	});

	describe("layer caching and quality", () => {
		const square = () => new Float32Array([0, 0, 100, 0, 100, 100, 0, 100]);
		const setup = () => {
			const engine = new LightingEngine();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const internals = engine as any;
			const lightFill = vi.fn(), visionFill = vi.fn(), lightSetTransform = vi.fn(), drawImage = vi.fn();
			const lightRec = recordingContext(), visionRec = recordingContext(), main = recordingContext();
			Object.assign(lightRec.ctx, { fillRect: lightFill, setTransform: lightSetTransform });
			Object.assign(visionRec.ctx, { fillRect: visionFill });
			Object.assign(main.ctx, { drawImage });
			internals.lightCtx = lightRec.ctx;
			internals.visionCtx = visionRec.ctx;
			internals.lightMaskCache = { l: square() };
			internals.visionMaskCache = new Float32Array([0, 0, 10, 0, 10, 10]);
			const lamp = light({ id: "l", x: 5, y: 5, radius: 3 });
			const render = (over: Record<string, unknown> = {}) =>
				engine.render({ mainCtx: main.ctx, width: 200, height: 100, lights: [lamp], viewpoint: { x: 0, y: 0, radius: 8 }, view: { scale: 10, x: 0, y: 0 }, ...over });
			return { engine, internals, lamp, render, lightFill, visionFill, lightSetTransform, drawImage, main };
		};

		it("redraws neither layer when nothing changed, but still composites both onto the map every frame", () => {
			const { render, lightFill, visionFill, drawImage } = setup();
			render();
			const [lightCalls, visionCalls] = [lightFill.mock.calls.length, visionFill.mock.calls.length];
			expect(lightCalls).toBeGreaterThan(0);
			expect(visionCalls).toBe(1);
			render();
			render();
			expect(lightFill.mock.calls.length).toBe(lightCalls);
			expect(visionFill.mock.calls.length).toBe(visionCalls);
			expect(drawImage).toHaveBeenCalledTimes(6); // light layer and vision layer, three frames
		});

		it("redraws the light layer when a light's opacity changes (a flicker), but not the vision layer", () => {
			const { render, lamp, lightFill, visionFill } = setup();
			render();
			const [lightCalls, visionCalls] = [lightFill.mock.calls.length, visionFill.mock.calls.length];
			lamp.color[3] = 0.7;
			render();
			expect(lightFill.mock.calls.length).toBeGreaterThan(lightCalls);
			expect(visionFill.mock.calls.length).toBe(visionCalls);
		});

		it("redraws both layers when the camera moves", () => {
			const { render, lightFill, visionFill } = setup();
			render();
			const [lightCalls, visionCalls] = [lightFill.mock.calls.length, visionFill.mock.calls.length];
			render({ view: { scale: 10, x: -10, y: 0 } });
			expect(lightFill.mock.calls.length).toBeGreaterThan(lightCalls);
			expect(visionFill.mock.calls.length).toBeGreaterThan(visionCalls);
		});

		it("redraws when a new polygon arrives from the worker, the light layer for a light's and the vision layer for the player's", () => {
			const { render, internals, lightFill, visionFill } = setup();
			render();
			const [lightCalls, visionCalls] = [lightFill.mock.calls.length, visionFill.mock.calls.length];
			internals.lightMaskCache = { l: square() };
			render();
			expect(lightFill.mock.calls.length).toBeGreaterThan(lightCalls);
			expect(visionFill.mock.calls.length).toBe(visionCalls);
			internals.visionMaskCache = new Float32Array([0, 0, 20, 0, 20, 20]);
			render();
			expect(visionFill.mock.calls.length).toBeGreaterThan(visionCalls);
		});

		it("redraws the layers when the light's polygon changes, the ambient colour changes, or the area is resized", () => {
			const { render, lightFill } = setup();
			render();
			let calls = lightFill.mock.calls.length;
			render({ ambientColor: "rgb(10, 10, 10)" });
			expect(lightFill.mock.calls.length).toBeGreaterThan(calls);
			calls = lightFill.mock.calls.length;
			render({ ambientColor: "rgb(10, 10, 10)", width: 300 });
			expect(lightFill.mock.calls.length).toBeGreaterThan(calls);
		});

		it("skips the vision layer entirely without a viewpoint, and redraws it when the viewpoint comes back", () => {
			const { render, visionFill, drawImage } = setup();
			render({ viewpoint: undefined });
			expect(visionFill).not.toHaveBeenCalled();
			expect(drawImage).toHaveBeenCalledTimes(1);
			render();
			expect(visionFill).toHaveBeenCalledTimes(1);
		});

		it("half quality draws the layers at half size and scales them up onto the map", () => {
			const { render, internals, lightSetTransform, drawImage } = setup();
			render({ quality: "half" });
			expect(internals.lightCanvas.width).toBe(100);
			expect(internals.lightCanvas.height).toBe(50);
			expect(internals.visionCanvas.width).toBe(100);
			// the view (10 px per world unit) is halved too, so the lights land in the same place
			expect(lightSetTransform).toHaveBeenCalledWith(5, 0, 0, 5, 0, 0);
			expect(drawImage).toHaveBeenCalledWith(internals.lightCanvas, 0, 0, 100, 50, 0, 0, 200, 100);
			expect(drawImage).toHaveBeenCalledWith(internals.visionCanvas, 0, 0, 100, 50, 0, 0, 200, 100);
		});

		describe("statistics overlay", () => {
			/** The text drawn on the main canvas, and the boxes filled on it. */
			const overlay = () => {
				const ctx = setup();
				const texts: string[] = [], boxes: number[][] = [];
				const stroke = vi.fn();
				Object.assign(ctx.main.ctx, { fillText: (t: string) => texts.push(t), fillRect: (...a: number[]) => boxes.push(a), stroke });
				return { ...ctx, texts, boxes, stroke };
			};

			it("draws nothing extra when off", () => {
				const { engine, render, texts, stroke } = overlay();
				expect(engine.hudMode).toBe("off");
				render();
				expect(texts).toEqual([]);
				expect(stroke).not.toHaveBeenCalled();
			});

			it("stats shows the timings and counts but not the geometry", () => {
				const { engine, render, texts, stroke } = overlay();
				engine.setHudMode("stats");
				render({ totalLights: 7 });
				const text = texts.join("\n");
				for (const label of ["LSCG map stats [stats]", "FPS", "Map draw", "Lighting", "Redraws/s", "Worker", "Segments"]) expect(text).toContain(label);
				expect(text).toContain("1 drawn of 7");
				expect(stroke).not.toHaveBeenCalled();
			});

			it("debug adds the lighting geometry", () => {
				const { engine, internals, render, texts, stroke } = overlay();
				internals.segments = [{ p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 } }];
				engine.setHudMode("debug");
				render();
				expect(texts.join("\n")).toContain("[debug]");
				expect(stroke).toHaveBeenCalled();
				expect(texts.join("\n")).toContain("Segments  1");
			});

			it("sits inside the right edge of the map, not over the chat, whatever the map's width", () => {
				const { engine, render, boxes } = overlay();
				engine.setHudMode("stats");
				render({ width: 1000 });
				expect(boxes.at(-1)![0]).toBe(1000 - 340 - 10);
				render({ width: 2000 });
				expect(boxes.at(-1)![0]).toBe(2000 - 340 - 10);
				render({ width: 200 });
				expect(boxes.at(-1)![0]).toBe(0);
			});

			it("keeps `debug` working as an on/off flag", () => {
				const { engine } = overlay();
				engine.debug = true;
				expect(engine.hudMode).toBe("debug");
				expect(engine.debug).toBe(true);
				engine.setHudMode("stats");
				expect(engine.debug).toBe(false);
				engine.debug = false;
				expect(engine.hudMode).toBe("off");
			});

			it("asks for the walls again when geometry is switched on, since the worker only returns them when asked", () => {
				const { engine } = overlay();
				const lamp = light();
				const walls = [{ type: "rectangle" as const, topLeft: { x: 0, y: 0 }, bottomRight: { x: 5, y: 5 } }];
				engine.compute([lamp], walls, undefined);
				const compute = vi.spyOn(engine, "compute");
				engine.setHudMode("stats");
				expect(compute).not.toHaveBeenCalled();
				engine.setHudMode("debug");
				expect(compute).toHaveBeenCalledWith([lamp], walls, undefined);
				compute.mockClear();
				engine.setHudMode("debug");
				expect(compute).not.toHaveBeenCalled();
				compute.mockRestore();
			});

			it("counts compute jobs and layer redraws per second", () => {
				let now = 5000;
				const clock = vi.spyOn(performance, "now").mockImplementation(() => now);
				const { engine, internals, render, lamp } = overlay();
				engine.setHudMode("stats");
				engine.compute([lamp], [], undefined);
				engine.updateLights([lamp]);
				render();
				lamp.color[3] = 0.5;
				render();
				now += 1500;
				render();
				expect(internals.hz.compute).toBe(2);
				expect(internals.hz.lightsRedrawn).toBeGreaterThanOrEqual(2);
				expect(internals.hz.visionRedrawn).toBeGreaterThanOrEqual(1);
				clock.mockRestore();
			});
		});

		it("switching quality resizes the layers and redraws them", () => {
			const { render, internals, lightFill } = setup();
			render();
			expect(internals.lightCanvas.width).toBe(200);
			const calls = lightFill.mock.calls.length;
			render({ quality: "half" });
			expect(internals.lightCanvas.width).toBe(100);
			expect(lightFill.mock.calls.length).toBeGreaterThan(calls);
			render({ quality: "full" });
			expect(internals.lightCanvas.width).toBe(200);
		});
	});

	it("animates colours in place, without touching the colour array a light source shares", () => {
		const engine = new LightingEngine();
		const shared: [number, number, number, number] = [250, 220, 150, 0.8];
		const lamp = light({ id: "shared", animType: "flicker", color: shared });
		engine.updateAnimations([lamp]);
		const own = lamp.color;
		expect(own).not.toBe(shared);
		engine.updateAnimations([lamp]);
		engine.updateAnimations([lamp]);
		expect(lamp.color).toBe(own); // updated in place, not replaced each frame
		expect(shared).toEqual([250, 220, 150, 0.8]);
	});

	it("merges a partial worker result into the cache, and replaces it on a full one", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		const poly = (n: number) => new Float32Array([n, n, n + 1, n, n, n + 1]);
		const done = (payload: object) => internals.handleWorkerMessage({ data: { type: "COMPUTE_DONE", payload } });

		done({ full: true, lightPolygons: { a: poly(1), b: poly(2) }, visionPolygon: poly(9) });
		expect(Object.keys(internals.lightMaskCache).sort()).toEqual(["a", "b"]);

		// An update for one moving light and no new vision polygon leaves the rest alone
		done({ full: false, lightPolygons: { b: poly(5) } });
		expect(Array.from(internals.lightMaskCache.a)).toEqual(Array.from(poly(1)));
		expect(Array.from(internals.lightMaskCache.b)).toEqual(Array.from(poly(5)));
		expect(Array.from(internals.visionMaskCache)).toEqual(Array.from(poly(9)));

		// ...and a new vision polygon replaces only the vision
		done({ full: false, lightPolygons: {}, visionPolygon: poly(7) });
		expect(Array.from(internals.visionMaskCache)).toEqual(Array.from(poly(7)));
		expect(Object.keys(internals.lightMaskCache).sort()).toEqual(["a", "b"]);

		// A full result drops lights that no longer exist
		done({ full: true, lightPolygons: { c: poly(3) }, visionPolygon: poly(4) });
		expect(Object.keys(internals.lightMaskCache)).toEqual(["c"]);
	});

	it("ignores worker messages that are not results", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		internals.handleWorkerMessage({ data: { type: "SOMETHING_ELSE", payload: { full: true, lightPolygons: { x: new Float32Array(2) } } } });
		expect(internals.lightMaskCache).toEqual({});
	});

	it("starts the queued job when a result arrives, and frees the worker when none is queued", () => {
		const engine = new LightingEngine();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		const send = vi.spyOn(internals, "sendToWorker").mockImplementation(() => {});
		internals.isWorkerBusy = true;
		internals.pendingJob = { type: "UPDATE_LIGHTS", lights: [], movingLights: [light()], viewpoint: undefined };
		internals.handleWorkerMessage({ data: { type: "COMPUTE_DONE", payload: { full: false, lightPolygons: {} } } });
		expect(send).toHaveBeenCalledWith("UPDATE_LIGHTS", expect.any(Array), undefined, undefined);
		expect(internals.isWorkerBusy).toBe(true);
		internals.handleWorkerMessage({ data: { type: "COMPUTE_DONE", payload: { full: false, lightPolygons: {} } } });
		expect(internals.isWorkerBusy).toBe(false);
		send.mockRestore();
	});

	describe("main-thread fallback budget", () => {
		const wall = [{ type: "rectangle" as const, topLeft: { x: 70, y: 0 }, bottomRight: { x: 80, y: 100 } }];
		let clock: ReturnType<typeof vi.spyOn>;
		let now = 1000;

		beforeEach(() => {
			now = 1000;
			clock = vi.spyOn(performance, "now").mockImplementation(() => now);
		});
		afterEach(() => clock.mockRestore());

		it("does not hold back a compute that was fast", () => {
			const engine = new LightingEngine();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const internals = engine as any;
			engine.compute([light()], wall, undefined);
			engine.compute([light({ id: "second" })], wall, undefined);
			expect(Object.keys(internals.lightMaskCache)).toEqual(["second"]);
			expect(internals.fallbackPending).toBeNull();
		});

		it("holds back the next compute after a slow one, keeps only the newest request, and runs it on render", () => {
			const engine = new LightingEngine();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const internals = engine as any;
			// The first compute takes 106 ms of the stubbed clock (merge is where the time passes), 100 over the budget.
			const slow = vi.spyOn(internals, "getLightId").mockImplementationOnce((l: Light) => { now += 106; return l.id; });
			engine.compute([light({ id: "first" })], wall, undefined);
			slow.mockRestore();
			expect(Object.keys(internals.lightMaskCache)).toEqual(["first"]);

			// Within the hold: nothing computed, the newest request waits
			engine.compute([light({ id: "dropped" })], wall, undefined);
			engine.compute([light({ id: "newest" })], wall, undefined);
			expect(Object.keys(internals.lightMaskCache)).toEqual(["first"]);
			expect(internals.fallbackPending.lights[0].id).toBe("newest");

			// Rendering before the hold is over does not run it
			internals.lightCtx = recordingContext().ctx;
			internals.visionCtx = recordingContext().ctx;
			const ctx = recordingContext().ctx;
			engine.render({ mainCtx: ctx, width: 100, height: 100, lights: [] });
			expect(Object.keys(internals.lightMaskCache)).toEqual(["first"]);

			// After the hold, the next render runs the waiting compute
			now += 1000;
			engine.render({ mainCtx: ctx, width: 100, height: 100, lights: [] });
			expect(Object.keys(internals.lightMaskCache)).toEqual(["newest"]);
			expect(internals.fallbackPending).toBeNull();
		});
	});

	it("computes light and vision masks without a worker, and updates moving lights", () => {
		const engine = new LightingEngine();
		const lamp = light();
		engine.compute([lamp], [{ type: "rectangle", topLeft: { x: 70, y: 0 }, bottomRight: { x: 80, y: 100 } }], { x: 50, y: 50, radius: 100 });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const internals = engine as any;
		expect(internals.lightMaskCache.l.length).toBeGreaterThan(0);
		// Polygons are flat [x0, y0, x1, y1, ...] arrays
		const xs = (poly: Float32Array) => Array.from(poly).filter((_, i) => i % 2 === 0);
		expect(Math.max(...xs(internals.lightMaskCache.l))).toBeCloseTo(70);
		expect(internals.visionMaskCache.length).toBeGreaterThan(0);
		lamp.x = 20;
		engine.updateLights([lamp], undefined);
		expect(Math.min(...xs(internals.lightMaskCache.l))).toBeCloseTo(-20);
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

describe("MapModule performance settings", () => {
	it("keeps every vanilla-changing improvement opt-in, and light quality at full", () => {
		const defaults = new MapModule().defaultSettings;
		expect(defaults.perfWallEffectTable).toBe(false);
		expect(defaults.perfFastPerception).toBe(false);
		expect(defaults.perfFastMapRenderer).toBe(false);
		expect(defaults.perfDrawImageFastPath).toBe(false);
		expect(defaults.perfLightQuality).toBe("full");
	});
});
