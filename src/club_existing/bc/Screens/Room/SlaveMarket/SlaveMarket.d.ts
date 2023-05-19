/**
 * Checks if an auction can be started.
 * @returns {boolean} - Returns TRUE if the player has room in her private room and is dominant enough to participate in an auction
 */
declare function SlaveMarketCanStartAuction(): boolean;
/**
 * Checks if an auction cannot be started due to being too submissive.
 * @returns {boolean} - Returns TRUE if the player is not dominant enough to participate in an auction
 */
declare function SlaveMarketCannotStartAuctionSubmissive(): boolean;
/**
 * Checks if an auction cannot be started due to lack of space in the player's private room
 * @returns {boolean} - Returns TRUE if the player is dominant enough to participate in an auction, but does not have space in her private room
 */
declare function SlaveMarketCannotStartAuctionRoom(): boolean;
/**
 * Checks if the player can be auctioned.  Must not be owned, must be submissive, must not be restrained, must have space in room and must not have been auctioned in the last seven days
 * @returns {boolean} - Returns TRUE if the player can be auctioned
 */
declare function SlaveMarketCanBeAuctioned(): boolean;
/**
 * Loads the Slave Market room, generates the Mistress and slave
 * @returns {void} - Nothing
 */
declare function SlaveMarketLoad(): void;
/**
 * Runs and draws the slave market, the screen can be used to search for a daily job.
 * @returns {void} - Nothing
 */
declare function SlaveMarketRun(): void;
/**
 * Handles clicks in the slave market.
 * @returns {void} - Nothing
 */
declare function SlaveMarketClick(): void;
/**
 * Triggered when the auction starts, the mini game is launched
 * @returns {void} - Nothing
 */
declare function SlaveMarketAuctionStart(): void;
/**
 * Triggered when the auction ends. If the player was the last bidder, she buys the slave and gets in a dialog with her, otherwise she returns to the main area of the slave market
 * @returns {void} - Nothing
 */
declare function SlaveMarketAuctionEnd(): void;
/**
 * Generates a new slave for the slave market
 * @returns {void} - Nothing
 */
declare function SlaveMarketNewSlave(): void;
/**
 * Triggered when the player brings the slave to her room, the player is sent to her private room with the NPC.
 * @returns {void} - Nothing
 */
declare function SlaveMarketVisitRoom(): void;
/**
 * Triggered when the slave training start. Sets the NPC and dialog before sending the player to an empty room with the trainee.
 * @returns {void} - Nothing
 */
declare function SlaveMarketTrainingStart(): void;
/**
 * Triggered when the auctioned player gets stripped and chained
 * @returns {void} - Nothing
 */
declare function SlaveMarketAuctionPlayerStrip(): void;
/**
 * Triggered when the player auction starts
 * @returns {void} - Nothing
 */
declare function SlaveMarketAuctionPlayerStart(): void;
/**
 * Triggered when the player auction ends, we create the buyer and activate her
 * @returns {void} - Nothing
 */
declare function SlaveMarketPlayerAuctionEnd(): void;
/**
 * Triggered when the player auction has ended and both characters are transferred to the player room
 * @returns {void} - Nothing
 */
declare function SlaveMarketPlayerAuctionTransfer(): void;
declare var SlaveMarketBackground: string;
/** @type {null | NPCCharacter} */
declare var SlaveMarketMistress: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var SlaveMarketSlave: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var SlaveMarketSlaveToTrain: null | NPCCharacter;
declare var SlaveMarketTrainingBackgroundList: string[];
/** @type {null | NPCCharacter} */
declare var SlaveMarketBuyer: null | NPCCharacter;
