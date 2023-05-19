/**
 * Checks if the player is helpless (maids disabled) or not.
 * @returns {boolean} - Returns true if the player still has time remaining after asking the maids to stop helping
 */
declare function ManagementIsMaidsDisabled(): boolean;
/**
 * Checks if the player has a special title such as maid, mistress, kidnapper, etc.
 * @returns {boolean} - TRUE if the player has a special title.
 */
declare function ManagementNoTitle(): boolean;
/**
 * Checks if the player has unlocked sarah's quest.
 * @returns {boolean} - TRUE if the player has unlocked sarah's quest.
 */
declare function ManagementSarahUnlockQuest(): boolean;
/**
 * Checks if the player is Sarah's owner.
 * @returns {boolean} - TRUE if the player is Sarah's owner.
 */
declare function ManagementIsSarahOwner(): boolean;
/**
 * Checks if the mistress has been angered for a given amount of times.
 * @param {number} InCount - Number of times the mistress has to have been angered.
 * @returns {boolean} - TRUE if the mistress has been angered the specified amount.
 */
declare function ManagementGetMistressAngryCount(InCount: number): boolean;
/**
 * Increments the amount of times the mistress has been angered.
 * @returns {void} - Nothing
 */
declare function ManagementMistressAngryAdd(): void;
/**
 * Checks if the mistress is willing to release the player. (Based on the release timer)
 * @returns {boolean} - TRUE if the mistress will release the player
 */
declare function ManagementMistressWillRelease(): boolean;
/**
 * Checks if the player is about to play with the submissive, albeit without the consent of the mistress.
 * @returns {boolean} - TRUE if the dialog option is available.
 */
declare function ManagementCanPlayWithoutPermission(): boolean;
/**
 * Checks if the player is owned by one of the bondage college NPCs.
 * @returns {boolean} - TRUE if the player is owned by a bondage college NPC
 */
declare function ManagementOwnerFromBondageCollege(): boolean;
/**
 * Checks if the player's owner is a NPC in her private room.
 * @returns {boolean} - TRUE if the player's owner is in the player's private room.
 */
declare function ManagementOwnerInPrivateRoom(): boolean;
/**
 * Checks if the player's owner is not one of the bondage college NPC.
 * @returns {boolean} - TRUE if the player is NOT owned by a bondage college NPC
 */
declare function ManagementOwnerAway(): boolean;
/**
 * Checks if the player is wearing any chastity item that can currently be removed by the mistress.
 * @returns {boolean} - TRUE if there is at least one chastity item that can be removed.
 */
declare function ManagementAllowReleaseChastity(): boolean;
/**
 * Checks if the player is chaste, but cannot be released.
 * @returns {boolean} - TRUE if the player is chaste and cannot be released.
 */
declare function ManagementRefuseReleaseChastity(): boolean;
/**
 * Checks if the player cannot be released by the mistress.
 * @returns {boolean} - TRUE if the player cannot be released.
 */
declare function ManagementOwnerPending(): boolean;
/**
 * Checks if the player can be released from her chastity items by the mistress
 * @returns {boolean} - TRUE if the release timer has expired and the mistress can release the player from chastity.
 */
declare function ManagementOwnerAccepted(): boolean;
/**
 * Checks if the player can be released by the mistress (timer), but cannot be released from chastity due to her owner.
 * @returns {boolean} - TRUE if the player can be released, but cannot be released from chastity.
 */
declare function ManagementOwnerRefused(): boolean;
/**
 * Helper function to check a group's unlockability.
 * @param {AssetGroupItemName} groupName - The name of the group to unlock
 */
declare function ManagementCanUnlockGroup(groupName: AssetGroupItemName): boolean;
/**
 * Checks if the mistress can remove the player's chastity bra
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockBra(): boolean;
/**
 * Checks if the mistress can remove the player's butt item with a chaste effect
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockButt(): boolean;
/**
 * Checks if the mistress can remove the player's vulva piercing item with a chaste effect
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockVulvaPiercings(): boolean;
/**
 * Checks if the mistress can remove the player's vulva item with a chaste effect
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockVulva(): boolean;
/**
 * Checks if the mistress can remove the player's nipple item with a chaste effect
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockNipples(): boolean;
/**
 * Checks if the mistress can remove the player's pelvis item with a chaste effect
 * @returns {boolean} - TRUE if the mistress can remove the item. (Not owner locked while owned and has at least 25$.)
 */
