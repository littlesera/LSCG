/**
 * Analyzes a phrase to determine if it is a full emote. A full emote is a phrase wrapped in "()"
 * @param {string} D - A phrase
 * @returns {boolean} - Returns TRUE if the current speech phrase is a full emote (all between parentheses)
 */
declare function SpeechFullEmote(D: string): boolean;
/**
 * Returns the gag level corresponding to the given effect array, or 0 if the effect array contains no gag effects
 * @param {readonly EffectName[]} Effect - The effect to lookup the gag level for
 * @return {number} - The gag level corresponding to the given effects
 */
declare function SpeechGetEffectGagLevel(Effect: readonly EffectName[]): number;
/**
 * Gets the cumulative gag level of an asset group. Each gagging effect has a specific numeric value. The following
 * Effect arrays are used for the calculation:
 *     - Item.Property.Effect
 *     - Item.Asset.Effect
 *     - Item.Asset.Group.Effect
 * @param {Character} C - The character, whose assets are used for the check
 * @param {readonly AssetGroupItemName[]} AssetGroups - The name of the asset groups to look through
 * @returns {number} - Returns the total gag effect of the character's assets
 */
declare function SpeechGetGagLevel(C: Character, AssetGroups: readonly AssetGroupItemName[]): number;
/**
 * Gets the cumulative gag level of a character
 * @param {Character} C - The character, whose assets are used for the check
 * @param {boolean} [NoDeaf=false] - Whether or not deafness affects the dialogue
 * @returns {number} - Returns the total gag effect of the character's assets
 */
declare function SpeechGetTotalGagLevel(C: Character, NoDeaf?: boolean): number;
/**
 * Processes the character's speech, anything between parentheses isn't touched. Effects alter the speech differently according to a character's language. Effects that can be applied are the following: gag talk, baby talk and stuttering.
 * @param {Character} C - The character, whose dialog might need to be altered
 * @param {string} CD - The character's dialog to alter
 * @param {boolean} [NoDeaf=false] - Whether or not deafness affects the dialogue
 * @returns {string} - Returns the dialog after speech effects were processed (Garbling, Stuttering, Baby talk)
 */
declare function SpeechGarble(C: Character, CD: string, NoDeaf?: boolean): string;
/**
 * A PRNG(Pseudo random number generator) helper to generate random number sequence by seed.
 * Stole this function and the function below from {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript stackoverflow}
 * @param {number} a - seed 1
 * @param {number} b - seed 2
 * @param {number} c - seed 3
 * @param {number} d - seed 4
 * @returns {() => number} - The function where it could be used to do PRNG magic.
 */
declare function sfc32(a: number, b: number, c: number, d: number): () => number;
/**
 * Random seeding tool to generate random seeding sequence that is able to be used.
 * This allows the random result always be the same when the seed is the same.
 * (This implementation is needed because dialog refreshes every frame, we have to generate garbled text that are the same.)
 * (Otherwise it will just keep flashing and changing the text.)
 *
 * @param {string} seed - The seed to generate random numbers.
 * @returns {() => number} - The function where it could be used to do PRNG magic.
 */
declare function randomSeeding(seed: string): () => number;
/**
 * Test if the current character parsed in is a Chinese character, and client user is using Chinese.
 * This is to prevent garbling Japanese kanji.
 * But for chatroom use case where two clients may have different languages
 * I don't have a definite solution yet, so let's do this for now to resolve the options not showing up first.
 * @param {string} character
 * @returns {boolean} - true if is Chinese character, false otherwise.
 */
declare function isChineseCharacter(character: string): boolean;
/**
 * Get the character and determine if it is a Chinese character, if it does, do random garbling according to the gagLevel.
 * This is only a hotfix for the issue where Chinese characters are not displayed because they are not properly garbled,
 * when showing as options.
 *
 * @param {string} character - The character needs to be garbled.
 * @param {number} gagLevel - Gag level.
 *
 * @return {string} - The character that being garbled.
 */
declare function doChineseGarbling(character: string, gagLevel: number): string;
/**
 * A helper method to check if the character parsed in is one of the following: ' .?!~-。？！，'
 * Note: last 4 punctuations are commonly used in CJK languages.
 * @param {string} character - The character needs to be checked.
 * @returns {boolean} - true if containing one of the following: ' .?!~-', otherwise false.
 */
