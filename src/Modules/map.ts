import { BaseModule } from "base";
import { getModule } from "modules";
import { MapSettingsModel } from "Settings/Models/base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { Color, HudMode, Light, LineObstacle, OpaqueObstacle, Viewpoint } from "Utilities/lighting.types";
import { drawBlindfold, GetItemNameAndDescriptionConcat, hookFunction, isPhraseInString } from "utils";
import { StateModule } from "./states";
import { ScreenItems } from "./item-use";
import { debounce } from "lodash-es";
import { GuiMaps } from "Settings/maps";
import { LightingEngine } from "Utilities/lighting.engine";
import { exposePerf, recordPerf } from "Utilities/perf";
import { isDevBuild } from "Utilities/dev";

interface lightingSource {
    objId: number;
    heightOffset?: number;
    xOffset?: number;
    color?: Color;
    radius?: number; // in tile counts
    angle?: number;
    fov?: number;
    animType?: "flicker" | "pulse" | "glitch" | "hover" | "none";
}

interface WallSides {
    isolated: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
    doorBelow: boolean;
}

/** Where the map statistics overlay mode is remembered, per browser. */
const STATS_MODE_KEY = "LSCG_MAP_STATS";

/** The engine treats a light at or below this opacity as drawing nothing worth keeping (see LightingEngine.render). */
const MIN_VISIBLE_LIGHT_ALPHA = 0.01;

export class MapModule extends BaseModule {
    lastMouseX: number = 0;
    lastMouseY: number = 0;

    /** Character lights (what people hold or wear) change in bursts, e.g. everyone's canvas loading as a room fills. */
    debouncedCharacterLightRefresh = debounce(() => {
        this.RefreshCharacterLightsIfChanged();
    }, 150, { leading: false, trailing: true, maxWait: 500 });

    get zoomLevel(): number {
        return ChatRoomMapViewPerceptionRange;
    }

    get lightingVisionMax(): number {
        // Set max 10 (default max) for now, since people maxing 'ChatRoomMapViewPerceptionRangeMax' can cause it to calculate a ton
        return this.lightingEngine.debug ? ChatRoomMapViewPerceptionRangeMax : Math.min(ChatRoomMapViewPerceptionRangeMax + 3, 40); // push an extra 3 tiles for lights to still see some effects while blinded
    }

    /**
     * How many columns either side of the player lights and walls are considered. The same as the rows (lightingVisionMax)
     * except on a map drawn wider than 1000 px (BC R134's resizable split), where the extra columns on screen need lights too.
     */
    get lightingVisionMaxX(): number {
        const extraColumns = this.MapWidth > 1000 ? Math.ceil((this.MapWidth - 1000) / (2 * this.TileUnit)) : 0;
        return Math.min(this.lightingVisionMax + extraColumns, ChatRoomMapViewWidth);
    }

    get defaultSettings() {
        return <MapSettingsModel>{
            enabled: true,
            enhancedLighting: false,
            disableLightAnimation: false,
            useEnhancedBlinding: true,
            useRoomCustomization: true,
            hideVanillaFog: false,
            hideDarkLights: false,
            perfWallEffectTable: false,
            perfFastPerception: false,
            perfFastMapRenderer: false,
            perfDrawImageFastPath: false,
            perfLightQuality: "full",
        };
    }

    get settings(): MapSettingsModel {
        return super.settings as MapSettingsModel;
    }

    get settingsScreen(): Subscreen | null {
        return GuiMaps;
    }

    get EnhancedLightingEnabled(): boolean {
		return super.Enabled && this.settings.enhancedLighting && !ChatRoomMapViewEditMode;
	}

    lightSources: lightingSource[] = [
        {
            objId: 3030, // Candelabra
            radius: 5,
            animType: "flicker",
            color: [250, 220, 150, 0.8],
        },
        {
            objId: 2090, // Lamppost
            heightOffset: 1.4,
            radius: 6,
            color: [200, 200, 200, 0.8],
        },
        {
            objId: 610, // Log Fire
            radius: 4,
            color: [250, 220, 150, 1],
            animType: "flicker",
            heightOffset: 0.2,
        },
        {
            objId: 611, // Log Fire (anim)
            radius: 4,
            color: [255, 194, 90, 0.9],
            animType: "flicker",
            heightOffset: 0.2,
        },
        {
            objId: 3050, // Fireplace left
            radius: 4,
            angle: 95,
            fov: 120,
            color: [209, 137, 69, 0.8],
            animType: "flicker",
            xOffset: -0.2,
            heightOffset: -0.25,
        },
        {
            objId: 3050, // Fireplace right
            radius: 4,
            angle: 85,
            fov: 120,
            color: [232, 174, 107, 0.8],
            animType: "flicker",
            xOffset: 0.2,
            heightOffset: -0.25,
        },
        {
            objId: 3050, // Fireplace center
            radius: 4,
            angle: 90,
            fov: 120,
            color: [250, 220, 150, 1],
            animType: "flicker",
            heightOffset: -0.1,
        },
        {
            objId: 2060, // xmas tree White
            radius: 0.3,
            animType: "flicker",
            color: [255, 217, 125, 1],
            heightOffset: 1.15,
        },
        {
            objId: 2060, // xmas tree Red
            radius: 1,
            animType: "flicker",
            color: [182, 0, 0, 0.8],
            heightOffset: 0.3,
        },
        {
            objId: 2060, // xmas tree Green
            radius: 1,
            animType: "flicker",
            color: [7, 86, 0, 0.8],
            heightOffset: -0.2,
        },
    ];

