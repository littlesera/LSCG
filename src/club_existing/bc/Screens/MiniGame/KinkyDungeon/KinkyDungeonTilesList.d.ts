declare function KDSlimeImmuneEntity(entity: any): any;
declare function KDSlimeWalker(entity: any): boolean;
declare function KDSlimeImmune(enemy: any): any;
/**
 * Return value: whether or not to continue to allow peripheral tile updates
 * @type {Record<string, (delta) => boolean>}
 */
declare let KDTileUpdateFunctions: Record<string, (delta: any) => boolean>;
/**
 * @type {Record<string, (moveX, moveY) => boolean>}
 */
declare let KDMoveObjectFunctions: Record<string, (moveX: any, moveY: any) => boolean>;
/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (delta, tile: effectTile) => boolean>}
 */
declare let KDEffectTileFunctionsStandalone: Record<string, (delta: any, tile: effectTile) => boolean>;
/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (delta, entity: entity, tile: effectTile) => boolean>}
 */
declare let KDEffectTileFunctions: Record<string, (delta: any, entity: entity, tile: effectTile) => boolean>;
/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>}
 */
declare let KDEffectTileCreateFunctionsCreator: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>;
/**
 * Return is whether or not something the player should know about happened
 * @type {Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>}
 */
declare let KDEffectTileCreateFunctionsExisting: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean>;
/**
 * Return is whether or not the move should be interrupted
 * @type {Record<string, (entity, tile: effectTile, willing, dir, sprint) => {cancelmove: boolean, returnvalue: boolean}>}
 */
declare let KDEffectTileMoveOnFunctions: Record<string, (entity: any, tile: effectTile, willing: any, dir: any, sprint: any) => {
    cancelmove: boolean;
    returnvalue: boolean;
}>;
declare let KDTorchExtinguishTypes: string[];
declare let KDSlimeExtinguishTypes: string[];
declare let KDIgnitionSources: string[];
/**
 * Return is idk
 * @type {Record<string, (b, tile: effectTile, d) => boolean>}
 */
declare let KDEffectTileBulletFunctions: Record<string, (b: any, tile: effectTile, d: any) => boolean>;
