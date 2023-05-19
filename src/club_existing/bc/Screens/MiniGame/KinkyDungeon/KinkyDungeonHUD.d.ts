/**
 *
 * @param {item} item
 * @param {boolean} [includeItem]
 * @returns {item[]}
 */
declare function KDDynamicLinkList(item: item, includeItem?: boolean): item[];
/**
 * Returns a list of items on the 'surface' of a dynamic link, i.e items that can be accessed
 * @param {item} item
 * @returns {item[]}
 */
declare function KDDynamicLinkListSurface(item: item): item[];
/**
 *
 * @param {restraint} restraint
 * @returns {number}
 */
declare function KDLinkSize(restraint: restraint): number;
/**
 *
 * @param {item} item
 * @param {string} linkCategory
 * @returns {number}
 */
declare function KDLinkCategorySize(item: item, linkCategory: string): number;
declare function KinkyDungeonDrawInputs(): void;
declare function KDCycleSpellPage(reverse: any): void;
declare function KinkyDungeonDrawProgress(x: any, y: any, amount: any, totalIcons: any, maxWidth: any, sprite: any): void;
declare function KinkyDungeonCanSleep(): boolean;
declare function KDLinspace(min: any, max: any, steps: any): any[];
declare function KDSteps(max: any, step: any, maxStep?: number): any[];
declare function KinkyDungeonDrawStats(x: any, y: any, width: any, heightPerBar: any): void;
declare function KinkyDungeonActivateWeaponSpell(instant: any): boolean;
declare function KinkyDungeonRangedAttack(): boolean;
declare function KinkyDungeonHandleHUD(): boolean;
declare function KinkyDungeonUpdateStruggleGroups(): void;
declare let KinkyDungeonStruggleGroups: any[];
declare let KinkyDungeonStruggleGroupsBase: string[];
declare let KinkyDungeonDrawStruggle: number;
declare let KinkyDungeonDrawStruggleHover: boolean;
declare let KinkyDungeonDrawState: string;
declare let KinkyDungeonDrawStatesModal: string[];
declare let KinkyDungeonSpellValid: boolean;
declare let KinkyDungeonCamX: number;
declare let KinkyDungeonCamY: number;
declare let KinkyDungeonTargetX: number;
declare let KinkyDungeonTargetY: number;
declare let KinkyDungeonLastDraw: number;
declare let KinkyDungeonLastDraw2: number;
declare let KinkyDungeonDrawDelta: number;
declare const KinkyDungeonLastChatTimeout: 10000;
declare let KinkyDungeonStatBarHeight: number;
declare let KinkyDungeonToggleAutoDoor: boolean;
declare let KinkyDungeonToggleAutoPass: boolean;
declare let KinkyDungeonToggleAutoSprint: boolean;
declare let KinkyDungeonInspect: boolean;
declare let KinkyDungeonFastMove: boolean;
declare let KinkyDungeonFastMovePath: any[];
declare let KinkyDungeonFastStruggle: boolean;
declare let KinkyDungeonFastStruggleType: string;
declare let KinkyDungeonFastStruggleGroup: string;
declare namespace KDBuffSprites {
    const Camo: boolean;
    const Drenched: boolean;
    const StoneSkin: boolean;
    const Conduction: boolean;
    const Ignite: boolean;
    const Burning: boolean;
    const Unsteady: boolean;
    const Unsteady2: boolean;
    const Chilled: boolean;
    const ChillWalk: boolean;
    const Slimed: boolean;
    const LightningRod: boolean;
    const PoisonDagger: boolean;
    const Cutting: boolean;
    const Slippery: boolean;
    const ScrollVerbal: boolean;
    const ScrollArms: boolean;
    const ScrollLegs: boolean;
    const Empower: boolean;
    const SlimeMimic: boolean;
    const DisenchantSelf: boolean;
    const LeatherBurst: boolean;
    const TabletElements: boolean;
    const TabletConjure: boolean;
    const TabletIllusion: boolean;
    const TabletRope: boolean;
    const TabletWill: boolean;
    const TabletMetal: boolean;
    const TabletLatex: boolean;
    const TabletLeather: boolean;
    const AvatarFire: boolean;
    const AvatarWater: boolean;
    const AvatarEarth: boolean;
    const AvatarAir: boolean;
    const DistractionCast: boolean;
}
declare namespace KDStatsSkipLine {
    const info: number;
    const status: number;
    const dmg: number;
}
declare namespace KDStatsSkipLineBefore {
    const kinky: number;
}
declare namespace KDStatsOrder {
    const info_1: number;
    export { info_1 as info };
    export const help: number;
    const status_1: number;
    export { status_1 as status };
    export const buffs: number;
    const dmg_1: number;
    export { dmg_1 as dmg };
    const kinky_1: number;
    export { kinky_1 as kinky };
}
declare let KDModalArea_x: number;
declare let KDModalArea_y: number;
declare let KDModalArea_width: number;
declare let KDModalArea_height: number;
declare let KDModalArea: boolean;
declare let KDConfirmDeleteSave: boolean;
declare let KDStruggleGroupLinkIndex: {};
