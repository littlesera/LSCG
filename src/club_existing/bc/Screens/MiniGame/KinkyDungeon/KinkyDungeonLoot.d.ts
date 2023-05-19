/**
 * @param {item[]} list
 * @param {boolean} excludeBound - bound weapons, i.e. magic knives and weapons
 */
declare function KinkyDungeonAddLostItems(list: item[], excludeBound: boolean): void;
declare function KinkyDungeonLoot(Level: any, Index: any, Type: any, roll: any, tile: any, returnOnly: any, noTrap: any): any;
declare function KinkyDungeonGetUnlearnedSpells(minlevel: any, maxlevel: any, SpellList: any): any[];
declare function KinkyDungeonLootEvent(Loot: any, Floor: any, Replacemsg: any, Lock: any): any;
declare function KinkyDungeonAddGold(value: any): void;
declare function KDSpawnLootTrap(x: any, y: any, trap: any, mult: any, duration: any): void;
declare function KDGenChestTrap(guaranteed: any, x: any, y: any, chestType: any, lock: any, noTrap: any): any;
declare function KDTriggerLoot(Loot: any, Type: any): void;
/** @type {item[]} */
declare let KinkyDungeonLostItems: item[];
declare let KDTightRestraintsMod: number;
declare let KDTightRestraintsMult: number;
declare let KinkyDungeonSpecialLoot: boolean;
declare let KinkyDungeonLockedLoot: boolean;
declare namespace KDTrapChestType {
    function _default(guaranteed: any, x: any, y: any, chestType: any, lock: any, noTrap: any): {
        trap: string;
        mult: number;
    };
    export { _default as default };
    export function shadow(guaranteed: any, x: any, y: any, chestType: any, lock: any, noTrap: any): {
        trap: string;
        mult: number;
        duration: number;
    };
}