declare function ManagementCanUnlockBelt(): boolean;
/**
 * Sets the player's chastity release timer to 0.
 * @returns {void} - Nothing.
 */
declare function ManagementEndChastityRelease(): void;
/**
 * Checks if the player can be released from her owner, but for the first time ever.
 * @returns {boolean} - TRUE if the player has at least 60$ and has never been released from an owner before.
 */
declare function ManagementCanReleaseFromOwnerFirst(): boolean;
/**
 * Checks if the player can be released from her owner, but has been released before.
 * @returns {boolean} - TRUE if the player has at least 200$ and has been released from an owner before.
 */
declare function ManagementCanReleaseFromOwner(): boolean;
/**
 * Checks if the player can break an online ownership trial.
 * @returns {boolean} - TRUE if the player can break her trial.
 */
declare function ManagementCanBreakTrialOnline(): boolean;
/**
 * Checks if the player can part ways from their online owner. (7 days wait time over)
 * @returns {boolean} - TRUE if the player can break her full collar.
 */
declare function ManagementCanBeReleasedOnline(): boolean;
/**
 * Checks if the player cannot part ways from their online owner. (7 days wait time not over)
 * @returns {boolean} - TRUE if the player cannot break her full collar.
 */
declare function ManagementCannotBeReleasedOnline(): boolean;
/**
 * Checks if the player can part ways from her owner. (The NPC left the private room.)
 * @returns {boolean} - TRUE if the player can part ways with her current NPC owner.
 */
declare function ManagementCanBeReleased(): boolean;
/**
 * Checks if the player cannot part ways from her owner. (The NPC is still in the private room.)
 * @returns {boolean} - TRUE if the player cannot part ways with her current NPC owner.
 */
declare function ManagementCannotBeReleased(): boolean;
/**
 * Checks if the player cannot part ways from her owner because she's on the Extreme difficulty.
 * @returns {boolean} - TRUE if the player cannot part ways with her current owner.
 */
declare function ManagementCannotBeReleasedExtreme(): boolean;
/**
 * Checks if the player can be owned by the mistress.
 * @returns {boolean} - TRUE if the player is fully submissive, the player is not owned, the mistress has not been angered and the mistress can enter the private room.
 */
declare function ManagementWillOwnPlayer(): boolean;
/**
 * Checks if the mistress is not willing to own the player.
 * @returns {boolean} - TRUE if the player can be owned, but is not submissive enough.
 */
declare function ManagementWontOwnPlayer(): boolean;
/**
 * Checks if the player has at least one lover who is a NPC from bondage college.
 * @returns {boolean} - TRUE if the player has at least one lover who is a NPC from bondage college.
 */
declare function ManagementLoverFromBondageCollege(): boolean;
/**
 * Checks if the player can stop dating the given online lover (1 to 5)
 * @param {number} L - Index of the potential lover
 * @returns {boolean} - TRUE if the player can stop dating the specified lover
 */
declare function ManagementCanBreakDatingLoverOnline(L: number): boolean;
/**
 * Checks if the player can divorce the given online lover (The 1 week waiting period is over)
 * @param {number} L - Index of the potential lover
 * @returns {boolean} - TRUE if the they can get divorced
 */
declare function ManagementCanBreakUpLoverOnline(L: number): boolean;
/**
 * Checks if the player is not able to divorce the given online lover (The 1 week waiting period is not over)
 * @param {number} L - Index of the potential lover
 * @returns {boolean} - TRUE if the they cannot get divorced
 */
declare function ManagementCannotBreakUpLoverOnline(L: number): boolean;
/**
 * Checks if the player can stop dating the given NPC lover (1 to 5)
 * @param {number} L - Index of the potential lover
 * @returns {boolean} - TRUE if the player can stop dating the specified lover. (The NPC is gone from the room.)
 */
declare function ManagementCanBreakUpLoverNPC(L: number): boolean;
/**
 * Checks if the player cannot stop dating the given NPC lover (1 to 5)
 * @param {number} L - Index of the potential lover
 * @returns {boolean} - TRUE if the player cannot stop dating the specified lover (The lover is still in the player's private room.)
 */
