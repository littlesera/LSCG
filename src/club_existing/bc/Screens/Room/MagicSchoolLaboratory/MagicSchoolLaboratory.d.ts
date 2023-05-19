/**
 * Dresses a character C as a witch, the colors and clothes can changes based on the house
 * @param {Character} C - The character that will wear the clothes
 * @param {"" | "Maiestas" | "Vincula" | "Amplector" | "Corporis"} House - The house name
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryPrepareNPC(C: Character, House: "" | "Maiestas" | "Vincula" | "Amplector" | "Corporis"): void;
/**
 * Loads the magic school laboratory and the teacher
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryLoad(): void;
/**
 * Runs the room
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryRun(): void;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryClick(): void;
/**
 * When the user wants to practice a spell
 * @param {number} SpellNumber - The spell number (0 to strip, etc.)
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratorySpellPractice(SpellNumber: number): void;
/**
 * When the magic spell practice puzzle ends
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratorySpellPracticeEnd(): void;
/**
 * Check if someone is a member of a magic house or not
 * @param {"" | "Maiestas" | "Vincula" | "Amplector" | "Corporis"} House - The house name
 * @returns {boolean} - TRUE if a member, FALSE if not
 */
declare function MagicSchoolLaboratoryInHouse(House: "" | "Maiestas" | "Vincula" | "Amplector" | "Corporis"): boolean;
/**
 * Joins a specific magic house, sets the reputation to 1 and clear all other reputations
 * @param {"" | MagicSchoolHouse} House - The house name
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryJoinHouse(House: "" | MagicSchoolHouse): void;
/**
 * Dresses the player as it's current magic school house
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryDressHouse(): void;
/**
 * Check if a NPC is a member of a magic house or not
 * @param {MagicSchoolHouse} House - The house name
 * @returns {boolean} - TRUE if a member, FALSE if not
 */
declare function MagicSchoolLaboratoryFromHouse(House: MagicSchoolHouse): boolean;
/**
 * Check if a NPC is a member of the player's house
 * @param {MagicSchoolHouse} House - The house name
 * @returns {boolean} - TRUE if from same house, FALSE if not
 */
declare function MagicSchoolLaboratoryFromSameHouse(House: MagicSchoolHouse): boolean;
/**
 * Check if a NPC is a member of the player's rival house
 * @param {MagicSchoolHouse} House - The house name
 * @returns {boolean} - TRUE if a rival, FALSE if not
 */
declare function MagicSchoolLaboratoryFromRivalHouse(House: MagicSchoolHouse): boolean;
/**
 * Starts a practice battle against the school teacher
 * @param {number} Difficulty - The difficulty level from 0 to 10 (hardest)
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryMagicBattleStart(Difficulty: number): void;
/**
 * When the magic battle practice ends
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryMagicBattleEnd(): void;
/**
 * Generates a random student from the same house as the player (sister)
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryBuildSister(): void;
/**
 * Generates a random student that will meet the player
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryFindStudent(): void;
/**
 * When a fight begins between the player and a student
 * @param {"Wage25" | "Honor" | "RainbowWand"} Type - The type of battle to do (Normal, Wage or Honor)
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryBattleStudentStart(Type: "Wage25" | "Honor" | "RainbowWand"): void;
/**
 * When a student battle ends, we release the winner, change reputation or give some money based on the wage
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryBattleStudentEnd(): void;
/**
 * Sets an emote for the student when there's an activity
 * @param {ExpressionNameMap["Blush"]} Blush
 * @param {ExpressionNameMap["Eyes"]} Eyes
 * @returns {void}
 */
declare function MagicSchoolLaboratoryStudentEmote(Blush: ExpressionNameMap["Blush"], Eyes: ExpressionNameMap["Eyes"]): void;
/**
 * Checks, if the player can bring the student to her private room
 * @returns {boolean} - Returns true, if the player can
 */
declare function MagicSchoolLaboratoryCanTransferToRoom(): boolean;
/**
 * Triggered when the player transfers the student to her private room
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryTransferToRoom(): void;
/**
 * Triggered when the player won and ungag the student to talk with her
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryUngagStudent(): void;
/**
 * Triggered when the player lost and get ungagged by the student, can affect reputation
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryUngagPlayer(RepChange: any): void;
/**
 * Triggered when the player lost and get untied by the student, can affect reputation
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryReleasePlayer(RepChange: any): void;
/**
 * When the player lost a battle and the student tests a spell on her
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryLoserSpell(RepChange: any): void;
/**
 * Returns the player in the main hall in her current bondage
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryPlayerMainHall(): void;
/**
 * Starts a max difficulty battle against the master
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryBattleMasterStart(): void;
/**
 * When the magic battle against the master ends
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryBattleMasterEnd(): void;
/**
 * When the player learns the master technique from it's house
 * @returns {void} - Nothing
 */
declare function MagicSchoolLaboratoryLearnMastery(): void;
/**
 * Returns TRUE if the rainbow wand can be waged in a magic fight
 * @returns {boolean} - TRUE if it can be waged
 */
declare function MagicSchoolLaboratoryCanWageWand(): boolean;
declare var MagicSchoolLaboratoryBackground: string;
/** @type {null | NPCCharacter} */
declare var MagicSchoolLaboratoryTeacher: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var MagicSchoolLaboratoryStudent: null | NPCCharacter;
declare var MagicSchoolLaboratoryBattleWage: string;
declare var MagicSchoolLaboratoryLastSpell: string;
declare var MagicSchoolLaboratorySpellCount: number;
