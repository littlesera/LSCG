/**
 * Checks if the player is helpless (maids disabled) or not.
 * @returns {boolean} - Returns true if the player still has time remaining after asking the maids to stop helping
 */
declare function MaidQuartersIsMaidsDisabled(): boolean;
/**
 * Checks if the player is helpless (maids disabled) or not and also if they have reputation to do work
 * @returns {boolean} - Returns true if the player has maids enabled and also has rep
 */
declare function MaidQuartersCanDoWorkForMaids(): boolean;
/**
 * Checks if the player is helpless (maids disabled) or not and also if they have reputation to do work
 * @returns {boolean} - Returns true if the player has maids enabled and also has rep
 */
declare function MaidQuartersCanDoWorkButMaidsDisabled(): boolean;
/**
 * CHecks for appropriate dressing
 * @returns {boolean} - Returns true if the player wears a maid dress and a maid hair band, false otherwise
 */
declare function MaidQuartersPlayerInMaidUniform(): boolean;
/**
 * Checks, if the player is fully dressed for the 'serve drinks' job
 * @returns {boolean} - Retruns true, if the player is wearing a maid uniform, has her legs and arms restrained, is gagged and wearing a serving tray
 */
declare function MaidQuartersPlayerInDrinksUniform(): boolean;
/**
 * Checks, if the player can leave the maid to wear her uniform for the 'serve drink job'
 * @returns {boolean} - Returns true, if the player is a maid, not wearing her uniform and was not forced to do the job
 */
declare function MaidQuartersPlayerCanChangeForDrinks(): boolean;
/**
 * Checks, if the player is fully dressed for the 'clean room job'
 * @returns {boolean} - Returns true, if the player is wearing a maid uniform, has her feet, legs and arms restrained and is wearing a duster gag
 */
declare function MaidQuartersPlayerInCleaningUniform(): boolean;
/**
 * Checks, if the player can leave the maid to wear her uniform for the 'clean room job'
 * @returns {boolean} - Returns true, if the player is a maid and not wearing her uniform
 */
declare function MaidQuartersPlayerCanChangeForCleaning(): boolean;
/**
 * Checks, if the player can leave the maid to wear her uniform for the 'rescue job'
 * @returns {boolean} - Returns true, if the player is a maid and not wearing her uniform
 */
declare function MaidQuartersPlayerCanChangeForRescue(): boolean;
/**
 * Update the maid current dialog to give an advice about why the player's current outfit isn't a maid outfit
 */
declare function MaidQuartersAdviceMaidUniform(): void;
/**
 * Checks, if the player is able to do the 'serve drinks' job
 * @returns {boolean} - Returns true, if the player can do the job, false otherwise
 */
declare function MaidQuartersAllowMaidDrinks(): boolean;
/**
 * Checks, if the player is ready for the 'serve drinks' job and is allowed to do it
 * @returns {boolean} - Returns true, if the player is ready for the job, false otherwise
 */
declare function MaidQuartersAllowSelfBondageMaidDrinks(): boolean;
/**
 * Accept to start the 'serve drinks' job when self prepared for it
 * @returns {void} - Nothing
 */
declare function MaidQuartersAcceptSelfBondageMaidDrinks(): void;
/**
 * Checks, if the player can do the 'clean room job'
 * @returns {boolean} - Returns true, if the player can do the job, false otherwise
 */
declare function MaidQuartersAllowMaidCleaning(): boolean;
/**
 * Checks, if the player is ready for the 'clean room job' and is allowed to do it
 * @returns {boolean} - Returns true, if the player is ready for the job, false otherwise
 */
declare function MaidQuartersAllowSelfBondageMaidCleaning(): boolean;
/**
 * Accept to start the 'clean room job' when self prepared for it
 * @returns {void} - Nothing
 */
declare function MaidQuartersAcceptSelfBondageMaidCleaning(): void;
/**
 * Checks, if the player can do the 'play music' job
 * @returns {boolean} - Returns true, if the player can do the job, false otherwise
 */
declare function MaidQuartersAllowMaidPlayMusic(): boolean;
/**
 * Checks, if the player can do a rescue mission
 * @returns {boolean} - Returns true, if the player can do the job, false otherwise
 */
declare function MaidQuartersAllowRescue(): boolean;
/**
 * Checks, if the player is on a running rescue mission
 * @returns {boolean} - Returns true, if the player has a running but unfinished rescue mission, false otherwise
 */
