/**
 *
 * @param {string} location
 * @param {Record<string, effectTile>} value
 */
declare function KinkyDungeonEffectTilesSet(location: string, value: Record<string, effectTile>): void;
/**
 *
 * @param {string} location
 * @returns {Record<string, effectTile>}
 */
declare function KinkyDungeonEffectTilesGet(location: string): Record<string, effectTile>;
/**
 *
 * @param {string} location
 * @param {any} value
 */
declare function KinkyDungeonTilesSet(location: string, value: any): void;
/**
 *
 * @param {string} location
 * @returns {any}
 */
declare function KinkyDungeonTilesGet(location: string): any;
/**
 *
 * @param {string} location
 */
declare function KinkyDungeonTilesDelete(location: string): void;
declare function KDAlreadyOpened(x: any, y: any): boolean;
declare function KinkyDungeonPlaySound(src: any, entity: any): void;
declare function KinkyDungeonSetCheckPoint(Checkpoint: any, AutoSave: any, suppressCheckPoint: any): void;
declare function KinkyDungeonNewGamePlus(): void;
declare function KDResetData(Data: any): void;
declare function KDResetEventData(Data: any): void;
declare function KinkyDungeonInitialize(Level: any, Load: any): void;
declare function KDInitCanvas(): void;
declare function KDCreateBoringness(): void;
/**
 *
 * @param {floorParams} MapParams
 * @param {number} Floor
 * @param {boolean} [testPlacement]
 * @param {boolean} [seed]
 */
declare function KinkyDungeonCreateMap(MapParams: floorParams, Floor: number, testPlacement?: boolean, seed?: boolean): void;
/**
 * Creates a list of all tiles accessible and not hidden by doors
 */
declare function KinkyDungeonGenNavMap(): void;
declare function KinkyDungeonGetAccessible(startX: any, startY: any, testX: any, testY: any): {};
declare function KinkyDungeonGetAccessibleRoom(startX: any, startY: any): string[];
declare function KinkyDungeonIsAccessible(testX: any, testY: any): boolean;
declare function KinkyDungeonIsReachable(testX: any, testY: any, testLockX: any, testLockY: any): boolean;
declare function KinkyDungeonGetAllies(): entity[];
declare function KinkyDungeonPlaceEnemies(spawnPoints: any, InJail: any, Tags: any, BonusTags: any, Floor: any, width: any, height: any, altRoom: any): void;
declare function KinkyDungeonGetClosestSpecialAreaDist(x: any, y: any): number;
declare function KinkyDungeonCreateRectangle(Left: any, Top: any, Width: any, Height: any, Border: any, Fill: any, Padding: any, OffLimits: any, NoWander: any, flexCorner: any): void;
declare function KinkyDungeonPlaceStairs(checkpoint: any, startpos: any, width: any, height: any, noStairs: any): void;
declare function KinkyDungeonSkinArea(skin: any, X: any, Y: any, Radius: any, NoStairs: any): void;
declare function KinkyDungeonGetMainPath(level: any): string;
declare function KinkyDungeonGetShortcut(level: any): string;
declare function KinkyDungeonPlaceShortcut(checkpoint: any, width: any, height: any): void;
declare function KinkyDungeonPlaceChests(chestlist: any, treasurechance: any, treasurecount: any, rubblechance: any, Floor: any, width: any, height: any): void;
declare function KinkyDungeonPlaceLore(width: any, height: any): number;
declare function KinkyDungeonPlaceHeart(width: any, height: any, Floor: any): boolean;
declare function KinkyDungeonPlaceShrines(shrinelist: any, shrinechance: any, shrineTypes: any, shrinecount: any, shrinefilter: any, ghostchance: any, manaChance: any, orbcount: any, filterTypes: any, Floor: any, width: any, height: any): void;
declare function KinkyDungeonPlaceChargers(chargerlist: any, chargerchance: any, litchargerchance: any, chargercount: any, Floor: any, width: any, height: any): void;
/**
 *
 * @param {number} Floor
 * @param {number} manaChance
 * @param {string[]} filterTypes
 * @returns
 */
declare function KinkyDungeonGenerateShrine(Floor: number, filterTypes: string[], manaChance: number): {
    type: string;
    drunk: boolean;
} | {
    type: string;
    drunk?: undefined;
};
declare function KinkyDungeonPlaceSpecialTiles(gaschance: any, gasType: any, Floor: any, width: any, height: any): void;
declare function KinkyDungeonPlaceBrickwork(brickchance: any, Floor: any, width: any, height: any): void;
declare function KinkyDungeonPlaceTraps(traps: any, traptypes: any, trapchance: any, doorlocktrapchance: any, Floor: any, width: any, height: any): void;
declare function KinkyDungeonPlacePatrols(Count: any, width: any, height: any): void;
/**
 *
 * @returns {number}
 */
