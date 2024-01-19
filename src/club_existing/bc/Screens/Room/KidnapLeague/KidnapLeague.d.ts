/**
 * Checks if the player can be kidnapped
 * @returns {boolean} - Returns TRUE if the player is restrained and the trainer is not.
 */
declare function KidnapLeagueAllowKidnap(): boolean;
/**
 * Checks if the kidnap league trainer is restrained.
 * @returns {boolean} - Returns TRUE if the kidnap league trainer is restrained.
 */
declare function KidnapLeagueIsTrainerRestrained(): boolean;
/**
 * Checks if the player can take a new kidnap league bounty.
 * @returns {boolean} - Returns TRUE if the player has no active bounty.
 */
declare function KidnapLeagueCanTakeBounty(): boolean;
/**
 * Checks if a kidnap league bounty was taken.
 * @returns {boolean} - Returns TRUE if the player has an active and unfinished bounty.
 */
declare function KidnapLeagueBountyTaken(): boolean;
/**
 * Checks if the current bounty resulted in a victory.
 * @returns {boolean} - Returns TRUE if the current bounty resulted in a victory.
 */
declare function KidnapLeagueBountyWasVictory(): boolean;
/**
 * Checks if the current bounty resulted in a defeat.
 * @returns {boolean} - Returns TRUE if the current bounty resulted in a defeat.
 */
declare function KidnapLeagueBountyWasDefeat(): boolean;
/**
 * Checks if a NPC can be transfered to the player's private room.
 * @returns {boolean} - Returns TRUE if the player has an accessible private room and a free spot for a NPC.
 */
declare function KidnapLeagueCanTransferToRoom(): boolean;
/**
 * Checks if the NPC will not visit the player's private room.
 * @returns {boolean} - Returns TRUE if the NPC won't come to the private room even if it's possible
 */
declare function KidnapLeagueWontVisitRoom(): boolean;
/**
 * Checks if both players can kiss.
 * @returns {boolean} - Returns TRUE if both players are able to talk which means they can kiss.
 */
declare function KidnapLeagueCanKiss(): boolean;
/**
 * Checks if the player has public permissions (up to Owners, Whitelist, and Dominants)
 * @returns {boolean} - Returns TRUE if the player can start the online bounty game
 */
declare function KidnapLeagueHasBountyPermissions(): boolean;
/**
 * Checks if the player has public permissions (up to Owners, Whitelist, and Dominants)
 * @returns {boolean} - Returns TRUE if the player cannot start the online bounty game
 */
declare function KidnapLeagueDoesNotHaveBountyPermissions(): boolean;
/**
 * Checks if the player can take up the online bounty quest
 * @returns {boolean} - Returns TRUE if the player can start the online bounty game
 */
declare function KidnapLeagueCanStartOnlineBounty(): boolean;
/**
 * Checks if the player can end early the online bounty quest
 * @returns {boolean} - Returns TRUE if the player can end the online bounty game
 */
declare function KidnapLeagueOnlineBountyOngoing(): boolean;
/**
 * Checks if the player can end the online bounty quest
 * @returns {boolean} - Returns TRUE if the player can end the online bounty game
 */
declare function KidnapLeagueOnlineBountyEnded(): boolean;
/**
 * Starts the online bounty game
 * @returns {void} - Nothing
 */
declare function KidnapLeagueOnlineBountyStart(): void;
/**
 * Ends the online bounty game early
 * @returns {void} - Nothing
 */
declare function KidnapLeagueOnlineBountyCancel(): void;
/**
 * Ends the online bounty game and pays
 * @returns {void} - Nothing
 */
declare function KidnapLeagueOnlineBountyFinish(): void;
/**
 * Ends the online bounty game for the kidnapper
 * @returns {void} - Nothing
 */
declare function KidnapLeagueResetOnlineBountyProgress(): void;
/**
 * Loads the kidnap league NPC
 * @returns {void} - Nothing
 */
declare function KidnapLeagueLoad(): void;
/**
 * Runs and draws the kidnap league,  this room can be used for daily job search
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRun(): void;
/**
 * Handles clicks in the kidnap league room, this room can be used for daily job search
 * @returns {void} - Nothing
 */