declare function isStandardPunctuationOrSpace(character: string): boolean;
/**
 * A helper method to check if the character parsed in is one of the following: ' .?!~-_'"。？！，'
 * This one was created for lower gag levels or baby talk. So any and all punction can be added to it.
 * @param {string} character - The character needs to be checked.
 * @returns {boolean} - true if containing one of the following: ' .?!~-_'"。？！，', otherwise false.
 */
declare function isAnyPunctuationOrSpace(character: string): boolean;
/**
 * Helper method to strip diacritics from characters.
 * @param {string} character - character that needs to be stripped.
 * @param {Number} gagEffect - The current gag effect level.
 * @returns {string} - character that being stripped after garbling.
 */
declare function stripDiacriticsFromCharacter(character: string, gagEffect: number): string;
/**
 * check if the character is one of the following: áàãâéèêíìîõóòôúùûñç
 * @param {string} character - The character needs to be checked.
 * @returns {boolean} - true if is one of the above, otherwise false.
 */
declare function isAccentedOrLatinCharacter(character: string): boolean;
/**
 * Returns the index where the OOC part of a message starts as well as it's length.
 * Attention: Currently this function does not detect the end of OOC messages properly to mimic the old behaviour before it was introduced. So "length" ALWAYS ranges from the opening parenthesis to the end of the message!!!
 * @param {string} Message - The message to check
 * @returns {{ start: number, length: number }[]} Contains the starting position of each detected OOC section of Message (Without OOC section, this references past the end of Message); length - contains the length of the OOC section of Message
 */
declare function SpeechGetOOCRanges(Message: string): {
    start: number;
    length: number;
}[];
/**
 * Convenience function to check weither a character of a message is within the passed OOC range.
 * Attention: Currently this function does not detect the end of OOC messages properly to mimic the old behaviour before it was introduced. So "length" ALWAYS ranges from the opening parenthesis to the end of the message!!!
 * @param {number} index - The index of the character to check
 * @param {{ start: number, length: number }[]} oocRanges - The OOC Ranges to check
 * @returns {boolean} Returns true if the position passed in index is within a entry in oocRange
 */
declare function SpeechIndexInOocRange(index: number, oocRanges: {
    start: number;
    length: number;
}[]): boolean;
/**
 * The core of the speech garble function, usable without being tied to a specific character
 * @param {number} GagEffect - The gag level of the speech
 * @param {string} CD - The character's dialog to alter
 * @param {boolean} IgnoreOOC
 * @return {string} - Garbled text
 */
declare function SpeechGarbleByGagLevel(GagEffect: number, CD: string, IgnoreOOC?: boolean): string;
/**
 * Makes the character stutter if she has a vibrating item and/or is aroused. Stuttering based on arousal is toggled in the character's settings.
 * @param {Character} C - The character, whose dialog might need to be altered
 * @param {string} CD - The character's dialog to alter
 * @returns {string} - Returns the dialog after the stuttering factor was applied
 */
declare function SpeechStutter(C: Character, CD: string): string;
/**
 * Makes the character talk like a Baby when she has drunk regression milk
 * @param {Character} C - The character, whose dialog needs to be altered
 * @param {string} CD - The character's dialog to alter
 * @returns {string} - Returns the dialog after baby talk was applied
 */
declare function SpeechBabyTalk(C: Character, CD: string): string;
/**
 * Anonymize character names from a string, replacing them with "Someone".
 *
 * Used as part of sensory-deprivation processing.
 *
 * @param {string} msg
 * @param {readonly Character[]} characters
 */
declare function SpeechAnonymize(msg: string, characters: readonly Character[]): string;
declare const chineseRegex: RegExp;
declare const chineseRandomGarbledSound: string[];
declare namespace SpeechGagLevelLookup {
    let GagTotal4: 20;
    let GagTotal3: 16;
    let GagTotal2: 12;
    let GagTotal: 8;
    let GagVeryHeavy: 7;
    let GagHeavy: 6;
    let GagMedium: 5;
    let GagNormal: 4;
    let GagEasy: 3;
    let GagLight: 2;
    let GagVeryLight: 1;
}
