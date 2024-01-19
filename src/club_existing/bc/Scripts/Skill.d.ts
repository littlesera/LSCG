/**
 * Returns the data for a given skill from a character
 *
 * @param {Character} C - The character to get skills from.
 * @param {SkillType} skillType The skill to get
 * @returns {Skill | undefined}
 */
declare function SkillGet(C: Character, skillType: SkillType): Skill | undefined;
/**
 * When the player progresses in a skill. Also validates the values to make sure they are within the proper ranges once changed. (level 0-10, progress 0-100)
 * @param {Character} C - The character to get skills from.
 * @param {SkillType} SkillType - Name of the skill to set the value for
 * @param {number} SkillLevel - Level to set for the given skill
 * @param {number} Progress - Progress to set for the given skill
 * @param {boolean} [Push=true] - Pushes the skills to the server if TRUE
 * @returns {void} - Nothing
 */
declare function SkillChange(C: Character, SkillType: SkillType, SkillLevel: number, Progress: number, Push?: boolean): void;
/**
 * Loads the skill data from the server on login
 * @param {readonly Skill[]} NewSkill - The player skills array sent by the server
 * @returns {void} - Nothing
 */
declare function SkillLoad(NewSkill: readonly Skill[]): void;
/**
 * Get a specific skill modifier from a character
 * @param {Character} C
 * @param {SkillType} SkillType
 */
declare function SkillGetModifier(C: Character, SkillType: SkillType): number;
/**
 * Get the timeout value on a skill modifier
 *
 * @param {Character} C - The character to get skills from
 * @param {SkillType} SkillType
 * @returns At which (absolute) time will the modifier expire
 */
declare function SkillGetModifierDuration(C: Character, SkillType: SkillType): number;
/**
 * Set a specific skill modifier to apply for a given duration on the target character.
 * @param {Character} C - The character to change the modifier on
 * @param {SkillType} SkillType - The skill the modifier applies to
 * @param {number} Value - The new value of the modifier
 * @param {number} Duration - The length of the modifier effect, in ms
 * @param {boolean} [Push=true] - Pushes the skills to the server if TRUE
 * @returns {boolean} true if the new value was valid, false if it got capped.
 */
declare function SkillSetModifier(C: Character, SkillType: SkillType, Value: number, Duration: number, Push?: boolean): boolean;
/**
 * Get a specific skill level from a character WITH the current modifier applied
 * @param {Character} C - Character for which we want to query a skill
 * @param {SkillType} SkillType - Name of the skill to get the value of
 * @returns {number} - Current level for the given skill.
 */
declare function SkillGetLevel(C: Character, SkillType: SkillType): number;
/**
 * Get a specific skill level from a character WITHOUT the modifier applied
 * @param {Character} C - Character for which we want to query a skill
 * @param {SkillType} SkillType - Name of the skill to get the value of
 * @returns {number} - Current real level for the given skill.
 */
declare function SkillGetLevelReal(C: Character, SkillType: SkillType): number;
/**
 * Get a specific skill progress from a character
 * @param {Character} C - Character for which we want to query a skill
 * @param {SkillType} SkillType - Name of the skill to get the progress of
 * @returns {number} - Current progress for the given skill.
 */
declare function SkillGetProgress(C: Character, SkillType: SkillType): number;
/**
 * Add progress to a skill, the skill progresses slower for each level, takes into account cheaters version.
 * @param {Character} C - The character to get skills from
 * @param {SkillType} SkillType - Name of the skill to add progress to
 * @param {number} Progress - Progress to be made before the ratios are applied
 * @returns {void} - Nothing
 */
declare function SkillProgress(C: Character, SkillType: SkillType, Progress: number): void;
/**
 * Sets the ratio % of a skill that's going to be used by the player
 * @param {Character} C - The character to get the skill from
 * @param {SkillType} SkillType - Name of the skill to get the value of
 * @param {number} Ratio - The ratio to set for a given skill (0 to 1)
 * @param {boolean} [Push=true] - Pushes the skills to the server if TRUE
 */
declare function SkillSetRatio(C: Character, SkillType: SkillType, Ratio: number, Push?: boolean): void;
/**
 * Gets the ratio % of effectiveness of a skill for a character
 * @param {Character} C - The character to get the skill from
 * @param {SkillType} SkillType - Name of the skill to get the value of
 * @returns {number} - The current active ratio for the given skill
 */
declare function SkillGetRatio(C: Character, SkillType: SkillType): number;
/**
 * Gets a skill level with the current ratio applied to it, if the current skill has a % modifier.
 * @param {Character} C - The character to get the skill from
 * @param {SkillType} SkillType - Name of the skill to get the value of
 * @returns {number} - The skill level with the ratio % applied
 */
declare function SkillGetWithRatio(C: Character, SkillType: SkillType): number;
declare var SkillModifier: number;
declare var SkillModifierMax: number;
declare var SkillModifierMin: number;
declare var SkillLevelMaximum: number;
declare var SkillLevelMinimum: number;
declare var SkillProgressMax: number;
/** @type {SkillType[]} */
declare var SkillValidSkills: SkillType[];
