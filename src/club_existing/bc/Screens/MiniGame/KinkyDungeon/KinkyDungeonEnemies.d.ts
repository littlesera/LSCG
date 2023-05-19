/**
 * Refreshes the enemies map
 */
declare function KinkyDungeonRefreshEnemiesCache(): void;
/**
 *
 * @param {string} Name
 * @returns {enemy}
 */
declare function KinkyDungeonGetEnemyByName(Name: string): enemy;
declare function KinkyDungeonGetEnemyByName(name: string): enemy;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string[]} [filter]
 * @param {boolean} [any]
 * @param {boolean} [qualified] - Exclude jails where the player doesnt meet conditions
 * @returns {{x: number, y: number, type: string, radius: number}}
 */
declare function KinkyDungeonNearestJailPoint(x: number, y: number, filter?: string[], any?: boolean, qualified?: boolean): {
    x: number;
    y: number;
    type: string;
    radius: number;
};
declare function KDLockNearbyJailDoors(x: any, y: any): void;
/**
 *
 * @param {string[]} [filter]
 * @param {{x: number, y: number, type: string, radius: number}[]} [exclude]
 * @returns {{x: number, y: number, type: string, radius: number}}
 */
declare function KinkyDungeonRandomJailPoint(filter?: string[], exclude?: {
    x: number;
    y: number;
    type: string;
    radius: number;
}[]): {
    x: number;
    y: number;
    type: string;
    radius: number;
};
declare function KinkyDungeonNearestPatrolPoint(x: any, y: any): number;
/**
 *
 * @param {string} Flag
 * @param {number} Duration - In turns
 * @param {number} [Floors] - Optional, makes this flag expire in this many floors
 */
