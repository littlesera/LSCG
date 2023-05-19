/**
 *
 * @param {number} Min
 * @param {number} Avg
 * @param {number} Max
 * @param {entity} [Enemy]
 * @returns {number}
 */
declare function KDPersonalitySpread(Min: number, Avg: number, Max: number, Enemy?: entity): number;
declare function KinkyDungeonCanPutNewDialogue(): boolean;
declare function KDBasicCheck(PositiveReps: any, NegativeReps: any, Modifier?: number): number;
declare function KDDialogueApplyPersonality(allowed: any): void;
declare function KDGetDialogue(): KinkyDialogue;
declare function KDDrawDialogue(): void;
declare function KDIncreaseOfferFatigue(Amount: any): void;
declare function KDEnemyHelpfulness(enemy: any): 1 | 1.75 | 0.33;
declare function KDGetSpeaker(): entity;
/**
 *
 * @param {number} Amount
 */
declare function KDPleaseSpeaker(Amount: number): void;
/**
 *
 * @param {entity} enemy
 * @param {number} Amount
 */
declare function KDAddOpinion(enemy: entity, Amount: number): void;
declare function KDAllySpeaker(Turns: any, Follow: any): void;
declare function KDAggroSpeaker(Turns?: number): void;
declare function KDBasicDialogueSuccessChance(checkResult: any): number;
declare function KDAgilityDialogueSuccessChance(checkResult: any): number;
declare function KDOffensiveDialogueSuccessChance(checkResult: any): number;
/**
 *
 * @param {string} Dialogue
 * @param {string} [Speaker]
 * @param {boolean} [Click]
 * @param {string} [Personality]
 * @param {entity} [enemy]
 */
declare function KDStartDialog(Dialogue: string, Speaker?: string, Click?: boolean, Personality?: string, enemy?: entity): void;
declare function KDDialogueGagged(): boolean;
declare function KDHandleDialogue(): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} Name
 * @returns {entity}
 */
declare function DialogueCreateEnemy(x: number, y: number, Name: string): entity;
/**
 *
 * @returns {entity}
 */
declare function KDDialogueEnemy(): entity;
declare function KDAllyDialogue(name: any, requireTags: any, requireSingleTag: any, excludeTags: any, weight: any): KinkyDialogue;
/**
 *
 * @param {string} name
 * @param {string} faction
 * @param {string[]} enemytypes
 * @returns {KinkyDialogue}
 */
declare function KDPrisonerRescue(name: string, faction: string, enemytypes: string[]): KinkyDialogue;
declare function KDRecruitDialogue(name: any, faction: any, outfitName: any, goddess: any, restraints: any, restraintscount: any, restraintsAngry: any, restraintscountAngry: any, requireTags: any, requireSingleTag: any, excludeTags: any, chance: any): KinkyDialogue;
declare function KDShopDialogue(name: any, items: any, requireTags: any, requireSingleTag: any, chance: any): KinkyDialogue;
/**
 *
 * @param {(firstRefused) => boolean} setupFunction - firstRefused is if the player said no first. Happens after the user clicks
 * @param {(firstRefused) => boolean} yesFunction - firstRefused is if the player said no then yes. Happens whenever the user submits
 * @param {(firstRefused) => boolean} noFunction - firstRefused is if the player said no then no. Happens whenever the user successfully avoids
 * @param {(firstRefused) => boolean} domFunction - firstRefused is if the player said no then no. Happens when the user clicks the Dominant response
 * @returns {KinkyDialogue}
 */
declare function KDYesNoTemplate(setupFunction: (firstRefused: any) => boolean, yesFunction: (firstRefused: any) => boolean, noFunction: (firstRefused: any) => boolean, domFunction: (firstRefused: any) => boolean): KinkyDialogue;
/**
 *
 * @param {string} name
 * @param {string[]} goddess
 * @param {string[]} antigoddess
 * @param {string[]} restraint
 * @param {number[]} diffSpread - 0 is yesfunction diff, 2 is nofunction diff, 1 is yesfunction dom (should be lower), 3 is nofunction dom (should be lower)
 * @param {number[]} OffdiffSpread - 0 is submissive diff, 1 is normal diff, 2 is dom diff, 3 is dom diff if you have dom personality (should be between 1 and 2)
 * @param {number} count
 * @param {number} countAngry
 * @param {string} countAngry
 * @param {boolean} Ally
 * @param {{name: string, duration: number, floors?: number}[]} Flags - Sets flags on setup
 * @returns {KinkyDialogue}
 */
declare function KDYesNoBasic(name: string, goddess: string[], antigoddess: string[], restraint: string[], diffSpread: number[], OffdiffSpread: number[], count?: number, countAngry?: number, Lock?: string, Ally?: boolean, Flags?: {
    name: string;
    duration: number;
    floors?: number;
}[]): KinkyDialogue;
/**
 * A shop where the seller sells items
 * @returns {KinkyDialogue}
 */
declare function KDSaleShop(name: any, items: any, requireTags: any, requireSingleTag: any, chance: any, markup: any): KinkyDialogue;
/** Yoinks a nearby enemy and brings them next to x */
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @returns {entity}
 */
declare function DialogueBringNearbyEnemy(x: number, y: number, radius: number): entity;
/** Yoinks a nearby enemy and brings them next to x */
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {entity} enemy
 * @returns {entity}
 */
declare function DialogueBringSpecific(x: number, y: number, enemy: entity): entity;
/**
 * Returns if you are submissive enough to be played with by this enemy
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KDIsSubmissiveEnough(enemy: entity): boolean;
/**
 *
 * @param {entity} enemy
 * @returns {number}
 */
declare function KDGetModifiedOpinion(enemy: entity): number;
/**
 *
 * @param {number} Amount
 */
declare function KDAddOffer(Amount: number): void;
/**
 * @returns {number}
 */
declare function KDGetOfferLevelMod(): number;
declare namespace KDDialogueData {
    const CurrentDialogueIndex: number;
}
declare let KDMaxDialogue: number;
declare let KDOptionOffset: number;
declare let KinkyDungeonDialogueTimer: number;
/**
 * @type {Record<string, {speaker: string, faction: string}>}
 */
declare let KDPrisonRescues: Record<string, {
    speaker: string;
    faction: string;
}>;
declare let KDMaxSellItems: number;
declare let KDOfferCooldown: number;
