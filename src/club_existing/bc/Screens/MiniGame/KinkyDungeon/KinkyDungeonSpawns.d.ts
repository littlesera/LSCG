declare function KinkyDungeonAddTags(tags: any, Floor: any): any[];
/**
 *
 * @param {string[]} enemytags
 * @param {number} Level
 * @param {string} Index
 * @param {string} Tile
 * @param {string[]} [requireTags]
 * @param {boolean} [requireHostile]
 * @param {Record<string, {bonus: number, mult: number}>} [bonusTags]
 * @param {string[]} [filterTags]
 * @param {string[]} [requireSingleTag]
 * @returns {enemy}
 */
declare function KinkyDungeonGetEnemy(enemytags: string[], Level: number, Index: string, Tile: string, requireTags?: string[], requireHostile?: boolean, bonusTags?: Record<string, {
    bonus: number;
    mult: number;
}>, filterTags?: string[], requireSingleTag?: string[]): enemy;
declare function KinkyDungeonGetEnemyByName(Name: string): enemy;
/**
 *
 * @param {string} name
 * @returns {enemy}
 */
declare function KinkyDungeonGetEnemyByName(name: string): enemy;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {boolean} noTransgress
 * @param {boolean} normalDrops
 * @param {string[]} [requireTags]
 * @returns {entity}
 */
declare function KinkyDungeonCallGuard(x: number, y: number, noTransgress: boolean, normalDrops: boolean, requireTags?: string[]): entity;
declare function KinkyDungeonHandleWanderingSpawns(delta: any): void;
declare let KDPerkToggleTags: string[];
declare let KinkyDungeonTotalSleepTurns: number;
declare let KinkyDungeonSearchTimer: number;
declare let KinkyDungeonSearchTimerMin: number;
declare let KinkyDungeonFirstSpawn: boolean;
declare let KinkyDungeonSearchStartAmount: number;
declare let KinkyDungeonSearchHuntersAmount: number;
declare let KinkyDungeonSearchEntranceAdjustAmount: number;
declare let KinkyDungeonSearchEntranceChaseAmount: number;
/** The defauilt interval between hunter checks */
declare let HunterPulse: number;
/** Cooldown for hunter spawns */
declare let HunterSpawnTimer: number;
