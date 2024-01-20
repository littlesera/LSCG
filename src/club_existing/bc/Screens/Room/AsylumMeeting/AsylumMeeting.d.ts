/**
 * Checks if the player can be released
 * @returns {boolean} - Returns true, if the player can be released, false otherwise
 */
declare function AsylumMeetingCanReleasePlayer(): boolean;
/**
 * Checks if the player cannot be released
 * @returns {boolean} - Returns true, if the player cannot be released, false otherwise
 */
declare function AsylumMeetingCannotReleasePlayer(): boolean;
/**
 * Checks wether the player can be restrained or not
 * @returns {boolean} - Returns true, if the player can be restrained, flase otherwise
 */
declare function AsylumMeetingCanRestrainPlayer(): boolean;
/**
 * Returns TRUE if specific dialog conditions are met
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function AsylumMeetingCanKiss(): boolean;
declare function AsylumMeetingWearingGGTS(): boolean;
declare function AsylumMeetingGGTSCollar(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained and gagged
 */
declare function AsylumMeetingCanPlayClubCard(): boolean;
/**
 * Loads the room and it's patients
 * @returns {void} - Nothing
 */
declare function AsylumMeetingLoad(): void;
/**
 * Runs the room. Is called at short intervals so don't use expensive loops or function calls from here
 * @returns {void} - Nothing
 */
declare function AsylumMeetingRun(): void;
/**
 * Handles the click events. Is called by CommonClick()
 * @returns {void} - Nothing
 */
declare function AsylumMeetingClick(): void;
/**
 * When the player smokes with the patient
 * @returns {void} - Nothing
 */
declare function AsylumMeetingSmoke(): void;
/**
 * The player buys a vibrating wand from the left hand patient
 * @returns {void} - Nothing
 */
declare function AsylumMeetingBuyVibratingWand(): void;
/**
 * The player buys lockpicks from the left hand patient
 * @returns {void} - Nothing
 */
declare function AsylumMeetingBuyLockPicks(): void;
/**
 * The player pays the left hand patient to release her
 * @returns {void} - Nothing
 */
declare function AsylumMeetingReleaseForMoney(): void;
/**
 * When the girl on the left runs away, the player's reputation changes
 * @param {number} RepChange - The amount to change the player's reputation by
 * @returns {void} - Nothing
 */
declare function AsylumMeetingRunAway(RepChange: number): void;
/**
 * When the player gets restrained by the left hand patient
 * @param {"FEW"|"LOT"|"ALL"} RestraintsType - The amount of restraints to put on the player
 * @returns {void} - Nothing
 */
declare function AsylumMeetingRestrainPlayer(RestraintsType: "FEW" | "LOT" | "ALL"): void;
/**
 * When the player plays with a patient, she blushes
 * @param {"Low"| "Medium"| "High"| "VeryHigh"| "Extreme"| "ShortBreath"} BlushType - The expression to use
 * @returns {void} - Nothing
 */
declare function AsylumMeetingBlush(BlushType: "Low" | "Medium" | "High" | "VeryHigh" | "Extreme" | "ShortBreath"): void;
/**
 * Before the player quits GGTS
 * @returns {void} - Nothing
 */
declare function AsylumMeetingBeforeQuitGGTS(): void;
/**
 * When the player quits GGTS, her game data is erased
 * @returns {void} - Nothing
 */
declare function AsylumMeetingQuitGGTS(): void;
/**
 * When the player quits GGTS by destroying the database server, the asylum closes until there's a relog
 * @returns {void} - Nothing
 */
declare function AsylumMeetingQuitGGTSMainHall(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function AsylumMeetingClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function AsylumMeetingClubCardEnd(): void;
declare var AsylumMeetingBackground: string;
/** @type {null | NPCCharacter} */
declare var AsylumMeetingPatientLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var AsylumMeetingPatientRight: null | NPCCharacter;