    lightingEngine: LightingEngine = new LightingEngine();
    /** Map lights then character lights. Read several times a frame, so the combined array is only rebuilt when either list changed. */
    get allLights(): Light[] {
        if (this._allLights && this._allMap === this.mapLights && this._allChar === this.charLights
            && this._allMapLength === this.mapLights.length && this._allCharLength === this.charLights.length) {
            return this._allLights;
        }
        this._allMap = this.mapLights;
        this._allChar = this.charLights;
        this._allMapLength = this.mapLights.length;
        this._allCharLength = this.charLights.length;
        return this._allLights = [...this.mapLights, ...this.charLights];
    }
    private _allLights?: Light[];
    private _allMap?: Light[];
    private _allChar?: Light[];
    private _allMapLength = -1;
    private _allCharLength = -1;
    mapLights: Light[] = [];
    charLights: Light[] = [];
    /**
     * Everything the lighting engine works with is in WORLD space: one unit is one tile, and tile (X, Y)'s top-left corner is
     * at (X, Y). Walls, light positions and radii never depend on where the player is or how zoomed in the view is, so their
     * visibility polygons stay valid as the player walks and zooms; only the camera (below) moves.
     *
     * Where vision is cast from: slightly above the middle of the player's tile (50 canvas px, whatever the zoom).
     */
    get viewpoint(): Viewpoint {
        const pos = Player?.MapData?.Pos;
        return {
            x: (pos?.X ?? 0) + 0.5,
            y: (pos?.Y ?? 0) + 0.5 - 50 / this.TileUnit,
            radius: 8,
        };
    }

    /**
     * Maps world space to the canvas, the way BC's DrawGrid places tiles: the player's tile is centred in the drawn map
     * (which is 1000 px wide, or the width of the resizable map on BC R134), so canvas = world * scale + offset.
     */
    get camera(): { scale: number; x: number; y: number } {
        const scale = this.TileUnit;
        const pos = Player?.MapData?.Pos;
        return {
            scale,
            x: -(pos?.X ?? 0) * scale + (this.MapWidth - scale) / 2,
            y: -(pos?.Y ?? 0) * scale + (1000 - scale) / 2,
        };
    }

    /** The lights worth drawing now: those inside the lighting window around the player (see lightingVisionMax). */
    get visibleLights(): Light[] {
        const all = this.allLights;
        const pos = Player?.MapData?.Pos;
        const key = `${pos?.X},${pos?.Y},${this.lightingVisionMax},${this.lightingVisionMaxX}`;
        if (this._visibleFor === all && this._visibleKey === key && this._visibleLength === all.length) return this._visible!;
        const rangeY = Math.max(this.lightingVisionMax, 1);
        const rangeX = Math.max(rangeY, this.lightingVisionMaxX);
        const px = pos?.X ?? 0, py = pos?.Y ?? 0;
        this._visibleFor = all;
        this._visibleKey = key;
        this._visibleLength = all.length;
        return this._visible = all.filter(l => Math.abs((l.tileX ?? Math.floor(l.x)) - px) <= rangeX && Math.abs((l.tileY ?? Math.floor(l.y)) - py) <= rangeY);
    }
    private _visible?: Light[];
    private _visibleFor?: Light[];
    private _visibleKey = "";
    private _visibleLength = -1;

    drawingMapFlag: boolean = false;

    /** Bumped whenever the room's map data (tiles, objects, effects) is seen to have changed. */
    private mapRevision = 0;
    private mapFingerprint: { tiles?: string; objects?: string; effects?: string } = {};
    /** What the walls and map lights were last built from; they are rebuilt only when this changes. */
    private lastStaticSignature = "";
    /** What the door obstacles and the vision polygon were last computed for. */
    private lastDoorSignature = "";
    private lastViewSignature = "";
    private lastCharacterLightSignature = "";
    /** Wall obstacles (everything but doors) from the last static parse. */
    private wallObstacles: OpaqueObstacle[] = [];
    /** Tiles holding a door, from the last static parse. Door obstacles depend on where the player stands. */
    private doorTiles: { X: number; Y: number }[] = [];

