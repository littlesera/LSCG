/**
 * CHecks, if the player can be served
 * @returns {boolean} - Returns true, if the player can be served, false otherwise
 */
declare function CafeMaidCanServe(): boolean;
/**
 * Checks, if the maid from the cafe can serve the player
 * @returns {boolean} - Returns true, if the maid is able to serve, false otherwise
 */
declare function CafeMaidCannotServe(): boolean;
/**
 * Checks, if the player is able to consume a dring
 * @returns {boolean} - Returns true, if player and maid are unrestrained, false otherwise
 */
declare function CafePlayerCannotConsume(): boolean;
/**
 * CHecks, if the player has completed the only serving task
 * @returns {boolean} - Returns true, if the player is done, false otherwise
 */
declare function CafeOnlineDrinkCompleted(): boolean;
/**
 * Checks, if the player is a head maid and gagged
 * @returns {boolean} - Returns true, if the player is a head maid and gagged
 */
declare function CafeIsGaggedHeadMaid(): boolean;
/**
 * Checks if the player is gagged and an experienced maid (reputation higher than 50)
 * @returns {boolean} - Returns true, if the player is gagged and a senior maid, false otherwise
 */
declare function CafeIsGaggedSeniorMaid(): boolean;
/**
 * Checks if the player is gagged and an ordinary maid
 * @returns {boolean} - Returns true if the player is gagged and an ordinary maid, false otherwise
 */
declare function CafeIsGaggedRookieMaid(): boolean;
/**
 * Checks if the player is an experinced maid, but no head maid
 * @returns {boolean} - Returns true, if the player is no head maid and has a reputation of more than 50, false otherwise
 */
declare function CafeIsMaidChoice(): boolean;
/**
 * Checks, if the player is an ordinary maid
 * @returns {boolean} - Returns true if the player is no head maid and has a reputation of less than 50
 */
declare function CafeIsMaidNoChoice(): boolean;
/**
 * Checks, if a dildo can be applied to the player
 * @returns {boolean} - Returns true, if a dildo can be applied, false otherwise
 */
declare function CafeCanDildo(): boolean;
/**
 * Checks, if the player aked for a certain speciality
 * @param {string} Type - The type of cafe speciality
 * @returns {boolean} - Returns true, if the player asked for a given speciality, false otherwise
 */
declare function CafeEquired(Type: string): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function CafeCanPlayClubCard(): boolean;
/**
 * Loads the Cafe room and initializes the NPCs. This function is called dynamically
 * @returns {void} - Nothing
 */
declare function CafeLoad(): void;
/**
 * Run the Cafe room and draw characters. This function is called dynamically at short intervals.
 * Don't use expensive loops or functions from here
 * @returns {void} - Nothing
 */
declare function CafeRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function CafeClick(): void;
/**
 * When the player asks for a special, she is told the price
 * @param {string} Item - The special the player asks for
 */
declare function CafeEquirePrice(Item: string): void;
/**
 * The player consumes a speciality. The money is subtracted and the effect applied
 * @returns {void} - Nothing
 */
declare function CafeConsumeSpeciiality(): void;
/**
 * The cafe maid remove the player's gag
 */
declare function CafeUngagPlayer(): void;
/**
 * The cafe maid applies chosen bondage
 * @param {"Shibari" | "Tape" | "Leather" | "Latex" | "Heavy"} Style - The style of bondage chosen by the player
 * @returns {void} - Nothing
 */
declare function CafeServiceBound(Style: "Shibari" | "Tape" | "Leather" | "Latex" | "Heavy"): void;
/**
 * Make sure the player is bound securely for serving
 * @returns {void} - Nothing
 */
declare function CafeRamdomBound(): void;
/**
 * The maid re-stocks the player's serving tray
 * @returns {void} - Nothing
 */
declare function CafeRefillTray(): void;
/**
 * The maid uses toy on the player
 * @returns {void} - Nothing
 */
declare function CafeGivenDildo(): void;
/**
 * Maid turns player's Vibe up to moderate
 * @returns {void} - Nothing
 */
declare function CafeTurnDildoUp(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function CafeClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function CafeClubCardEnd(): void;
/**
 * Sends the bound player back to the main hall
 * @returns {void} - Nothing
 */
declare function CafeClubCardMainHall(): void;
declare var CafeBackground: string;
/** @type {null | NPCCharacter} */
declare var CafeMaid: null | NPCCharacter;
declare var CafeIsMaid: boolean;
declare var CafeIsHeadMaid: boolean;
declare var CafeVibeIncreased: boolean;
declare var CafeEnergyDrinkPrice: number;
declare var CafeGlassMilkPrice: number;
declare var CafeCupcakePrice: number;
/** @type {null | string} */
declare var CafeAskedFor: null | string;
declare var CafePrice: number;
