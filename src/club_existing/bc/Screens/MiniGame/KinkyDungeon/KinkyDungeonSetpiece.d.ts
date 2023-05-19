declare function KinkyDungeonPlaceSetPieces(POI: any, trapLocations: any, chestlist: any, shrinelist: any, chargerlist: any, spawnPoints: any, InJail: any, width: any, height: any): void;
declare function KDGetFavoredSetpieces(POI: any, setpieces: any): any;
declare function KDGetFavoringSetpieces(Name: any, tags: any, POI: any, POIBlacklist: any): any;
declare function KinkyDungeonGetSetPiece(POI: any, setpieces: any, pieces: any): any;
declare function KinkyDungeonGenerateSetpiece(POI: any, Piece: any, InJail: any, trapLocations: any, chestlist: any, shrinelist: any, chargerlist: any, spawnPoints: any, forcePOI: any, altType: any, MapParams: any): {
    Pass: boolean;
    Traps: any;
};
/**
 * This function unblocks movement to ensure a map is pathable
 * @param {number} x
 * @param {number} y
 * @returns {boolean} - whether it's possible
 */
declare function KDUnblock(x: number, y: number): boolean;
declare function SetpieceSpawnPrisoner(x: any, y: any): void;
declare function KDTorch(X: any, Y: any, altType: any, MapParams: any): void;
declare function KDChest(X: any, Y: any, loot?: string, faction?: string): void;
declare function KDCreateDoors(Left: any, Top: any, Width: any, Height: any, openChance?: number, convertDoodads?: boolean): void;
declare function KDPlaceChest(cornerX: any, cornerY: any, radius: any, chestlist: any, spawnPoints: any, NoAddToChestList: any): string;
declare let KDSetpieceAttempts: number;
declare let KDSetPieces: ({
    Name: string;
    tags: string[];
    Radius: number;
    xPad?: undefined;
    yPad?: undefined;
    xPadEnd?: undefined;
    yPadEnd?: undefined;
    Max?: undefined;
    Prereqs?: undefined;
    noPOI?: undefined;
} | {
    Name: string;
    tags: string[];
    Radius: number;
    xPad: number;
    yPad: number;
    xPadEnd: number;
    yPadEnd: number;
    Max?: undefined;
    Prereqs?: undefined;
    noPOI?: undefined;
} | {
    Name: string;
    tags: string[];
    Radius: number;
    Max: number;
    xPad?: undefined;
    yPad?: undefined;
    xPadEnd?: undefined;
    yPadEnd?: undefined;
    Prereqs?: undefined;
    noPOI?: undefined;
} | {
    Name: string;
    tags: string[];
    Radius: number;
    Prereqs: string[];
    Max: number;
    xPad: number;
    yPad: number;
    xPadEnd: number;
    yPadEnd: number;
    noPOI?: undefined;
} | {
    Name: string;
    tags: string[];
    Radius: number;
    Max: number;
    xPad: number;
    yPad?: undefined;
    xPadEnd?: undefined;
    yPadEnd?: undefined;
    Prereqs?: undefined;
    noPOI?: undefined;
} | {
    Name: string;
    tags: string[];
    noPOI: boolean;
    Radius: number;
    xPad: number;
    yPad: number;
    xPadEnd: number;
    yPadEnd: number;
    Max?: undefined;
    Prereqs?: undefined;
})[];
declare let KDCountSetpiece: Map<any, any>;