declare function MaidQuartersAllowCancelRescue(): boolean;
/**
 * Checks, if the 'Unlock Sarah' quest is available
 * @returns {boolean} - Returns true, if the quest is available, false otherwise
 */
declare function MaidQuartersCanFreeSarah(): boolean;
/**
 * Checks, if the maid can release the player from her restraint
 * @returns {boolean} - Returns true, if the player can be released, false otherwise
 */
declare function MaidQuartersCanReleasePlayer(): boolean;
/**
 * Checks, if the maid is unable to free the player
 * @returns {boolean} - Returns true, if the maid is unable to free the player, false otherwise
 */
declare function MaidQuartersCannotReleasePlayer(): boolean;
/**
 * Checks, if the player can get the duster gag
 * @returns {boolean} - Returns true, if the player can get the duster gag, false otherwise
 */
declare function MaidQuartersCanGetDusterGag(): boolean;
/**
 * Checks, if the player has finished the 'serve drinks' job
 * @returns {boolean} - Returns true, if the job is finished, false otherwise
 */
declare function MaidQuartersOnlineDrinkCompleted(): boolean;
/**
 * Checks if the player can talk after being rewarded for the online drinks mini-game
 * @returns {boolean} - Returns true, if the player is gagged or restrained.
 */
declare function MaidQuartersOnlineDrinkIsRestrained(): boolean;
/**
 * Checks if the player can get ungagged by the maids
 * @returns {boolean} - Returns true, if the maids can remove the gag, false otherwise
 */
declare function MaidQuartersCanUngag(): boolean;
declare function MaidQuartersCanUngagAndMaidsDisabled(): boolean;
/**
 * Checks, if the maids are unable to remove the gag (if there is one)
 * @returns {boolean} - Returns true, if the player cannot be ungagged by the maids, false otherwise
 */
declare function MaidQuartersCannotUngag(): boolean;
declare function MaidQuartersCannotUngagAndMaidsNotDisabled(): boolean;
/**
 * Loads the maid quarters. This function is called dynamically, as soon, as the player enters the maid quarters
 * @returns {void} - Nothing
 */
declare function MaidQuartersLoad(): void;
/**
 * Runs the maid quarters dialog
 * This function is called periodically so don't use it for extensive use or the call of other complex functions
 * @returns {void} - Nothing
 */
declare function MaidQuartersRun(): void;
/**
 * Handles the click events of the maid quarters. Clicks are propageted from 'CommonClick()'
 * @returns {void} - Nothing
 */
declare function MaidQuartersClick(): void;
/**
 * The maid ungags the player
 * @returns {void} - Nothing
 */
declare function MaidQuartersMaidUngagPlayer(): void;
/**
 * Dresses the player as a maid
 * @returns {void} - Nothing
 */
declare function MaidQuartersWearMaidUniform(): void;
/**
 * Removes the maid uniform and dresses the character back
 * @returns {void} - Nothing
 */
declare function MaidQuartersRemoveMaidUniform(): void;
/**
 * Starts a mini game or maid chore
 * @param {string} GameType - Name of the mini-game to launch
 * @param {number} Difficulty - Difficulty Ration for the mini-game
 * @returns {void} - Nothing
 */
declare function MaidQuartersMiniGameStart(GameType: string, Difficulty: number): void;
/**
 * Is called when the mini game ends and sends the player back to the maid quarters.
 * Depending on the choosen game, the next dialog option is selected
 * @returns {void} - Nothing
 */
declare function MaidQuartersMiniGameEnd(): void;
/**
 * When an ordinary  mini game / maid chore is successful, the player gets paid and the maid reputation increases
 * @returns {void} - Nothing
 */
declare function MaidQuartersMiniGamePay(): void;
/**
 * When the music mini game is successful, the player gets paid
 * @returns {void} - Nothing
 */
declare function MaidQuartersMiniGamePayAdvanced(): void;
/**
 * Handles the payment after a successful rescue mission
 * @returns {void} - Nothing
 */
declare function MaidQuartersRescuePay(): void;
/**
 * The maid releases the player, reduces her dominant score and assures that this option is only used once
 * @returns {void} - Nothing
 */
declare function MaidQuartersMaidReleasePlayer(): void;
/**
 * Collects the dominant reputation change of a player during the course of the various dialog options.
 * When the player becomes a maid, the change is applied
 * @param {string} Value - The value by which the reputation is changed
 * @returns {void} - Nothing
 */
