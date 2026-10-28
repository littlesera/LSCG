// BC R133 regressions: MapManager's getters now throw until the map view first
// activates (R132 started from an empty map), and activity icons moved from
// Assets/Female3DCG/Activity/ to Icons/Activity/.
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { MapModule } from "Modules/map";
import { ActivityModule } from "Modules/activities";
import { boot } from "../harness/world";

const g = globalThis as Record<string, any>;

describe("BC R133 compatibility", () => {
	beforeAll(() => {
		boot(new CoreModule());
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("MapModule.ParseMapForObjects", () => {
		it("does not throw when MapManager has no map loaded yet (joining a map room before the map view activates)", () => {
			vi.stubGlobal("ChatRoomMapViewPerceptionRange", 4);
			vi.stubGlobal("ChatRoomMapViewPerceptionRangeMax", 10);
			vi.stubGlobal("ChatRoomMapViewEditMode", "");
			vi.stubGlobal("ChatRoomMapViewWidth", 40);
			vi.stubGlobal("ChatRoomMapViewHeight", 40);
			const map = new MapModule();
			vi.spyOn(map, "EnhancedLightingEnabled", "get").mockReturnValue(true);
			const notLoaded = () => { throw new Error("No map loaded"); };
			vi.stubGlobal("MapManager", { Map: { getTileId: notLoaded, getEffects: notLoaded } });
			vi.stubGlobal("ChatRoomMapViewGetObjectAtPos", notLoaded);
			vi.stubGlobal("ChatRoomData", { MapData: { Type: "Always" } });
			const prevMapData = g.Player.MapData;
			g.Player.MapData = { Pos: { X: 0, Y: 0 } };
			try {
				expect(map.MapLoaded).toBe(false);
				expect(() => map.ParseMapForObjects()).not.toThrow();
			} finally {
				g.Player.MapData = prevMapData;
				vi.unstubAllGlobals();
			}
		});
	});

	describe("ActivityModule image resolution", () => {
		const resolve = (mod: ActivityModule, img: string) => (mod as any).ResolveImage(img) as string;

		it("maps the pre-R133 activity icon path forward once Icons/Activity exists", () => {
			const mod = new ActivityModule();
			(mod as any).newIconPathExists = true;
			expect(resolve(mod, "Assets/Female3DCG/Activity/Slap.png")).toBe("Icons/Activity/Slap.png");
			expect(resolve(mod, "Icons/Activity/Slap.png")).toBe("Icons/Activity/Slap.png");
		});

		it("still falls back to the old path until Icons/Activity is confirmed", () => {
			const mod = new ActivityModule();
			expect(resolve(mod, "Icons/Activity/Slap.png")).toBe("Assets/Female3DCG/Activity/Slap.png");
		});
	});
});
