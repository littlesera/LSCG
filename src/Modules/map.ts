import { BaseModule } from "base";
import { MapSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { Light, LightingEngine, OpaqueObstacle, Viewpoint } from "Utilities/LightingEngine";
import { GetItemNameAndDescriptionConcat, hookFunction, isPhraseInString } from "utils";

interface lightingSource {
    objId: number;
}

interface WallSides {
    left: boolean;
    right: boolean;
    top: boolean;
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
            objId: 3030 // Candelabra
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

        hookFunction("ChatRoomMapViewCalculatePerceptionMasks", 1, (args, next) => {
            next(args);
            this.ParseMapForObjects();
        }, ModuleCategory.Map);

        hookFunction("ChatRoomMapViewMouseWheel", 1, (args, next) => {
            next(args);
            this.ParseMapForObjects();
        }, ModuleCategory.Map);
    }

    GetCharacterLights(C: Character, CX: number = 500, CY: number = 450): Light[] {
        let charLights: Light[] = [];
        if (InventoryGet(C, "ItemHandheld")?.Asset?.Name == "CandleWax") {
            charLights.push({
                x: CX,
                y: CY,
                radius: this.TileUnit * 3,
                color: [250, 220, 150, 0.5],
                animType: "flicker"
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

        return charLights;
    }

    get TileUnit(): number {
        return 1000 / ((ChatRoomMapViewPerceptionRange * 2) + 1)
    }

    ParseOtherCharactersForLight() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.settings.enhancedLighting) return;

        let MaxVisibleRange = ChatRoomMapViewGetSightRange();
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;
        this.charLights = [];
        for (let C of ChatRoomCharacter) {
            if (C.IsPlayer()) continue;
            let X = C.MapData?.Pos.X ?? 0;
            let Y = C.MapData?.Pos.Y ?? 0;
            let ScreenX = (X - Player.MapData.Pos.X) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
            let ScreenY = (Y - Player.MapData.Pos.Y) * this.TileUnit + ChatRoomMapViewPerceptionRange * this.TileUnit;
            let MaxRange = Math.max(Math.abs(X - Player.MapData.Pos.X), Math.abs(Y - Player.MapData.Pos.Y));
            if (MaxRange > MaxVisibleRange) continue;
            this.charLights.push(...this.GetCharacterLights(C, ScreenX + (this.TileUnit/2), ScreenY));
        }
    }

    ParseMapForObjects() {
        if (!Player) return;
        if (!Player.MapData) return;
        if (!this.settings.enhancedLighting) return;

        let [Left, Top, Width, Height] = [0, 0, 1000, 1000];
        let MaxVisibleRange = ChatRoomMapViewGetSightRange();
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
            if (!!ObjectID && this.lightSources.some(ls => ls.objId == ObjectID)) {                
                this.lights.push({
                    x: ScreenX + (TileWidth/2),
                    y: ScreenY + (TileHeight/2),
                    radius: TileWidth * 4,
                    color: [250, 220, 150, 0.8],
                    animType: "flicker"
                });
            }

            // Parse Obstacles
            if (!!TileData && TileData.Type == "Wall") {
                if (ChatRoomMapViewGetCharacterAtPos(X, Y)?.IsPlayer() || (Object?.Type == "WallPath" && Object?.Style == "WoodOpen")) {
                    // No obstacle for wall that has an open door
                    continue;
                }

                let effectTop = ScreenY - (TileHeight * 0.6);
                let effectbottom = ScreenY + (TileHeight * 0.2);
                if (Object?.Type == "WallPath") { // Special Door Cutout
                    objects.push({
                        type: "line",
                        points: [
                            {x: ScreenX, y: ScreenY},
                            {x: ScreenX, y: effectTop},
                            {x: ScreenX + TileWidth, y: effectTop},
                            {x: ScreenX + TileWidth, y: ScreenY}
                        ]
                    });
                } else {
                    let sides = this.GetWallSides(X, Y);
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
                                {x: ScreenX, y: ScreenY + TileHeight}
                            ]
                        });
                    }
                    if (sides.right) {
                        objects.push({
                            type: "line",
                            points: [
                                {x: ScreenX + TileWidth, y: ScreenY},
                                {x: ScreenX + TileWidth, y: ScreenY + TileHeight}
                            ]
                        });
                    }
                }
            }
        }
        
        this.lights.push(...this.GetCharacterLights(Player));
        this.ParseOtherCharactersForLight();

        this.lightingEngine.setObstacles(objects);
    }

    private GetWallSides(X: number, Y: number): WallSides {
        // Find all other walls around the current tile
        let CW = ChatRoomMapViewIsWall(X - 1, Y) || ChatRoomMapViewTileIsHidden(X - 1, Y);
        let CE = ChatRoomMapViewIsWall(X + 1, Y) || ChatRoomMapViewTileIsHidden(X + 1, Y);
        let SW = ChatRoomMapViewIsWall(X - 1, Y + 1) || ChatRoomMapViewTileIsHidden(X - 1, Y + 1);
        let SC = ChatRoomMapViewIsWall(X, Y + 1) || ChatRoomMapViewTileIsHidden(X, Y + 1);
        let SE = ChatRoomMapViewIsWall(X + 1, Y + 1) || ChatRoomMapViewTileIsHidden(X + 1, Y + 1);
        let NC = ChatRoomMapViewIsWall(X, Y - 1) || ChatRoomMapViewTileIsHidden(X, Y - 1);

        return {
            left: SC && !CW,
            right: SC && !CE,
            top: (!NC || !SC)
        }
    }
}