/**
 * Returns the number of available perks for the current player character
 * @returns {number} - The number of perks
 */
declare function PlatformProfileGetFreePerk(): number;
/**
 * Draws a black arrow that goes down and right
 * @param {number} SX - The source X position on screen
 * @param {number} SY - The source Y position on screen
 * @param {number} TX - The target X position on screen
 * @param {number} TY - The target Y position on screen
 * @returns {void} - Nothing
 */
declare function PlatformProfileDrawArrow(SX: number, SY: number, TX: number, TY: number): void;
/**
 * Loads the screen and removes the key listeners
 * @returns {void} - Nothing
 */
declare function PlatformProfileLoad(): void;
/**
 * Draws the perk button on the screen, the color changes based on if the perk is available or paid
 * @param {number} X - The X position on screen
 * @param {number} Y - The Y position on screen
 * @param {number} PerkNum - The perk number for the current character
 * @param {Object} Prerequisite1 - If there's a first prerequisite to validate
 * @param {Object} Prerequisite2 - If there's a second prerequisite to validate
 * @returns {void} - Nothing
 */
declare function PlatformProfileDrawPerkButton(X: number, Y: number, PerkNum: number, Prerequisite1: any, Prerequisite2: any): void;
/**
 * Returns the text associated to the bonus given by the owner of the current player
 * @param {Object} PlatformChar - The platform character to evaluate
 * @returns {string} - The text string linked to the bonus
 */
declare function PlatformGetOwnerBonus(PlatformChar: any): string;
/**
 * Returns the text associated to the bonus given by the lover of the current player
 * @param {Object} PlatformChar - The platform character to evaluate
 * @returns {string} - The text string linked to the bonus
 */
declare function PlatformGetLoverBonus(PlatformChar: any): string;
/**
 * Runs and draws the screen.
 * @returns {void} - Nothing
 */
declare function PlatformProfileRun(): void;
/**
 * Adds the perk as an active perk for the current character
 * @param {number} PerkNum - The perk number for the current character
 * @returns {void} - Nothing
 */
declare function PlatformProfileBuyPerk(PerkNum: number): void;
/**
 * Handles clicks in the screen
 * @returns {void} - Nothing
 */
declare function PlatformProfileClick(): void;
/**
 * When the screens exits, we unload the listeners
 * @returns {void} - Nothing
 */
declare function PlatformProfileExit(): void;
