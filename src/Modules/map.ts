import { BaseModule } from "base";
import { getModule } from "modules";
import { MapSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { Color, Light, LightingEngine, LineObstacle, OpaqueObstacle, Viewpoint } from "Utilities/LightingEngine";
import { GetItemNameAndDescriptionConcat, hookFunction, isPhraseInString } from "utils";
import { StateModule } from "./states";
import { ScreenItems } from "./item-use";

// REMOVE WHEN BC-STUBS UPDATES
declare const ChatRoomMapManager: any;

interface lightingSource {
    objId: number;
    heightOffset?: number;
    color?: Color;
    radius?: number; // in tile counts
    animType?: "flicker" | "pulse" | "glitch" | "none";
}

interface WallSides {
    isolated: boolean;
    left: boolean;
    right: boolean;
    top: boolean;
    doorBelow: boolean;
}

export class MapModule extends BaseModule {
    get defaultSettings() {
        return <MapSettingsModel>{
            enabled: true,
            enhancedLighting: false
        };
    }

    get settings(): MapSettingsModel {
        return super.settings as MapSettingsModel;
    }

    lightSources: lightingSource[] = [
        {
            objId: 3030, // Candelabra
            radius: 5,
            animType: "flicker",
            color: [250, 220, 150, 0.8]
        },
        {
            objId: 2090, // Lamppost
            heightOffset: 1.4,
            radius: 6,
            color: [200, 200, 200, 0.8]
        },
        {
            objId: 610, // Log Fire
            radius: 4,
            color: [250, 220, 150, 1],
            animType: "flicker",
            heightOffset: 0.2
        },
        {
            objId: 611, // Log Fire (anim)
            radius: 4,
            color: [255, 194, 90, 0.9],
            animType: "flicker",
            heightOffset: 0.2
        }
    ];

    lightingEngine: LightingEngine = new LightingEngine();
    lights: Light[] = [];
    charLights: Light[] = [];
    viewpoint: Viewpoint = {
        x: 500, 
        y: 450,
        radius: this.TileUnit * 8
    };
    
    load(): void {
        (window as any).lighting = this.lightingEngine; // Expose the lighting engine for debugging/testing
        hookFunction("ChatRoomMapViewDrawGrid", 1, (args, next) => {
            next(args);

            if (this.settings.enhancedLighting) {
                if (this.lightingEngine.debug && Player && Player.MapData && Player.MapData.Pos) {
                    for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
                        let X = Pos % ChatRoomMapViewWidth;
                        let Y = Math.floor(Pos / ChatRoomMapViewWidth);
                        let MaxRange = Math.max(Math.abs(X - Player.MapData?.Pos.X), Math.abs(Y - Player?.MapData?.Pos.Y));
                        if (MaxRange > ChatRoomMapViewGetSightRange()) continue;

                        let ScreenX = (X - Player.MapData.Pos.X) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
                        let ScreenY = (Y - Player.MapData.Pos.Y) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
                        MainCanvas.save();
                        MainCanvas.textAlign = "left";
                        MainCanvas.textBaseline = "top";
                        DrawEmptyRect(ScreenX, ScreenY, this.TileUnit, this.TileUnit, "grey");
                        DrawTextFit(`${X},${Y}`, ScreenX, ScreenY, this.TileUnit/4, "white");
                        MainCanvas.restore();
                    }
                }

                this.lightingEngine.render({
                    mainCtx: MainCanvas, 
                    width: MainCanvas.canvas.width, 
                    height: MainCanvas.canvas.height, 
                    lights: [...this.lights, ...this.charLights], 
                    viewpoint: (ChatRoomMapFogIsActive() ? this.viewpoint : undefined),
                    focus: {x: MouseX, y: MouseY}
                });
            }
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewSyncMapData", 1, (args, next) => {
            next(args);

            if (this.settings.enhancedLighting) {
                this.ParseOtherCharactersForLight();
            }
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewUpdatePlayerFlag", 1, (args, next) => {
            let ret = next(args);
            this.ParseMapForObjects();
            return ret;
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewMouseWheel", 1, (args, next) => {
            next(args);
            this.ParseMapForObjects();
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewUpdateFlag", 1, (args, next) => {
            next(args);
            this.ParseMapForObjects();
        }, ModuleCategory.Map);

        hookFunction("CharacterLoadCanvas", 1, (args, next) => {
            let ret = next(args);
            this.ParseMapForObjects();
            return ret;
        }, ModuleCategory.Map);
    }

    GetCharacterLights(C: Character, CX: number = 500, CY: number = 450): Light[] {
        let charLights: Light[] = [];
        var handheldItem = InventoryGet(C, "ItemHandheld");
        if (handheldItem?.Asset?.Name == "CandleWax") {
            charLights.push({
                x: CX,
                y: CY,
                radius: this.TileUnit * 3,
                color: [250, 220, 150, 0.5],
                animType: "flicker"
            });
        }

        if (handheldItem?.Asset?.Name == "Cigarette") {
            let inMouth = handheldItem.Property?.TypeRecord?.typed == 0;
            let xOffset = inMouth ? (this.TileUnit * 0.06) : (this.TileUnit * 0.09);
            let yOffset = inMouth ? (this.TileUnit * 0.4) : (this.TileUnit * 0.02);
            charLights.push({
                x: CX + xOffset,
                y: CY - yOffset,
                radius: this.TileUnit/4,
                color: [250, 220, 150, 0.5],
                animType: "flicker"
            });
        }

        if (ScreenItems.includes(handheldItem?.Asset?.Name ?? "")) {
            charLights.push({
                x: CX,
                y: CY,
                radius: this.TileUnit * 0.8,
                color: [64, 183, 255, 0.4],
                animType: "glitch",
                fov: 45,
                angle: 270
            });
        }

        if (C.Appearance.some(i => isPhraseInString(GetItemNameAndDescriptionConcat(i) || "", "glowing", true))) {
            charLights.push({
                x: CX,
                y: CY,
                radius: this.TileUnit * 2,
                color: [173, 216, 230, 0.4],
                animType: "pulse"
            });
        }

        if (C.Appearance.some(i => isPhraseInString(GetItemNameAndDescriptionConcat(i) || "", "flashlight", true))) {
            charLights.push({
                x: CX,
                y: CY,
                radius: this.TileUnit * 6,
                fov: 35,
                color: [200, 200, 200, 0.8],
                animType: C.IsPlayer() ? "flashlight" : "none"
            });
        }

        if (!!(C as OtherCharacter)) {
            let ghostState = (C as OtherCharacter).LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (!!ghostState && ghostState.active) {
                let hexColor = getModule<StateModule>("StateModule").AstralProjectionState.GetProjectionTintColor(C as OtherCharacter);
                charLights.push({
                    x: CX,
                    y: CY,
                    radius: this.TileUnit * 2,
                    color: this.hexToColor(hexColor, 0.6),
                    animType: "pulse"
                });
            }
        }

        return charLights;
    }

    get TileUnit(): number {
        return 1000 / ((ChatRoomMapViewPerceptionRange * 2) + 1)
    }

    ParseOtherCharactersForLight() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.settings.enhancedLighting) return;

        let MaxVisibleRange = ChatRoomMapViewPerceptionRangeMax;
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;
        this.charLights = [];
        for (let C of ChatRoomCharacter) {
            //if (C.IsPlayer()) continue;
            let X = C.MapData?.Pos.X ?? 0;
            let Y = C.MapData?.Pos.Y ?? 0;
            let ScreenX = (X - Player.MapData.Pos.X) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
            let ScreenY = (Y - Player.MapData.Pos.Y) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
            let MaxRange = Math.max(Math.abs(X - Player.MapData.Pos.X), Math.abs(Y - Player.MapData.Pos.Y));
            if (MaxRange > MaxVisibleRange) continue;
            this.charLights.push(...this.GetCharacterLights(C, ScreenX + (this.TileUnit/2), C.IsKneeling() ? ScreenY + (this.TileUnit*0.45) : ScreenY));
        }
    }

    ParseMapForObjects() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.settings.enhancedLighting) return;

        let [Left, Top, Width, Height] = [0, 0, 1000, 1000];
        let MaxVisibleRange = ChatRoomMapViewPerceptionRangeMax;
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;

        let TileWidth = Width / ((ChatRoomMapViewPerceptionRange * 2) + 1);
        let TileHeight = Height / ((ChatRoomMapViewPerceptionRange * 2) + 1);

        let objects: OpaqueObstacle[] = [];
        this.lights = [];

        for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
            let X = Pos % ChatRoomMapViewWidth;
            let Y = Math.floor(Pos / ChatRoomMapViewWidth);

            let MaxRange = Math.max(Math.abs(X - Player.MapData.Pos.X), Math.abs(Y - Player.MapData.Pos.Y));
		    if (MaxRange > MaxVisibleRange) continue;

            let ScreenX = (X - Player.MapData.Pos.X) * TileWidth + ChatRoomMapViewPerceptionRange * TileWidth;
            let ScreenY = (Y - Player.MapData.Pos.Y) * TileHeight + ChatRoomMapViewPerceptionRange * TileWidth;

            let Object = ChatRoomMapViewGetObjectAtPos(X, Y);
            let TileData = ChatRoomMapViewGetTileAtPos(X, Y);

            // Parse Light Sources
            let ObjectID = Object?.ID;
            let lightSource = this.lightSources.find(ls => ls.objId == ObjectID);
            if (!!ObjectID && !!lightSource) {                
                this.lights.push({
                    x: ScreenX + (TileWidth/2),
                    y: ScreenY + ((TileHeight/2) - ((lightSource.heightOffset ?? 0) * TileHeight)),
                    radius: TileWidth * (lightSource.radius ?? 4),
                    color: lightSource.color ?? [250, 220, 150, 0.8],
                    animType: lightSource.animType ?? "none"
                });
            }

            // Parse Effect
            this.lights.push(...this.ParseMapEffectsForLighting(X, Y, ScreenX, ScreenY));

            // Parse Obstacles
            if (!!TileData && TileData.Type == "Wall") {
                let effectbottom = ScreenY + (this.TileUnit * 0.4);

                if (this.PositionContainsDoor(X, Y)) { // Special Door Cutout
                    objects.push(...this.GetDoorObstacles(X, Y, ScreenX, ScreenY));
                } else {
                    let sides = this.GetWallSides(X, Y);
                    if (sides.isolated) {
                        objects.push(...this.GetSingleColumnWallLines(X, Y, ScreenX, ScreenY));
                    } else {
                        if (sides.top) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX, y: ScreenY},
                                    {x: ScreenX + TileWidth, y: ScreenY}
                                ]
                            });
                        }
                        if (sides.left) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX, y: ScreenY},
                                    {x: ScreenX, y: sides.doorBelow ? effectbottom : ScreenY + TileHeight}
                                ]
                            });
                        }
                        if (sides.right) {
                            objects.push({
                                type: "line",
                                points: [
                                    {x: ScreenX + TileWidth, y: ScreenY},
                                    {x: ScreenX + TileWidth, y: sides.doorBelow ? effectbottom : ScreenY + TileHeight}
                                ]
                            });
                        }
                    }
                }
            }
        }
        
        //this.lights.push(...this.GetCharacterLights(Player));
        this.ParseOtherCharactersForLight();

        this.lightingEngine.setObstacles(objects);
    }

    ParseMapEffectsForLighting(X: number, Y: number, ScreenX: number, ScreenY: number): Light[] {
        if (!ChatRoomMapManager || !ChatRoomMapManager.Map) return [];
        let effects = ChatRoomMapManager.Map.getEffectsByXY(X, Y);
        let lights: Light[] = [];
        for (let effect of effects) {
            if (effect.Type == "StaticLighting") {
                lights.push({
                    x: ScreenX + (this.TileUnit/2),
                    y: ScreenY + (this.TileUnit/2),
                    radius: this.TileUnit * 5,
                    color: effect.Color ?? [250, 220, 150, 0.4],
                    animType: "none"
                });
            }
        }
        return lights;
    }

    private PositionContainsDoor(X: number, Y: number): boolean {
        let Object = ChatRoomMapViewGetObjectAtPos(X, Y);
        return Object?.Type == "WallPath";
    }
        
    private DootAtPositionIsOpen(X: number, Y: number): boolean {
        let alwaysOpenDoorStyles = ["WoodOpen"];

        let Object = ChatRoomMapViewGetObjectAtPos(X, Y);
        return(this.PositionContainsDoor(X, Y) && 
            (ChatRoomMapViewGetCharacterAtPos(X, Y)?.IsPlayer() || alwaysOpenDoorStyles.includes(Object?.Style ?? "")))
    }

    private GetWallSides(X: number, Y: number): WallSides {
        // Find all other walls around the current tile
        let CW = ChatRoomMapViewIsWall(X - 1, Y);
        let CE = ChatRoomMapViewIsWall(X + 1, Y);
        let SW = ChatRoomMapViewIsWall(X - 1, Y + 1);
        let SC = ChatRoomMapViewIsWall(X, Y + 1);
        let SE = ChatRoomMapViewIsWall(X + 1, Y + 1);
        let NC = ChatRoomMapViewIsWall(X, Y - 1);
        let NW = ChatRoomMapViewIsWall(X - 1, Y - 1);
        let NE = ChatRoomMapViewIsWall(X + 1, Y - 1);

        return {
            isolated: !CW && !CE && !SW && !SC && !SE && !NC && !NW && !NE,
            left: SC && (!CW || !SW),
            right: SC && (!CE || !SE),
            top: (!NC || !SC),
            doorBelow: this.PositionContainsDoor(X, Y + 1)
        }
    }

    private GetDoorObstacles(X: number, Y: number, ScreenX: number, ScreenY: number): OpaqueObstacle[] {
        if (!this.PositionContainsDoor(X, Y)) return [];

        let effectTop = ScreenY - (this.TileUnit * 0.6);

        let isHorizontalDoor = !ChatRoomMapViewIsWall(X - 1, Y) && !ChatRoomMapViewIsWall(X + 1, Y);

        let lines: LineObstacle[] = []
        
        if (!this.DootAtPositionIsOpen(X, Y) || ChatRoomMapViewIsWall(X, Y - 1)) {
            // always block top of door when closed or if wall north
            lines.push({
                type: "line",
                points: [
                    {x: ScreenX, y: effectTop},
                    {x: ScreenX + this.TileUnit, y: effectTop}
                ]
            });
        } 

        if (!this.DootAtPositionIsOpen(X, Y)) {
            if (X >= (Player?.MapData?.Pos?.X ?? X)) { // Door is right of Player, block right side
                lines.push({
                    type: "line",
                    points: [
                        {x: ScreenX + this.TileUnit, y: isHorizontalDoor ? ScreenY + this.TileUnit : ScreenY},
                        {x: ScreenX + this.TileUnit, y: effectTop}
                    ]
                });
            } 
            if (X <= (Player?.MapData?.Pos?.X ?? X)) { // Door is left of Player, block left side
                lines.push({
                    type: "line",
                    points: [
                        {x: ScreenX, y: isHorizontalDoor ? ScreenY + this.TileUnit : ScreenY},
                        {x: ScreenX, y: effectTop}
                    ]
                });
            }
        }

        return lines;
    }

    private GetSingleColumnWallLines(X: number, Y: number, ScreenX: number, ScreenY: number): OpaqueObstacle[] {
        let fxUnit = (this.TileUnit * 0.8);
        return [
            {
                type: "oval",
                center: {x: ScreenX + (this.TileUnit/2), y: ScreenY - (fxUnit/2) + (this.TileUnit * 0.2)},
                radiusX: fxUnit / 2,
                radiusY: fxUnit / 2,
                resolution: 5
            }
        ];
    }

    private hexToColor(hex: string, defaultAlpha: number = 1.0): Color {
        // 1. Strip the hash if it exists
        let cleanHex = hex.replace(/^#/, '');

        // 2. Expand shorthand hexes (e.g., "0cf" becomes "00ccff")
        if (cleanHex.length === 3 || cleanHex.length === 4) {
            cleanHex = cleanHex.split('').map(char => char + char).join('');
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