import { BaseModule } from "base";
import { getModule } from "modules";
import { MapSettingsModel } from "Settings/Models/base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { Color, Light, LineObstacle, OpaqueObstacle, Viewpoint } from "Utilities/lighting.types";
import { drawBlindfold, GetItemNameAndDescriptionConcat, hookFunction, isPhraseInString } from "utils";
import { StateModule } from "./states";
import { ScreenItems } from "./item-use";
import { debounce } from "lodash-es";
import { GuiMaps } from "Settings/maps";
import { LightingEngine } from "Utilities/lighting.engine";
import { exposePerf, recordPerf } from "Utilities/perf";

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
    get allLights(): Light[] {
        return [...this.mapLights, ...this.charLights];
    }
    mapLights: Light[] = [];
    charLights: Light[] = [];
    /**
     * Where vision is cast from: the player's tile, centred in the drawn map. Rebuilt on each read so it follows zoom (the
     * radius) and, on BC R134 and later, the map's width.
     */
    get viewpoint(): Viewpoint {
        return {
            x: this.MapWidth / 2,
            y: 450,
            radius: this.TileUnit * 8,
        };
    }
    
    drawingMapFlag: boolean = false;

    /** Bumped whenever the room's map data (tiles, objects, effects) is seen to have changed. */
    private mapRevision = 0;
    private mapFingerprint: { tiles?: string; objects?: string; effects?: string } = {};
    /** What the last ParseMapForObjects was computed from; a request for the same inputs is skipped. */
    private lastParseSignature = "";
    private lastCharacterLightSignature = "";

    load(): void {
        (window as any).lighting = this.lightingEngine; // Expose the lighting engine for debugging/testing
        exposePerf(); // window.lscgPerf: rolling map/lighting frame timings, for profiling and the browser perf test

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
                    this.lightingEngine.updateAnimations(this.allLights, {x: this.lastMouseX, y: this.lastMouseY});
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
                    lights: this.allLights, 
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

    /** Everything ParseMapForObjects's output depends on. A parse is skipped when this has not changed since the last one. */
    private get parseSignature(): string {
        const pos = Player?.MapData?.Pos;
        return [this.mapRevision, pos?.X, pos?.Y, ChatRoomMapViewPerceptionRange, this.MapWidth, this.lightingVisionMax,
            ChatRoomMapViewWidth, ChatRoomMapViewHeight, this.settings.hideDarkLights ? 1 : 0].join("|");
    }

    /** Parses the map unless nothing it depends on has changed since the last parse. `force` always parses. */
    RequestParse(force: boolean = false): void {
        if (!force && this.parseSignature === this.lastParseSignature) return;
        this.ParseMapForObjects();
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
        this.lightingEngine.updateLights(this.allLights, this.viewpoint);
    }

    GetCharacterLights(C: Character, X: number, Y: number): Light[] {
        const ScreenX = this.ScreenX(X);
        const ScreenY = this.ScreenY(Y);
        const CX = ScreenX + (this.TileUnit/2);
        const CY = C.IsKneeling() ? ScreenY + (this.TileUnit*0.45) : ScreenY;

        const charLights: Light[] = [];
        const handheldItem = InventoryGet(C, "ItemHandheld");
        if (handheldItem?.Asset?.Name == "CandleWax") {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY + (this.TileUnit/10),
                radius: this.TileUnit * 3,
                color: [250, 220, 150, 0.5],
                animType: "flicker",
            }, C.MemberNumber));
        }

        if (handheldItem?.Asset?.Name == "Cigarette") {
            const inMouth = handheldItem.Property?.TypeRecord?.typed == 0;
            const xOffset = inMouth ? (this.TileUnit * 0.06) : (this.TileUnit * 0.09);
            const yOffset = inMouth ? (this.TileUnit * 0.4) : (this.TileUnit * 0.02);
            charLights.push(this.NewLight(X, Y, {
                x: CX + xOffset,
                y: CY - yOffset,
                radius: this.TileUnit/4,
                color: [250, 220, 150, 0.5],
                animType: "flicker",
            }, C.MemberNumber));
        }

        if (ScreenItems.includes(handheldItem?.Asset?.Name ?? "")) {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY,
                radius: this.TileUnit * 0.8,
                color: [64, 183, 255, 0.4],
                fov: 45,
                angle: 270,
            }, C.MemberNumber));
        }

        if (C.Appearance.some(i => isPhraseInString(GetItemNameAndDescriptionConcat(i) || "", "glowing", true))) {
            charLights.push(this.NewLight(X, Y, {
                x: CX,
                y: CY,
                radius: this.TileUnit * 2,
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
                radius: C.IsPlayer() ? (this.TileUnit * 6) : (this.TileUnit * 3),
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
                    radius: this.TileUnit * 2,
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

    NewLight(tileX: number, tileY: number, light: Partial<Light>, playerNum: number = 0): Light {
        const key = playerNum ? `${playerNum}` : `${tileX}_${tileY}`;
        const customId = `L_${key}_${light.color}`;
        
        const ScreenX = this.ScreenX(tileX);
        const ScreenY = this.ScreenY(tileY);

        const defaults: Light = {
            id: customId,
            x: ScreenX + (this.TileUnit/2), // (Assuming a 32px grid, adjust to your actual tile size)
            y: ScreenY + (this.TileUnit/2),
            radius: this.TileUnit * 4, 
            color: [250, 220, 150, 0.5],
        };

        return {
            ...defaults,
            ...light,
        };
    }

    RecomputeCharacterLights() {
        if (this.allLights.length > 0) {
            this.ParseOtherCharactersForLight();
            this.lightingEngine.updateLights(this.allLights, this.viewpoint);
        } else {
            this.RequestParse();
        }
    }

    ParseOtherCharactersForLight() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.EnhancedLightingEnabled) return;

        let MaxVisibleRange = this.lightingVisionMax;
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;
        const MaxVisibleRangeX = Math.max(MaxVisibleRange, this.lightingVisionMaxX);
        this.charLights = [];
        for (const C of ChatRoomCharacter) {
            //if (C.IsPlayer()) continue;
            const X = C.MapData?.Pos.X ?? 0;
            const Y = C.MapData?.Pos.Y ?? 0;
            if (Math.abs(X - Player.MapData.Pos.X) > MaxVisibleRangeX || Math.abs(Y - Player.MapData.Pos.Y) > MaxVisibleRange) continue;
            this.charLights.push(...this.GetCharacterLights(C, X, Y));
        }
    }

    ParseMapForObjects() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!ChatRoomData || !ChatRoomData.MapData) return;
        if (!this.EnhancedLightingEnabled) return;
        if (!this.MapLoaded) return;
        this.lastParseSignature = this.parseSignature;

        const objects: OpaqueObstacle[] = [];
        this.mapLights = [];

        let MaxVisibleRange = this.lightingVisionMax;
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;
        const MaxVisibleRangeX = Math.max(MaxVisibleRange, this.lightingVisionMaxX);

        const TileWidth = this.TileUnit;
        const TileHeight = this.TileUnit;

        for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
            const X = Pos % ChatRoomMapViewWidth;
            const Y = Math.floor(Pos / ChatRoomMapViewWidth);

            if (Math.abs(X - Player.MapData.Pos.X) > MaxVisibleRangeX || Math.abs(Y - Player.MapData.Pos.Y) > MaxVisibleRange) continue;

            const ScreenX = this.ScreenX(X);
            const ScreenY = this.ScreenY(Y);

            const Object = ChatRoomMapViewGetObjectAtPos(X, Y);
            const TileData = ChatRoomMapViewGetTileAtPos(X, Y);

            // Parse Light Sources
            const ObjectID = Object?.ID;
            const lightingSources = this.lightSources.filter(ls => ls.objId == ObjectID);
            if (!!ObjectID && !!lightingSources && lightingSources.length > 0) {
                for (const lightSource of lightingSources) {
                    this.mapLights.push(this.NewLight(X, Y, {
                        x: ScreenX + (TileWidth/2) + ((lightSource.xOffset ?? 0) * TileWidth),
                        y: ScreenY + ((TileHeight/2) - ((lightSource.heightOffset ?? 0) * TileHeight)),
                        radius: TileWidth * (lightSource.radius ?? 4),
                        color: lightSource.color ?? [250, 220, 150, 0.8],
                        animType: lightSource.animType ?? "none",
                        angle: lightSource.angle,
                        fov: lightSource.fov,
                    }));
                }
            }

            // Parse Effect
            this.mapLights.push(...this.ParseMapEffectsForLighting(X, Y, ScreenX, ScreenY));

            // Parse Obstacles
            if (!!TileData && TileData.Type == "Wall") {
                const effectbottom = ScreenY + (this.TileUnit * 0.4);

                if (this.PositionContainsDoor(X, Y)) { // Special Door Cutout
                    objects.push(...this.GetDoorObstacles(X, Y, ScreenX, ScreenY));
                } else {
                    const sides = this.GetWallSides(X, Y);
                    if (sides.isolated) {
                        objects.push(...this.GetSingleColumnWallLines(X, Y, ScreenX, ScreenY));
                    } else {
                        if (sides.top) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX, y: ScreenY},
                                    {x: ScreenX + TileWidth, y: ScreenY},
                                ],
                            });
                        }
                        if (sides.left) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX, y: ScreenY},
                                    {x: ScreenX, y: sides.doorBelow ? effectbottom : ScreenY + TileHeight},
                                ],
                            });
                        }
                        if (sides.right) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX + TileWidth, y: ScreenY},
                                    {x: ScreenX + TileWidth, y: sides.doorBelow ? effectbottom : ScreenY + TileHeight},
                                ],
                            });
                        }
                    }
                }
            }
        }
        
        //this.lights.push(...this.GetCharacterLights(Player));
        this.ParseOtherCharactersForLight();
        this.lastCharacterLightSignature = this.characterLightSignature;

        // Trim out any "off" lights.
        if (this.settings.hideDarkLights) {
            this.mapLights = this.mapLights.filter(l => {
                const [r, g, b, a] = l.color;
                return a > 0.01 && (r > 0 || g > 0 || b > 0);
            });
        }

        this.lightingEngine.compute(this.allLights, objects, this.viewpoint);
    }

    get MapLoaded(): boolean {
        try {
            MapManager.Map.getTileId(0);
            return true;
        } catch {
            return false;
        }
    }

    ParseMapEffectsForLighting(X: number, Y: number, ScreenX: number, ScreenY: number): Light[] {
        if (ChatRoomMapViewEditMode == "Effect") return [];
        const effects = MapManager.Map.getEffects(X, Y);
        const lights: Light[] = [];
        for (const effect of effects) {
            if (effect.Type == "StaticLighting") {
                lights.push(this.NewLight(X, Y, {
                    x: ScreenX + (this.TileUnit/2),
                    y: ScreenY + (this.TileUnit/2),
                    radius: this.TileUnit * 5,
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

    private GetDoorObstacles(X: number, Y: number, ScreenX: number, ScreenY: number): OpaqueObstacle[] {
        if (!this.PositionContainsDoor(X, Y)) return [];

        const effectTop = ScreenY - (this.TileUnit * 0.6);

        const isHorizontalDoor = !ChatRoomMapViewIsWall(X - 1, Y) && !ChatRoomMapViewIsWall(X + 1, Y);

        const lines: LineObstacle[] = [];
        
        if (!this.DootAtPositionIsOpen(X, Y) || ChatRoomMapViewIsWall(X, Y - 1)) {
            // always block top of door when closed or if wall north
            lines.push({
                type: "line",
                points: [
                    {x: ScreenX, y: effectTop},
                    {x: ScreenX + this.TileUnit, y: effectTop},
                ],
            });
        } 

        if (!this.DootAtPositionIsOpen(X, Y)) {
            if (X >= (Player?.MapData?.Pos?.X ?? X)) { // Door is right of Player, block right side
                lines.push({
                    type: "line",
                    points: [
                        {x: ScreenX + this.TileUnit, y: isHorizontalDoor ? ScreenY + this.TileUnit : ScreenY},
                        {x: ScreenX + this.TileUnit, y: effectTop},
                    ],
                });
            } 
            if (X <= (Player?.MapData?.Pos?.X ?? X)) { // Door is left of Player, block left side
                lines.push({
                    type: "line",
                    points: [
                        {x: ScreenX, y: isHorizontalDoor ? ScreenY + this.TileUnit : ScreenY},
                        {x: ScreenX, y: effectTop},
                    ],
                });
            }
        }

        return lines;
    }

    private GetSingleColumnWallLines(X: number, Y: number, ScreenX: number, ScreenY: number): OpaqueObstacle[] {
        const fxUnit = (this.TileUnit * 0.8);
        if (this.zoomLevel <= 10) {
            return [
                {
                    type: "oval",
                    center: {x: ScreenX + (this.TileUnit/2), y: ScreenY - (fxUnit/2) + (this.TileUnit * 0.2)},
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
                        {x: ScreenX , y: ScreenY},
                        {x: ScreenX + this.TileUnit, y: ScreenY},
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