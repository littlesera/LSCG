/**
 * Sets a specific trait for a NPC
 * @param {NPCCharacter} C - NPC to set the trait for
 * @param {string} TraitName - Name of the trait to set
 * @param {number} TraitValue - Value of the trait to set
 * @returns {void} - Nothing
 */
declare function NPCTraitSet(C: NPCCharacter, TraitName: string, TraitValue: number): void;
/**
 * Generate random traits for a NPC (70% odds for each traits, can switch on both sides, strength is from 1 to 100). Will generate at least one trait.
 * @param {NPCCharacter} C - NPC to generate the trait for
 * @returns {void} - Nothing
 */
declare function NPCTraitGenerate(C: NPCCharacter): void;
/**
 * Get the opposite trait of a specified trait.
 * @param {string} Trait - Name of the trait to find the opposite of.
 * @returns {string} - Name of the opposite trait.
 */
declare function NPCTraitReverse(Trait: string): string;
/**
 * Returns the weight value of the specified option (The higher the value, the higher the chances the option will be picked, an opposite trait will always result as an option that's not picked)
 * @param {string} Dialog - Specified dialog line with the affecting traits.
 * @param {readonly NPCTrait[]} Trait - List of traits of the NPC.
 * @returns {number} - Weight of the dialog option
 */
declare function NPCTraitGetOptionValue(Dialog: string, Trait: readonly NPCTrait[]): number;
/**
 * Finds and keeps the best possible option for a specified NPC dialog group. A group is a list of similar options where each option is influenced by a specified trait.
 * @param {NPCCharacter} C - NPC to get the dialog of
 * @param {string} Group - Name of the dialog group to look for
 * @returns {void} - Nothing.
 */
declare function NPCTraitKeepBestOption(C: NPCCharacter, Group: string): void;
/**
 * Picks the dialog group option that fits mosts with the NPC traits
 * @param {Character} C - NPC to get the dialog options of
 * @returns {void} - Nothing.
 */
declare function NPCTraitDialog(C: Character): void;
/**
 * Sets the arousal settings for a NPC if it's not already done
 * @param {Character} C - NPC to set the arousal stats of
 * @returns {void} - Nothing.
 */
declare function NPCArousal(C: Character): void;
/**
 * Returns the trait value of an NPC. If the opposite trait is found, it will return a negative value.
 * @param {NPCCharacter} C - NPC to get the trait of
 * @param {string} TraitType - Name of the trait to get the value of
 * @returns {number} - Value of the trait, returns 0 if it was never set.
 */
declare function NPCTraitGet(C: NPCCharacter, TraitType: string): number;
/**
 * Adds a new event in a specified NPC log or updates an existing event if it was previously logged.
 * @param {NPCCharacter} C - NPC for which to add the event to
 * @param {string} EventName - Name of the even to add
 * @param {number} EventValue - Value of the even to add (time in ms)
 * @returns {void} - Nothing
 */
declare function NPCEventAdd(C: NPCCharacter, EventName: string, EventValue: number): void;
/**
 * Deletes a specified NPC event from the log
 * @param {NPCCharacter} C - NPC for which to delete the event
 * @param {string} EventName - Name of the even to delete
 * @returns {void} - Nothing
 */
declare function NPCEventDelete(C: NPCCharacter, EventName: string): void;
/**
 * Returns a specified NPC event value.
 * @param {NPCCharacter} C - NPC to get the event value of
 * @param {string} EventName - Name of the even to get the value of
 * @returns {number} - Value of the event as the time in ms, returns 0 if it was never logged
 */
declare function NPCEventGet(C: NPCCharacter, EventName: string): number;
/**
 * For longer events like a collaring, the serious trait will dictate the time (1 day if playful, 3 days if nothing, 7 days if serious)
 * @param {NPCCharacter} C - NPC to get the event delay of
 * @returns {number} - Delay required for the event.
 */
declare function NPCLongEventDelay(C: NPCCharacter): number;
/**
 * The horny / frigid trait comes into play when a NPC decides if it can take the player as a lover. (1 week if horny, 2 weeks if nothing, 4 weeks if frigid)
 * @param {NPCCharacter} C - NPC to get the event delay of
 * @returns {number} - Delay required for the lover event.
 */
declare function NPCLongLoverEventDelay(C: NPCCharacter): number;
/**
 * Changes the love factor for a specified NPC, will stay within the -100 to 100 range
 * @param {NPCCharacter} C - NPC to change the love factor of
 * @param {number} LoveFactor - Amount to add to the current love factor (can be negative).
 * @returns {void} - Nothing
 */
declare function NPCLoveChange(C: NPCCharacter, LoveFactor: number): void;
/**
 * Raises the love factor progressively with interaction time
 * @returns {void} - Nothing
 */
declare function NPCInteraction(): void;
/**
 * List for all possible pairs of NPC traits. A pair defines opposites.
 * @constant
 * @type {[string, string][]}
 */
declare var NPCTrait: [string, string][];
