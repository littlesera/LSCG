/**
 * Checks, if the player is able to leave the Asylum
 * @returns {boolean} - Returns true, if the player is able to leave, false otherwise
 */
declare function AsylumEntranceCanWander(): boolean;
/**
 * Checks, if the player can bring the nurse to her private room
 * @returns {boolean} - Returns true, if the player can drag the nurse to her private roo, false otherwise
 */
declare function AsylumEntranceCanTransferToRoom(): boolean;
/**
 * CHecks if the player can kiss the nurse
 * @returns {boolean} - Returns true, if the player can kiss the nurse, false otherwise
 */
declare function AsylumEntranceCanKiss(): boolean;
/**
 * Checks if the player can have a nurse uniform of her own
 * @returns {boolean} - Returns true, if the player can have her own nurse uniform, false otherwise
 */
declare function AsylumEntranceCanGetNurseUniform(): boolean;
/**
 * Returns TRUE if the nurse is collared by GGTS
 * @returns {boolean} - Returns TRUE if the nurse is collared by GGTS
 */
declare function AsylumEntranceNurseHasGGTSCollar(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function AsylumEntranceCanPlayClubCard(): boolean;
/**
 * Loads the room and generates the nurse. Is called dynamically
 * @returns {void} - Nothing
 */
declare function AsylumEntranceLoad(): void;
/**
 * // Runs the room (shows the nurse, player, icons and committed time).
 * Is called over and over again, so don't call expensive functions or loops from here.
 * @returns {void} - Nothing
 */
declare function AsylumEntranceRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function AsylumEntranceClick(): void;
/**
 * Enters the online chat room in "Asylum mode"
 * @returns {void} - Nothing
 */
declare function AsylumEntranceStartChat(): void;
/**
 * Dresses a given character as a nurse
 * @param {Character} C - The character to dress
 * @returns {void} - Nothing
 */
declare function AsylumEntranceWearNurseClothes(C: Character): void;
/**
 * Dresses the player as a patient. Used in dialogs.
 */
declare function AsylumEntrancePlayerWearPatientClothes(): void;
/**
 * Dresses a given character as a patient. Removes all clothes and respects cosplay rules
 * @param {Character} C - The character to dress
 * @param {boolean} [ExtraEvent] - Should we process extra events for login or GGTS
 * @returns {void} - Nothing
 */
declare function AsylumEntranceWearPatientClothes(C: Character, ExtraEvent?: boolean): void;
/**
 * Checks, if the player is dressed as a patient
 * @returns {boolean} - Returns true, if the player is dressed as a patient, false otherwise
 */
declare function AsylumEntranceIsWearingPatientClothes(): boolean;
/**
 * Checks, if the player is dressed as a nurse
 * @returns {boolean} - Returns true, if the player is dressed as a nurse, false otherwise
 */
declare function AsylumEntranceIsWearingNurseClothes(): boolean;
/**
 * Commits a player to the asylum for a given time and changes the players reputation
 * @param {string} Duration - The time (in micro seconds) the player gets committed for
 * @param {string} ReputationChange - The amount the player's reputation is going to change
 * @returns {void} - Nothing
 */
declare function AsylumEntranceCommitPatient(Duration: string, ReputationChange: string): void;
/**
 * The player starts working as a nurse for the Asylum. Dresses the player and sets her reputation to 1
 * @returns {void} - Nothing
 */
declare function AsylumEntranceStartNurse(): void;
/**
 * Starts the fight for freedom between the player and the nurse
 * @returns {void} - Nothing
 */
declare function AsylumEntranceFightNurse(): void;
/**
 * Resolves the result of the fight against the nurse
 * @returns {void} - Nothing
 */
declare function AsylumEntranceFightNurseEnd(): void;
/**
 * Restrains the player in a straitjacket with a custom difficulty
 * @param {string} Pose - The tightness of the straitjacket
 * @returns {void} - Nothing
 */
declare function AsylumEntrancePlayerJacket(Pose: string): void;
/**
 * Handles the theft of the nurse's clothes by the player
 * @param {number} RepChange - The amount of reputation change
 * @returns {void} - Nothing
 */
declare function AsylumEntrancePlayerNurseClothes(RepChange: number): void;
/**
 * When the nurse is forced to be a patient (player will be tracked down for a full day after and a title will be forced)
 * @returns {void} - Nothing
 */
declare function AsylumEntranceNurseBecomePatient(): void;
/**
 * Handles the restraining of the nurse by the player
 * @param {number} RepChange - The amount of reputation change for the player
 * @returns {void} - Nothing
 */
declare function AsylumEntranceNurseStrap(RepChange: number): void;
/**
 * When the player gets committed again after escaping, she is restraint tightly and has to stay for a full day
 * @returns {void} - Nothing
 */
declare function AsylumEntranceRecommit(): void;
/**
 * Handles the player being caught by a nurse, after escaping the Asylum. The player is brought back and the doors locked
 * @returns {void} - Nothing
 */
declare function AsylumEntranceNurseCatchEscapedPlayer(): void;
/**
 * Handled the player'S fight against the kidnap nurse
 * @returns {void} - Nothing
 */
declare function AsylumEntranceKidnapNurseFight(): void;
/**
 * Resolved the fight against the kidnap nurse
 * @param {boolean} Surrender - Wether the player surrendered or not
 * @returns {void} - Nothing
 */
declare function AsylumEntranceKidnapNurseFightOutro(Surrender: boolean): void;
/**
 * Handles the bribe attempt of the kidnapping nurse
 * @param {string} BribeAmount - The offered bribe amount
 * @param {string} BribeOdds - The odds of a succesful bribe attempt
 * @returns {void} - Nothing
 */
declare function AsylumEntranceKidnapNurseBribe(BribeAmount: string, BribeOdds: string): void;
/**
 * When the player transfers the kidnap nurse to her room
 * @returns {void} - Nothing
 */
declare function AsylumEntranceKidnapNurseTransferToRoom(): void;
/**
 * When the player leaves the kidnap nurse
 * @returns {void} - Nothing
 */
declare function AsylumEntranceKidnapNurseExit(): void;
/**
 * When the escaped player walks back to the asylum
 * @returns {void} - Nothing
 */
declare function AsylumEntranceGoToAsylum(): void;
/**
 * When the escaped player is dressed back as a patient
 * @returns {void} - Nothing
 */
declare function AsylumEntranceBackAsPatient(): void;
/**
 * The player meets  an escaped patient while on nurse duty
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientMeet(): void;
/**
 * When the player starts a fight against the escaped patient
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientFight(): void;
/**
 * Resolves the fight against an escaped patient
 * @param {boolean} Surrender - Wether the player surrendered or not
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientFightOutro(Surrender: boolean): void;
/**
 * Resolves the bribe attempt towards the player by an escaped patient
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientBribe(): void;
/**
 * When the player transfers a patient to her room
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientTransferToRoom(): void;
/**
 * Handles the returning of an escaped patient by the player
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientTransferToAsylum(): void;
/**
 * When the player leaves the escaped patient
 * @returns {void} - Nothing
 */
declare function AsylumEntranceEscapedPatientLeave(): void;
/**
 * The player gets a nurse uniform of her own
 * @returns {void} - Nothing
 */
declare function AsylumEntranceGiveNurseUniform(): void;
/**
 * Whether or not a patient has earned a set of Asylum restraints.
 * @returns {boolean} - TRUE if the the player is a patient but is not eligible for their own set of Asylum restraints,
 * FALSE otherwise.
 */
declare function AsylumEntrancePatientCannotGetRestraints(): boolean;
/**
 * Whether or not a patient has earned a set of Asylum restraints.
 * @returns {boolean} - TRUE if the the player is a patient and is eligible for their own set of Asylum restraints,
 * FALSE otherwise.
 */
declare function AsylumEntrancePatientCanGetRestraints(): boolean;
/**
 * Whether or not a nurse has earned a set of Asylum restraints.
 * @returns {boolean} - TRUE if the the player is a nurse but is not eligible for their own set of Asylum restraints,
 * FALSE otherwise.
 */
declare function AsylumEntranceNurseCannotGetRestraints(): boolean;
/**
 * Whether or not a nurse has earned a set of Asylum restraints.
 * @returns {boolean} - TRUE if the the player is a nurse and is eligible for their own set of Asylum restraints,
 * FALSE otherwise
 */
declare function AsylumEntranceNurseCanGetRestraints(): boolean;
/**
 * Called when the player has earned their own set of Asylum restraints.
 * @returns {void} - Nothing
 */
declare function AsylumEntranceGiveRestraints(): void;
/**
 * When the user removes 10 GGTS minutes from her bank to leave the asylum
 * @returns {void} - Nothing
 */
declare function AsylumEntrancePayTenMinutes(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function AsylumEntranceClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function AsylumEntranceClubCardEnd(): void;
declare var AsylumEntranceBackground: string;
/** @type {null | NPCCharacter} */
declare var AsylumEntranceNurse: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var AsylumEntranceKidnapNurse: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var AsylumEntranceEscapedPatient: null | NPCCharacter;
declare var AsylumEntranceEscapedPatientWillBribe: boolean;
declare var AsylumEntranceEscapedPatientWillJoin: boolean;
