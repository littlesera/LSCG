/**
 * Checks to see if the player needs help in any way
 * @returns {boolean} - True if player has any restraints or locks, False otherwise
 */
declare function MainHallPlayerNeedsHelpAndHasNoOwnerOrLoverItem(): boolean;
/**
 * Checks if the maid will help the player or not.  Maids are disabled from the quarters or when playing hardcore.
 * @returns {boolean} - Returns true if the player still has time remaining after asking the maids to stop helping in the maid quarters
 */
declare function MainHallIsMaidsDisabled(): boolean;
/**
 * Checks if the maid will not help the player because she's playing on hardcore
 * @returns {boolean} - Returns TRUE if the difficulty is hardcore or more
 */
declare function MainHallMaidsPlayingHardcore(): boolean;
/**
 * Checks for the dialog options to help the player know how much time is left before the maids can help them
 * @returns {boolean} - Returns TRUE if the remaining duration fits within the time range
 */
declare function MainHallMaidsDisabledMinutesLeft(): boolean;
declare function MainHallMaidsDisabledHourLeft(): boolean;
declare function MainHallMaidsDisabledDaysLeft1(): boolean;
declare function MainHallMaidsDisabledDaysLeft2(): boolean;
declare function MainHallMaidsDisabledDaysLeft3(): boolean;
declare function MainHallMaidsDisabledDaysLeft4(): boolean;
declare function MainHallMaidsDisabledDaysLeft5(): boolean;
declare function MainHallMaidsDisabledDaysLeft6(): boolean;
declare function MainHallMaidsDisabledDaysLeft7(): boolean;
declare function MainHallMaidsDisabledBegForMore(): boolean;
/**
 * Checks for the dialog options to help the maid determine which dialog options she can give the player to extend the duration
 * @returns {boolean} - Returns TRUE if the remaining duration fits within the time range
 */
declare function MainHallMaidsDisabledAtLeast30MinutesLeft(): boolean;
declare function MainHallMaidsDisabledAtLeast1HourLeft(): boolean;
declare function MainHallMaidsDisabledAtLeast12HourLeft(): boolean;
declare function MainHallMaidsDisabledAtLeastDaysLeft1(): boolean;
declare function MainHallMaidsDisabledAtLeastDaysLeft3(): boolean;
declare function MainHallMaidsDisabledAtLeastDaysLeft7(): boolean;
/**
 * Checks if the dialog option to trick the maid is available
 * @returns {boolean} - Returns TRUE if the maid can be tricked
 */
declare function MainHallCanTrickMaid(): boolean;
/**
 * Checks, if the player has an owner or lover lock on her
 * @returns {boolean} - Returns true, if the player has either a lover or owner item on herself, false otherwise
 */
declare function MainHallHasOwnerOrLoverItem(): boolean;
declare function MainHallHasOwnerOrLoverItemAndMaidsNotDisabled(): boolean;
declare function MainHallHasNoOwnerOrLoverItemAndMaidsNotDisabled(): boolean;
declare function MainHallHasOwnerItemAndMaidsNotDisabled(): boolean;
declare function MainHallHasLoverItemAndMaidsNotDisabled(): boolean;
declare function MainHallHasFamilyItemAndMaidsNotDisabled(): boolean;
declare function MainHallHasSlaveCollarAndMaidsNotDisabled(): boolean;
declare function MainHallPlayerNeedsHelpAndHasNoOwnerOrLoverItemAndMaidsNotDisabled(): boolean;
/**
 * Returns TRUE if the main hall sub-screen is allowed for the player, check for owner rules
 * @param {string} ID - The screen ID to validate (A is club shop)
 * @returns {boolean} - Returns true, if the screen is allowed
 */
declare function MainHallAllow(ID: string): boolean;
/**
 * Loads the main hall by setting up the NPCs, CSVs and global variables required.
 * @returns {void} - Nothing
 */
declare function MainHallLoad(): void;
/**
 * Runs and draws the main hall screen
 * @returns {void} - Nothing
 */
declare function MainHallRun(): void;
/**
 * Randomly select a new tip to display
 */
declare function MainHallCycleTips(): void;
/**
 * Validates the player's move into a new room. Before entering the requested rooms, the player can be attacked by random kidnappers or intercepted by various NPC types
 * @param {string} RoomName - Name of the room the player is heading to
 * @returns {void} - Nothing
 */
declare function MainHallWalk(RoomName: string): void;
/**
 * Handles clicks in the main hall screen
 * @returns {void} - Nothing
 */
declare function MainHallClick(): void;
/**
 * Triggered when the player chooses to open changelog.
 */
