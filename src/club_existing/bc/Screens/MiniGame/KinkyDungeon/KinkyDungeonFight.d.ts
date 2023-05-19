/**
 *
 * @param {item} item
 * @returns {weapon}
 */
declare function KDWeapon(item: item): weapon;
declare function KinkyDungeonFindWeapon(Name: any): weapon;
declare function KinkyDungeonWeaponCanCut(RequireInteract: any, MagicOnly: any): boolean;
declare function KDSetWeapon(Weapon: any, forced: any): void;
declare function KinkyDungeonGetPlayerWeaponDamage(HandsFree: any, NoOverride: any): weapon;
declare function KinkyDungeonGetEvasion(Enemy: any, NoOverride: any, IsSpell: any, IsMagic: any, cost: any): number;
declare function KinkyDungeonAggro(Enemy: any, Spell: any, Attacker: any, Faction: any): void;
declare function KinkyDungeonPlayerEvasion(): number;
declare function KinkyDungeonGetPlayerStat(stat: any, mult: any): number;
declare function KDRestraintBlockPower(block: any, power: any): number;
declare function KinkyDungeonEvasion(Enemy: any, IsSpell: any, IsMagic: any, Attacker: any): boolean;
/**
 *
 * @param {Record<string, boolean>} tags
 * @param {string} type
 * @param {string} resist
 * @returns {boolean}
 */
declare function KinkyDungeonGetImmunity(tags: Record<string, boolean>, type: string, resist: string): boolean;
declare function KDArmorFormula(DamageAmount: any, Armor: any): number;
declare function KinkyDungeonDamageEnemy(Enemy: any, Damage: any, Ranged: any, NoMsg: any, Spell: any, bullet: any, attacker: any, Delay: any, noAlreadyHit: any): any;
declare function KinkyDungeonDisarm(Enemy: any, suff: any): boolean;
declare function KinkyDungeonAttackEnemy(Enemy: any, Damage: any): void;
declare function KDUpdateBulletEffects(b: any, d: any): void;
declare function KinkyDungeonUpdateBullets(delta: any, Allied: any): void;
declare function KinkyDungeonUpdateSingleBulletVisual(b: any, end: any, delay: any): void;
declare function KinkyDungeonUpdateBulletVisuals(delta: any): void;
declare function KinkyDungeonUpdateBulletsCollisions(delta: any, Catchup: any): void;
declare function KDCheckCollideableBullets(entity: any, force: any): void;
/**
 *
 * @param {any} b
 * @param {number} born
 * @param {boolean} [outOfTime]
 * @param {boolean} [outOfRange]
 * @param {number} [d] - Fraction of the timestep that this hit happened in
 * @param {number} [dt] - Timestep
 * @param {boolean} [end] - If the bullet is dying
 */
declare function KinkyDungeonBulletHit(b: any, born: number, outOfTime?: boolean, outOfRange?: boolean, d?: number, dt?: number, end?: boolean): void;
declare function KinkyDungeonSummonEnemy(x: any, y: any, summonType: any, count: any, rad: any, strict: any, lifetime: any, hidden: any, goToTarget: any, faction: any, hostile: any, minrad: any, startAware: any, noBullet: any, hideTimer: any, pathfind: any, mod: any, boundTo: any, weakBinding: any): number;
declare function KinkyDungeonBulletDoT(b: any): void;
declare function KinkyDungeonBulletTrail(b: any): boolean;
declare function KinkyDungeonBulletsCheckCollision(bullet: any, AoE: any, force: any, d: any, inWarningOnly: any, delta: any): boolean;
declare function KDBulletAoECanHitEntity(bullet: any, enemy: any): boolean;
declare function KDBulletCanHitEntity(bullet: any, enemy: any, inWarningOnly: any, overrideCollide: any): boolean;
/**
 *
 * @param {any} bullet
 */