declare function MaidQuartersDominantRepChange(Value: string): void;
/**
 * Switches from one maid to another in the initiation
 * @param {string} MaidType - Name of the current maid type
 */
declare function MaidQuartersInitiationTransition(MaidType: string): void;
/**
 * Change the initiation maid appearance on the spot to simulate a new character
 * @returns {void} - Nothing
 */
declare function MaidQuartersChangeInitiationMaid(): void;
/**
 * The player joins the maid sorority
 * @returns {void} - Nothing
 */
declare function MaidQuartersBecomMaid(): void;
/**
 * The player is promoted to head maid
 * @returns {void} - Nothing
 */
declare function MaidQuartersBecomHeadMaid(): void;
/**
 * Starts a maid rescue mission in a random room. The same room is never selected twice and
 * the player is not sent to the introduction room when doing the daily quest
 * @returns {void} - Nothing
 */
declare function MaidQuartersStartRescue(): void;
/**
 * Cancels the current rescue mission
 * @returns {void} - Nothing
 */
declare function MaidQuartersCancelRescue(): void;
/**
 * The player as head maid can trick the maids into freeing Sarah
 * @returns {void} - Nothing
 */
declare function MaidQuartersFreeSarah(): void;
/**
 * The maid gives a duster gag to the player if she's in the sorority
 * @returns {void} - Nothing
 */
declare function MaidQuartersGetDusterGag(): void;
/**
 * Starts the online drink serving game
 * @returns {void} - Nothing
 */
declare function MaidQuartersOnlineDrinkStart(): void;
/**
 * On online player picks a drink from the plyers tray. She only gets credited, if it was a new customer
 * @param {number} MemberNumber - The member ID of the customer
 * @param {number|string} DrinkValue - The value of the picked drink
 */
declare function MaidQuartersOnlineDrinkPick(MemberNumber: number, DrinkValue: number | string): void;
/**
 * Calculates the player's earnings from the online drink serving.
 * When the maid tray is empty, the player can get paid (40% of drink value + 10$)
 * @returns {void} - Nothing
 */
declare function MaidQuartersOnlineDrinkPay(): void;
/**
 * Flags the online drink serving as not initiated by the player's owner
 * @returns {void} - Nothing
 */
declare function MaidQuartersNotFromOwner(): void;
declare function MaidQuartersSetMaidsDisabled(minutes: any): void;
declare var MaidQuartersBackground: string;
/** @type {null | NPCCharacter} */
declare var MaidQuartersMaid: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var MaidQuartersMaidInitiation: null | NPCCharacter;
/** @type {{ Cloth?: Item, Hat?: Item, ItemArms?: Item, ItemLegs?: Item, ItemFeet?: Item }} */
declare var MaidQuartersItemClothPrev: {
    Cloth?: Item;
    Hat?: Item;
    ItemArms?: Item;
    ItemLegs?: Item;
    ItemFeet?: Item;
};
declare var MaidQuartersMaidReleasedPlayer: boolean;
declare var MaidQuartersCanBecomeMaid: boolean;
declare var MaidQuartersCannotBecomeMaidYet: boolean;
declare var MaidQuartersCanBecomeHeadMaid: boolean;
declare var MaidQuartersCannotBecomeHeadMaidYet: boolean;
declare var MaidQuartersIsMaid: boolean;
declare var MaidQuartersIsHeadMaid: boolean;
declare var MaidQuartersSelfBondageMaidDrinksAccepted: boolean;
declare var MaidQuartersSelfBondageMaidCleaningAccepted: boolean;
declare var MaidQuartersDominantRep: number;
declare var MaidQuartersCurrentRescue: string;
declare var MaidQuartersRescueList: string[];
declare var MaidQuartersRescueStage: string[];
declare var MaidQuartersCurrentRescueStarted: boolean;
declare var MaidQuartersCurrentRescueCompleted: boolean;
declare var MaidQuartersOnlineDrinkStarted: boolean;
declare var MaidQuartersOnlineDrinkCount: number;
declare var MaidQuartersOnlineDrinkValue: number;
/** @type {number[]} */
declare var MaidQuartersOnlineDrinkCustomer: number[];
declare var MaidQuartersOnlineDrinkFromOwner: boolean;
