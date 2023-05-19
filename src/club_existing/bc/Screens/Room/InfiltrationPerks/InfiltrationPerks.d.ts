/**
 * Checks if a named perk is activated or not
 * @returns {boolean} - TRUE if the perk is active
 */
declare function InfiltrationPerksActive(PerkName: any): boolean;
/**
 * Activate or deactivate a perk from the player choice
 * @returns {void} - Nothing
 */
declare function InfiltrationPerksActivate(PerkName: any): void;
/**
 * Returns the number of perks taken by the player
 * @returns {number} - Number of perks taken by the player
 */
declare function InfiltrationPerksTaken(): number;
/**
 * Returns the number of perks available for the player
 * @returns {number} - Number of perks available for the player
 */
declare function InfiltrationPerksAvail(): number;
/**
 * Loads the infiltration perks screen, checks if there's an invalid perk and clears the list if it's the case
 * @returns {void} - Nothing
 */
declare function InfiltrationPerksLoad(): void;
/**
 * Runs and draws the infiltration perks screen
 * @returns {void} - Nothing
 */
declare function InfiltrationPerksRun(): void;
/**
 * Handles clicks in the infiltration perks screen.
 * @returns {void} - Nothing
 */
declare function InfiltrationPerksClick(): void;
/**
 * Updates the infiltration data for the player
 * @returns {void} - Nothing
 */
declare function InfiltrationPerksExit(): void;
declare var InfiltrationPerksBackground: string;
declare var InfiltrationPerksList: string[];
