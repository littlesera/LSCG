/**
 * Loads the deck # in memory so it can be edited
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderLoadDeck(Deck: any): void;
/**
 * Saves the modified deck as a string on the server
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderSaveChanges(): void;
/**
 * Saves the modified deck as a string on the server
 * @param {boolean} Save - TRUE to save, FALSE to skip saving
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderSaveName(Save: boolean): void;
/**
 * Loads the filtered cards
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderFilterLoad(): void;
/**
 * Loads the club card deck builder
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderLoad(): void;
/**
 * Returns the deck name on slot "Deck"
 * @param {number} Deck - The deck #
 * @returns {string} - The deck name or Deck #X if no name is assigned
 */
declare function ClubCardBuilderGetDeckName(Deck: number): string;
/**
 * Enters in deck rename mode
 * @param {number} Deck - The deck #
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderRenameMode(Deck: number): void;
/**
 * Runs the club card deck builder
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderRun(): void;
/**
 * Handles clicks during the club card game
 * @returns {void} - Nothing
 */
declare function ClubCardBuilderClick(): void;
declare var ClubCardBuilderBackground: string;
declare var ClubCardBuilderDeckIndex: number;
declare var ClubCardBuilderFocus: any;
declare var ClubCardBuilderList: any[];
declare var ClubCardBuilderOffset: number;
declare var ClubCardBuilderDeckCurrent: any[];
declare var ClubCardBuilderDeckSize: number;
declare var ClubCardBuilderFilterIndex: number;
declare var ClubCardBuilderFilterGroup: string[];
declare var ClubCardBuilderRenameIndex: number;
declare var ClubCardBuilderDefaultDeck: number[];
declare var ClubCardBuilderMaidDeck: number[];
declare var ClubCardBuilderDominantDeck: number[];
declare var ClubCardBuilderPornDeck: number[];
declare var ClubCardBuilderAsylumDeck: number[];
declare var ClubCardBuilderABDLDeck: number[];
declare var ClubCardBuilderCollegeDeck: number[];
declare var ClubCardBuilderLiabilityDeck: number[];
