/**
 *
 * @param {number} w
 * @param {number} h
 * @param {Record<string, string>} indices
 * @param {any} data
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, number>} maxTagFlags
 * @returns {Record<string, KDMapTile>}
 */
declare function KDMapTilesPopulate(w: number, h: number, indices: Record<string, string>, data: any, requiredAccess: Record<string, boolean>, maxTagFlags: Record<string, number>, tagModifiers: any): Record<string, KDMapTile>;
/**
 *
 * @param {KDMapTile} mapTile - Tile to be evaluated for weight
 * @param {Record<string, boolean>} tags - Tags of the INCOMING tile, not the current one
 * @param {Record<string, number>} tagCounts - Counts of all tags on the map at present
 * @param {Record<string, number>} tagModifiers - Tags of the incoming tile will get a multiplier if the incoming tile has it
 * @returns {number}
 */
declare function KDGetTileWeight(mapTile: KDMapTile, tags: Record<string, boolean>, tagCounts: Record<string, number>, tagModifiers: Record<string, number>): number;
/**
 *
 * @param {string} index
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, KDMapTile>} tilesFilled
 * @param {Record<string, string>} indexFilled
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, boolean>} globalTags
 * @param {Record<string, string>} indices
 * @param {Record<string, number>} tagModifiers
 * @returns {string}
 */
declare function KD_GetMapTile(index: string, indX: number, indY: number, tilesFilled: Record<string, KDMapTile>, indexFilled: Record<string, string>, tagCounts: any, requiredAccess: Record<string, boolean>, globalTags: Record<string, boolean>, indices: Record<string, string>, tagModifiers: Record<string, number>): string;
/**
 *
 * @param {KDMapTile} mapTile
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, string>} indices
 * @param {Record<string, boolean>} requiredAccess
 * @param {Record<string, string>} indexFilled
 * @returns {boolean}
 */
declare function KDCheckMapTileFilling(mapTile: KDMapTile, indX: number, indY: number, indices: Record<string, string>, requiredAccess: Record<string, boolean>, indexFilled: Record<string, string>): boolean;
declare function KDLooseIndexRankingSuspend(indexCheck: any, indexTile: any, w: any, h: any, xx: any, yy: any): boolean;
/**
 *
 * @param {KDMapTile} mapTile
 * @param {number} indX
 * @param {number} indY
 * @param {Record<string, string>} indexFilled
 * @param {Record<string, boolean>} requiredAccess
 * @returns {boolean}
 */
declare function KDCheckMapTileAccess(mapTile: KDMapTile, indX: number, indY: number, indexFilled: Record<string, string>, requiredAccess: Record<string, boolean>): boolean;
/**
 *
 * @param {KDMapTile} tile
 * @param {number} x
 * @param {number} y
 * @param {any} y
 * @returns {string[]}
 */
declare function KD_PasteTile(tile: KDMapTile, x: number, y: number, data: any): string[];
/**
 * Creates a map tile based on a generator tile
 * @param {number} x
 * @param {number} y
 * @param {any} tileGenerator
 * @param {any} data
 * @returns {any}
 */
declare function KDCreateTile(x: number, y: number, tileGenerator: any, data: any): any;
/**
 * Creates a map tile based on a generator tile
 * @param {number} x
 * @param {number} y
 * @param {any} tileGenerator
 * @param {any} data
 * @returns {any}
 */
declare function KDCreateEffectTileTile(x: number, y: number, tileGenerator: any, data: any): any;
/**
 * Aggregates tags from nearby tiles for the specific tile
 * @param {number} x - Top left corner
 * @param {number} y - Top left corner
 * @param {number} w - Tile size
 * @param {number} h - Tile size
 * @param {Record<string, KDMapTile>} tilesFilled
 * @param {Record<string, boolean>} globalTags
 * @return {Record<string, boolean>}
 */
declare function KDAggregateTileTags(x: number, y: number, w: number, h: number, tilesFilled: Record<string, KDMapTile>, globalTags: Record<string, boolean>): Record<string, boolean>;
declare namespace KDEffectTileGen {
    function TorchUnlit(x: any, y: any, tile: any, tileGenerator: any, data: any): any;
    function Torch(x: any, y: any, tile: any, tileGenerator: any, data: any): any;
}
/**
 * @type {Record<string, (x: number, y: number, tile: any, tileGenerator: any, data: {params: floorParams; chestlist: any[]; traps: any[]; shrinelist: any[]; chargerlist: any[]; spawnpoints: any[]}) => any>}
 */
declare let KDTileGen: Record<string, (x: number, y: number, tile: any, tileGenerator: any, data: {
    params: floorParams;
    chestlist: any[];
    traps: any[];
    shrinelist: any[];
    chargerlist: any[];
    spawnpoints: any[];
}) => any>;
