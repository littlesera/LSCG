/**
 * Sets when the next bid will occur. It varies from 5 to 15 seconds, the auction gets slower and there are less bids the higher the price is.
 * @returns {void} - Nothing
 */
declare function SlaveAuctionSetNextBidTime(): void;
/**
 * Loads the slave auction mini game by setting the global variables and loading the NPCs required
 * @returns {void} - Nothing
 */
declare function SlaveAuctionLoad(): void;
/**
 * Runs the slave auction mini game by drawing the characters and related text on screen.
 * @returns {void} - Nothing
 */
declare function SlaveAuctionRun(): void;
/**
 * Handles click events during the slave auction minigame. The player can bid or end the auction.
 * @returns {void} - Nothing
 */
declare function SlaveAuctionClick(): void;
declare function SlaveAuctionKeyDown(event: KeyboardEvent): boolean;
declare var SlaveAuctionBackground: string;
/** @type {null | NPCCharacter} */
declare var SlaveAuctionVendor: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var SlaveAuctionSlave: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var SlaveAuctionCustomerLeft: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var SlaveAuctionCustomerRight: null | NPCCharacter;
declare var SlaveAuctionBidCurrent: string;
declare var SlaveAuctionBidTime: number;
declare var SlaveAuctionBidNextTime: number;
declare var SlaveAuctionBidAmount: number;
declare var SlaveAuctionEnd: boolean;