declare function KidnapLeagueClick(): void;
/**
 * Triggered when the player takes a bounty of a given difficulty. An easy bounty lowers the kidnap reputation.
 * @param {number} Difficulty - Difficulty factor of the bounty.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueTakeBounty(Difficulty: number): void;
/**
 * Triggered when the league trainer reminds the player of her current bounty. The proper character dialog for it is set.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyRemind(): void;
/**
 * Starts the bounty hunter mission in the kidnap league screen.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyStart(): void;
/**
 * Starts the bounty hunter fight with its settings.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyFightStart(): void;
/**
 * Ends the bounty hunter fight and goes back to the kidnap league screen.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyFightEnd(): void;
/**
 * Triggered when the player pays for a kidnap league bounty.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyPay(): void;
/**
 * Resets the current kidnap league bounty so another one can be taken. The harder the battle, the more reputation the player gains.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueBountyReset(): void;
/**
 * Starts a kidnap game with the player against the trainer. An easy fight will lower the player dominant reputation.
 * @param {number} Difficulty - Difficulty ratio of the encounter
 * @returns {void} - Nothing
 */
declare function KidnapLeagueStartKidnap(Difficulty: number): void;
/**
 * Ends a kidnap match ends. Send the player to the kidnap league screen and sets the right trainer dialog.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueEndKidnap(): void;
/**
 * Resets the player and teacher for another kidnapping by releasing them and dressing them up.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueResetTrainer(): void;
/**
 * Triggered at the start of a match, sets a random intro sequence.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomIntro(): void;
/**
 * Triggered at the end of a match, sets a random outro sequence.
 * @param {boolean} Surrender - Whether or not the player surrendered.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomOutro(Surrender: boolean): void;
/**
 * Triggered when a random kidnap match starts. We start the kidnap minigame with the appropriate settings.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomStart(): void;
/**
 * Triggered when a the player successfully bribes her way out of a fight
 * @param {number} Amount - Amount paid (positive number)
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomBribe(Amount: number): void;
/**
 * Triggered when the player surrenders during a kidnap match, the match ends early.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomSurrender(): void;
/**
 * Triggered at the end of a kidnap match. Player is sent to the main hall, dressed back and is unable to do another match for 3 minutes.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomEnd(): void;
/**
 * Triggered when we need to show the amount of money the NPC offers to get out.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomMoneyAmount(): void;
/**
 * Triggered when accepts the NPC's offer to pay for freedom, we lower the kidnap reputation.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomEndMoney(): void;
/**
 * When a random activity starts, set the related NPC dialog and stage
 * @param {string} A - Name of the activity to perform.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomActivityStart(A: string): void;
/**
 * Triggered when the kidnapper does a random activity on the player.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomActivityLaunch(): void;
/**
 * Triggered when the player transfers the kidnapper to her room, they are sent to the private room.
 * @returns {void} - Nothing
 */
declare function KidnapLeagueTransferToRoom(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function KidnapLeagueRandomClubCardEnd(): void;
declare var KidnapLeagueBackground: string;
/** @type {null | NPCCharacter} */
declare var KidnapLeagueTrainer: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var KidnapLeagueRandomKidnapper: null | NPCCharacter;
declare var KidnapLeagueRandomKidnapperScenario: string;
declare var KidnapLeagueRandomKidnapperDifficulty: number;
/** @type {null | "" | "Maid" | "Mistress"} */
declare var KidnapLeagueArchetype: null | "" | "Maid" | "Mistress";
declare var KidnapLeagueWillPayForFreedom: boolean;
declare var KidnapLeagueRandomActivityList: string[];
declare var KidnapLeagueRandomActivity: string;
declare var KidnapLeagueRandomActivityCount: number;
/** @type {null | NPCCharacter} */
declare var KidnapLeagueBounty: null | NPCCharacter;
/** @type {null | number} */
declare var KidnapLeagueBountyDifficulty: null | number;
declare var KidnapLeagueBountyLocation: string;
declare var KidnapLeagueBountyLocationList: string[];
/** @type {null | boolean} */
declare var KidnapLeagueBountyVictory: null | boolean;
declare var KidnapLeagueVisitRoom: boolean;
/** @type {number[]} */
declare var KidnapLeagueSearchingPlayers: number[];
declare var KidnapLeagueSearchFinishTime: number;
declare var KidnapLeagueSearchFinishDuration: number;
declare var KidnapLeagueOnlineBountyTarget: number;
declare var KidnapLeagueOnlineBountyTargetStartedTime: number;
