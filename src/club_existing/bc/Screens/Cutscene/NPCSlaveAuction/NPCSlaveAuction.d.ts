/**
 * Loads the slave auction cutscene by creating the NPCs and setting the stage.
 * @returns {void} - Nothing
 */
declare function NPCSlaveAuctionLoad(): void;
/**
 * Runs and draws the slave auction cutscene
 * @returns {void} - Nothing
 */
declare function NPCSlaveAuctionRun(): void;
/**
 * Handles clicks during the slave auction cutscene. Clicking anywhere on the screen advances the cutscene. At the end of the cutscene, the player is sent back to the main hall and private NPCs are saved.
 * @returns {void} - Nothing
 */
declare function NPCSlaveAuctionClick(): void;
declare var NPCSlaveAuctionBackground: string;
/** @type {null | NPCCharacter} */
declare var NPCSlaveAuctionVendor: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCSlaveAuctionSlave: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCSlaveAuctionMistress: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCSlaveAuctionGirlLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NPCSlaveAuctionGirlRight: null | NPCCharacter;
declare var NPCSlaveAuctionAmount: number;
