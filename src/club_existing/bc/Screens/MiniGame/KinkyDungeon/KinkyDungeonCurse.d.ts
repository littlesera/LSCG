/**
 *
 * @param {restraint} restraint
 * @param {string} newRestraintName
 * @param {KinkyDungeonEvent[]} ev
 * @param {number} power
 * @param {string} lock
 * @returns {any}
 */
declare function KDAddEventVariant(restraint: restraint, newRestraintName: string, ev: KinkyDungeonEvent[], power?: number, lock?: string): any;
declare function KinkyDungeonCurseInfo(item: any, Curse: any): void;
declare function KinkyDungeonCurseStruggle(item: any, Curse: any): void;
declare function KinkyDungeonCurseAvailable(item: any, Curse: any): boolean;
/**
 *
 * @param {string} group
 * @param {number} index
 * @param {string} Curse
 */
declare function KinkyDungeonCurseUnlock(group: string, index: number, Curse: string): void;
/** @type {Record<string, {onApply?: (item: item, host?: item) => void, condition: (item: item) => boolean, remove: (item: item, host: item) => void}>} */
declare let KDCurses: Record<string, {
    onApply?: (item: item, host?: item) => void;
    condition: (item: item) => boolean;
    remove: (item: item, host: item) => void;
}>;
/** Cursed variants of restraints
 * @type {Record<string, KDCursedVar>}
 */
declare let KDCursedVars: Record<string, KDCursedVar>;
declare let KDBasicCurseUnlock: string[];
declare let KDBasicCurses: string[];