declare function KDGetEffLevel(): number;
/**
 * @returns {string}
 */
declare function KDRandomizeRedLock(): string;
/**
 * Generates a lock
 * @param {boolean} [Guaranteed]
 * @param {number} [Floor]
 * @param {boolean} [AllowGold]
 * @param {string} [Type] - Used to customize the type
 * @returns {string}
 */
declare function KinkyDungeonGenerateLock(Guaranteed?: boolean, Floor?: number, AllowGold?: boolean, Type?: string): string;
declare function KinkyDungeonPlaceDoors(doorchance: any, nodoorchance: any, doorlockchance: any, trapChance: any, grateChance: any, Floor: any, width: any, height: any): {
    x: number;
    y: number;
}[];
declare function KinkyDungeonReplaceDoodads(Chance: any, barchance: any, wallRubblechance: any, wallhookchance: any, ceilinghookchance: any, width: any, height: any, altType: any): void;
declare function KinkyDungeonPlaceFurniture(barrelChance: any, cageChance: any, width: any, height: any, altType: any): void;
declare function KinkyDungeonPlaceFood(foodChance: any, width: any, height: any, altType: any): void;
declare function KinkyDungeonPlaceTorches(torchchance: any, torchlitchance: any, torchchanceboring: any, width: any, height: any, altType: any, torchreplace: any): void;
/**
 * Replace vertical wall '1' with '|'
 * @param {number} width
 * @param {number} height
 */
declare function KinkyDungeonReplaceVert(width: number, height: number): void;
declare function KinkyDungeonMazeWalls(Cell: any, Walls: any, WallsList: any): void;
declare function KinkyDungeonMapSet(X: any, Y: any, SetTo: any, VisitedRooms: any): boolean;
declare function KinkyDungeonMapSetForce(X: any, Y: any, SetTo: any, VisitedRooms: any): boolean;
declare function KinkyDungeonBoringGet(X: any, Y: any): number;
declare function KinkyDungeonBoringSet(X: any, Y: any, SetTo: any): boolean;
declare function KinkyDungeonMapGet(X: any, Y: any): string;
declare function KinkyDungeonVisionSet(X: any, Y: any, SetTo: any): boolean;
declare function KinkyDungeonBrightnessSet(X: any, Y: any, SetTo: any, monotonic: any): boolean;
declare function KinkyDungeonColorSet(X: any, Y: any, SetTo: any, monotonic: any): boolean;
declare function KinkyDungeonShadowSet(X: any, Y: any, SetTo: any, monotonic: any): boolean;
declare function KinkyDungeonVisionGet(X: any, Y: any): any;
declare function KinkyDungeonBrightnessGet(X: any, Y: any): any;
declare function KinkyDungeonColorGet(X: any, Y: any): any;
declare function KinkyDungeonShadowGet(X: any, Y: any): any;
declare function KinkyDungeonFogGet(X: any, Y: any): any;
declare function KinkyDungeonGetDirection(dx: any, dy: any): {
    x: number;
    y: number;
    delta: number;
};
declare function KinkyDungeonGetDirectionRandom(dx: any, dy: any): {
    x: number;
    y: number;
    delta: number;
};
declare function KinkyDungeonControlsEnabled(): boolean;
declare function KDStartSpellcast(tx: any, ty: any, SpellToCast: any, enemy: any, player: any, bullet: any, data: any): string;
declare function KinkyDungeonClickGame(Level: any): boolean;
declare function KinkyDungeonGetMovable(): string;
declare function KinkyDungeonListenKeyMove(): void;
declare function KinkyDungeonGameKeyDown(): boolean;
declare function KinkyDungeonGameKeyUp(lastPress: any): boolean;
declare function KinkyDungeonSendTextMessage(priority: any, text: any, color: any, time: any, noPush: any, noDupe: any, entity: any): boolean;
declare function KinkyDungeonSendActionMessage(priority: any, text: any, color: any, time: any, noPush: any, noDupe: any, entity: any): boolean;
declare function KDAttackCost(): number;
declare function KinkyDungeonLaunchAttack(Enemy: any, skip: any): void;
declare function KinkyDungeonMove(moveDirection: any, delta: any, AllowInteract: any, SuppressSprint: any): boolean;
declare function KinkyDungeonWaitMessage(NoTime: any): void;
declare function KinkyDungeonMoveTo(moveX: any, moveY: any, SuppressSprint: any): number;
declare function KDCanSprint(): boolean;
declare function KinkyDungeonAdvanceTime(delta: any, NoUpdate: any, NoMsgTick: any): void;
declare function KinkyDungeonTargetTileMsg(): void;
/**
 * Sets an item in the character appearance
 * @param {Character} C - The character whose appearance should be changed
 * @param {string} Group - The name of the corresponding groupr for the item
 * @param {Asset|null} ItemAsset - The asset collection of the item to be changed
 * @param {string|string[]} NewColor - The new color (as "#xxyyzz" hex value) for that item
 * @param {number} [DifficultyFactor=0] - The difficulty, on top of the base asset difficulty, that should be assigned
 * to the item
 * @param {number} [ItemMemberNumber=-1] - The member number of the player adding the item - defaults to -1
 * @param {boolean} [Refresh=true] - Determines, wether the character should be redrawn after the item change
 * @param {item} [item] - The item, to pass to the event
 * @returns {Item} - the item itself
 */
