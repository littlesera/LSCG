declare function KinkyDungeonPlayerEffect(damage: any, playerEffect: any, spell: any, faction: any, bullet: any): boolean;
/**
 * @type {Record<string, (damage, playerEffect, spell, faction, bullet) => {sfx: string, effect: boolean}>}
 */
declare let KDPlayerEffects: Record<string, (damage: any, playerEffect: any, spell: any, faction: any, bullet: any) => {
    sfx: string;
    effect: boolean;
}>;
