/**
 * Loads the forbidden words screen, fetches the word list from the current character rules
 * @returns {void} - Nothing
 */
declare function ForbiddenWordsLoad(): void;
/**
 * Starts the forbidden words screen and loads it
 * @returns {void} - Nothing
 */
declare function ForbiddenWordsOpen(RuleType: any): void;
/**
 * Draws the forbidden words text and check boxes
 * @returns {void} - Nothing
 */
declare function ForbiddenWordsRun(): void;
/**
 * Handles the click events.  Called from CommonClick()
 * @returns {void} - Nothing
 */
declare function ForbiddenWordsClick(): void;
/**
 * Handles exiting from the screen, updates the sub rules
 * @returns {void} - Nothing
 */
declare function ForbiddenWordsExit(): void;
declare var ForbiddenWordsBackground: string;
/** @type {null | Character } */
declare var ForbiddenWordsTarget: null | Character;
/** @type {string[]} */
declare var ForbiddenWordsList: string[];
declare var ForbiddenWordsOffset: number;
declare var ForbiddenWordsConsequence: string;
declare var ForbiddenWordsConsequenceList: string[];
