import { BaseModule } from "base";
import { MapSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { Light, LightingEngine, Polygon, Viewpoint } from "Utilities/LightingEngine";
import { hookFunction } from "utils";

interface lightingSource {
    objId: number;
}

export class MapModule extends BaseModule {
    get defaultSettings() {
        return <MapSettingsModel>{
            enabled: true,
            enhancedLighting: true
        };
    }

    lightSources: lightingSource[] = [
        {
            objId: 3030 // Candelabra
        }
    ];

    lightingEngine: LightingEngine = new LightingEngine();
    lights: Light[] = [];
    viewpoint: Viewpoint = {
        x: 500, 
        y: 450,
        radius: 800
    };
    
    load(): void {
        hookFunction("ChatRoomMapViewDrawGrid", 1, (args, next) => {
            next(args);

            this.lightingEngine.render(MainCanvas, MainCanvas.canvas.width, MainCanvas.canvas.height, this.lights, (ChatRoomMapFogIsActive() ? this.viewpoint : undefined));
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

    ParseMapForObjects() {
        if (!Player) return;
        if (!Player.MapData) return;

        let playerIsLight = InventoryGet(Player, "ItemHandheld")?.Asset?.Name == "CandleWax";

        let [Left, Top, Width, Height] = [0, 0, 1000, 1000];
        let MaxVisibleRange = ChatRoomMapViewGetSightRange();
	    if (MaxVisibleRange < 1) MaxVisibleRange = 1;

        let TileWidth = Width / ((ChatRoomMapViewPerceptionRange * 2) + 1);
        let TileHeight = Height / ((ChatRoomMapViewPerceptionRange * 2) + 1);

        let objects: Polygon[] = [];
        this.lights = [];

        for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
            let X = Pos % ChatRoomMapViewWidth;
            let Y = Math.floor(Pos / ChatRoomMapViewWidth);

            let MaxRange = Math.max(Math.abs(X - Player.MapData.Pos.X), Math.abs(Y - Player.MapData.Pos.Y));
		    if (MaxRange > MaxVisibleRange) continue;

            let ScreenX = (X - Player.MapData.Pos.X) * TileWidth + ChatRoomMapViewPerceptionRange * TileWidth;
            let ScreenY = (Y - Player.MapData.Pos.Y) * TileHeight + ChatRoomMapViewPerceptionRange * TileWidth;

            let TileID = ChatRoomData?.MapData?.Tiles?.charCodeAt(Pos);
            let TileData = ChatRoomMapViewTileList.find(t => t.ID == TileID);
            if (!!TileData && TileData.Type == "Wall") {
                let startY = ScreenY - (TileHeight * 0.6);
                objects.push([
                    {x: ScreenX, y: ScreenY},
                    {x: ScreenX + TileWidth, y: ScreenY},
                    // {x: ScreenX + TileWidth, y: startY + (TileHeight*0.8)},
                    // {x: ScreenX, y: startY + (TileHeight*0.8)}
                ]);
            }

            let ObjectID = ChatRoomData?.MapData?.Objects?.charCodeAt(Pos);
            if (!!ObjectID && ObjectID > ChatRoomMapViewObjectStartID) {
                let source = this.lightSources.find(ls => ls.objId == ObjectID)
                if (!source) {
                    continue;
                }
                
                this.lights.push({
                    x: ScreenX + (TileWidth/2),
                    y: ScreenY + (TileHeight/2),
                    radius: TileWidth * 4,
                    r: 250,
                    g: 220,
                    b: 150,
                    intensity: 0.8
                });
            }
        }

        if (playerIsLight) {
            this.lights.push({
                x: 500,
                y: 450,
                radius: TileWidth * 2,
                r: 250,
                g: 220,
                b: 150,
                intensity: 0.6
            });
        }

        this.lightingEngine.setObstacles(objects);
    }
}