declare function KDAddAppearance(C: Character, Group: string, ItemAsset: Asset | null, NewColor: string | string[], DifficultyFactor?: number, ItemMemberNumber?: number, Refresh?: boolean, item?: item): Item;
declare function KinkyDungeonCloseDoor(data: any): void;
declare function KDGetEnemyCache(): Map<string, entity>;
/**
 *
 * @param {number} [x]
 * @param {number} [y]
 */
declare function KDTile(x?: number, y?: number): any;
/**
 *
 * @param {number} [x]
 * @param {number} [y]
 */
declare function KDTileDelete(x?: number, y?: number): void;
/**
 * Stuns the player for [turns] turns
 * @param {number} turns
 */
declare function KDStunTurns(turns: number): void;
/**
 * Picks a string based on weights
 * @param {Record<string, number>} list - a list of weights with string keys
 * @returns {string} - the key that was selected
 */
declare function KDGetByWeight(list: Record<string, number>): string;
declare let KinkyDungeonGagMumbleChance: number;
declare let KinkyDungeonGagMumbleChancePerRestraint: number;
declare let MiniGameKinkyDungeonCheckpoint: string;
declare let MiniGameKinkyDungeonShortcut: string;
declare let MiniGameKinkyDungeonMainPath: string;
declare let MiniGameKinkyDungeonLevel: number;
/**
 * @type Record<string, string>
 */
declare let KinkyDungeonMapIndex: Record<string, string>;
/**
 * @type {number[]}
 */
declare let KinkyDungeonBoringness: number[];
declare let KinkyDungeonVisionGrid: any[];
declare let KinkyDungeonColorGrid: any[];
declare let KinkyDungeonShadowGrid: any[];
declare let KinkyDungeonBrightnessGrid: any[];
declare let KinkyDungeonFogGrid: any[];
declare let KinkyDungeonUpdateLightGrid: boolean;
declare let KinkyDungeonGrid: string;
declare let KinkyDungeonGrid_Last: string;
declare let KinkyDungeonGridSize: number;
declare let KinkyDungeonGridWidth: number;
declare let KinkyDungeonGridHeight: number;
declare let KinkyDungeonGridSizeDisplay: number;
declare let KinkyDungeonGridWidthDisplay: number;
declare let KinkyDungeonGridHeightDisplay: number;
declare namespace KinkyDungeonMoveDirection {
    const x: number;
    const y: number;
    const delta: number;
}
declare let KinkyDungeonTextMessagePriority: number;
declare let KinkyDungeonTextMessage: string;
declare let KinkyDungeonTextMessageNoPush: boolean;
declare let KinkyDungeonTextMessageTime: number;
declare let KinkyDungeonTextMessageColor: string;
declare let KinkyDungeonActionMessagePriority: number;
declare let KinkyDungeonActionMessage: string;
declare let KinkyDungeonActionMessageNoPush: boolean;
declare let KinkyDungeonActionMessageTime: number;
declare let KinkyDungeonActionMessageColor: string;
declare let KinkyDungeonSpriteSize: number;
declare let KinkyDungeonCanvas: HTMLCanvasElement;
declare let KinkyDungeonContext: any;
declare let KinkyDungeonCanvasFow: HTMLCanvasElement;
declare let KinkyDungeonContextFow: any;
declare let KinkyDungeonCanvasPlayer: HTMLCanvasElement;
declare let KinkyDungeonContextPlayer: any;
/** @type {entity[]} */
declare let KinkyDungeonEntities: entity[];
declare let KinkyDungeonTerrain: any[];
declare let KinkyDungeonPOI: any[];
declare let KinkyDungeonMapBrightness: number;
declare let KinkyDungeonGroundTiles: string;
declare let KinkyDungeonWallTiles: string;
declare let KinkyDungeonMovableTilesEnemy: string;
declare let KinkyDungeonMovableTilesSmartEnemy: string;
declare let KinkyDungeonMovableTiles: string;
declare let KinkyDungeonTransparentObjects: string;
declare let KinkyDungeonTransparentMovableObjects: string;
declare let KDOpenDoorTiles: string[];
declare let KDRandomDisallowedNeighbors: string;
declare let KDTrappableNeighbors: string;
declare let KDTrappableNeighborsLikely: string;
/**
 * @type {Record<string, {x: number, y: number, tags?:string[]}>}
 */
