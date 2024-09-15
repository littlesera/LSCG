/**
 * Checks if the therapy for the player can start
 * @returns {boolean} - Returns true, if the player is ready for therapy, false otherwise
 */
declare function AsylumTherapyPatientReadyForTherapy(): boolean;
/**
 * Loads the room and initializes the nurse and the patient
 * @returns {void} - Nothing
 */
declare function AsylumTherapyLoad(): void;
/**
 * Runs the room. This function is called over and over again at short intervals. So better don't use expensive loops or functions from here.
 * @returns {void} - Nothing
 */
declare function AsylumTherapyRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function AsylumTherapyClick(): void;
/**
 * When the player gets ungagged by the nurse, her reputation is reduced
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPlayerUngag(): void;
/**
 * Release and strip the player
 * @returns {void} - Nothing
 */
declare function AsylumTherapyStripPlayer(): void;
/**
 * Apply restraints on the player for bondage therapy. Depending on the patient reputation, the bondage therapy gets harsher
 * @returns {void} - Nothing
 */
declare function AsylumTherapyBondageTherapyRestrain(): void;
/**
 * Releases the player at the end of a therapy session
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTherapyEnd(): void;
/**
 * When the patient therapy fails, loses reputation
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTherapyFail(): void;
/**
 * When the patient therapy succeeds, gain reputation
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTherapySuccess(): void;
/**
 * Apply restraints on the player for pain therapy.
 * Depending on the patient's reputation, the pain therapy gets a tougher weapon
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPainTherapyRestrain(): void;
/**
 * For the tickle therapy, we use the four limbs shackle that forces the hands behind the back
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTickleTherapyRestrain(): void;
/**
 * For the tickle therapy, we apply a blindfold that's tougher depending on the patient reputation
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTickleTherapyBlindfold(): void;
/**
 * For the orgasm therapy, a vibrating toy can be applied on the player's breast
 * @returns {void} - Nothing
 */
declare function AsylumTherapyOrgasmTherapyRestrain(): void;
/**
 * Initiates the bondage therapy as a nurse
 * @param {number} RepChange - The amount, the player's reputation changes
 * @param {"FEW" | "LOT" | "ALL" } RestraintsLevel - The level of restraints to use
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPatientBondageIntro(RepChange: number, RestraintsLevel: "FEW" | "LOT" | "ALL"): void;
/**
 * Initiates the pain therapy as a nurse
 * @param {number} RepChange - The amount, the player's reputation changes
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPatientPainIntro(RepChange: number): void;
/**
 * Initiates the tickle therapy as a nurse
 * @param {number} RepChange - The amount, the player's reputation changes
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPatientTickleIntro(RepChange: number): void;
/**
 * Initiates the orgasm therapy as a nurse
 * @param {number} RepChange - The amount, the player's reputation changes
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPatientOrgasmIntro(RepChange: number): void;
/**
 * Starts the therapy mini-game as a nurse
 * @param {number} Difficulty - The difficulty of the mini game
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTherapyStart(Difficulty: number): void;
/**
 * Ends the therapy mini-game as a nurse, plays with reputation and money
 * @returns {void} - Nothing
 */
declare function AsylumTherapyTherapyMiniGameEnd(): void;
/**
 * When a new patient comes in
 * @returns {void} - Nothing
 */
declare function AsylumTherapyPatientNew(): void;
declare var AsylumTherapyBackground: string;
/** @type {null | NPCCharacter} */
declare var AsylumTherapyNurse: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var AsylumTherapyPatient: null | NPCCharacter;