    load(): void {
        (window as any).lighting = this.lightingEngine; // Expose the lighting engine for debugging/testing
        // window.lscgPerf: rolling map/lighting frame timings for profiling and the browser perf test, and hud() to show them on the map
        exposePerf(window as unknown as { lscgPerf?: unknown }, (mode?: string) => this.SetStatsMode(mode));
        this.RestoreStatsMode();

        // In a development build (or with localStorage.LSCG_DEV = "1"), Alt+Shift+L steps the map statistics overlay.
        hookFunction("GameKeyDown", 1, (args, next) => {
            const event = args[0] as KeyboardEvent | undefined;
            if (event?.altKey && event.shiftKey && event.code === "KeyL" && isDevBuild() && this.Enabled) {
                this.SetStatsMode();
                return true;
            }
            return next(args);
        }, ModuleCategory.Map);

        // Performance hack, ChatRoomActivateView is fired every frame if the map is always, causing a flood of redundant event hookups and disconnects.
        hookFunction("ChatRoomActivateView", 1, (args, next) => {
            const viewName = args[0] as "Character" | "Map";
            if (ChatRoomActiveView == ChatRoomViews[viewName])
                return;
            next(args);
            if (viewName === ChatRoomMapViewName) this.RequestParse(true);
        }, ModuleCategory.Map);

        hookFunction("RgbaArrayToHTMLColor", 1, (args, next) => { // Hack for effect overlay rectangles, since we're overriding them as lighting 'indicators'
            if (this.EnhancedLightingEnabled && this.drawingMapFlag && ChatRoomMapViewEditMode !== "Effect") {
                return "rgba(0,0,0,0)";
            }
            return next(args);
        }, ModuleCategory.Map);

        hookFunction("DrawImageResize", 1, (args, next) => {
            if (this.EnhancedLightingEnabled && this.drawingMapFlag && this.settings.hideVanillaFog && args[0] === "Assets/Map/Tiles/Fog/Half.png") {
                return true; // Hack to prevent half fog squares
            }
            return next(args);
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewDrawGrid", 1, (args, next) => {
            this.CheckMapDataChanged();
            this.drawingMapFlag = true;
            const drawStart = performance.now();
            next(args);
            recordPerf("drawGrid", performance.now() - drawStart);
            this.drawingMapFlag = false;

            if (this.EnhancedLightingEnabled) {
                if (this.lightingEngine.debug && Player && Player.MapData && Player.MapData.Pos) {
                    for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
                        const X = Pos % ChatRoomMapViewWidth;
                        const Y = Math.floor(Pos / ChatRoomMapViewWidth);
                        const MaxRange = Math.max(Math.abs(X - Player.MapData?.Pos.X), Math.abs(Y - Player?.MapData?.Pos.Y));
                        if (MaxRange > ChatRoomMapViewGetSightRange()) continue;

                        const ScreenX = this.ScreenX(X);
                        const ScreenY = this.ScreenY(Y);
                        MainCanvas.save();
                        MainCanvas.textAlign = "left";
                        MainCanvas.textBaseline = "top";
                        DrawEmptyRect(ScreenX, ScreenY, this.TileUnit, this.TileUnit, "grey");
                        DrawTextFit(`${X},${Y}`, ScreenX, ScreenY, this.TileUnit/4, "white");
                        MainCanvas.restore();
                    }
                }

                if (this.lightingVisionMax > 10) {
                    this.lightingEngine.disableSpatialAnimations = true;
                }
                if (!this.settings.disableLightAnimation) {
                    this.lastMouseX = MouseX >= 0 ? MouseX : this.lastMouseX;
                    this.lastMouseY = MouseY >= 0 ? MouseY : this.lastMouseY;
                    const cam = this.camera;
                    // The flashlight aims at the mouse; lights are in world space, the mouse is on the canvas.
                    this.lightingEngine.updateAnimations(this.visibleLights, {x: (this.lastMouseX - cam.x) / cam.scale, y: (this.lastMouseY - cam.y) / cam.scale});
                }

                let ambientColor = "rgb(60, 60, 60)";
                if (this.settings.useRoomCustomization && !!ChatRoomData?.Custom?.ImageFilter) {
                    const color = this.hexToColor(ChatRoomData?.Custom?.ImageFilter, 1);
                    ambientColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
                }

                const useViewpoint = ChatRoomMapFogIsActive() && !ChatRoomMapViewHasSuperPowers();
                
                this.lightingEngine.render({
                    mainCtx: MainCanvas, 
                    width: this.MapWidth, 
                    height: MainCanvas.canvas.height, 
                    lights: this.visibleLights,
                    view: this.camera,
                    quality: this.settings.perfLightQuality === "half" ? "half" : "full",
                    totalLights: this.allLights.length,
                    viewpoint: (useViewpoint ? this.viewpoint : undefined),
                    ambientColor: ambientColor,
                });

                if (this.settings.useEnhancedBlinding) {
                    const blindLevel = Player.GetBlindLevel();
                    if (blindLevel > 0) {
                        drawBlindfold(blindLevel, MainCanvas);
                    }
                }
            }
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewSyncMapData", 1, (args, next) => {
            next(args);
            if (this.EnhancedLightingEnabled) {
                this.RecomputeCharacterLights();
            }
        }, ModuleCategory.Map);