declare let KinkyDungeonRandomPathablePoints: Record<string, {
    x: number;
    y: number;
    tags?: string[];
}>;
/** @type {Record<string, any>} */
declare let KinkyDungeonTiles: Record<string, any>;
/** @type {Record<string, Record<string, effectTile>>} */
declare let KinkyDungeonEffectTiles: Record<string, Record<string, effectTile>>;
/** @type {Record<string, any>} */
declare let KinkyDungeonTilesMemory: Record<string, any>;
/** @type {Record<string, any>} */
declare let KinkyDungeonTilesSkin: Record<string, any>;
declare let KinkyDungeonTargetTile: any;
declare let KinkyDungeonTargetTileLocation: string;
declare const KinkyDungeonBaseLockChance: 0.1;
declare const KinkyDungeonScalingLockChance: 0.1;
declare const KinkyDungeonBlueLockChance: -0.1;
declare const KinkyDungeonBlueLockChanceScaling: 0.015;
declare const KinkyDungeonBlueLockChanceScalingMax: 0.4;
declare const KinkyDungeonGoldLockChance: -0.25;
declare const KinkyDungeonGoldLockChanceScaling: 0.015;
declare const KinkyDungeonGoldLockChanceScalingMax: 0.25;
declare const KinkyDungeonPurpleLockChance: 0;
declare const KinkyDungeonPurpleLockChanceScaling: 0.02;
declare const KinkyDungeonPurpleLockChanceScalingMax: 0.6;
declare let KinkyDungeonCurrentMaxEnemies: number;
declare let KinkyDungeonNextDataSendTime: number;
declare const KinkyDungeonNextDataSendTimeDelay: 500;
declare let KinkyDungeonNextDataSendTimeDelayPing: number;
declare let KinkyDungeonNextDataSendStatsTimeDelay: number;
declare let KinkyDungeonNextDataSendStatsTime: number;
declare let KinkyDungeonNextDataLastTimeReceived: number;
declare let KinkyDungeonNextDataLastTimeReceivedTimeout: number;
declare let KinkyDungeonLastMoveDirection: any;
declare let KinkyDungeonTargetingSpell: any;
/**
 * Item to decrement by 1 when spell is cast
 */
declare let KinkyDungeonTargetingSpellItem: any;
declare let KinkyDungeonTargetingSpellWeapon: any;
/**
 * Game stops when you reach this level
 */
declare let KinkyDungeonMaxLevel: number;
declare let KinkyDungeonLastMoveTimer: number;
declare let KinkyDungeonLastMoveTimerStart: number;
declare let KinkyDungeonLastMoveTimerCooldown: number;
declare let KinkyDungeonLastMoveTimerCooldownStart: number;
declare let KinkyDungeonPatrolPoints: any[];
declare namespace KinkyDungeonStartPosition {
    const x_1: number;
    export { x_1 as x };
    const y_1: number;
    export { y_1 as y };
}
declare namespace KinkyDungeonEndPosition {
    const x_2: number;
    export { x_2 as x };
    const y_2: number;
    export { y_2 as y };
}
declare let KinkyDungeonShortcutPosition: any;
declare let KinkyDungeonJailLeash: number;
declare let KinkyDungeonJailLeashX: number;
declare let KinkyDungeonSaveInterval: number;
declare let KinkyDungeonSFX: any[];
declare let KDStageBossGenerated: boolean;
declare let KinkyDungeonSpecialAreas: any[];
declare let KDMinBoringness: number;
declare let KinkyDungeonCommercePlaced: number;
declare let KDFood: {
    Food: string;
    Weight: number;
}[];
declare let canvasOffsetX: number;
declare let canvasOffsetY: number;
declare const canvasOffsetX_ui: 500;
declare const canvasOffsetY_ui: 164;
declare let KinkyDungeonAutoWaitSuppress: boolean;
declare let KDShopBuyConfirm: boolean;
declare let KinkyDungeonNoMoveFlag: boolean;
declare let KinkyDungeonLastAction: string;
declare let KinkyDungeonLastTurnAction: string;
declare let KDDrawUpdate: number;
declare let KDVisionUpdate: number;
declare let KDLastTick: number;
declare let KDAllowDialogue: boolean;
declare let lastFloaterRefresh: number;
/**
 * @type {Map<string, entity>}
 */
declare let KDEnemyCache: Map<string, entity>;
declare let KDUpdateEnemyCache: boolean;
declare let KDTileQuery: string;
declare let KDTileLast: any;
declare namespace KDKeyCheckers {
    function Toggles(): boolean;
    function Shop(): boolean;
    function Dialogue(): boolean;
}
