declare function KDAssignGuardAction(guard: any, xx: any, yy: any): void;
declare function KDGetJailEvent(guard: any, xx: any, yy: any): (g: any, x: any, y: any) => void;
declare function KinkyDungeonLoseJailKeys(Taken: any, boss: any, enemy: any): void;
declare function KinkyDungeonUpdateJailKeys(): void;
declare function KinkyDungeonAggroFaction(faction: any, noAllyRepPenalty: any): boolean;
declare function KinkyDungeonPlayerIsVisibleToJailers(): entity;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KinkyDungeonCanPlay(enemy: entity): boolean;
declare function KinkyDungeonCheckRelease(): number;
/**
 *
 * @param {string} action
 * @param {{enemy?: entity, x?: number, y?: number, faction?: string}} data
 */
declare function KinkyDungeonAggroAction(action: string, data: {
    enemy?: entity;
    x?: number;
    y?: number;
    faction?: string;
}): void;
/**
 *
 * @param {entity} enemy
 * @param {string} Type
 * @param {string} [faction]
 * @param {boolean} [force]
 */
declare function KinkyDungeonStartChase(enemy: entity, Type: string, faction?: string, force?: boolean): void;
/**
 *
 * @param {entity} enemy
 * @param {string} Type
 */
declare function KinkyDungeonPlayExcuse(enemy: entity, Type: string): void;
/**
 *
 * @param {entity} enemy
 * @param {number} mult
 * @param {number} base
 */
declare function KDSetPlayCD(enemy: entity, mult: number, base?: number): void;
/**
 *
 * @param {string} Group
 * @returns {restraint}
 */
declare function KinkyDungeonGetJailRestraintForGroup(Group: string): restraint;
declare function KinkyDungeonGetJailRestraintLevelFor(Name: any): number;
declare function KinkyDungeonInJail(): boolean;
declare function KinkyDungeonPlaceJailKeys(): boolean;
declare function KinkyDungeonHandleJailSpawns(delta: any): void;
declare function KinkyDungeonLockableItems(): string[];
declare function KinkyDungeonMissingJailUniform(): string[];
declare function KinkyDungeonTooMuchRestraint(): string[];
/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} type
 */
declare function KinkyDungeonHandleLeashTour(xx: number, yy: number, type: string): void;
/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} type
 */
declare function KinkyDungeonJailGuardGetLeashWaypoint(xx: number, yy: number, type: string): void;
declare function KinkyDungeonJailGetLeashPoint(xx: any, yy: any, enemy: any): {
    x: any;
    y: any;
};
/**
 * @param {boolean} [any]
 * @param {boolean} [qualified] - Makes sure the player is qualified
 * @returns {boolean} - Returns if the player is inside the nearest jail cell
 */
declare function KinkyDungeonPlayerInCell(any?: boolean, qualified?: boolean): boolean;
declare function KinkyDungeonPointInCell(x: any, y: any): boolean;
declare function KinkyDungeonPassOut(noteleport: any): void;
declare function KDGetJailDoor(x: any, y: any): {
    tile: any;
    x: any;
    y: any;
};
declare function KDDefeatedPlayerTick(): void;
declare function KinkyDungeonDefeat(PutInJail: any): void;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KDEnemyIsTemporary(enemy: entity): boolean;
declare function KDKickEnemies(nearestJail: any): void;
declare function KDResetAllIntents(): void;
declare function KDKickEnemy(e: any): void;
declare function KinkyDungeonStripInventory(KeepPicks: any): void;
declare function KDExpireFlags(enemy: any): void;
/**
 * Gets the jail outfit of the guard, or using overrideTags instead of the guard's taggs
 * @param {string[]} [overrideTags]
 * @param {boolean} [requireJail]
 * @param {boolean} [requireParole]
 * @returns {{Name: string, Level: number}[]}
 */
declare function KDGetJailRestraints(overrideTags?: string[], requireJail?: boolean, requireParole?: boolean): {
    Name: string;
    Level: number;
}[];
/** Time spent in cage before guards start getting teleported */
declare let KDMaxCageTime: number;
/** Max turns for the alert timer until the whole map becomes hostile */
declare let KDMaxAlertTimer: number;
declare let KDMaxAlertTimerAggro: number;
/**
 * @type {string[]}
 */
declare let KDLocalChaseTypes: string[];
