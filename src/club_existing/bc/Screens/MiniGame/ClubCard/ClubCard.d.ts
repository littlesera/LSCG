/**
 * Returns TRUE if the current game is online
 * @returns {boolean} - Nothing
 */
declare function ClubCardIsOnline(): boolean;
/**
 * Returns TRUE if the BC Player is a player in the current Club Card game
 * @returns {boolean} - Nothing
 */
declare function ClubCardIsPlaying(): boolean;
/**
 * Adds a text entry to the game log
 * @param {string} LogEntry - The club card player
 * @param {boolean} Push - The club card player
 * @returns {void} - Nothing
 */
declare function ClubCardLogAdd(LogEntry: string, Push?: boolean): void;
/**
 * Publishes an action to the log and replaces all the tags
 * @param {string} Text - The text to fetch
 * @param {ClubCardPlayer|null} CCPlayer - The source player
 * @param {number|null} Amount - The amount linked to the action
 * @param {ClubCard|null} Card - The card linked to the action
 * @returns {void} - Nothing
 */
declare function ClubCardLogPublish(Text: string, CCPlayer?: ClubCardPlayer | null, Amount?: number | null, Card?: ClubCard | null): void;
/**
 * Creates a popop in the middle of the board that pauses the game
 * @param {string} Mode - The popup mode "DECK", "TEXT" or "YESNO"
 * @param {string|null} Text - The text to display
 * @param {string|null} Button1 - The label of the first button
 * @param {string|null} Button2 - The label of the second button
 * @param {string|null} Function1 - The function of the first button
 * @param {string|null} Function2 - The function of the second button
 * @returns {void} - Nothing
 */
declare function ClubCardCreatePopup(Mode: string, Text?: string | null, Button1?: string | null, Button2?: string | null, Function1?: string | null, Function2?: string | null): void;
/**
 * Destroys the current popup
 * @returns {void} - Nothing
 */
declare function ClubCardDestroyPopup(): void;
/**
 * Returns TRUE if the card is a liability (should be played on the opponent side)
 * @param {ClubCard} Card - The card to evaluate
 * @returns {boolean} - TRUE if the card is a liability
 */
declare function ClubCardIsLiability(Card: ClubCard): boolean;
/**
 * Gets the opponent of the parameter player or the player that's not on it's turn if null
 * @param {ClubCardPlayer|null} CCPlayer - The club card player or null
 * @returns {ClubCardPlayer} - The opponent
 */
declare function ClubCardGetOpponent(CCPlayer?: ClubCardPlayer | null): ClubCardPlayer;
/**
 * Adds money to the club card player stats
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {Number} Amount - The amount to add
 * @returns {void} - Nothing
 */
declare function ClubCardPlayerAddMoney(CCPlayer: ClubCardPlayer, Amount: number): void;
/**
 * Adds fame to the club card player stats, can trigger a victory
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {Number} Amount - The amount to add
 * @returns {void} - Nothing
 */
declare function ClubCardPlayerAddFame(CCPlayer: ClubCardPlayer, Amount: number): void;
/**
 * Raises the level of player
 * @param {Object} CCPlayer - The club card player
 * @returns {void} - Nothing
 */
declare function ClubCardUpgradeLevel(CCPlayer: any): void;
/**
 * Returns TRUE if a card (by name) is currently present on a board
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {string} CardName - The name of the card
 * @returns {boolean} - TRUE if at least one card with that name is present
 */
declare function ClubCardNameIsOnBoard(CCPlayer: ClubCardPlayer, CardName: string): boolean;
/**
 * Returns TRUE if a card (by group) is currently present on a board
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {string} GroupName - The name of the card group
 * @returns {boolean} - TRUE if at least one card from that group is present
 */
declare function ClubCardGroupIsOnBoard(CCPlayer: ClubCardPlayer, GroupName: string): boolean;
/**
 * Returns the number of cards of a specific group found on a board
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {string} GroupName - The name of the card group
 * @returns {number} - The number of cards from that group on the board
 */
declare function ClubCardGroupOnBoardCount(CCPlayer: ClubCardPlayer, GroupName: string): number;
/**
 * Removes a card from a player board
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {ClubCard} Card - The card object to remove
 * @returns {void} - Nothing
 */
declare function ClubCardRemoveFromBoard(CCPlayer: ClubCardPlayer, Card: ClubCard): void;
/**
 * Removes a card from a player time events
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {string} CardName - The card object to remove
 * @returns {void} - Nothing
 */
declare function ClubCardRemoveFromEventByName(CCPlayer: ClubCardPlayer, CardName: string): void;
/**
 * Removes all cards that belong to a group (ex: Liability) from a board
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {String} GroupName - The group name to remove
 * @returns {void} - Nothing
 */
declare function ClubCardRemoveGroupFromBoard(CCPlayer: ClubCardPlayer, GroupName: string): void;
/**
 * Shuffles an array of cards
 * @param {Array} array - The array of cards to shuffle
 * @returns {Array} - The shuffled cards
 */
