/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
declare function KDWettable(entity: entity): boolean;
/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
declare function KDConducting(entity: entity): boolean;
declare function KinkyDungeonHandleTilesEnemy(enemy: any, delta: any): void;
/**
 * Applies effects based on nearby tiles. Affects only the player
 * @param {number} delta
 */
declare function KDPeripheralTileEffects(delta: number): void;
/**
 * Applies effects based on the tile you are standing on. Affects only the player
 * @param {number} delta
 */
declare function KinkyDungeonUpdateTileEffects(delta: number): void;
declare function KinkyDungeonHandleMoveToTile(toTile: any): void;
declare function KDCanEscape(): boolean;
/**
 * Creates combined record of tags
 * @param {number} x
 * @param {number} y
 * @returns {Record<String, boolean>}
 */
declare function KDEffectTileTags(x: number, y: number): Record<string, boolean>;
declare function KinkyDungeonHandleStairs(toTile: any, suppressCheckPoint: any): void;
declare function KinkyDungeonHandleMoveObject(moveX: any, moveY: any, moveObject: any): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
declare function KDHasEffectTile(x: number, y: number): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {Record<string, effectTile>}
 */
declare function KDGetEffectTiles(x: number, y: number): Record<string, effectTile>;
declare function KDGetSpecificEffectTile(x: any, y: any, tile: any): effectTile;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {effectTileRef} tile
 * @param {number} durationMod
 * @returns {effectTile}
 */
declare function KDCreateEffectTile(x: number, y: number, tile: effectTileRef, durationMod: number): effectTile;
declare function KDInteractNewTile(newTile: any): void;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {effectTileRef} tile
 * @param {number} [durationMod]
 * @param {number} [rad]
 * @param {{x: number, y: number}} [avoidPoint]
 * @param {number} [density]
 * @param {string} mod - explosion modifier
 */
declare function KDCreateAoEEffectTiles(x: number, y: number, tile: effectTileRef, durationMod?: number, rad?: number, avoidPoint?: {
    x: number;
    y: number;
}, density?: number, mod?: string): void;
/**
 * Current alpha vs fade type
 * @param {string} id
 * @param {number} alpha
 * @param {string} fade
 * @param {number} delta
 */
declare function KDApplyAlpha(id: string, alpha: number, fade: string, delta: number): number;
declare function KDDrawEffectTiles(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
/**
 *
 * @param {effectTile} tile
 * @returns {boolean}
 */
declare function KDCanSeeEffectTile(tile: effectTile): boolean;
declare function KDUpdateEffectTiles(delta: any): void;
/**
 *
 * @param {number} delta
 * @param {entity} entity
 * @param {effectTile} tile
 */
declare function KinkyDungeonUpdateSingleEffectTile(delta: number, entity: entity, tile: effectTile): void;
/**
 *
 * @param {number} delta
 * @param {effectTile} tile
 */
declare function KinkyDungeonUpdateSingleEffectTileStandalone(delta: number, tile: effectTile): void;
/**
 *
 * @param {any} b
 * @param {effectTile} tile
 * @param {number} d
 */
declare function KinkyDungeonBulletInteractionSingleEffectTile(b: any, tile: effectTile, d: number): void;
declare function KDEffectTileInteractions(x: any, y: any, b: any, d: any): void;
/**
 * Moves an entity
 * @param {entity} enemy
 * @param {number} x
 * @param {number} y
 * @param {boolean} willing
 */
declare function KDMoveEntity(enemy: entity, x: number, y: number, willing: boolean, dash: any, forceHitBullets: any): boolean;
declare function KDMovePlayer(moveX: any, moveY: any, willing: any, sprint: any, forceHitBullets: any): boolean;
declare function KDSlip(dir: any): boolean;
/**
 * Helper function for flammable tiles
 */
declare function KDInferno(existingTile: any, newTile: any, duration: any): void;
/**
 * Helper function for flammables
 * @param {*} b
 * @param {effectTile} tile
 * @param {*} d
 */
declare function KDIgnition(b: any, tile: effectTile, d: any): void;
declare let KinkyDungeonChestConfirm: boolean;
declare let KinkyDungeonConfirmStairs: boolean;
/** @type {Record<string, boolean>} */
declare let KDTileModes: Record<string, boolean>;
declare let KDLastEffTileUpdate: number;
