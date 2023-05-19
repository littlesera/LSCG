/**
 * Returns TRUE if the private bed is available.
 * @returns {boolean} - TRUE if available.
 */
declare function PrivateBedActive(): boolean;
/**
 * Returns the number of girls in the private bedroom.
 * @returns {Number} - The number of girls.
 */
declare function PrivateBedCount(): number;
/**
 * Loads the private bedroom screen.
 * @returns {void} - Nothing.
 */
declare function PrivateBedLoad(): void;
/**
 * Draws a private bedroom character.
 * @param {Character} C - The character to draw.
 * @returns {void} - Nothing.
 */
declare function PrivateBedDrawCharacter(C: Character): void;
/**
 * Runs the private bedroom screen.
 * @returns {void} - Nothing.
 */
declare function PrivateBedRun(): void;
/**
 * Starts an arousal action on a character.
 * @param {Character} Source - The source character.
 * @param {Character} Target - The target character.
 * @param {AssetItemGroup} Group - The zone / group to target.
 * @param {ActivityName} Activity - The activity to do.
 * @returns {boolean} - TRUE if the activity could start.
 */
declare function PrivateBedActivityStart(Source: Character, Target: Character, Group: AssetItemGroup, Activity: ActivityName): boolean;
/**
 * Checks if the activity if valid for the group/zone on the target character.
 * @param {Character} Source - The source character.
 * @param {Character} Target - The target character.
 * @param {AssetGroup} Group - The zone / group to target.
 * @param {Activity} Activity - The activity to do.
 * @returns {Group is AssetItemGroup} - TRUE if the activity is valid for the group
 */
declare function PrivateBedGroupActivityIsValid(Source: Character, Target: Character, Group: AssetGroup, Activity: Activity): Group is AssetItemGroup;
/**
 * Starts a random activity for a source NPC
 * @param {Character} Source - The source character.
 * @returns {void} - Nothing.
 */
declare function PrivateBedNPCActivity(Source: Character): void;
/**
 * Handles clicks in the private bedroom.
 * @returns {void|boolean} - Nothing.
 */
declare function PrivateBedClick(): void | boolean;
/**
 * When the player exits the private bedroom.  The next sex scene will wait from 5 to 20 depending on luck and the frigid/honry trait.
 * @returns {void} - Nothing.
 */
declare function PrivateBedExit(Type: any): void;
/**
 * When a character gets an orgasm
 * @param {Character} C - The character getting the orgasm.
 * @returns {void} - Nothing.
 */
declare function PrivateBedOrgasm(C: Character): void;
declare var PrivateBedBackground: string;
/** @type {Character[]} */
declare var PrivateBedCharacter: Character[];
/** @type {ActivityName} */
declare var PrivateBedActivity: ActivityName;
/** @type {ActivityName[]} */
declare var PrivateBedActivityList: ActivityName[];
/** @type {string[]} */
declare var PrivateBedLog: string[];
declare var PrivateBedActivityDelay: number;
declare var PrivateBedActivityMustRefresh: boolean;
declare var PrivateBedLeaveTime: number;