declare function ClubCardShuffle(array: any[]): any[];
/**
 * Sets the glowing border for a card
 * @param {ClubCard} Card - The card that must glow
 * @param {string} Color - The color of the glow
 * @returns {void} - Nothing
 */
declare function ClubCardSetGlow(Card: ClubCard, Color: string): void;
/**
 * Draw cards from the player deck into it's hand
 * @param {ClubCardPlayer} CCPlayer - The club card player that draws the cards
 * @param {number|null} Amount - The amount of cards to draw, 1 if null
 * @returns {void} - Nothing
 */
declare function ClubCardPlayerDrawCard(CCPlayer: ClubCardPlayer, Amount?: number | null): void;
/**
 * Removes cards from a player hand
 * @param {ClubCardPlayer} CCPlayer - The club card player that discards
 * @param {number} Amount - The amount of cards to discard
 * @returns {void} - Nothing
 */
declare function ClubCardPlayerDiscardCard(CCPlayer: ClubCardPlayer, Amount: number): void;
/**
 * Builds a deck array of object from a deck array of numbers
 * @param {Array} InDeck - The array of number deck
 * @returns {Array} - The resulting deck
 */
declare function ClubCardLoadDeck(InDeck: any[]): any[];
/**
 * Returns the index of the player in the ClubCardPlayer array
 * @returns {number} - The array index position
 */
declare function ClubCardGetPlayerIndex(): number;
/**
 * Builds a deck array of object from a deck array of numbers
 * @param {number} DeckNum - The array of number deck
 * @returns {void} - The resulting deck
 */
declare function ClubCardLoadDeckNumber(DeckNum: number): void;
/**
 * Draw the club card player hand on screen, show only sleeves if not controlled by player
 * @param {Character} Char - The character to link to that club card player
 * @param {String} Cont - The control linked to that player
 * @param {Array} Cards - The cards to build the deck with
 * @returns {void} - Nothing
 */
declare function ClubCardAddPlayer(Char: Character, Cont: string, Cards: any[]): void;
/**
 * The player can get rewarded with a new card if she wins VS a specific opponent
 * @returns {void} - Nothing
 */
declare function ClubCardGetReward(): void;
/**
 * When a turn ends, we move to the next player
 * @param {boolean|null} Draw - If the end of turn was triggered by a draw
 * @returns {void} - Nothing
 */
declare function ClubCardEndTurn(Draw?: boolean | null): void;
declare function ClubCardCheckVictory(CCPlayer: any): boolean;
/**
 * Returns the number of cards that can be played in one turn by a player
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @returns {Number} - The number of cards
 */
declare function ClubCardTurnPlayableCardCount(CCPlayer: ClubCardPlayer): number;
/**
 * Returns the number of cards that will be drawn when the player choses to draw instead of playing
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @returns {Number} - The number of cards to draw
 */
declare function ClubCardDrawCardCount(CCPlayer: ClubCardPlayer): number;
/**
 * Returns the extra time in turns for event over time
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @returns {Number} - The extra time
 */
declare function ClubCardExtraTime(CCPlayer: ClubCardPlayer): number;
/**
 * Returns the player that will be the target of a card.  Liability cards are played on the other side.
 * @param {ClubCard} Card - The card to play
 * @returns {ClubCardPlayer} - The target player
 */
declare function ClubCardFindTarget(Card: ClubCard): ClubCardPlayer;
/**
 * Returns TRUE if a specific card can be played by the player
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {ClubCard} Card - The card to play
 * @returns {boolean} - TRUE if the card can be played
 */
declare function ClubCardCanPlayCard(CCPlayer: ClubCardPlayer, Card: ClubCard): boolean;
/**
 * Returns TRUE if a specific card can be selected as a prerequisite for another card by the player
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {ClubCard} Card - The card to select
 * @returns {boolean} - TRUE if the card can be selected
 */
declare function ClubCardCanSelectCard(CCPlayer: ClubCardPlayer, Card: ClubCard): boolean;
/**
 * When a player plays a card
 * @param {ClubCardPlayer} CCPlayer - The club card player
 * @param {ClubCard} Card - The card to play
 * @returns {void} - Nothing
 */
declare function ClubCardPlayCard(CCPlayer: ClubCardPlayer, Card: ClubCard): void;
/**
 * When a player selects a card that's a prerequisite for another card
 * @param {ClubCard} Card - The card to play
 * @returns {void} - Nothing
 */
declare function ClubCardSelectCard(Card: ClubCard): void;
/**
 * When the AI plays it's move
 * @returns {void} - Nothing
 */
declare function ClubCardAIPlay(): void;
/**
 * When the opponent (AI) starts it's turn, gives 3 seconds before it's move
 * @returns {void} - Nothing
 */
declare function ClubCardAIStart(): void;
/**
 * When a player concedes the game
 * @returns {void} - Nothing
 */
declare function ClubCardConcede(): void;
/**
 * When a player goes bankrupt, she restarts her club from scratch, draws 5 new cards and ends her turn
 * @returns {void} - Nothing
 */
