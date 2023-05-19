/**
 * Checks, if the magic show currently has the given state
 * 1 - No Show
 * 2 - Before Assist Redress
 * 3 - After Assist Redress
 * 4 - Assistant is bound
 * 5 - Assistant is released
 * 6 - To Sing a Song
 * 7 - To Bind for Change
 * 8 - After Change
 * @param {number} QState - The state that is queried
 * @returns {boolean} - Returns true, if the queried state matches with the current state of the magic show, flase otherwise
 */
declare function MagicShowIsState(QState: number): boolean;
/**
 * Checks, if the magician's assistant has been released
 * @returns {boolean} - Returns true, if the assistant has been released, false otherwise
 */
declare function MagicAssistantIsReleased(): boolean;
/**
 * Checks, if the magician is bound by the minal required number of items (gag, arms, feet, legs, head)
 * @param {number} MinItem - The minimal number of items that must be used on the magician
 * @returns {boolean} - Returns true, if the required number of items is reached or exceeded, false otherwise
 */
declare function MagicRestrainPerformerMinItem(MinItem: number): boolean;
/**
 * Checks, if the magician's assistant is bound by the minal required number of items (gag, arms, feet, legs, head)
 * @param {number} MinItem - The minimal number of items that must be used on the magician's assistant
 * @returns {boolean} - Returns true, if the required number of items is reached or exceeded, false otherwise
 */
declare function MagicRestrainAssistantMinItem(MinItem: number): boolean;
/**
 * Checks wether the assistant is restrained and should redress
 * @returns {boolean} - Returns true, if the assistant should redress and is currently restrained
 */
declare function MagicAssistantIsDressRestrain(): boolean;
/**
 * Checks wether the assistant is free and should redress
 * @returns {boolean} - Returns true, if the assistant should redress and is currently free
 */
declare function MagicAssistantIsntDressRestrain(): boolean;
/**
 * Checks, wether a given character is bound by the minal required number of items (gag, arms, feet, legs, head)
 * @param {Character} C - The character to check
 * @param {number} MinItem - The minimal required number of items
 * @returns {boolean} - - Returns true, if the required number of items is reached or exceeded, false otherwise
 */
declare function MagicRestrainMinItem(C: Character, MinItem: number): boolean;
/**
 * Loads the room characters, saves their inventories and starts the show
 * @returns {void} - Nothing
 */
declare function MagicLoad(): void;
/**
 * Runs the magic screen, draws the player, the magician and the assistant as well as all required buttons
 * @returns {void} - Nothing
 */
declare function MagicRun(): void;
/**
 * Handles the click events in the magic screen
 * @returns {void} - Nothing
 */
declare function MagicClick(): void;
/**
 * Changes the dresses of the player and the assistants and progresses the show state
 * @returns {void} - Nothing
 */
declare function MagicTrickChangeDresses(): void;
/**
 * Changes the dresses of player and assistant back and goes back to state 1
 * @returns {void} - Nothing
 */
declare function MagicTrickChangeDressesBack(): void;
/**
 * Randomly dresses the assistant and sets the show's state to 3
 * @returns {void} - Nothing
 */
declare function MagicAssistantDress(): void;
/**
 * Starts the magic show and sets all counters to 0
 * @returns {void} - Nothing
 */
declare function MagicShowStart(): void;
/**
 * Adds money to the player's account. The longer she performs, the more money she earns
 * @returns {void} - Nothing
 */
declare function MagicShowIncomeAdd(): void;
/**
 * When the player leaves the show, she get's her money and is redressed in the things she wore at the start of the show
 * @returns {void} - Nothing
 */
declare function MagicShowPayoff(): void;
/**
 * Randomly selects the next magic trick and prepares the appropriate dialog
 * @returns {void} - Nothing
 */
declare function MagicSelectTrick(): void;
/**
 * Copies the restraints currently on the magician randomly
 * either to the player or the assistant and gets the appropriate dialog option
 * @returns {void} - Nothing
 */
declare function MagicTrickChangeBinds(): void;
/**
 * Copies the restraints from the assistant to the player and
 * picks the appropriate dialog options
 * @returns {void} - Nothing
 */
declare function MagicTrickBindAsstant(): void;
/**
 * Binds the player lightly and places her in a wooden box
 * @returns {void} - Nothing
 */
declare function MagicTrickBoxTiedLight(): void;
/**
 * Binds the player heavily and places her in a wooden box
 * @returns {void} - Nothing
 */
declare function MagicTrickBoxTiedHeavy(): void;
/**
 * Places the player in the water filled milk can
 * @returns {void} - Nothing
 */
declare function MagicTrickBoxMilkCan(): void;
/**
 * Places the player in the water torture cell
 * @returns {void} - Nothing
 */
declare function MagicTrickBoxWaterCell(): void;
/**
 * If the player chooses to keep the magic coins, add them to her account
 * @returns {void} - Nothing
 */
declare function MagicTrickGetCoin(): void;
/**
 * If the player has to sing a song end the dialog and wait, what the player does with the assistant
 * @returns {void} - Nothing
 */
declare function MagicSongLeavePerformer(): void;
/**
 * Bind the player and the assistant during the 'Sweet, sweet Gwendoline" song
 * @returns {void} - Nothing
 */
declare function MagicSongGwendoyn(): void;
/**
 * The player earns money with the performance of "Bad girl"
 * @returns {void} - Nothing
 */
declare function MagicSongBadGirl(): void;
/**
 * Change the show's state after the assistant was released
 * @returns {void} - Nothing
 */
declare function MagicAssistantRelese(): void;
/**
 * Dress the assistant in the player's clothes
 * @returns {void} - Nothing
 */
declare function MagicTrickAsstantChange(): void;
/**
 * Ends the show. Release everybody, dress everybody back to their clothes
 * from the start and bring the player back to the mein hall
 * @returns {void} - Nothing
 */
declare function MagicTrickEndPerformance(): void;
/**
 * Removes a defined set of restraints from the character. If the adult baby harness chains are removed,
 * mittens and harness are removed as well
 * @param {Character} C - The character whose items should be removed
 * @returns {void} - Nothing
 */
declare function MagicRestrainRemove(C: Character): void;
/**
 * Copies restraints from one character to another
 * @param {Character} FromC - The source for all restraints
 * @param {Character} ToC - The target of all restraints
 * @returns {void} - Nothing
 */
declare function MagicRestrainCopyTransfer(FromC: Character, ToC: Character): void;
declare var MagicBackground: string;
/** @type {null | NPCCharacter} */
declare var MagicPerformer: null | NPCCharacter;
/** @type {null | Item[]} */
declare var MagicPerformerAppearance: null | Item[];
/** @type {null | NPCCharacter} */
declare var MagicAssistant: null | NPCCharacter;
/** @type {null | Item[]} */
declare var MagicAssistantAppearance: null | Item[];
/** @type {null | Item[]} */
declare var MagicPlayerAppearance: null | Item[];
/** @type {null | string} */
declare var MagicTrick: null | string;
declare var MagicTrickList: string[];
/** @type {AssetGroupName[]} */
declare var MagicRestraintList: AssetGroupName[];
declare var MagicTrickCounter: number;
declare var MagicShowIncome: number;
declare var MagicShowState: number;