declare function ManagementCannotBreakUpLoverNPC(L: number): boolean;
/**
 * Checks if the player is currently a club slave.
 * @returns {boolean} - TRUE if the player is a club slave.
 */
declare function ManagementIsClubSlave(): boolean;
/**
 * Checks if the player is wearing a slave collar.
 * @returns {boolean} - TRUE if the player is wearing a slave collar.
 */
declare function ManagementWearingSlaveCollar(): boolean;
/**
 * Checks if a NPC can be transfered to the player's private room.
 * @returns {boolean} - TRUE if the player owns a private room, has space for an extra NPC and is not locked out of her room.
 */
declare function ManagementCanTransferToRoom(): boolean;
/**
 * Checks if the mistress is not willing to visit the player's room.
 * @returns {boolean} - TRUE if the mistress could transfer to the player's room, but is not willing to.
 */
declare function ManagementWontVisitRoom(): boolean;
/**
 * Checks if the player can become a club mistress.
 * @returns {boolean} - TRUE if the player is fully dominant, has been in the club for more than a month, is currently not restrained, is not kneeling, can currently change and is currently not a club mistress.
 */
declare function ManagementCanBeClubMistress(): boolean;
/**
 * Checks if the player is not able to become a club mistress due to her reputation.
 * @returns {boolean} - TRUE if the player could be a club mistress, but has a dominant reputation between 50 and 99.
 */
declare function ManagementCannotBeClubMistress(): boolean;
/**
 * Checks if the player is not able to become a club mistress due to her reputation (by a large amount, which makes the mistress laugh.)
 * @returns {boolean} - TRUE if the player could be a club mistress, but has a dominant reputation below 50.
 */
declare function ManagementCannotBeClubMistressLaugh(): boolean;
/**
 * Checks if the player is not able to become a club mistress due to her short time in the club.
 * @returns {boolean} - TRUE if the player has been in the club for less than a month.
 */
declare function ManagementCannotBeClubMistressTime(): boolean;
/**
 * Checks if the player can receive her club mistress pay check.
 * @returns {boolean} - TRUE if the player is a club mistress and has not been paid this week.
 */
declare function ManagementMistressCanBePaid(): boolean;
/**
 * Checks if the player cannot receive her club mistress pay check.
 * @returns {boolean} - TRUE if the player is a club mistress, but has already been paid this week.
 */
declare function ManagementMistressCannotBePaid(): boolean;
/**
 * Checks if the player can be a club slave.
 * @returns {boolean} - TRUE if the player is not wearing an owner/lover only restraint and is not too dominant.
 */
declare function ManagementCanBeClubSlave(): boolean;
/**
 * Checks if the player cannot be a club slave due to her dominant reputation.
 * @returns {boolean} - TRUE if the player is not wearing an owner/lover only restraint, but is too dominant.
 */
declare function ManagementCannotBeClubSlaveDominant(): boolean;
/**
 * Checks if the player cannot be a club slave due to her currently worn owner-only restraint(s).
 * @returns {boolean} - TRUE if the player is wearing an owner-only restraint.
 */
declare function ManagementCannotBeClubSlaveOwnerLock(): boolean;
/**
 * Checks if the player cannot be a club slave due to her currently worn lover-only restraint(s).
 * @returns {boolean} - TRUE if the player is wearing a lover-only restraint.
 */
declare function ManagementCannotBeClubSlaveLoverLock(): boolean;
/**
 * Checks if the player cannot be a club slave due to her currently worn lover-only restraint(s).
 * @returns {boolean} - TRUE if the player is wearing a lover-only restraint.
 */
declare function ManagementCannotBeClubSlaveFamilyLock(): boolean;
/**
 * Checks if the player can kiss the current NPC.
 * @returns {boolean} - TRUE if both the NPC and the player can talk.
 */
declare function ManagementCanKiss(): boolean;
/**
 * Checks if the player can masturbate the current NPC.
 * @returns {boolean} - TRUE if the NPC is not chaste and the player can interact.
 */
declare function ManagementCanMasturbate(): boolean;
/**
 * Checks if the player can play with the management submissive NPC.
 * @returns {boolean} - TRUE if the player's dominant reputation is below 23 and the player is not wearing a locked restraint.
 */