declare function KDBulletEffectTiles(bullet: any): void;
declare function KDBulletHitPlayer(bullet: any, player: any): void;
/**
 *
 * @param {any} bullet
 * @param {entity} enemy
 * @param {number} d
 * @param {boolean} nomsg
 */
declare function KDBulletHitEnemy(bullet: any, enemy: entity, d: number, nomsg: boolean): void;
declare function KDBulletID(bullet: any, enemy: any): string;
declare function KinkyDungeonLaunchBullet(x: any, y: any, targetx: any, targety: any, speed: any, bullet: any, miscast: any): {
    born: number;
    time: any;
    x: any;
    y: any;
    vx: number;
    vy: number;
    xx: any;
    yy: any;
    spriteID: any;
    bullet: any;
    trail: any;
    trailEffectTile: any;
};
declare function KinkyDungeonDrawFight(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
declare function KinkyDungeonSendWeaponEvent(Event: any, data: any): void;
declare function KinkyDungeonSendBulletEvent(Event: any, b: any, data: any): void;
declare function KDHealRepChange(enemy: any, amount: any): void;
declare function KDApplyGenBuffs(entity: any, buff: any, time: any): void;
declare function KDSilenceEnemy(enemy: any, time: any): void;
declare function KDBlindEnemy(enemy: any, time: any): void;
declare function KDDisarmEnemy(enemy: any, time: any): void;
declare function KDCheckPrereq(enemy: any, prereq: any, e: any, data: any): any;
declare function KDBulletAoEMod(b: any): any;
declare function KDBulletTrailAoEMod(b: any): any;
/**
 *
 * @param {number} bx
 * @param {number} by
 * @param {number} xx
 * @param {number} yy
 * @param {number} rad
 * @param {string} modifier
 */
declare function AOECondition(bx: number, by: number, xx: number, yy: number, rad: number, modifier?: string): boolean;
/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} name
 */
declare function KDCreateParticle(xx: number, yy: number, name: string): void;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} aoe
 * @param {any} Damage
 * @param {entity} Damage
 */
declare function KDDealEnvironmentalDamage(x: number, y: number, aoe: number, Damage: any, Attacker: any): void;
declare let KinkyDungeonKilledEnemy: any;
declare let KinkyDungeonAlert: number;
declare let KDBrawlerAmount: number;
declare let KDClumsyAmount: number;
declare let KDDodgeAmount: number;
declare let KinkyDungeonMissChancePerBlind: number;
declare let KinkyDungeonMissChancePerSlow: number;
declare let KinkyDungeonBullets: any[];
/**
 * @type {Map<string, {end: boolean, temporary: boolean, spin: number, spinAngle: number, name: string, size: number, spriteID: string, xx:number, yy:number, visual_x: number, visual_y: number, aoe?: boolean, updated: boolean, vx: number, vy: number, scale: number, alpha: number, delay: number}>}
 */