declare function KinkyDungeonSetFlag(Flag: string, Duration: number, Floors?: number): void;
declare function KinkyDungeonUpdateFlags(delta: any): void;
declare function KinkyDungeonGetPatrolPoint(index: any, radius: any, Tiles: any): any;
declare function KDHelpless(enemy: any): boolean;
declare function KinkyDungeonNearestPlayer(enemy: any, requireVision: any, decoy: any, visionRadius: any, AI_Data: any): any;
declare function KinkyDungeonInDanger(): boolean;
declare function KDAmbushAI(enemy: any): boolean;
declare function KinkyDungeonDrawEnemies(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
/**
 *
 * @param {entity} enemy
 * @param {string} flag
 * @returns {boolean}
 */
declare function KDEnemyHasFlag(enemy: entity, flag: string): boolean;
declare function KinkyDungeonDrawEnemiesStatus(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
declare function KinkyDungeonDrawEnemiesWarning(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
declare function KinkyDungeonBar(x: any, y: any, w: any, h: any, value: any, foreground?: string, background?: string, orig?: any, origColor?: string, notches?: any, notchcolor?: string, notchbg?: string, zIndex?: number): void;
/**
 *
 * @param {entity} enemy
 * @param {number} [playerDist]
 * @returns {boolean}
 */
declare function KDCanSeeEnemy(enemy: entity, playerDist?: number): boolean;
declare function KDMaxEnemyViewDist(enemy: any): number;
/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
declare function KDGetEnemyStruggleMod(enemy: entity): number;
/**
 *
 * @param {entity} enemy
 * @param {number} vibe
 * @returns {number}
 */
declare function KDGetEnemyDistractRate(enemy: entity, vibe: number): number;
/**
 *
 * @param {entity} enemy
 * @param {number} vibe
 * @returns {number}
 */
declare function KDGetEnemyDistractionDamage(enemy: entity, vibe: number): number;
declare function KinkyDungeonDrawEnemiesHP(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
/**
 *
 * @param {entity} enemy
 * @param {number} offset
 * @returns {number}
 */
declare function KDDrawEnemyTooltip(enemy: entity, offset: number): number;
declare function KDGetColor(enemy: any): string;
/**
 *
 * @param {entity} enemy
 * @returns {boolean} Whether or not it was a Champion capture
 */
declare function KinkyDungeonCapture(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 */
declare function KDDropStolenItems(enemy: entity): void;
declare function KinkyDungeonEnemyCheckHP(enemy: any, E: any): boolean;
/**
 *
 * @param {entity} enemy
 */
declare function KDDropItems(enemy: entity): void;
/**
 *
 * @param {entity} Enemy
 * @returns {boolean} - If the NPC is eligible to use favors
 */
declare function KDFavorNPC(Enemy: entity): boolean;
/**
 *
 * @param {entity} Enemy
 * @returns {number} - Gets the favor with the enemy
 */
declare function KDGetFavor(Enemy: entity): number;
/**
 *
 * @param {entity} Enemy
 * @param {number} Amount
 */
declare function KDChangeFavor(Enemy: entity, Amount: number): void;
declare function KDAddFavor(Faction: any, Amount: any): void;
declare function KDModFavor(Faction: any, Amount: any): void;
declare function KinkyDungeonCheckLOS(enemy: any, player: any, distance: any, maxdistance: any, allowBlind: any, allowBars: any): boolean;
declare function KinkyDungeonTrackSneak(enemy: any, delta: any, player: any, darkmult: any): boolean;
declare function KinkyDungeonMultiplicativeStat(Stat: any): number;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @param {entity} [hostileEnemy]
 * @returns {entity[]}
 */
declare function KDNearbyEnemies(x: number, y: number, dist: number, hostileEnemy?: entity): entity[];
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @returns {{x: number, y: number, tile: any}[]}
 */
declare function KDNearbyTiles(x: number, y: number, dist: number): {
    x: number;
    y: number;
    tile: any;
}[];
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} dist
 * @param {entity} [neutralEnemy]
 * @returns {entity[]}
 */
declare function KDNearbyNeutrals(x: number, y: number, dist: number, neutralEnemy?: entity): entity[];
declare function KinkyDungeonGetRandomEnemyPoint(avoidPlayer: any, onlyPlayer: any, Enemy: any, playerDist?: number, minDist?: number): {
    x: number;
    y: number;
};
declare function KinkyDungeonGetNearbyPoint(x: any, y: any, allowNearPlayer: boolean, Enemy: any, Adjacent: any, ignoreOffLimits: any, callback: any): {
    x: any;
    y: any;
};
declare function KinkyDungeonSetEnemyFlag(enemy: any, flag: any, duration: any): void;
/**
 *
 * @param {entity} enemy
 * @param {number} delta
 */
declare function KinkyDungeonTickFlagsEnemy(enemy: entity, delta: number): void;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KinkyDungeonHasStatus(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KinkyDungeonIsDisabled(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KinkyDungeonIsSlowed(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KinkyDungeonCanCastSpells(enemy: entity): boolean;
declare function KDCanBind(enemy: any): boolean;
declare function KDBoundEffects(enemy: any): 1 | 0 | 2 | 3 | 4;
declare function KinkyDungeonUpdateEnemies(delta: any, Allied: any): void;
declare function KDMakeHostile(enemy: any, timer: any): void;
/**
 * Makes an enemy vulnerable if you are behind them
 * @param {entity} enemy
 */
declare function KDCheckVulnerableBackstab(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
declare function KDGetAI(enemy: entity): string;
declare function KDAddThought(id: any, name: any, priority: any, duration: any): void;
declare function KDEnemyCanTalk(enemy: any): boolean;
/**
 *
 * @param {entity} enemy
 * @param {*} player
 * @param {number} delta
 * @param {number} visionMod
 * @param {item[]} playerItems
 * @returns {{idle: boolean, defeat: boolean}}
 */
declare function KinkyDungeonEnemyLoop(enemy: entity, player: any, delta: number, visionMod: number, playerItems: item[]): {
    idle: boolean;
    defeat: boolean;
};
declare function KinkyDungeonGetEnemyID(): number;
declare function KinkyDungeonNoEnemy(x: any, y: any, Player: any): boolean;
/**
 *
 * @param {entity} e - Target enemy
 * @param {entity} Enemy - Enemy trying to move
 * @returns
 */
declare function KinkyDungeonCanSwapWith(e: entity, Enemy: entity): boolean;
declare function KinkyDungeonNoEnemyExceptSub(x: any, y: any, Player: any, Enemy: any): boolean;
declare function KinkyDungeonEnemyAt(x: any, y: any): entity;
declare function KinkyDungeonEntityAt(x: any, y: any, requireVision: any, vx: any, vy: any): any;
declare function KinkyDungeonEnemyTryMove(enemy: any, Direction: any, delta: any, x: any, y: any): boolean;
declare function KinkyDungeonEnemyTryAttack(enemy: any, player: any, Tiles: any, delta: any, x: any, y: any, points: any, replace: any, msgColor: any, usingSpecial: any, refreshWarningTiles: any, attack: any, MovableTiles: any): boolean;
declare function KinkyDungeonGetWarningTilesAdj(): {
    x: number;
    y: number;
}[];
declare function KDCanPickpocket(enemy: any): boolean;
declare function KinkyDungeonGetWarningTiles(dx: any, dy: any, range: any, width: any, forwardOffset?: number): {
    x: number;
    y: number;
}[];
declare function KinkyDungeonFindMaster(enemy: any): {
    master: entity;
    dist: number;
};
declare function KinkyDungeonEnemyCanMove(enemy: any, dir: any, MovableTiles: any, AvoidTiles: any, ignoreLocks: any, Tries: any): boolean;
declare function KinkyDungeonFindID(id: any): entity;
declare function KDDash(enemy: any, player: any, MovableTiles: any): {
    happened: number;
    Dash: boolean;
};
declare function KinkyDungeonSendEnemyEvent(Event: any, data: any): void;
/**
 *
 * @param {entity} enemy
 * @param {any} data
 * @param {boolean} aggressive
 * @returns {(enemy, AIData) => void}
 */
declare function KDGetIntentEvent(enemy: entity, data: any, play: any, allied: any, hostile: any, aggressive: boolean): (enemy: any, AIData: any) => void;
declare function KDAddEntity(entity: any): void;
declare function KDSpliceIndex(index: any, num?: number): void;
/**
 *
 * @param {entity} enemy
 * @param {any} target
 * @returns {{x: number, y: number, delta: number}}
 */
declare function KDGetDir(enemy: entity, target: any): {
    x: number;
    y: number;
    delta: number;
};
declare function KDIsImmobile(enemy: any): any;
/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
declare function KDPullResistance(enemy: entity): number;
/**
 *
 * @param {number} power
 * @param {entity} enemy
 * @param {boolean} allowNeg
 * @returns {number}
 */
declare function KDPushModifier(power: number, enemy: entity, allowNeg?: boolean): number;
/**
 *
 * @param {entity} enemy
 * @param {number} amount
 * @param {string} type
 * @param {any} Damage
 * @returns {*}
 */
declare function KDTieUpEnemy(enemy: entity, amount: number, type: string, Damage: any): any;
declare function KDPredictStruggle(enemy: any, struggleMod: any, delta: any): {
    enemy: any;
    struggleMod: any;
    delta: any;
    boundLevel: any;
    specialBoundLevel: any;
};
/**
 * @param {entity} enemy - the enemy to check if the player can domme
 * @returns {boolean}
 */
declare function KDCanDom(enemy: entity): boolean;
/**
 * Returns true if any non-dominant activities are currently being performed on the player which compromises their ability to dominate
 * @returns {boolean}
 */
declare function KDPlayerIsNotDom(): boolean;
/**
 * Returns true if player has any level of bondage
 * @returns {boolean}
 */
declare function KDPlayerIsTied(): boolean;
/**
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KDIsBrat(enemy: entity): boolean;
/**
 * Captures helpless enemies near the enemy
 * @param {entity} enemy
 */
declare function KDCaptureNearby(enemy: entity): void;
/**
 *
 * @param {entity} enemy
 * @param {boolean} guaranteed
 * @returns {string}
 */
declare function KinkyDungeonGetLoadoutForEnemy(enemy: entity, guaranteed: boolean): string;
/**
 * Gets the text for a key, suffixed with the enemy faction or name if available. Otherwise falls back to just the key
 * @param {string} key - The base text key
 * @param {entity} enemy - The enemy
 * @param {boolean} useName - Whether to use the enemy name or faction
 * @returns {string}
 */
declare function KinkyDungeonGetTextForEnemy(key: string, enemy: entity, useName?: boolean): string;
declare function KDPlayerIsDefeated(): number;
declare function KDPlayerIsDisabled(): number | boolean;
declare function KDPlayerIsStunned(): number | boolean;
/**
 *
 * @param {entity} enemy
 * @returns {{suff: string, color: string}}
 */
declare function KDGetAwareTooltip(enemy: entity): {
    suff: string;
    color: string;
};
/**
 *
 * @param {string} lock
 * @returns {string}
 */
declare function KDProcessLock(lock: string): string;
/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 */
declare function KDRestockRestraints(enemy: entity, restMult: number): void;
/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 * @returns {number}
 */
declare function KDDetermineBaseRestCount(enemy: entity, restMult: number): number;
/**
 *
 * @param {entity} enemy
 * @param {number} restMult
 * @param {number} [count]
 */
declare function KDStockRestraints(enemy: entity, restMult: number, count?: number): void;
/**
 *
 * @param {entity} enemy
 * @param {string} loadout
 */
declare function KDSetLoadout(enemy: entity, loadout: string): void;
declare function KDClearItems(enemy: any): void;
/**
 *
 * @param {entity} enemy
 * @param {entity} player
 * @returns {boolean}
 */
declare function KDCanDetect(enemy: entity, player: entity): boolean;
declare let KDEnemiesCache: Map<any, any>;
declare let KinkyDungeonSummonCount: number;
declare let KinkyDungeonEnemyAlertRadius: number;
declare let KDStealthyMult: number;
declare let KDConspicuousMult: number;
declare let commentChance: number;
declare let actionDialogueChance: number;
declare let actionDialogueChanceIntense: number;
/** @type {Map<string, number>} */
declare let KinkyDungeonFlags: Map<string, number>;
declare let KinkyDungeonFastMoveSuppress: boolean;
declare let KinkyDungeonFastStruggleSuppress: boolean;
declare let KDMaxBindingBars: number;
declare let KDChampionMax: number;
declare let KinkyDungeonDamageTaken: boolean;
declare let KinkyDungeonTorsoGrabCD: number;
declare let KinkyDungeonHuntDownPlayer: boolean;
/**
 * @type {Map<number, {name: string, priority: number, duration: number, index: number}>}
 */
declare let KDThoughtBubbles: Map<number, {
    name: string;
    priority: number;
    duration: number;
    index: number;
}>;
declare let AIData: {};
declare let KinkyDungeonEnemyID: number;
declare let KDDomThresh_Loose: number;
declare let KDDomThresh_Normal: number;
declare let KDDomThresh_Strict: number;
declare let KDDomThresh_Variance: number;
declare let KDDomThresh_PerkMod: number;
declare let KDDefaultRestraintThresh: number;