declare function ManagementCanPlayWithSub(): boolean;
/**
 * Checks if the player cannot play with the management submissive NPC due to a locked restraint.
 * @returns {boolean} - TRUE if the player's dominant reputation is below 23, but the player is wearing a locked restraint.
 */
declare function ManagementCannotPlayWithSubLock(): boolean;
/**
 * Checks if there is no mistress in the player's private room.
 * @returns {boolean} - TRUE if there's no other Mistress in the player private room
 */
declare function ManagementNoMistressInPrivateRoom(): boolean;
/**
 * Checks if there is a chaste NPC in the player's private room.
 * @returns {boolean} - TRUE if any NPC in the private room is chaste.
 */
declare function ManagementFriendIsChaste(): boolean;
/**
 * Loads the club management room, creates the Mistress and sub character
 * @returns {void} - Nothing.
 */
declare function ManagementLoad(): void;
/**
 * Run the club management room, draws the player and 2 NPCs (if they are not gone).
 * @returns {void} - Nothing.
 */
declare function ManagementRun(): void;
/**
 * Handles clicks in the club management room.
 * @returns {void} - Nothing.
 */
declare function ManagementClick(): void;
/**
 * Triggered when the mistress releases the player and dress her back
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerStrip(): void;
/**
 * Triggered when the mistress straps a tight armbinder on the player for 2 minutes.
 * @param {number} ChangeRep - The value the player's Dominant reputation should be altered by
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerArmbinder(ChangeRep: number): void;
/**
 * Triggered when the mistress straps many restrains and chastity items on the player. The mistress will refuse to free the player afterwards.
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerRandomRestrain(): void;
/**
 * Triggered when the player starts playing with the management submissive. The player is restrained.
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerRandomRestrainPlay(): void;
/**
 * Triggered when the mistress releases the player and dresses her back.
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerRelease(): void;
/**
 * Triggered when the player switches from the sub to the Mistress because the mistress is angry.
 * @returns {void} - Nothing.
 */
declare function ManagementSwitchToAngryMistress(): void;
/**
 * Triggered when the mistress releases all girls that are locked in chastity items in the player's private room.
 * @returns {void} - Nothing.
 */
declare function ManagementReleasePrivateRoom(): void;
/**
 * Triggered when the player pays to have a chastity item unlocked.
 * @param {AssetGroupName} ItemGroup - The group of the item to unlock.
 * @returns {void} - Nothing.
 */
declare function ManagementUnlockItem(ItemGroup: AssetGroupName): void;
/**
 * Triggered when the mistress will contact the player's NPC owner
 * @returns {void} - Nothing.
 */
declare function ManagementContactOwner(): void;
/**
 * Triggered when the mistress releases the player from her owner.
 * @param {number} RepChange - The amount of dominant reputation the player will lose.
 * @returns {void} - Nothing.
 */
declare function ManagementReleaseFromOwner(RepChange: number): void;
/**
 * Break ownership by another player
 * @returns {void} - Nothing.
 */
declare function ManagementBreakOnlineOwnership(): void;
/**
 * Triggered when the Mistress breaks the bond between lovers.
 * @param {number} L - Index of the lover to remove.
 * @returns {void} - Nothing.
 */
declare function ManagementBreakLover(L: number): void;
/**
 * Triggered when the Mistress leaves her job to go see the player
 * @param {number} RepChange - The amount of dominant reputation the player will gain.
 * @returns {void} - Nothing.
 */
declare function ManagementSendMistressToPrivateRoom(RepChange: number): void;
/**
 * Triggered when the Mistress locks the club slave collar on the player.
 * @param {number} RepChange - The amount of dominant reputation the player will lose.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveCollar(RepChange: number): void;
/**
 * Triggered when the player finishes the club slave contract.
 * @param {number} RepChange - The amount of dominant reputation the player will gain or lose.
 * @returns {void} - Nothing.
 */
declare function ManagementFinishClubSlave(RepChange: number): void;
/**
 * Triggered when the player gets stopped by a random girl while the player is a club slave.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveRandomIntro(): void;
/**
 * Triggered when the player meets a random club slave while the player is a club mistress.
 * @returns {void} - Nothing.
 */