declare function MainHallOpenChangelog(): void;
/**
 * Triggered when the player asks for release, the player is freed from restraints and any combo locks
 * @returns {void} - Nothing
 */
declare function MainHallMaidReleasePlayer(): void;
/**
 * Triggered when the maid is angry at the player, she might gag or tie her up if the player is not dominant or not a head maid
 * @returns {void} - Nothing
 */
declare function MainHallMaidAngry(): void;
/**
 * Triggered when the maid is tricked into releasing Sarah
 * @returns {void} - Nothing
 */
declare function MainHallFreeSarah(): void;
/**
 * Triggered when the player calls the maids from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroom(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomStartPunishment(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromListEnd(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomInsertToy(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomApplyChastity(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomLockChastity(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomGag(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomArms(): void;
/**
 * Triggered when the maid unlocks the player from a chat room
 * @returns {void} - Nothing
 */
declare function MainHallPunishFromChatroomRest(): void;
/**
 * Triggered when the maid unlocks the player from an owner
 * @returns {void} - Nothing
 */
declare function MainHallMaidShamePlayer(): void;
/**
 * Triggered when the maid resets the slave collar to default. The player is punished after.
 * @returns {void} - Nothing
 */
declare function MainHallMaidChangeCollarPlayer(): void;
/**
 * Triggered when the maid punishes the player. The player is stripped and loses dominant/submissive reputation.
 * @returns {void} - Nothing
 */
declare function MainHallMaidPunishmentPlayer(): void;
/**
 * Triggered when the maid catches the club slave player with clothes. The player is stripped and the timer is restarted.
 * @returns {void} - Nothing
 */
declare function MainHallResetClubSlave(): void;
/**
 * Triggered when the player needs to be brought to the club management room to be expelled
 * @returns {void} - Nothing
 */
declare function MainHallMistressExpulsion(): void;
/**
 * Sets the maid dialog stage to the introduction for new players
 * @returns {void} - Nothing
 */
declare function MainHallMaidIntroduction(): void;
/**
 * Flags the introduction as done
 * @returns {void} - Nothing
 */
declare function MainHallMaidIntroductionDone(): void;
declare function MainHallSetMaidsDisabled(minutes: any): void;
declare function MainHallMoveToChatSelect(): void;
declare var MainHallBackground: string;
/** @type {null | number} */
declare var MainHallStartEventTimer: null | number;
/** @type {null | number} */
declare var MainHallNextEventTimer: null | number;
declare var MainHallRandomEventOdds: number;
/** @type {null | NPCCharacter} */
declare var MainHallMaid: null | NPCCharacter;
declare var MainHallIsMaid: boolean;
declare var MainHallIsHeadMaid: boolean;
declare var MainHallHasOwnerLock: boolean;
declare var MainHallHasLoverLock: boolean;
declare var MainHallHasFamilyLock: boolean;
declare var MainHallHasSlaveCollar: boolean;
/** The max number of known tips */
declare var MainHallMaxTip: number;
/** The index of the current tip */
declare var MainHallTip: number;
/** The max delay to wait before changing the current tip */
declare var MainHallTipCycleDelay: number;
/**
 * The timer that tracks the last time the tip cycled
 * @type {number}
 */
declare var MainHallTipCycleTimer: number;
declare var MainHallMaidWasCalledManually: boolean;
declare var MainHallAsylumOpen: boolean;
/**
 * Whether the player just got safeworded out of a chatroom and needs punishment
 */
declare var MainHallBeingPunished: boolean;
declare var MainHallFirstFrame: boolean;
/** @type {AssetLockType[]} */
declare var MainHallStrongLocks: AssetLockType[];
declare var MainHallPunishmentList: ({
    ItemMouth: string;
    ItemHead: string;
    ItemHands: string;
    ItemArms?: undefined;
    ItemLegs?: undefined;
    ItemPelvis?: undefined;
    ItemBreast?: undefined;
    ItemVulva?: undefined;
    ItemBoots?: undefined;
    ItemFeet?: undefined;
} | {
    ItemMouth: string;
    ItemArms: string;
    ItemLegs: string;
    ItemPelvis: string;
    ItemBreast: string;
    ItemVulva: string;
    ItemBoots: string;
    ItemHead: string;
    ItemHands: string;
    ItemFeet?: undefined;
} | {
    ItemMouth: string;
    ItemArms: string;
    ItemLegs: string;
    ItemFeet: string;
    ItemPelvis: string;
    ItemBreast: string;
    ItemVulva: string;
    ItemBoots: string;
    ItemHead: string;
    ItemHands: string;
})[];
declare var MainHallPunishmentChoice: number;
declare var MainHallRopeColor: string;
