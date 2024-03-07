/**
 * Checks if the player can restrain the Shibari dojo teacher.
 * @returns {boolean} - Returns TRUE if the player is able to restrain the teacher.
 */
declare function ShibariAllowTeacherBondage(): boolean;
/**
 * Checks if the player can strip the Shibari dojo teacher.
 * @returns {boolean} - Returns TRUE if the player is able to strip the teacher.
 */
declare function ShibariAllowTeacherStrip(): boolean;
/**
 * Checks if the player can be restrained by the Shibari dojo teacher.
 * @returns {boolean} - Returns TRUE if the player can be restrained by the teacher.
 */
declare function ShibariAllowPlayerBondage(): boolean;
/**
 * Checks if the player can spank the Shibari dojo teacher.
 * @returns {boolean} - Returns TRUE if the player can spank the teacher.
 */
declare function ShibariAllowSpank(): boolean;
/**
 * Checks if the given maid rescue scenario name is currently active in the shibari dojo.
 * @param {string} ScenarioName - Name of the scenario to check for.
 * @returns {boolean} - Returns TRUE if the given scenario is active.
 */
declare function ShibariIsRescueScenario(ScenarioName: string): boolean;
/**
 * Checks if the Shibari dojo teacher is restrained.
 * @returns {boolean} - Returns TRUE if the teacher is restrained.
 */
declare function ShibariIsTeacherRestrained(): boolean;
/**
 * Checks if the player can be trained in a given skill type.
 * @param {SkillType} SkillType - Name of the skill to check for.
 * @returns {boolean} - Returns TRUE if the player can receive a training.
 */
declare function ShibariCanTrainSkill(SkillType: SkillType): boolean;
/**
 * Checks if the player can pay for a training.
 * @returns {boolean} - Returns TRUE if the player can pay for the requested training.
 */
declare function ShibariCanPayForTraining(): boolean;
/**
 * Checks if the player can pay for a training.
 * @returns {boolean} - Returns TRUE if the player can pay for the requested training.
 */
declare function ShibariCanTrain(): boolean;
/**
 * Checks if the player can pay for a training.
 * @returns {boolean} - Returns TRUE if the player can pay for the requested training.
 */
declare function ShibariCannotTrainDelay(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function ShibariCanPlayClubCard(): boolean;
/**
 * Puts a character in a random bondage position.
 * @param {Character} C - Character to restrain.
 * @param {number} Level - Level of bondage, higher is more complex bondage
 * @returns {void} - Nothing
 */
declare function ShibariRandomBondage(C: Character, Level: number): void;
/**
 * Loads the shibari dojo and its two characters.
 * @returns {void} - Nothing
 */
declare function ShibariLoad(): void;
/**
 * Runs and draws the shibari dojo, with its 3 characters
 * @returns {void} - Nothing
 */
declare function ShibariRun(): void;
/**
 * Handles clicks in the shibari dojo
 * @returns {void} - Nothing
 */
declare function ShibariClick(): void;
/**
 * Triggered when the player is allowed to restrain the teacher.
 * @returns {void} - Nothing
 */
declare function ShibariStartTeacherBondage(): void;
/**
 * Triggered when the player gets restrained by the teacher, the teacher will not release the player for a minute after this.
 * @param {string} Level
 * @returns {void} - Nothing
 */
declare function ShibariRestrainPlayer(Level: string): void;
/**
 * Triggered on the first time the player says something submissive, it lowers the dominant score.
 * @returns {void} - Nothing
 */
declare function ShibariSubComment(): void;
/**
 * Triggered on the first time the player says something dominant, it raises the dominant score.
 * @returns {void} - Nothing
 */
declare function ShibariDomComment(): void;
/**
 * Triggered on the first time the player surrenders to the teacher, it lowers the dominant score.
 * @returns {void} - Nothing
 */
declare function ShibariSurrenderToTeacher(): void;
/**
 * Triggered on the first time the player spanks the submissive or the teacher, it raises the dominant score.
 * @returns {void} - Nothing
 */
declare function ShibariSpank(): void;
/**
 * Triggered when the teacher gives the suspension hemp rope to the player
 * @returns {void} - Nothing
 */
declare function ShibariGetRope(): void;
/**
 * Triggered when the player rescues the teacher and completes the mission for the maid rescue mission.
 * @returns {void} - Nothing
 */
declare function ShibariCompleteRescue(): void;
/**
 * Calculates the training price, it is linked to the current skill level of the player
 * @param {SkillType} SkillType - Name of the skill to calculate the price of
 * @returns {void} - Nothing
 */
declare function ShibariCalculateTrainingPrice(SkillType: SkillType): void;
/**
 * Triggered when the player pays to get trained in a given skill.
 * @param {SkillType} SkillType - Name of the skill being bought
 * @returns {void} - Nothing
 */
declare function ShibariPayForTraining(SkillType: SkillType): void;
/**
 * When the player starts a club card game against the shibari student
 * @returns {void} - Nothing
 */
declare function ShibariClubCardStart(): void;
/**
 * When the player ends a club card game against the shibari student
 * @returns {void} - Nothing
 */
declare function ShibariClubCardEnd(): void;
declare var ShibariBackground: string;
/** @type {null | NPCCharacter} */
declare var ShibariTeacher: null | NPCCharacter;
/** @type {null | Item[]} */
declare var ShibariTeacherAppearance: null | Item[];
declare var ShibariAllowTeacherItem: boolean;
/** @type {null | NPCCharacter} */
declare var ShibariStudent: null | NPCCharacter;
/** @type {null | Item[]} */
declare var ShibariPlayerAppearance: null | Item[];
declare var ShibariSubCommentDone: boolean;
declare var ShibariDomCommentDone: boolean;
declare var ShibariSurrenderDone: boolean;
declare var ShibariSpankDone: boolean;
/** @type {null | number} */
declare let ShibariTeacherReleaseTimer: null | number;
declare var ShibariRescueScenario: string;
declare var ShibariRescueScenarioList: string[];
declare var ShibariTrainingPrice: number;
declare var ShibariTrainingPriceList: number[];