        hookFunction("ChatRoomSyncRoomProperties", 1, (args, next) => {
            next(args);
            this.CheckMapDataChanged();
            this.RequestParse();
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewUpdatePlayerFlag", 1, (args, next) => {
            next(args);
            this.RequestParse();
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewMouseWheel", 1, (args, next) => {
            next(args);
            this.RequestParse();
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewUpdateFlag", 1, (args, next) => {
            next(args);
            this.CheckMapDataChanged();
            this.RequestParse();
        }, ModuleCategory.Map);

        // A character's canvas (re)loading means their appearance may have changed. That can only change character lights, so
        // it no longer rescans the whole map.
        hookFunction("CharacterLoadCanvas", 1, (args, next) => {
            const ret = next(args);
            this.debouncedCharacterLightRefresh();
            return ret;
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewClick", 1, (args, next) => {
            next(args);

            if (ChatRoomMapViewEditMode == "") {
                if (MouseIn(10, 10, 60, 60) || MouseIn(10, 80, 60, 60)) {
                    this.CheckMapDataChanged();
                    this.RequestParse();
                }
            }
        }, ModuleCategory.Map);
    }

    /**
     * Notices the room's map data (tiles, objects, effects) changing, from the encoded strings BC keeps in
     * ChatRoomData.MapData; map edits and room updates both end up there. Comparing the strings is cheap enough to do every
     * frame (a saved map is two 1600-character strings and one short effects string).
     */
    CheckMapDataChanged(): void {
        const data = ChatRoomData?.MapData as { Tiles?: string; Objects?: string; Effects?: string } | undefined;
        if (!data) return;
        const fp = this.mapFingerprint;
        if (data.Tiles === fp.tiles && data.Objects === fp.objects && data.Effects === fp.effects) return;
        const first = fp.tiles === undefined && fp.objects === undefined && fp.effects === undefined;
        this.mapFingerprint = { tiles: data.Tiles, objects: data.Objects, effects: data.Effects };
        if (!first) this.mapRevision++;
    }

    /**
     * What the walls and map lights are built from. Notably not the player's position, the zoom, or the map's width: those
     * only move the camera (see `camera`). Zoom only matters through whether lone pillars are ovals or lines.
     */
    private get staticSignature(): string {
        return [this.mapRevision, this.zoomLevel <= 10 ? "oval" : "line", ChatRoomMapViewWidth, ChatRoomMapViewHeight,
            this.settings.hideDarkLights ? 1 : 0].join("|");
    }

    /** What the door obstacles depend on: each door's state and which side of it the player is on. */
    private get doorSignature(): string {
        const px = Player?.MapData?.Pos?.X ?? 0;
        return this.doorTiles.map(({ X, Y }) => `${this.DootAtPositionIsOpen(X, Y) ? 1 : 0}${X >= px ? 1 : 0}${X <= px ? 1 : 0}`).join("");
    }

    /** What the vision polygon depends on: where the player is, and the 50 px lift of the viewpoint, which depends on zoom. */
    private get viewSignature(): string {
        const pos = Player?.MapData?.Pos;
        return `${pos?.X},${pos?.Y},${ChatRoomMapViewPerceptionRange}`;
    }

    /**
     * Brings lighting up to date with the least work. The walls and map lights are rebuilt only when the map itself (or the
     * pillar style) changed; if a door's state or the player's side of it changed, the doors are rebuilt and everything is
     * recomputed; if only the player moved, just the vision polygon is. Zooming and resizing cost nothing here.
     * `force` always rebuilds.
     */
    RequestParse(force: boolean = false): void {
        if (force || this.staticSignature !== this.lastStaticSignature) {
            this.ParseMapForObjects();
            return;
        }
        if (!this.EnhancedLightingEnabled || !Player?.MapData) return;
        if (this.doorSignature !== this.lastDoorSignature) {
            this.ComputeLighting();
            return;
        }
        if (this.viewSignature !== this.lastViewSignature) {
            this.lastViewSignature = this.viewSignature;
            this.lightingEngine.updateLights([], this.viewpoint);
        }
    }

    /** What character lights are computed from: who is where, kneeling or not, and what they hold or wear. */
    private get characterLightSignature(): string {
        const parts: string[] = [];
        for (const C of ChatRoomCharacter ?? []) {
            const pos = C.MapData?.Pos;
            const worn = (C.Appearance ?? []).map(i => `${i.Asset?.Name}${i.Craft?.Name ?? ""}${i.Craft?.Description ?? ""}`).join(",");
            const handheld = InventoryGet(C, "ItemHandheld")?.Property?.TypeRecord?.typed ?? "";
            const astral = (C as OtherCharacter).LSCG?.StateModule?.states?.find(st => st.type === "astral-projection")?.active ? 1 : 0;
            parts.push(`${C.MemberNumber}:${pos?.X},${pos?.Y}:${C.IsKneeling?.() ? 1 : 0}:${handheld}:${astral}:${worn}`);
        }
        return parts.join(";");
    }

    /** Recomputes character lights only if something that affects them changed. Cheap enough for a debounced event. */
    RefreshCharacterLightsIfChanged(): void {
        if (!this.EnhancedLightingEnabled || !Player?.MapData) return;
        const signature = this.characterLightSignature;
        if (signature === this.lastCharacterLightSignature) return;
        this.lastCharacterLightSignature = signature;
        this.ParseOtherCharactersForLight();
        this.lightingEngine.updateLights(this.charLights);
    }

    GetCharacterLights(C: Character, X: number, Y: number): Light[] {
        // World space: the middle of the tile horizontally; standing characters' lights sit at the top of the tile, kneeling ones lower.
        const CX = X + 0.5;
        const CY = C.IsKneeling() ? Y + 0.45 : Y;

        const charLights: Light[] = [];
        const handheldItem = InventoryGet(C, "ItemHandheld");
        if (handheldItem?.Asset?.Name == "CandleWax") {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY + 0.1,
                radius: 3,
                color: [250, 220, 150, 0.5],
                animType: "flicker",
            }, C.MemberNumber));
        }

        if (handheldItem?.Asset?.Name == "Cigarette") {
            const inMouth = handheldItem.Property?.TypeRecord?.typed == 0;
            const xOffset = inMouth ? 0.06 : 0.09;
            const yOffset = inMouth ? 0.4 : 0.02;
            charLights.push(this.NewLight(X, Y, {
                x: CX + xOffset,
                y: CY - yOffset,
                radius: 0.25,
                color: [250, 220, 150, 0.5],
                animType: "flicker",
            }, C.MemberNumber));
        }

        if (ScreenItems.includes(handheldItem?.Asset?.Name ?? "")) {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY,
                radius: 0.8,
                color: [64, 183, 255, 0.4],
                fov: 45,
                angle: 270,
            }, C.MemberNumber));
        }

        if (C.Appearance.some(i => isPhraseInString(GetItemNameAndDescriptionConcat(i) || "", "glowing", true))) {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY,
                radius: 2,
                color: [173, 216, 230, 0.4],
                animType: "pulse",
            }, C.MemberNumber));
        }

        const flashlight = C.Appearance.find(i => isPhraseInString(GetItemNameAndDescriptionConcat(i) || "", "flashlight", true));
        if (flashlight) {
            const searchStr = GetItemNameAndDescriptionConcat(flashlight) ?? "";
            let fov = 40;
            if (isPhraseInString(searchStr, "narrow")) fov = 20;
            if (isPhraseInString(searchStr, "wide")) fov = 60;
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY,
                radius: C.IsPlayer() ? 6 : 3,
                fov: fov,
                color: [200, 200, 200, C.IsPlayer() ? 0.8 : 0.2],
                animType: C.IsPlayer() ? "flashlight" : "none",
            }, C.MemberNumber));
        }

        if (C as OtherCharacter) {
            const ghostState = (C as OtherCharacter).LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (!!ghostState && ghostState.active) {
                const hexColor = getModule<StateModule>("StateModule").AstralProjectionState.GetProjectionTintColor(C as OtherCharacter);
                charLights.push(this.NewLight(X, Y, {
                    x: CX,
                    y: CY,
                    radius: 2,
                    color: this.hexToColor(hexColor, 0.6),
                    animType: "pulse",
                }, C.MemberNumber));
            }
        }

        return charLights;
    }

    get TileUnit(): number {
        return 1000 / ((ChatRoomMapViewPerceptionRange * 2) + 1);
    }

    /**
     * Width in canvas pixels of the area the map is drawn in. BC R134 lets the player resize it (the chat/map split, 500 to
     * 2000, 1000 by default); earlier clients always draw a 1000 px map.
     */
    get MapWidth(): number {
        return typeof ChatRoomMapViewSplitPosition === "number" ? ChatRoomMapViewSplitPosition : 1000;
    }

    /** Canvas X of a tile's left edge. The player's tile is centred in the drawn map, as BC's DrawGrid does. */
    ScreenX(tileX: number): number {
        return (tileX - (Player?.MapData?.Pos?.X ?? 0)) * this.TileUnit + (this.MapWidth - this.TileUnit) / 2;
    }

    /** Canvas Y of a tile's top edge. The map is always 1000 px tall. */
    ScreenY(tileY: number): number {
        return (tileY - (Player?.MapData?.Pos?.Y ?? 0)) * this.TileUnit + (1000 - this.TileUnit) / 2;
    }

    /** A light in world space (tile units), by default in the middle of its tile with a reach of 4 tiles. */
    NewLight(tileX: number, tileY: number, light: Partial<Light>, playerNum: number = 0): Light {
        const key = playerNum ? `${playerNum}` : `${tileX}_${tileY}`;
        const customId = `L_${key}_${light.color}`;

        const defaults: Light = {
            id: customId,
            tileX,
            tileY,
            x: tileX + 0.5,
            y: tileY + 0.5,
            radius: 4,
            color: [250, 220, 150, 0.5],
        };

        return {
            ...defaults,
            ...light,
        };
    }

    RecomputeCharacterLights() {
        // Other players moving only moves their own lights; the map's lights and the walls are untouched.
        this.ParseOtherCharactersForLight();
        this.lightingEngine.updateLights(this.charLights);
        this.lastCharacterLightSignature = this.characterLightSignature;
        this.RequestParse();
    }

    /** Every character's lights, wherever they are; which of them are worth drawing is decided per frame (visibleLights). */
    ParseOtherCharactersForLight() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.EnhancedLightingEnabled) return;

        this.charLights = [];
        for (const C of ChatRoomCharacter) {
            //if (C.IsPlayer()) continue;
            const X = C.MapData?.Pos.X ?? 0;
            const Y = C.MapData?.Pos.Y ?? 0;
            this.charLights.push(...this.GetCharacterLights(C, X, Y));
        }
    }

    /**
     * Rebuilds the walls and the lights placed on the map, in world space, for the whole map, then recomputes lighting.
     * Nothing here depends on where the player is or the zoom (beyond the pillar style), so it runs when the map changes,
     * not as the player walks.
     */
    ParseMapForObjects() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!ChatRoomData || !ChatRoomData.MapData) return;
        if (!this.EnhancedLightingEnabled) return;
        if (!this.MapLoaded) return;
        this.lastStaticSignature = this.staticSignature;

        const walls: OpaqueObstacle[] = [];
        const doors: { X: number; Y: number }[] = [];
        this.mapLights = [];

        // Light sources by object id, so each tile looks its object up instead of filtering the whole list.
        const sourcesByObject = new Map<number, lightingSource[]>();
        for (const source of this.lightSources) {
            const list = sourcesByObject.get(source.objId);
            if (list) list.push(source); else sourcesByObject.set(source.objId, [source]);
        }

        for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
            const X = Pos % ChatRoomMapViewWidth;
            const Y = Math.floor(Pos / ChatRoomMapViewWidth);

            const Object = ChatRoomMapViewGetObjectAtPos(X, Y);
            const TileData = ChatRoomMapViewGetTileAtPos(X, Y);

            // Parse Light Sources
            const ObjectID = Object?.ID;
            const lightingSources = ObjectID ? sourcesByObject.get(ObjectID) : undefined;
            if (!!ObjectID && !!lightingSources && lightingSources.length > 0) {
                for (const lightSource of lightingSources) {
                    this.mapLights.push(this.NewLight(X, Y, {
                        x: X + 0.5 + (lightSource.xOffset ?? 0),
                        y: Y + 0.5 - (lightSource.heightOffset ?? 0),
                        radius: lightSource.radius ?? 4,
                        color: lightSource.color ?? [250, 220, 150, 0.8],
                        animType: lightSource.animType ?? "none",
                        angle: lightSource.angle,
                        fov: lightSource.fov,
                    }));
                }
            }

            // Parse Effect
            this.mapLights.push(...this.ParseMapEffectsForLighting(X, Y));

            // Parse Obstacles
            if (!!TileData && TileData.Type == "Wall") {
                if (this.PositionContainsDoor(X, Y)) { // Special Door Cutout, depends on the player: rebuilt by BuildDoorObstacles
                    doors.push({ X, Y });
                } else {
                    const sides = this.GetWallSides(X, Y);
                    if (sides.isolated) {
                        walls.push(...this.GetSingleColumnWallLines(X, Y));
                    } else {
                        const effectbottom = Y + 0.4;
                        if (sides.top) {
                            walls.push({
                                type: "line",
                                points: [
                                    {x: X, y: Y},
                                    {x: X + 1, y: Y},
                                ],
                            });
                        }
                        if (sides.left) {
                            walls.push({
                                type: "line",
                                points: [
                                    {x: X, y: Y},
                                    {x: X, y: sides.doorBelow ? effectbottom : Y + 1},
                                ],
                            });
                        }
                        if (sides.right) {
                            walls.push({
                                type: "line",
                                points: [
                                    {x: X + 1, y: Y},
                                    {x: X + 1, y: sides.doorBelow ? effectbottom : Y + 1},
                                ],
                            });
                        }
                    }
                }
            }
        }

        this.wallObstacles = walls;
        this.doorTiles = doors;

        // BC puts a "Blank" static-lighting effect (colour 0, 0, 0 at 0 opacity) on every tile that has no other lighting, so a map
        // parses into a light per tile. They add nothing to the picture, but each would get a visibility polygon and be drawn every
        // frame, so a 40x40 map was lighting 1600 invisible lights. Only lights that can change a pixel are kept.
        this.mapLights = this.mapLights.filter(l => l.color[3] > MIN_VISIBLE_LIGHT_ALPHA);

        // Trim out any "off" lights.
        if (this.settings.hideDarkLights) {
            this.mapLights = this.mapLights.filter(l => {
                const [r, g, b, a] = l.color;
                return a > 0.01 && (r > 0 || g > 0 || b > 0);
            });
        }

        //this.lights.push(...this.GetCharacterLights(Player));
        this.ParseOtherCharactersForLight();
        this.lastCharacterLightSignature = this.characterLightSignature;

        this.ComputeLighting();
    }

    /** Door obstacles for the player's current position, added to the walls. */
    private BuildDoorObstacles(): OpaqueObstacle[] {
        const obstacles: OpaqueObstacle[] = [];
        for (const { X, Y } of this.doorTiles) obstacles.push(...this.GetDoorObstacles(X, Y));
        return obstacles;
    }

    /** Sends the walls (with doors as they are now) and every light to the engine, and records what that was computed for. */
    private ComputeLighting(): void {
        this.lastDoorSignature = this.doorSignature;
        this.lastViewSignature = this.viewSignature;
        this.lightingEngine.compute(this.allLights, [...this.wallObstacles, ...this.BuildDoorObstacles()], this.viewpoint);
    }

    /** Which map statistics overlay is showing: "off", "stats", or "debug" (statistics plus lighting geometry). */
    get StatsMode(): HudMode {
        return this.lightingEngine.hudMode;
    }

    /**
     * Shows or steps the map statistics overlay. With a mode, shows that one; without, steps off, stats, debug, off. The choice is
     * remembered in this browser so it survives a reload while developing. Returns the mode now showing.
     */
    SetStatsMode(mode?: string): HudMode {
        const order: HudMode[] = ["off", "stats", "debug"];
        const next = order.includes(mode as HudMode) ? mode as HudMode : order[(order.indexOf(this.StatsMode) + 1) % order.length];
        this.lightingEngine.setHudMode(next);
        try {
            if (next === "off") localStorage.removeItem(STATS_MODE_KEY); else localStorage.setItem(STATS_MODE_KEY, next);
        } catch { /* private window or blocked storage: not remembered */ }
        return next;
    }

    /** Brings back the overlay mode from before a reload, in development builds. */
    RestoreStatsMode(): void {
        if (!isDevBuild()) return;
        try {
            const saved = localStorage.getItem(STATS_MODE_KEY);
            if (saved === "stats" || saved === "debug") this.lightingEngine.setHudMode(saved);
        } catch { /* nothing remembered */ }
    }

    get MapLoaded(): boolean {
        try {
            MapManager.Map.getTileId(0);
            return true;
        } catch {
            return false;
        }
    }

    ParseMapEffectsForLighting(X: number, Y: number): Light[] {
        if (ChatRoomMapViewEditMode == "Effect") return [];
        const effects = MapManager.Map.getEffects(X, Y);
        const lights: Light[] = [];
        for (const effect of effects) {
            if (effect.Type == "StaticLighting") {
                lights.push(this.NewLight(X, Y, {
                    radius: 5,
                    color: effect.Color ?? [250, 220, 150, 0.4],
                    animType: "none",
                }));
            }
        }
        return lights;
    }

    private PositionContainsDoor(X: number, Y: number): boolean {
        const Object = ChatRoomMapViewGetObjectAtPos(X, Y);
        return Object?.Type == "WallPath";
    }
        
    private DootAtPositionIsOpen(X: number, Y: number): boolean {
        const alwaysOpenDoorStyles = ["WoodOpen"];

        const Object = ChatRoomMapViewGetObjectAtPos(X, Y);
        return(this.PositionContainsDoor(X, Y) && 
            (ChatRoomMapViewGetCharacterAtPos(X, Y)?.IsPlayer() || alwaysOpenDoorStyles.includes(Object?.Style ?? "")));
    }

    private GetWallSides(X: number, Y: number): WallSides {
        // Find all other walls around the current tile
        const CW = ChatRoomMapViewIsWall(X - 1, Y);
        const CE = ChatRoomMapViewIsWall(X + 1, Y);
        const SW = ChatRoomMapViewIsWall(X - 1, Y + 1);
        const SC = ChatRoomMapViewIsWall(X, Y + 1);
        const SE = ChatRoomMapViewIsWall(X + 1, Y + 1);
        const NC = ChatRoomMapViewIsWall(X, Y - 1);
        const NW = ChatRoomMapViewIsWall(X - 1, Y - 1);
        const NE = ChatRoomMapViewIsWall(X + 1, Y - 1);

        return {
            isolated: !CW && !CE && !SW && !SC && !SE && !NC && !NW && !NE,
            left: SC && (!CW || !SW),
            right: SC && (!CE || !SE),
            top: (!NC || !SC),
            doorBelow: this.PositionContainsDoor(X, Y + 1),
        };
    }

    private GetDoorObstacles(X: number, Y: number): OpaqueObstacle[] {
        if (!this.PositionContainsDoor(X, Y)) return [];

        const effectTop = Y - 0.6;

        const isHorizontalDoor = !ChatRoomMapViewIsWall(X - 1, Y) && !ChatRoomMapViewIsWall(X + 1, Y);

        const lines: LineObstacle[] = [];

        if (!this.DootAtPositionIsOpen(X, Y) || ChatRoomMapViewIsWall(X, Y - 1)) {
            // always block top of door when closed or if wall north
            lines.push({
                type: "line",
                points: [
                    {x: X, y: effectTop},
                    {x: X + 1, y: effectTop},
                ],
            });
        }

        if (!this.DootAtPositionIsOpen(X, Y)) {
            if (X >= (Player?.MapData?.Pos?.X ?? X)) { // Door is right of Player, block right side
                lines.push({
                    type: "line",
                    points: [
                        {x: X + 1, y: isHorizontalDoor ? Y + 1 : Y},
                        {x: X + 1, y: effectTop},
                    ],
                });
            }
            if (X <= (Player?.MapData?.Pos?.X ?? X)) { // Door is left of Player, block left side
                lines.push({
                    type: "line",
                    points: [
                        {x: X, y: isHorizontalDoor ? Y + 1 : Y},
                        {x: X, y: effectTop},
                    ],
                });
            }
        }

        return lines;
    }

    private GetSingleColumnWallLines(X: number, Y: number): OpaqueObstacle[] {
        const fxUnit = 0.8;
        if (this.zoomLevel <= 10) {
            return [
                {
                    type: "oval",
                    center: {x: X + 0.5, y: Y - (fxUnit/2) + 0.2},
                    radiusX: fxUnit / 2,
                    radiusY: fxUnit / 2,
                    resolution: 3,
                },
            ];
        } else {
            return [
                {
                    type: "line",
                    points: [
                        {x: X, y: Y},
                        {x: X + 1, y: Y},
                    ],
                },
            ];
        }
    }

    private hexToColor(hex: string, defaultAlpha: number = 1.0): Color {
        // 1. Strip the hash if it exists
        let cleanHex = hex.replace(/^#/, "");

        // 2. Expand shorthand hexes (e.g., "0cf" becomes "00ccff")
        if (cleanHex.length === 3 || cleanHex.length === 4) {
            cleanHex = cleanHex.split("").map(char => char + char).join("");
        }

        // 3. Parse the red, green, and blue channels
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);

        // 4. Parse the alpha channel if it exists (8-character hex), otherwise use default
        let a = defaultAlpha;
        if (cleanHex.length === 8) {
            // Hex alpha is 0-255, so we divide by 255 to get the 0.0-1.0 float the engine expects
            a = parseInt(cleanHex.slice(6, 8), 16) / 255; 
        }

        return [r, g, b, a];
    }
}