declare let KinkyDungeonBulletsVisual: Map<string, {
    end: boolean;
    temporary: boolean;
    spin: number;
    spinAngle: number;
    name: string;
    size: number;
    spriteID: string;
    xx: number;
    yy: number;
    visual_x: number;
    visual_y: number;
    aoe?: boolean;
    updated: boolean;
    vx: number;
    vy: number;
    scale: number;
    alpha: number;
    delay: number;
}>;
declare let KinkyDungeonBulletsID: {};
declare let KDVulnerableDmg: number;
declare let KDVulnerableDmgMult: number;
declare let KDVulnerableHitMult: number;
declare let KDPacifistReduction: number;
declare let KDRiggerDmgBoost: number;
declare let KDRiggerBindBoost: number;
declare let KDStealthyDamageMult: number;
declare let KDStealthyEvaMult: number;
declare let KDResilientDamageMult: number;
declare let KDStealthyEnemyCountMult: number;
declare let KDBoundPowerMult: number;
declare let KDBerserkerAmp: number;
declare let KDUnstableAmp: number;
declare let KinkyDungeonOpenObjects: string;
declare let KinkyDungeonMeleeDamageTypes: string[];
declare let KinkyDungeonHalfDamageTypes: string[];
declare let KinkyDungeonTeaseDamageTypes: string[];
declare let KinkyDungeonStunDamageTypes: string[];
declare let KinkyDungeonBindDamageTypes: string[];
declare let KinkyDungeonFreezeDamageTypes: string[];
declare let KinkyDungeonSlowDamageTypes: string[];
declare let KinkyDungeonVulnerableDamageTypes: string[];
declare namespace KDDamageBinds {
    const glue: string;
    const ice: string;
    const frost: string;
    const crush: string;
}
declare namespace KDSpellTagBinds {
    const rope: string;
    const leather: string;
    const chain: string;
    const metal: string;
    const vine: string;
    const nature: string;
}
declare namespace KinkyDungeonDamageTypesExtension {
    const tickle: string;
    const grope: string;
    const pain: string;
    const happygas: string;
    const charm: string;
}
declare let KinkyDungeonBindingDamageTypes: string[];
declare let KinkyDungeonDistractDamageTypes: string[];
declare let KinkyDungeonMasochistDamageTypes: string[];
declare let KinkyDungeonPlayerWeapon: any;
declare let KinkyDungeonPlayerWeaponLastEquipped: string;
/** @type {weapon} */
declare let KinkyDungeonPlayerDamageDefault: weapon;
/** @type {weapon} */
declare let KinkyDungeonPlayerDamage: weapon;
declare namespace KinkyDungeonDamageTypes {
    export namespace acid {
        const name_1: string;
        export { name_1 as name };
        export const color: string;
        export const bg: string;
    }
    export namespace cold {
        const name_2: string;
        export { name_2 as name };
        const color_1: string;
        export { color_1 as color };
        const bg_1: string;
        export { bg_1 as bg };
    }
    export namespace ice_1 {
        const name_3: string;
        export { name_3 as name };
        const color_2: string;
        export { color_2 as color };
        const bg_2: string;
        export { bg_2 as bg };
    }
    export { ice_1 as ice };
    export namespace frost_1 {
        const name_4: string;
        export { name_4 as name };
        const color_3: string;
        export { color_3 as color };
        const bg_3: string;
        export { bg_3 as bg };
    }
    export { frost_1 as frost };
    export namespace fire {
        const name_5: string;
        export { name_5 as name };
        const color_4: string;
        export { color_4 as color };
        const bg_4: string;
        export { bg_4 as bg };
    }
    export namespace poison {
        const name_6: string;
        export { name_6 as name };
        const color_5: string;
        export { color_5 as color };
        const bg_5: string;
        export { bg_5 as bg };
    }
    export namespace happygas_1 {
        const name_7: string;
        export { name_7 as name };
        const color_6: string;
        export { color_6 as color };
        const bg_6: string;
        export { bg_6 as bg };
    }
    export { happygas_1 as happygas };
    export namespace charm_1 {
        const name_8: string;
        export { name_8 as name };
        const color_7: string;
        export { color_7 as color };
        const bg_7: string;
        export { bg_7 as bg };
    }
    export { charm_1 as charm };
    export namespace soul {
        const name_9: string;
        export { name_9 as name };
        const color_8: string;
        export { color_8 as color };
        const bg_8: string;
        export { bg_8 as bg };
    }
    export namespace drain {
        const name_10: string;
        export { name_10 as name };
        const color_9: string;
        export { color_9 as color };
        const bg_9: string;
        export { bg_9 as bg };
    }
    export namespace souldrain {
        const name_11: string;
        export { name_11 as name };
        const color_10: string;
        export { color_10 as color };
        const bg_10: string;
        export { bg_10 as bg };
    }
    export namespace electric {
        const name_12: string;
        export { name_12 as name };
        const color_11: string;
        export { color_11 as color };
        const bg_11: string;
        export { bg_11 as bg };
    }
    export namespace glue_1 {
        const name_13: string;
        export { name_13 as name };
        const color_12: string;
        export { color_12 as color };
        const bg_12: string;
        export { bg_12 as bg };
    }
    export { glue_1 as glue };
    export namespace stun {
        const name_14: string;
        export { name_14 as name };
        const color_13: string;
        export { color_13 as color };
        const bg_13: string;
        export { bg_13 as bg };
    }
    export namespace chain_1 {
        const name_15: string;
        export { name_15 as name };
        const color_14: string;
        export { color_14 as color };
        const bg_14: string;
        export { bg_14 as bg };
    }
    export { chain_1 as chain };
    export namespace tickle_1 {
        const name_16: string;
        export { name_16 as name };
        const color_15: string;
        export { color_15 as color };
        const bg_15: string;
        export { bg_15 as bg };
    }
    export { tickle_1 as tickle };
    export namespace crush_1 {
        const name_17: string;
        export { name_17 as name };
        const color_16: string;
        export { color_16 as color };
        const bg_16: string;
        export { bg_16 as bg };
    }
    export { crush_1 as crush };
    export namespace grope_1 {
        const name_18: string;
        export { name_18 as name };
        const color_17: string;
        export { color_17 as color };
        const bg_17: string;
        export { bg_17 as bg };
    }
    export { grope_1 as grope };
    export namespace slash {
        const name_19: string;
        export { name_19 as name };
        const color_18: string;
        export { color_18 as color };
        const bg_18: string;
        export { bg_18 as bg };
    }
    export namespace pierce {
        const name_20: string;
        export { name_20 as name };
        const color_19: string;
        export { color_19 as color };
        const bg_19: string;
        export { bg_19 as bg };
    }
    export namespace pain_1 {
        const name_21: string;
        export { name_21 as name };
        const color_20: string;
        export { color_20 as color };
        const bg_20: string;
        export { bg_20 as bg };
    }
    export { pain_1 as pain };
    export namespace unarmed {
        const name_22: string;
        export { name_22 as name };
        const color_21: string;
        export { color_21 as color };
        const bg_21: string;
        export { bg_21 as bg };
    }
    export namespace magic {
        const name_23: string;
        export { name_23 as name };
        const color_22: string;
        export { color_22 as color };
        const bg_22: string;
        export { bg_22 as bg };
    }
    export namespace melee {
        const name_24: string;
        export { name_24 as name };
        const color_23: string;
        export { color_23 as color };
        const bg_23: string;
        export { bg_23 as bg };
    }
    export namespace spell {
        const name_25: string;
        export { name_25 as name };
        const color_24: string;
        export { color_24 as color };
        const bg_24: string;
        export { bg_24 as bg };
    }
}
declare let KinkyDungeonEvasionPityModifier: number;
declare let KinkyDungeonEvasionPityModifierIncrementPercentage: number;
declare namespace KDDamageEquivalencies {
    const frost_2: string;
    export { frost_2 as frost };
    const happygas_2: string;
    export { happygas_2 as happygas };
    const souldrain_1: string;
    export { souldrain_1 as souldrain };
    const drain_1: string;
    export { drain_1 as drain };
}
declare let KDDamageQueue: any[];
declare let KDBulletWarnings: any[];
declare let KDUniqueBulletHits: Map<any, any>;
declare let KinkyDungeonCurrentTick: number;
declare namespace KDPrereqs {
    function NoChastity(enemy: any, e: any, data: any): boolean;
    function blinded(enemy: any, e: any, data: any): boolean;
    function silenced(enemy: any, e: any, data: any): boolean;
    function disarmed(enemy: any, e: any, data: any): boolean;
    function bound(enemy: any, e: any, data: any): boolean;
    function Waiting(enemy: any, e: any, data: any): any;
    function damageType(enemy: any, e: any, data: any): boolean;
}
