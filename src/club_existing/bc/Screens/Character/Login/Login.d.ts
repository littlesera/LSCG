/**
 * Loads the next thank you bubble
 * @returns {void} Nothing
 */
declare function LoginDoNextThankYou(): void;
/**
 * Draw the credits
 * @returns {void} Nothing
 */
declare function LoginDrawCredits(): void;
/**
 * Loads the character login screen
 * @returns {void} Nothing
 */
declare function LoginLoad(): void;
/**
 * Runs the character login screen
 * @returns {void} Nothing
 */
declare function LoginRun(): void;
/**
 * Perform the inventory and appearance fixups needed.
 *
 * This is called by the login code, after the player's item lists are set up
 * but before the inventory and appearance are loaded from the server's data,
 * and applies the specified asset fixups by swapping Old with New in the list
 * of owned items, in the various player item lists, and in the appearance.
 *
 * If you're only moving items around, it should work just fine as long as
 * the `Old` and `New` asset definitions are compatible.
 * If it's an asset merge (say 3 into one typed asset), it will either set
 * the fixed up item to the specified `Option` or the first one if unspecified.
 *
 * TODO: only typed items are supported.
 *
 * @param {Record<string, string[]>} Inventory - The server-provided inventory object
 * @param {{Group: AssetGroupName, Name: string, Property?: any}[]} Appearance - The server-provided appearance object
 * @param {CraftingItem[]} Crafting - The server-provided, uncompressed crafting data
 */
declare function LoginPerformInventoryFixups(Inventory: Record<string, string[]>, Appearance: {
    Group: AssetGroupName;
    Name: string;
    Property?: any;
}[], Crafting: CraftingItem[]): void;
/**
 * Make sure the slave collar is equipped or unequipped based on the owner
 * @returns {void} Nothing
 */
declare function LoginValidCollar(): void;
/**
 * Adds or confiscates Club Mistress items from the player. Only players that are club Mistresses can have the Mistress
 * Padlock & Key
 * @returns {void} Nothing
 */
declare function LoginMistressItems(): void;
/**
 * Give the matching RewardMemberNumber Club Card to the player
 * @returns {void} Nothing
 */
declare function LoginClubCard(): void;
/**
 * Adds or confiscates pony equipment from the player. Only players that are ponies or trainers can have the pony
 * equipment.
 * @returns {void} Nothing
 */
declare function LoginStableItems(): void;
/**
 * Adds or confiscates maid items from the player. Only players that have joined the Maid Sorority can have these items.
 * @returns {void} - Nothing
 */
declare function LoginMaidItems(): void;
/**
 * Ensures lover-exclusive items are removed if the player has no lovers.
 * @returns {void} Nothing
 */
declare function LoginLoversItems(): void;
/**
 * Adds or removes Asylum items. Only players that have previously maxed out their patient or nurse reputation are
 * eligible for their own set of Asylum restraints outside the Asylum.
 * @returns {void} - Nothing
 */
declare function LoginAsylumItems(): void;
/**
 * Adds items if specific cheats are enabled
 * @returns {void} - Nothing
 */
declare function LoginCheatItems(): void;
/**
 * Checks every owned item to see if its BuyGroup contains an item the player does not have. This allows the player to
 * collect any items that have been added to the game which are in a BuyGroup that they have already purchased.
 * @returns {void} Nothing
 */
declare function LoginValideBuyGroups(): void;
/**
 * Checks if the player arrays contains any item that does not exists and saves them.
 * @returns {void} Nothing
 */
declare function LoginValidateArrays(): void;
/**
 * Makes sure the difficulty restrictions are applied to the player
 * @param {boolean} applyDefaults - If changing to the difficulty, set this to True to set LimitedItems to the default settings
 * @returns {void} Nothing
 */
declare function LoginDifficulty(applyDefaults: boolean): void;
/**
 * Set the item permissions for the Extreme difficulty
 * @param {boolean} applyDefaults - When initially changing to extreme/whitelist, TRUE sets strong locks to limited permissions. When enforcing
 * settings, FALSE allows them to remain as they are since the player could have changed them to fully open.
 * @returns {void} Nothing
 */
declare function LoginExtremeItemSettings(applyDefaults: boolean): void;
/**
 * Handles server response, when login has been queued
 * @param {number} Pos The position in queue
 */
declare function LoginQueue(Pos: number): void;
/**
 * Handles player login response data
 * @param {object | string} C - The Login response data - this will either be the player's character data if the
 * login was successful, or a string error message if the login failed.
 * @returns {void} Nothing
 */
declare function LoginResponse(C: object | string): void;
/** Check if the player's browser has ES2020 support */
declare function LoginCheckES2020(): void;
/**
 * Handles player click events on the character login screen
 * @returns {void} Nothing
 */
declare function LoginClick(): void;
/**
 * Handles player keyboard events on the character login screen, "enter" will login
 * @returns {void} Nothing
 */
declare function LoginKeyDown(): void;
/**
 * Attempt to log the user in based on their input username and password
 * @returns {void} Nothing
 */
declare function LoginDoLogin(): void;
/**
 * Sets the state of the login page to the submitted state
 * @returns {void} Nothing
 */
declare function LoginSetSubmitted(): void;
/**
 * Resets the login submission state
 * @param {string} [ErrorMessage] - the login error message to set if the login is invalid - if not specified, will clear the login error message
 * @param {boolean} [IsRelog=false] - whether or not we're on the relog screen
 * @returns {void} Nothing
 */
declare function LoginStatusReset(ErrorMessage?: string, IsRelog?: boolean): void;
/**
 * Updates the message on the login page
 * @returns {void} Nothing
 */
declare function LoginUpdateMessage(): void;
/**
 * Retrieves the correct message key based on the current state of the login page
 * @returns {string} The key of the message to display
 */
declare function LoginGetMessageKey(): string;
/**
 * Exit function - called when leaving the login page
 * @returns {void} - Nothing
 */
declare function LoginExit(): void;
declare var LoginBackground: string;
declare var LoginMessage: string;
/** @type {null | string[][]} */
declare var LoginCredits: null | string[][];
declare var LoginCreditsPosition: number;
declare var LoginThankYou: string;
declare var LoginThankYouList: string[];
declare var LoginThankYouNext: number;
declare var LoginSubmitted: boolean;
declare var LoginIsRelog: boolean;
declare var LoginErrorMessage: string;
declare var LoginCharacter: any;
declare let LoginTextCacheUnsubscribeCallback: any;
/**
 * The list of item fixups to apply on login.
 *
 * @type {{ Old: {Group: AssetGroupName, Name: string}, New: {Group: AssetGroupName, Name: string, Option?: string} }[]}
 */
declare let LoginInventoryFixups: {
    Old: {
        Group: AssetGroupName;
        Name: string;
    };
    New: {
        Group: AssetGroupName;
        Name: string;
        Option?: string;
    };
}[];
