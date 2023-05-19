/**
 * Returns whether or not the player meets a requirement for a pearl reward chest
 * @returns {boolean}
 */
declare function KDPearlRequirement(): boolean;
declare function KinkyDungeonInitReputation(): void;
/**
 *
 * @param {number} Amount
 * @returns {string}
 */
declare function KinkyDungeonRepName(Amount: number): string;
/**
 *
 * @param {number} Amount
 * @returns {string}
 */
declare function KinkyDungeonRepNameFaction(Amount: number): string;
/**
 *
 * @param {string} Rep
 * @param {number} Amount
 * @returns {boolean}
 */
declare function KinkyDungeonChangeFactionRep(Rep: string, Amount: number): boolean;
/**
 *
 * @param {string} Rep
 * @param {number} Amount
 * @returns {boolean}
 */
declare function KinkyDungeonChangeRep(Rep: string, Amount: number): boolean;
declare function KinkyDungeonHandleReputation(): boolean;
declare function KinkyDungeonDrawReputation(): void;
declare function KinkyDungeonDrawFactionRep(): string;
/**
 *
 * @param {string} rep
 * @returns {number}
 */
declare function KinkyDungeonPenanceCost(rep: string): number;
/**
 *
 * @param {string} rep
 * @param {number} value
 * @returns {boolean}
 */
declare function KinkyDungeonCanPenance(rep: string, value: number): boolean;
/**
 *
 * @param {string} rep
 * @returns {number}
 */
declare function KinkyDungeonAidManaCost(rep: string, value: any): number;
/**
 *
 * @param {string} rep
 * @param {number} value
 * @returns {number}
 */
declare function KinkyDungeonAidManaAmount(rep: string, value: number): number;
/**
 *
 * @param {string} rep
 * @param {number} value
 * @returns {boolean}
 */
declare function KinkyDungeonCanAidMana(rep: string, value: number): boolean;
declare function KinkyDungeonRescueTiles(): {
    x: number;
    y: number;
}[];
/**
 *
 * @param {string} rep
 * @param {number} value
 * @returns {boolean}
 */
declare function KinkyDungeonCanRescue(rep: string, value: number): boolean;
/**
 *
 * @param {number} delta
 */
declare function KinkyDungeonUpdateAngel(delta: number): void;
/**
 *
 * @param {number} x
 * @param {number} y
 */
declare function KinkyDungeonCreateAngel(x: number, y: number): void;
declare const KDANGER: -19;
declare const KDRAGE: -31;
declare namespace KDFactionGoddess {
    namespace Metal {
        const Angel: number;
        const Demon: number;
        const Nevermere: number;
        const AncientRobot: number;
        const Alchemist: number;
    }
    namespace Rope {
        const Angel_1: number;
        export { Angel_1 as Angel };
        const Demon_1: number;
        export { Demon_1 as Demon };
        export const KinkyConstruct: number;
        export const Dressmaker: number;
        export const Bountyhunter: number;
        export const Bast: number;
    }
    namespace Elements {
        const Angel_2: number;
        export { Angel_2 as Angel };
        const Demon_2: number;
        export { Demon_2 as Demon };
        export const Witch: number;
        export const Apprentice: number;
        export const Elemental: number;
    }
    namespace Leather {
        const Angel_3: number;
        export { Angel_3 as Angel };
        const Demon_3: number;
        export { Demon_3 as Demon };
        export const Elf: number;
        export const Dragon: number;
        export const Bandit: number;
        const Elemental_1: number;
        export { Elemental_1 as Elemental };
    }
    namespace Latex {
        const Angel_4: number;
        export { Angel_4 as Angel };
        const Demon_4: number;
        export { Demon_4 as Demon };
        export const Maidforce: number;
        const Alchemist_1: number;
        export { Alchemist_1 as Alchemist };
        const Nevermere_1: number;
        export { Nevermere_1 as Nevermere };
        const Elemental_2: number;
        export { Elemental_2 as Elemental };
    }
    namespace Will {
        const Angel_5: number;
        export { Angel_5 as Angel };
        const Demon_5: number;
        export { Demon_5 as Demon };
        const Elf_1: number;
        export { Elf_1 as Elf };
        export const Mushy: number;
        const Bast_1: number;
        export { Bast_1 as Bast };
        const Apprentice_1: number;
        export { Apprentice_1 as Apprentice };
    }
    namespace Conjure {
        const Angel_6: number;
        export { Angel_6 as Angel };
        const Demon_6: number;
        export { Demon_6 as Demon };
        const Alchemist_2: number;
        export { Alchemist_2 as Alchemist };
        const Witch_1: number;
        export { Witch_1 as Witch };
        const Apprentice_2: number;
        export { Apprentice_2 as Apprentice };
        const Dressmaker_1: number;
        export { Dressmaker_1 as Dressmaker };
    }
    namespace Illusion {
        const Angel_7: number;
        export { Angel_7 as Angel };
        const Demon_7: number;
        export { Demon_7 as Demon };
        const Witch_2: number;
        export { Witch_2 as Witch };
        const Apprentice_3: number;
        export { Apprentice_3 as Apprentice };
        const Maidforce_1: number;
        export { Maidforce_1 as Maidforce };
        const Bountyhunter_1: number;
        export { Bountyhunter_1 as Bountyhunter };
    }
}
/**
 * @type {Record<string, number>}
 */
declare let KinkyDungeonGoddessRep: Record<string, number>;
/**
 * @type {Record<string, boolean>}
 */
declare let KinkyDungeonRescued: Record<string, boolean>;
/**
 * @type {Record<string, boolean>}
 */
declare let KinkyDungeonAid: Record<string, boolean>;
declare let KDRepSelectionMode: string;
/**
 *
 * @type {Object.<string, string[]>}
 */
declare let KDBlessedRewards: {
    [x: string]: string[];
};
declare let KDFactionRepIndex: number;
declare let KDMaxFactionsPerBar: number;
/**
 * Current costs multipliers for shrines
 * @type {Record<string, number>}
 */
declare let KinkyDungeonPenanceCosts: Record<string, number>;
declare let KinkyDungeonPenanceRepBonus: number;
declare let KinkyDungeonPenanceRepBonusFail: number;
declare let KinkyDungeonPenanceCostGrowth: number;
declare let KinkyDungeonPenanceCostDefault: number;
