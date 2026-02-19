import { BaseModule } from "base";
import { MapSettingsModel } from "Settings/Models/base";

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

    // lights: Lamp[] = [];
    // walls: OpaqueObject[] = [];
    // lightings: Lighting[] = [];
    // darkMask: DarkMask | null = null;
    // vision: Lighting | null = null;
    
    load(): void {
        // hookFunction("ChatRoomMapViewDrawGrid", 1, (args, next) => {
        //     next(args);

        //     this.lightings.forEach(l => {
        //         l.render(MainCanvas);
        //     });

        //     this.darkMask?.render(MainCanvas);

        //     this.vision?.cast(MainCanvas);
        // }, ModuleCategory.Map);

        // hookFunction("ChatRoomMapViewCalculatePerceptionMasks", 1, (args, next) => {
        //     next(args);
        //     this.ParseMapForObjects();
        // }, ModuleCategory.Map);

        // hookFunction("ChatRoomMapViewMouseWheel", 1, (args, next) => {
        //     next(args);
        //     this.ParseMapForObjects();
        // }, ModuleCategory.Map);
    }

    // ParseMapForObjects() {
    //     if (!Player) return;
    //     if (!Player.MapData) return;

    //     let [Left, Top, Width, Height] = [0, 0, 1000, 1000];
    //     let MaxVisibleRange = ChatRoomMapViewGetSightRange();
	//     if (MaxVisibleRange < 1) MaxVisibleRange = 1;

    //     let TileWidth = Width / ((ChatRoomMapViewPerceptionRange * 2) + 1);
    //     let TileHeight = Height / ((ChatRoomMapViewPerceptionRange * 2) + 1);

    //     this.lights = [];
    //     this.walls = [];
    //     this.lightings = [];

    //     let FogActive = ChatRoomMapFogIsActive();
    //     for (let Pos = 0; Pos < ChatRoomMapViewWidth * ChatRoomMapViewHeight; Pos++) {
    //         let X = Pos % ChatRoomMapViewWidth;
    //         let Y = Math.floor(Pos / ChatRoomMapViewWidth);

    //         Defines the screen X and Y positions
    //         let ScreenX = (X - Player.MapData.Pos.X) * TileWidth + ChatRoomMapViewPerceptionRange * TileWidth;
    //         let ScreenY = (Y - Player.MapData.Pos.Y) * TileHeight + ChatRoomMapViewPerceptionRange * TileWidth;

    //         let TileID = ChatRoomData?.MapData?.Tiles?.charCodeAt(Pos);
    //         let TileData = ChatRoomMapViewTileList.find(t => t.ID == TileID);
    //         if (!!TileData && TileData.Type == "Wall") {
    //             this.walls.push(new RectangleObject({
    //                 topleft: new Vec2(ScreenX - 2, ScreenY - (TileHeight/2) - 10),
    //                 bottomright: new Vec2(ScreenX + TileWidth + 2, ScreenY + 20),
    //                 diffuse: 0.0
    //             }));
    //         }

    //         let ObjectID = ChatRoomData?.MapData?.Objects?.charCodeAt(Pos);
    //         if (!!ObjectID && ObjectID > ChatRoomMapViewObjectStartID) {
    //             let source = this.lightSources.find(ls => ls.objId == ObjectID)
    //             if (!source || Player.MapData.Pos.Y < Y) {
    //             if (!source) {
    //                 continue;
    //             }
                
    //             let newLamp = new Lamp({
    //                 position: new Vec2(ScreenX + (TileWidth/2), ScreenY + (TileHeight/2)),
    //                 distance: TileWidth * 4,
    //                 diffuse: 0.0,
    //                 color: 'rgba(250,220,150,0.2)',
    //                 radius: 1,
    //                 samples: 1,
    //             });
    //             this.lights.push(newLamp);
    //         }
    //     }

    //     let sightLight = new Lamp({
    //             position: new Vec2(500, 450),
    //             distance: 500,
    //             diffuse: 0.0,
    //             color: 'rgba(250,250,250,0)',
    //             radius: 5,
    //             samples: 1
    //         });
    //     this.vision = new Lighting({light: sightLight, objects: this.walls});

    //     this.lightings = this.lights.map(l => new Lighting({light: l, objects: this.walls}));

    //     this.darkMask = new DarkMask({
    //         lights: this.lights,
    //         color: 'rgba(0,0,0,0.8)',
    //     });
        
    //     this.vision.compute(MainCanvas.canvas.width, MainCanvas.canvas.height);

    //     this.lightings.forEach(l => {
    //         l.compute(MainCanvas.canvas.width, MainCanvas.canvas.height);
    //     });
                
    //     this.darkMask?.compute(MainCanvas.canvas.width, MainCanvas.canvas.height);
    // }
}