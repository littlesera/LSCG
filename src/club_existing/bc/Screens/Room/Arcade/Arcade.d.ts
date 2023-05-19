/**
 * Determines whether or not the player is bound and can plead to have their own headset put on them
 * @returns {boolean} - Whether or not the player can ask to have a headset put on
 */
declare function ArcadeCanAskForHeadsetHelpBound(): boolean;
/**
 * Determines whether or not the player is gagged and can plead to have their own headset put on them
 * @returns {boolean} - Whether or not the player can ask to have a headset put on
 */
declare function ArcadeCanAskForHeadsetHelpGagged(): boolean;
/**
 * Determines whether or not the player can play games
 * @returns {boolean} - Whether or not the player has a headset
 */
declare function ArcadeCanPlayGames(): boolean;
/**
 * Determines whether or not the player can play games and is gagged
 * @returns {boolean} - Whether or not the player has a headset and is gagged
 */
declare function ArcadeCanPlayGamesAndGagged(): boolean;
/**
 * Determines whether or not the player needs to rent a headset
 * @returns {boolean} - Whether or not the player needs to rent a headset
 */
declare function ArcadeNeedToRent(): boolean;
/**
 * Places a headset on the player
 * @returns {void} - Nothing
 */
declare function ArcadePutOnHeadset(): void;
/**
 * Places a headset on the player and charges them 10
 * @returns {void} - Nothing
 */
declare function ArcadeBuyHeadset(): void;
/**
 * Toggles the Devious Dungeon Challenge
 * @returns {void} - Nothing
 */
declare function ArcadeToggleDeviousChallenge(): void;
/**
 * Returns the deviouschallenge
 * @returns {boolean} - ArcadeDeviousChallenge
 */
declare function ArcadeDeviousChallengeAllowed(): boolean;
/**
 * Returns the deviouschallenge
 * @returns {boolean} - ArcadeDeviousChallenge
 */
declare function ArcadeDeviousChallengeEnabled(): boolean;
/**
 * Loads the Arcade room and initializes the NPCs. This function is called dynamically
 * @returns {void} - Nothing
 */
declare function ArcadeLoad(): void;
/**
 * Run the Arcade room and draw characters. This function is called dynamically at short intervals.
 * Don't use expensive loops or functions from here
 * @returns {void} - Nothing
 */
declare function ArcadeRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function ArcadeClick(): void;
/**
 * Starts the kinky dungeon game
 * @param {number} PlayerLevel - The player's current level in the game
 * @returns {void} - Nothing
 */
declare function ArcadeKinkyDungeonStart(PlayerLevel: number): void;
/**
 * Ends the therapy mini-game as a nurse, plays with reputation and money
 * @returns {void} - Nothing
 */
declare function ArcadeKinkyDungeonEnd(): void;
declare function ArcadeKinkyDungeonStartLoad(): Promise<void>;
/**
 * @returns {boolean} - False if the dungeon is not ready yet, true otherwise
 */
declare function ArcadeKinkyDungeonLoad(): boolean;
declare var ArcadeBackground: string;
/** @type {null | NPCCharacter} */
declare var ArcadeEmployee: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var ArcadePlayer: null | NPCCharacter;
declare var ArcadeAskedFor: any;
declare var ArcadePrice: number;
declare var ArcadeDeviousChallenge: boolean;
declare var ArcadeCannotDoDeviousChallenge: boolean;
declare var KinkyDungeonFiles: string[];
declare var KinkyDungeonIsLoading: boolean;
declare var KinkyDungeonReady: boolean;