declare function ClubCardBankrupt(): void;
/**
 * When the game ends
 * @param {boolean} Victory - TRUE if the player is victorious
 * @returns {void} - Nothing
 */
declare function ClubCardEndGame(Victory: boolean): void;
declare function ClubCardTextGet(Text: any): any;
/**
 * Prepares the card titles, texts and initialize the log if needed
 * @returns {void} - Nothing
 */
declare function ClubCardLoadCaption(): void;
/**
 * Assigns the club card object if needed and loads the CSV file
 * @returns {void} - Nothing
 */
declare function ClubCardCommonLoad(): void;
/**
 * Loads the club card mini-game: Assigns the opponents and draws the cards
 * @returns {void} - Nothing
 */
declare function ClubCardLoad(): void;
/**
 * Draw the club card player hand on screen, show only sleeves if not controlled by player
 * @param {Number} Value - The card to draw
 * @param {number} X - The X on screen position
 * @param {number} Y - The Y on screen position
 * @param {number} W - The width of the card
 * @param {string} Image - The buble
 * @returns {Number} - The next bubble Y position
 */
declare function ClubCardRenderBubble(Value: number, X: number, Y: number, W: number, Image: string): number;
/**
 * Returns the text description of all groups, separated by commas
 * @param {Array} Group - The card to draw
 * @returns {string} - The
 */
declare function ClubCardGetGroupText(Group: any[]): string;
/**
 * Draw the club card player hand on screen, show only sleeves if not controlled by player
 * @param {ClubCard|Number} Card - The card to draw
 * @param {number} X - The X on screen position
 * @param {number} Y - The Y on screen position
 * @param {number} W - The width of the card
 * @param {string|null} Sleeve - The sleeve image to draw instead of the card
 * @param {string|null} Source - The source from where it's called
 * @returns {void} - Nothing
 */
declare function ClubCardRenderCard(Card: ClubCard | number, X: number, Y: number, W: number, Sleeve?: string | null, Source?: string | null): void;
/**
 * Draw the club card player board on screen
 * @param {Object} CCPlayer - The club card player that draws the cards
 * @param {number} X - The X on screen position
 * @param {number} Y - The Y on screen position
 * @param {number} W - The width of the game board
 * @param {number} H - The height of the game board
 * @param {boolean} Mirror - If the board should be rendered bottom to top
 * @returns {void} - Nothing
 */
declare function ClubCardRenderBoard(CCPlayer: any, X: number, Y: number, W: number, H: number, Mirror: boolean): void;
/**
 * Draw the club card player hand on screen, show only sleeves if not controlled by player
 * @param {ClubCardPlayer} CCPlayer - The club card player that draws it's hand
 * @param {number} X - The X on screen position
 * @param {number} Y - The Y on screen position
 * @param {number} W - The width of the game board
 * @param {number} H - The height of the game board
 * @returns {void} - Nothing
 */
declare function ClubCardRenderHand(CCPlayer: ClubCardPlayer, X: number, Y: number, W: number, H: number): void;
/**
 * Shows the status text on the bottom right
 * @param {string} Text - The status text to show
 * @returns {void} - Nothing
 */
declare function ClubCardStatusText(Text: string): void;
/**
 * Renders the right side panel
 * @returns {void} - Nothing
 */
declare function ClubCardRenderPanel(): void;
/**
 * Renders the popup on the top of the game board
 * @returns {void} - Nothing
 */
declare function ClubCardRenderPopup(): void;
/**
 * Runs the club card game, draws all the controls
 * @returns {void} - Nothing
 */
declare function ClubCardRun(): void;
/**
 * Handles clicks during the club card game
 * @returns {void} - Nothing
 */
declare function ClubCardClick(): void;
declare function ClubCardKeyDown(event: any): void;
declare var ClubCardBackground: string;
declare var ClubCardLog: any[];
declare var ClubCardLogText: string;
declare var ClubCardLogScroll: boolean;
declare var ClubCardColor: string[];
declare var ClubCardOpponent: any;
declare var ClubCardOpponentDeck: any[];
declare var ClubCardReward: any;
declare var ClubCardHover: any;
declare var ClubCardFocus: any;
declare var ClubCardTextCache: any;
declare var ClubCardTurnIndex: number;
declare var ClubCardTurnCardPlayed: number;
declare var ClubCardTurnEndDraw: boolean;
declare var ClubCardFameGoal: number;
declare var ClubCardPopup: any;
declare var ClubCardSelection: any;
declare var ClubCardPending: any;
declare var ClubCardLevelLimit: number[];
declare var ClubCardLevelCost: number[];
/** @type {ClubCardPlayer[]} */
declare var ClubCardPlayer: ClubCardPlayer[];
declare var ClubCardOnlinePlayerMemberNumber1: number;
declare var ClubCardOnlinePlayerMemberNumber2: number;
/** @type {ClubCard[]} */
declare var ClubCardList: ClubCard[];
