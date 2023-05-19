/**
 * Sets when the next bid will occur. It varies from 5 to 15 seconds, the auction gets slower and there are less bids the higher the price is.
 * @returns {void} - Nothing
 */
declare function PlayerAuctionSetNextBidTime(): void;
/**
 * Creates a new customer to buy the player
 * @param {number} Index - The index of the customer from the NPC table
 * @returns {void} - Nothing
 */
declare function PlayerAuctionAddCustomer(Index: number): void;
/**
 * Loads the player auction mini game by setting the global variables and loading the NPCs required
 * @returns {void} - Nothing
 */
declare function PlayerAuctionLoad(): void;
/**
 * Runs the player auction mini game by drawing the characters and related text on screen.
 * @returns {void} - Nothing
 */
declare function PlayerAuctionRun(): void;
/**
 * Handles click events during the player auction minigame. The player can plead or end the auction.
 * @returns {void} - Nothing
 */
declare function PlayerAuctionClick(): void;
declare var PlayerAuctionBackground: string;
/** @type {null | NPCCharacter[]} */
declare var PlayerAuctionCustomer: null | NPCCharacter[];
declare var PlayerAuctionBidCurrent: number;
declare var PlayerAuctionBidTime: number;
declare var PlayerAuctionBidNextTime: number;
declare var PlayerAuctionBidAmount: number;
declare var PlayerAuctionPlead: number;
declare var PlayerAuctionSilenceMode: boolean;
declare var PlayerAuctionEnd: boolean;
