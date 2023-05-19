/**
 * Loads the Pandora's Box prison screen
 * @returns {void} - Nothing
 */
declare function PandoraPrisonLoad(): void;
/**
 * Runs and draws the prison screen
 * @returns {void} - Nothing
 */
declare function PandoraPrisonRun(): void;
/**
 * Generates a new valid activity for the prison guard
 * @returns {void} - Nothing
 */
declare function PandoraPrisonGuardNewActivity(): void;
/**
 * Handles clicks in the prison screen, the guard will pick a random activity to do on the player
 * @returns {void} - Nothing
 */
declare function PandoraPrisonClick(): void;
/**
 * When the player gets fully released by a maid
 * @returns {void} - Nothing
 */
declare function PandoraPrisonReleasePlayer(): void;
/**
 * When the player exits the prison
 * @returns {void} - Nothing
 */
declare function PandoraPrisonExitPrison(): void;
/**
 * When the player gets ungagged by an NPC, we remove everything on the head
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerUngag(): void;
/**
 * When the player gets restrained by an NPC, the arms bondage get tighter with difficulty and if a fight occured
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerRestrain(Level: any): void;
/**
 * When the player gets stripped and restrained by an NPC, call the regular restrain function
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerStrip(Level: any): void;
/**
 * When the player gets locked in a chastity device by the guard
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerChastity(LockType: any): void;
/**
 * When the NPC leaves the prison
 * @returns {void} - Nothing
 */
declare function PandoraPrisonCharacterRemove(): void;
/**
 * Returns TRUE if the player can start a fight
 * @returns {boolean} - TRUE if the player can start a fight
 */
declare function PandoraPrisonCanStartFight(): boolean;
/**
 * Starts the fight with the NPC guard
 * @returns {void} - Nothing
 */
declare function PandoraPrisonStartFight(): void;
/**
 * When the fight with the NPC ends
 * @returns {void} - Nothing
 */
declare function PandoraPrisonFightEnd(): void;
/**
 * When the player must strips the current character
 * @returns {void} - Nothing
 */
declare function PandoraPrisonCharacterNaked(): void;
/**
 * When the player changes in the clothes of someone else (type)
 * @param {string} Type - The type of character to dress as (ex: Guard)
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerClothes(Type: string): void;
/**
 * When the player escapes from the prison, she gains some infiltration skills
 * @returns {void} - Nothing
 */
declare function PandoraPrisonEscape(): void;
/**
 * When the player starts bribing the guard
 * @returns {void} - Nothing
 */
declare function PandoraPrisonBribeStart(): void;
/**
 * A guard can only bribed once on every round
 * @returns {boolean} - TRUE if bribing the guard is allowed
 */
declare function PandoraPrisonBribeAllowed(): boolean;
/**
 * Checks if the perk specified is currently selected
 * @param {string} Type - The perk type
 * @returns {boolean} - Returns TRUE if it's selected
 */
declare function PandoraPrisonHasPerk(Type: string): boolean;
/**
 * When the player bribes the guard to lower her sentence
 * @param {string|number} Money - The amount of money spent
 * @param {string|number} Minutes - The number of minutes to remove from the sentence
 * @returns {void} - Nothing
 */
declare function PandoraPrisonBribeProcess(Money: string | number, Minutes: string | number): void;
/**
 * When the current NPC picks a random weapon to beat up the player
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPickWeapon(): void;
/**
 * When the guard beats up the player, she loses some strength for fights
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerBeat(Damage: any, Blush: any): void;
/**
 * When the current NPC picks a random tickling item
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPickTickle(): void;
/**
 * When the player squeals, it shorten her sentence
 * @param {string|number} Minutes - The number of minutes to remove from the sentence
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerSqueal(Minutes: string | number): void;
/**
 * When the player gets tickled, she reacts and loses some willpower
 * @param {string|number} Damage - The health damage done by the tickle
 * @returns {void} - Nothing
 */
declare function PandoraPrisonPlayerTickle(Damage: string | number): void;
/**
 * When the player gets transfered, she gets a hood for the process
 * @returns {void} - Nothing
 */
declare function PandoraPrisonAddHood(): void;
/**
 * When the transfer is done, we remove the hood and assign a new background
 * @returns {void} - Nothing
 */
declare function PandoraPrisonRemoveHood(): void;
/**
 * Prepares the quickie scene by kneeling the player and removing the guards pants
 * @returns {void} - Nothing
 */
declare function PandoraPrisonQuikieStart(): void;
/**
 * Process the quickie scene, the player must progress slowly but only has 5 tries
 * @param {string|number} Factor - The pleasure factor to apply
 * @returns {void} - Nothing
 */
declare function PandoraPrisonQuikieProcess(Factor: string | number): void;
/**
 * Ends the quickie scenario
 * @returns {void} - Nothing
 */
declare function PandoraPrisonQuickieEnd(Message: any): void;
/**
 * When the player drinks water, she heals 25% of her max
 * @returns {void} - Nothing
 */
declare function PandoraPrisonDrinkWater(): void;
declare var PandoraPrisonBackground: string;
declare var PandoraWillpowerTimer: number;
/** @type {null | NPCCharacter} */
declare var PandoraPrisonMaid: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var PandoraPrisonGuard: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var PandoraPrisonCharacter: null | NPCCharacter;
declare var PandoraPrisonCharacterTimer: number;
declare var PandoraPrisonEscaped: boolean;
declare var PandoraPrisonBribeEnabled: boolean;
declare var PandoraQuickieCount: number;
declare var PandoraQuickiePleasure: number;
