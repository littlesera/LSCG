/**
 * Generic condition for Bondage Offers
 * @param {entity} enemy
 * @param {any} AIData
 * @param {number} dist - Current player dist, its sent as a param for faster runtime
 * @param {number} maxdist
 * @param {number} chance
 * @param {string[]} restraintTags - Tags of required restraints
 * @returns {boolean}
 */
declare function KDDefaultPrereqs(enemy: entity, AIData: any, dist: number, maxdist: number, chance: number, restraintTags: string[]): boolean;
declare function KDShopTrigger(name: any): {
    dialogue: any;
    allowedPrisonStates: string[];
    nonHostile: boolean;
    noCombat: boolean;
    excludeTags: string[];
    blockDuringPlaytime: boolean;
    prerequisite: (enemy: any, dist: any, AIData: any) => boolean;
    weight: (enemy: any, dist: any) => number;
};
/**
 *
 * @param {string} name
 * @param {KinkyDialogue} name
 * @returns {KinkyDialogueTrigger}
 */
declare function KDRecruitTrigger(name: string, dialogue: any): KinkyDialogueTrigger;
/** Boss intro dialogue */
declare function KDBossTrigger(name: any, enemyName: any): {
    dialogue: any;
    nonHostile: boolean;
    prerequisite: (enemy: any, dist: any, AIData: any) => boolean;
    weight: (enemy: any, dist: any) => number;
};
/**
 * Lose to a boss
 * @param {string} name
 * @param {string[]} enemyName
 * @param {string[]} tags
 * @returns {KinkyDialogueTrigger}
 */
declare function KDBossLose(name: string, enemyName: string[], tags: string[]): KinkyDialogueTrigger;
declare function KinkyDungeonGetShopForEnemy(enemy: any, guaranteed: any): string;
/** No dialogues will trigger when the player dist is higher than this */
declare let KinkyDungeonMaxDialogueTriggerDist: number;
/** @type {Record<string, KinkyDialogueTrigger>} */
declare let KDDialogueTriggers: Record<string, KinkyDialogueTrigger>;
