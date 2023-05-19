declare function KDGetPerkCost(perk: any): any;
declare function KinkyDungeonGetStatPoints(Stats: any): number;
declare function KinkyDungeonCanPickStat(Stat: any, points: any): boolean;
declare function KDPerkBlocked(perk1: any, perk2: any): boolean;
declare function KinkyDungeonCanUnPickStat(Stat: any): boolean;
declare function KinkyDungeonDrawPerks(NonSelectable: any): boolean;
/**
 *
 * @param {any[]} list
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} max
 * @param {number} fontSize
 * @param {(any) => ((any) => boolean)} clickfnc
 * @param {string} prefix
 */
declare function drawVertList(list: any[], x: number, y: number, w: number, h: number, max: number, fontSize: number, clickfnc: (any: any) => (any: any) => boolean, prefix: string): void;
/**
 *
 * @param {Record<string, boolean>} existing
 * @returns {string[]}
 */
declare function KDGetRandomPerks(existing: Record<string, boolean>): string[];
declare let KDDoorKnobChance: number;
declare let KDDoorKnobChanceArms: number;
declare let KDDoorAttractChance: number;
declare let KDDoorAttractChanceArms: number;
declare let KDCategoriesStart: {
    name: string;
    buffs: any[];
    debuffs: any[];
}[];
declare namespace KDPerkIcons {
    function Pacifist(): boolean;
    function BerserkerRage(): boolean;
    function BoundPower(): boolean;
    function UnstableMagic(): boolean;
    function BurningDesire(): boolean;
    function FrigidPersonality(): boolean;
    function ImmovableObject(): boolean;
    function GroundedInReality(): boolean;
    function LikeTheWind(): boolean;
    function LeastResistance(): boolean;
}
declare namespace KDPerkUpdateStats {
    export function Rigger(): void;
    export function Ticklish(): void;
    export function Stoic(): void;
    export function Lascivious(): void;
    export function Unperturbed(): void;
    export function PainTolerance(): void;
    export function Sticky(): void;
    export function DistractionCast(): void;
    export function BoundPower_1(): void;
    export { BoundPower_1 as BoundPower };
    export function BerserkerRage_1(): void;
    export { BerserkerRage_1 as BerserkerRage };
    export function UnstableMagic_1(): void;
    export { UnstableMagic_1 as UnstableMagic };
    export function CommonLatex(): void;
    export function CommonLeather(): void;
    export function CommonMaid(): void;
    export function CommonWolf(): void;
    export function CommonDress(): void;
    export function CommonFuuka(): void;
    export function CommonExp(): void;
    export function CommonKitty(): void;
}
/**
 * @type {Record<string, () => string>}
 */
declare let KDPerkCount: Record<string, () => string>;
/**
 * @type {Record<string, KDPerk>}
 */
declare let KinkyDungeonStatsPresets: Record<string, KDPerk>;
declare namespace KDPerkStart {
    export function Studious(): void;
    export function Submissive(): void;
    export function Pacifist_1(): void;
    export { Pacifist_1 as Pacifist };
    export function Rigger_1(): void;
    export { Rigger_1 as Rigger };
    export function Unchained(): void;
    export function FuukaCollar(): void;
    export function Prisoner(): void;
    export function Slayer(): void;
    export function Conjurer(): void;
    export function Magician(): void;
    export function Brawler(): void;
    export function StartLatex(): void;
    export function StartMaid(): void;
    export function StartWolfgirl(): void;
    export function StartObsidian(): void;
    export function Hogtied(): void;
    export function Stranger(): void;
    export function WrongNeighborhood(): void;
    export function Cursed(): void;
}
declare let KDPerksButtonWidth: number;
declare let KDPerksButtonWidthPad: number;
declare let KDPerksButtonHeight: number;
declare let KDPerksButtonHeightPad: number;
declare let KDPerksXPad: number;
declare let KDPerksYPad: number;
declare let KDPerksYStart: number;
declare let KDPerksXStart: number;
declare let KDPerksMaxY: number;
declare let KDPerksScroll: number;
declare let KDPerksIndex: number;
declare let KDPerksIndexUI: number;
declare let KDPerksIndexUIWeight: number;
declare let KDCategories: any[];
