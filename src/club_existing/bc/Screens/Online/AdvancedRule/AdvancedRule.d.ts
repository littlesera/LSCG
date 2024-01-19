/**
 * Loads the advanced rule screen
 * @returns {void} - Nothing
 */
declare function AdvancedRuleLoad(): void;
/**
 * Starts the advanced rule screen and loads it
 * @param {LogNameAdvanced} RuleType
 * @returns {void} - Nothing
 */
declare function AdvancedRuleOpen(RuleType: LogNameAdvanced): void;
/**
 * Draws the advanced rule text and check boxes
 * @returns {void} - Nothing
 */
declare function AdvancedRuleRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function AdvancedRuleClick(): void;
/**
 * Handles exiting from the screen, updates the sub rules
 * @returns {void} - Nothing
 */
declare function AdvancedRuleExit(): void;
declare var AdvancedRuleBackground: string;
/** @type {null | Character | NPCCharacter} */
declare var AdvancedRuleTarget: null | Character | NPCCharacter;
/** @type {"" | LogNameAdvanced} */
declare var AdvancedRuleType: "" | LogNameAdvanced;
/** @type {string[]} */
declare var AdvancedRuleOption: string[];
declare var AdvancedRuleSelection: string;
