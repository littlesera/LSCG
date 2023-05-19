declare function KDUpdateDoorNavMap(): void;
/**
 * @param {number} startx - the start position
 * @param {number} starty - the start position
 * @param {number} endx - the end positon
 * @param {number} endy - the end positon
 * @param {boolean} blockEnemy - Do enemies block movement?
 * @param {boolean} blockPlayer - Does player block movement?
 * @param {string} Tiles - Allowed move tiles!
 * @param {entity} [Enemy] - Enemy trying to pathfind
 * @param {boolean} [trimLongDistance] - Give up after 1000 or so tiles checked
 * @returns {any} - Returns an array of x, y points in order
 */
declare function KinkyDungeonFindPath(startx: number, starty: number, endx: number, endy: number, blockEnemy: boolean, blockPlayer: boolean, ignoreLocks: any, Tiles: string, RequireLight: any, noDoors: any, needDoorMemory: any, Enemy?: entity, trimLongDistance?: boolean): any;
declare function KinkyDungeonGetPath(closed: any, xx: any, yy: any, endx: any, endy: any): {
    x: any;
    y: any;
}[];
declare function KDSetPathfindCache(PathMap: any, newPath: any, endx: any, endy: any, Tiles: any, Finalindex: any): void;
/**
 * @type {Map<string, {x: number, y: number}[]>}
 */
declare let KDPathCache: Map<string, {
    x: number;
    y: number;
}[]>;
/**
 * @type {Map<string, {x: number, y: number}[]>}
 */
declare let KDPathCacheIgnoreLocks: Map<string, {
    x: number;
    y: number;
}[]>;
declare let KDPathfindingCacheHits: number;
declare let KDPathfindingCacheFails: number;
declare let KDPFTrim: number;
