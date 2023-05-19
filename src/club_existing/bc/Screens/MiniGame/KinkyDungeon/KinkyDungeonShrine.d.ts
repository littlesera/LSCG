declare function KinkyDungeonShrineInit(): void;
/**
 *
 * @param {string} Name
 * @returns {string}
 */
declare function KDGoddessColor(Name: string): string;
declare function KinkyDungeonShrineAvailable(type: any): boolean;
/**
 *
 * @param {number} Level
 */
declare function KinkyDungeonGenerateShop(Level: number): void;
/**
 *
 * @param {any} item
 * @param {boolean} [noScale]
 * @param {boolean} [sell]
 * @returns {number}
 */
declare function KinkyDungeonItemCost(item: any, noScale?: boolean, sell?: boolean): number;
declare function KinkyDungeonShrineCost(type: any): number;
declare function KDAddBasic(item: any): void;
declare function KinkyDungeonPayShrine(type: any): void;
declare function KinkyDungeonHandleShrine(): boolean;
declare function KinkyDungeonDrawShrine(): void;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} Goddess
 * @param {number} [mult]
 * @param {number} [LevelBoost]
 * @returns {number}
 */
declare function KDSummonRevengeMobs(x: number, y: number, Goddess: string, mult?: number, LevelBoost?: number): number;
/**
 *
 * @param {boolean} Bottle - Is this bottling or drinking?
 * @returns {boolean}
 */
declare function KDCanDrinkShrine(Bottle: boolean): boolean;
declare function KinkyDungeonShrineAngerGods(Type: any): void;
declare function KinkyDungeonGetSetPieces(Dict: any): any[];
declare function KinkyDungeonGetMapShrines(Dict: any): any[];
declare function KinkyDungeonTakeOrb(Amount: any, X: any, Y: any): void;
declare function KinkyDungeonDrawOrb(): void;
declare function KinkyDungeonHandleOrb(): boolean;
declare function KinkyDungeonTakePerk(Amount: any, X: any, Y: any): void;
declare function KinkyDungeonDrawPerkOrb(): void;
/**
 * Base costs for all the shrines. Starts at this value, increases thereafter
 * @type {Record<string, number>}
 */
declare let KinkyDungeonShrineBaseCosts: Record<string, number>;
declare let KDWillShrineWill: number;
declare let KinkyDungeonOrbAmount: number;
declare let KDShrineRemoveCount: number;
/**
 * Cost growth, overrides the default amount
 * @type {Record<string, number>}
 */
declare let KinkyDungeonShrineBaseCostGrowth: Record<string, number>;
declare let KinkyDungeonShopIndex: number;
declare let KinkyDungeonShrinePoolChancePerUse: number;
/**
 * Current costs multipliers for shrines
 * @type {Record<string, number>}
 */
declare let KinkyDungeonShrineCosts: Record<string, number>;
declare let KinkyDungeonShrineTypeRemove: string[];
declare let KDLevelsPerCheckpoint: number;
/**
 * @type {Record<string, {require: string[], requireSingle: string[], filter?: string[]}>}
 */
declare let KDGoddessRevengeMobTypes: Record<string, {
    require: string[];
    requireSingle: string[];
    filter?: string[];
}>;
declare let KDOrbX: number;
declare let KDOrbY: number;
declare let KDPerkConfirm: boolean;
declare let KDPerkOrbPerks: any[];