declare function ManagementFindClubSlaveRandomIntro(): void;
/**
 * Triggered when a random club management activity starts.
 * @param {string} A - Name of the activity being started.
 * @returns {void} - Nothing.
 */
declare function ManagementRandomActivityStart(A: string): void;
/**
 * Launches a random club slave activity.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveRandomActivityLaunch(): void;
/**
 * Triggered when the random activity stops.
 * @param {number} RepChange - Amount of dominant reputation to gain or lose.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveRandomActivityEnd(RepChange: number): void;
/**
 * Triggered when the player transfers the random NPC to her room.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveTransferToRoom(): void;
/**
 * Triggered when the player earns the mistress clothes.
 * @param {string} Color - The color of the outfit
 * @returns {void} - Nothing.
 */
declare function ManagementGetMistressOutfit(Color: string): void;
/**
 * Triggered when the player starts the Mistress introduction cutscene.
 * @returns {void} - Nothing.
 */
declare function ManagementPlayerMistressCutscene(): void;
/**
 * Triggered when the player receives her weekly 100$ mistress pay.
 * @returns {void} - Nothing.
 */
declare function ManagementMistressPay(): void;
/**
 * Triggered when the player gets kicked out of the Mistress community
 * @returns {void} - Nothing.
 */
declare function ManagementMistressKicked(): void;
/**
 * Unlocks Sarah if the player is already her owner
 * @returns {void} - Nothing.
 */
declare function ManagementFreeSarah(): void;
/**
 * Fully restrains the player for the struggle activity
 * @returns {void} - Nothing.
 */
declare function ManagementActivityStruggleRestrain(): void;
/**
 * Starts the struggle game
 * @returns {void} - Nothing.
 */
declare function ManagementActivityStruggleStart(): void;
/**
 * Starts the quiz game (picks a question at random)
 * @returns {void} - Nothing.
 */
declare function ManagementStartQuiz(): void;
/**
 * Removes gagging items from the player.
 * @returns {void} - Nothing.
 */
declare function ManagementRemoveGag(): void;
/**
 * Locks the player in the timer cell for 5 minutes.
 * @returns {void} - Nothing.
 */
declare function ManagementCell(): void;
/**
 * Returns to the main hall.
 * @returns {void} - Nothing.
 */
declare function ManagementMainHall(): void;
/**
 * Runs an activity with a random club slave. (Reputation is only added for the first 3 activities)
 * @param {string} ActivityType - The type of the club slave activity performed.
 * @param {number} RepChange - Amount of dominant reputation to gain or lose.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveActiviy(ActivityType: string, RepChange: number): void;
/**
 * Triggered after player with a club slave. There's a 50% chance the club slave will go to the player's private room.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveVisitRoom(): void;
/**
 * Triggered when the player asks to have her slave collar model changed
 * @param {string} NewType - The new slave collar type to change to.
 * @returns {void} - Nothing.
 */
declare function ManagementChangeSlaveCollarType(NewType: string): void;
/**
 * Sets the given NPC's dialog based on if the player is a club slave or not. Some NPC are not available or have special dialog for club slaves.
 * @param {Character} C - Current NPC.
 * @returns {void} - Nothing.
 */
declare function ManagementClubSlaveDialog(C: Character): void;
declare var ManagementBackground: string;
/** @type {null | NPCCharacter} */
declare var ManagementMistress: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var ManagementSub: null | NPCCharacter;
declare var ManagementMistressAngryCount: number;
declare var ManagementMistressReleaseTimer: number;
/** @type {null | Item[]} */
declare var ManagementPlayerAppearance: null | Item[];
declare var ManagementMistressAllowPlay: boolean;
declare var ManagementCanReleaseChastity: boolean;
declare var ManagementEmpty: boolean;
/** @type {null | NPCCharacter} */
declare var ManagementRandomGirl: null | NPCCharacter;
/** @type {"" | NPCArchetype} */
declare var ManagementRandomGirlArchetype: "" | NPCArchetype;
declare var ManagementRandomActivityCount: number;
declare var ManagementRandomActivity: string;
declare var ManagementRandomActivityList: string[];
declare var ManagementRandomActivityCategory: string;
declare var ManagementRandomActivityCategoryList: string[];
declare var ManagementRandomTalkCount: number;
declare var ManagementVisitRoom: boolean;
declare var ManagementTimer: number;
