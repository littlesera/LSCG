/**
 * Checks if the introduction room is currently the scenario for maid rescue mission.
 * @param {string} ScenarioName - Name of the rescue scenario to check for.
 * @returns {boolean} - Returns TRUE if the given scenario is the current active one.
 */
declare function IntroductionIsRescueScenario(ScenarioName: string): boolean;
/**
 * Checks if the two NPCs in the introduction room are free.
 * @returns {boolean} - Returns TRUE if both the maid and the sub is free.
 */
declare function IntroductionIsBothFree(): boolean;
/**
 * Checks if the introduction maid is restrained.
 * @returns {boolean} - Returns TRUE if the introduction maid is restrained
 */
declare function IntroductionIsMaidRestrained(): boolean;
/**
 * Checks if the player has no title
 * @returns {boolean} - Returns TRUE if the player is not a maid or a mistress.
 */
declare function IntroductionNoTitle(): boolean;
/**
 * Checks if the introduction job is completed
 * @returns {boolean} - Returns TRUE if the introduction job was done.
 */
declare function IntroductionJobIsComplete(): boolean;
/**
 * Checks if the player can take a job.
 * @returns {boolean} - Returns TRUE if a job is available and the player is able to take one.
 */
declare function IntroductionCanTakeJob(): boolean;
/**
 * Checks if the player is able to take a job, but none are available.
 * @returns {boolean} - Returns TRUE if there is no job available while the player is able to take one.
 */
declare function IntroductionCannotTakeJobDone(): boolean;
/**
 * Checks if the player has jobs available, but is restrained
 * @returns {boolean} - Returns TRUE if the players is restrained while a job is available.
 */
declare function IntroductionCannotTakeJobRestrained(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function IntroductionCanPlayClubCard(): boolean;
/**
 * Loads the introduction room and its 2 NPCS
 * @returns {void} - Nothing
 */
declare function IntroductionLoad(): void;
/**
 * Runs and draws the main introduction room with its 3 characters.
 * @returns {void} - Nothing
 */
declare function IntroductionRun(): void;
/**
 * Handles clicks in the introduction room.
 * @returns {void} - Nothing
 */
declare function IntroductionClick(): void;
/**
 * Change the opinion the maid has on the player, it will affect the global player Domme/sub reputation at the end of the first training
 * @param {string} Bonus - Number representing the bonus to the current opinion the maid has.
 * @returns {void} - Nothing
 */
declare function IntroductionChangeMaidOpinion(Bonus: string): void;
/**
 * Gives focus on certain body parts with its zone
 * @param {AssetGroupItemName} NewZone - Zone to set as the new focus group
 * @returns {void} - Nothing
 */
declare function IntroductionSetZone(NewZone: AssetGroupItemName): void;
/**
 * Clears the body part focus zones
 * @returns {void} - Nothing
 */
declare function IntroductionClearZone(): void;
/**
 * Triggered when the maid gives basic items to the player
 * @returns {void} - Nothing
 */
declare function IntroductionGetBasicItems(): void;
/**
 * Saves the maid opinion of the player to the log
 * @returns {void} - Nothing
 */
declare function IntroductionSaveMaidOpinion(): void;
/**
 * Checks if the introduction maid can restrain the player.
 * @returns {boolean} - Returns TRUE if the maid can restrain the player
 */
declare function IntroductionAllowRestrainPlayer(): boolean;
/**
 * Gags the player unless she's head maid during the introduction dialog.
 * @returns {void} - Nothing
 */
declare function IntroductionGagPlayer(): void;
/**
 * Triggered when the player rescues both girls and completes the maid rescue mission
 * @returns {void} - Nothing
 */
declare function IntroductionCompleteRescue(): void;
/**
 * Triggered at the end of a job. The time is logged and a new job will be available the next day. The day is based on the server time.
 * @returns {void} - Nothing
 */
declare function IntroductionJobDone(): void;
/**
 * Checks if a specific daily job is available. Each job is available in a rotating fashion. Certain jobs are only available for doms or subs.
 * @param {string} JobName - Name of the job to check for.
 * @returns {boolean} - Returns TRUE if a specific daily job is available for the player.
 */
declare function IntroductionJobAvailable(JobName: string): boolean;
/**
 * Checks if there is a daily job available
 * @returns {boolean} - Returns TRUE if any job is available for the player
 */
declare function IntroductionJobAnyAvailable(): boolean;
/**
 * Starts a given daily job with the given goal.
 * @param {string} JobName - Name of the job to start
 * @param {number} JobCount - Treshold to consider the job complete
 * @returns {void} - Nothing
 */
declare function IntroductionJobStart(JobName: string, JobCount: number): void;
/**
 * Cancels the current daily job, it hurts the reputation of the player.
 * @returns {void} - Nothing
 */
declare function IntroductionJobGiveUp(): void;
/**
 * Shows the lock description that the player must apply
 * @returns {void} - Nothing
 */
declare function IntroductionJobLockType(): void;
/**
 * Validates progress for a daily job. When a member number needs to be unique, it may not progress.
 * @param {string} JobName - Name of the job for which to register progress
 * @param {string} [Param] - Optional parameter for the job to check for. Can be the name of an asset or anything required by the specific job.
 * @param {boolean} [UniqueMember] - If the member number should be unique.
 * @returns {void} - Nothing
 */
declare function IntroductionJobProgress(JobName: string, Param?: string, UniqueMember?: boolean): void;
/**
 * Starts the daily kidnapping job.
 * @returns {void} - Nothing
 */
declare function IntroductionJobBouncerStart(): void;
/**
 * Starts the daily dog walking job.
 * @returns {void} - Nothing
 */
declare function IntroductionJobPuppyStart(): void;
/**
 * Starts the Shibari dojo daily job.
 * @returns {void} - Nothing
 */
declare function IntroductionJobDojoStart(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function IntroductionClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function IntroductionClubCardEnd(): void;
declare var IntroductionBackground: string;
/** @type {null | NPCCharacter} */
declare var IntroductionMaid: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var IntroductionSub: null | NPCCharacter;
declare var IntroductionMaidOpinion: number;
declare var IntroductionHasBasicItems: boolean;
declare var IntroductionSubRestrained: boolean;
declare var IntroductionIsMaid: boolean;
declare var IntroductionIsHeadMaid: boolean;
declare var IntroductionRescueScenario: string;
declare var IntroductionRescueScenarioList: string[];
declare var IntroductionJobList: string[];
declare var IntroductionJobCurrent: string;
declare var IntroductionJobCount: number;
/** @type {null | string} */
declare var IntroductionJobParam: null | string;
declare namespace IntroductionJobPosition {
    let Active: boolean;
    let X: number;
    let Y: number;
}
declare var IntroductionJobLockList: string[];
declare var IntroductionJobSearchList: string[];
/** @type {number[]} */
declare var IntroductionJobMember: number[];
