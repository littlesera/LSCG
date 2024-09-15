/**
 * Checks if the player is caged.
 * @returns {boolean} - TRUE if the player is in the cage.
 */
declare function PrivateIsCaged(): boolean;
/**
 * Checks if the player can get the second private room expansion.
 * @returns {boolean} - TRUE if the player has the first private room expansion, but not the second.
 */
declare function PrivateCanGetSecondExtension(): boolean;
/**
 * Checks if the player can play with the private room vendor.
 * @returns {boolean} - TRUE if the player has every upgrade and both characters can interact.
 */
declare function PrivateVendorCanPlay(): boolean;
/**
 * Checks if the player can change her clothes.
 * @returns {boolean} - TRUE if the player is not restrained and is more dominant than the current character.
 */
declare function PrivateAllowChange(): boolean;
/**
 * Checks if the player is not able to change.
 * @returns {boolean} - TRUE if the player is not restrained, but is not enough dominant to change.
 */
declare function PrivateWontChange(): boolean;
/**
 * Checks if the current character is restrained.
 * @returns {boolean} - TRUE if the character is restrained.
 */
declare function PrivateIsRestrained(): boolean;
/**
 * Checks if the current character can be restrained.
 * @returns {boolean} - TRUE if the character can be restrained.
 */
declare function PrivateAllowRestain(): boolean;
/**
 * Checks if both characters in the current dialog can talk.
 * @returns {boolean} - TRUE if both characters are not under a gagging effect.
 */
declare function PrivateNobodyGagged(): boolean;
/**
 * Checks if the player can masturbate the current character.
 * @returns {boolean} - TRUE if the player is not restrained, the character is not vulva chaste and the character is naked.
 */
declare function PrivateCanMasturbate(): boolean;
/**
 * Checks if the player can fondle the current character's breasts.
 * @returns {boolean} - TRUE if the player is not restrained and the character is not breast chaste.
 */
declare function PrivateCanFondle(): boolean;
/**
 * Checks if the player can be restrained by the current character.
 * @returns {boolean} - TRUE if both characters are not restrained and the player is less dominant than the NPC.
 */
declare function PrivateAllowRestrainPlayer(): boolean;
/**
 * Checks if the player cannot be restrained by the current character.
 * @returns {boolean} - TRUE if both characters are not restrained, but the player is too dominant to be tied by the NPC.
 */
declare function PrivateWontRestrainPlayer(): boolean;
/**
 * Checks if the player can be released by the current character.
 * @returns {boolean} - TRUE if the player is not wearing owner restraints, the player is restrained, the release timer is up or the character is owned by the player, the current character is free and the player's owner is not around.
 */
declare function PrivateAllowReleasePlayer(): boolean;
/**
 * Checks if the player cannot be released by the current character due to time/character restrictions.
 * @returns {boolean} - TRUE if the player is restrained, but cannot be released due to the character not being owned by the player or the release timer not being expired yet.
 */
declare function PrivateWontReleasePlayer(): boolean;
/**
 * Checks if the player cannot be released by the current character due to her owner being around.
 * @returns {boolean} - TRUE if the player is restrained, but cannot be released due to her owner being in the room.
 */
declare function PrivateWontReleasePlayerOwner(): boolean;
/**
 * Checks if the player cannot be released by the current character due to worn owner only restraint(s).
 * @returns {boolean} - TRUE if the player is restrained, but is wearing owner-only restraints.
 */
declare function PrivateWontReleasePlayerOwnerOnly(): boolean;
/**
 * Checks if the NPC will kneel willingly while not gagged.
 * @returns {boolean} - TRUE if the player is more dominant than the NPC or if the player owns the NPC.
 */
declare function PrivateWillKneel(): boolean;
/**
 * Checks if the NPC will kneel willingly while gagged.
 * @returns {boolean} - TRUE if the player is more dominant than the NPC or if the player owns the NPC.
 */
declare function PrivateWillKneelGagged(): boolean;
/**
 * Checks if the NPC will not kneel willingly.
 * @returns {boolean} - TRUE if the player is less dominant than the NPC and if the player does owns the NPC.
 */
declare function PrivateWontKneel(): boolean;
/**
 * Checks if the NPC cannot kneel.
 * @returns {boolean} - TRUE if the NPC cannot kneel.
 */
declare function PrivateCannotKneel(): boolean;
/**
 * Checks if the NPC can stand.
 * @returns {boolean} - TRUE if the NPC can stand.
 */
declare function PrivateCanStandUp(): boolean;
/**
 * Checks if the NPC can stand while gagged.
 * @returns {boolean} - TRUE if the NPC can stand.
 */
declare function PrivateCanStandUpGagged(): boolean;
/**
 * Checks if the NPC cannot stand up.
 * @returns {boolean} - TRUE if the NPC is not able to stand.
 */
declare function PrivateCannotStandUp(): boolean;
/**
 * Checks if the character would take the player as a sub.
 * @returns {boolean} - TRUE if the character is willing to own the player.
 */
declare function PrivateWouldTakePlayerAsSub(): boolean;
/**
 * Checks if the character will not take the player as a sub.
 * @returns {boolean} - TRUE if the character is not willing to own the player.
 */
declare function PrivateWontTakePlayerAsSub(): boolean;
/**
 * Checks if the character would take the player has a sub, but the wait time is not over.
 * @returns {boolean} - TRUE if some time is still needed before the NPC can own the player.
 */
declare function PrivateNeedTimeToTakePlayerAsSub(): boolean;
/**
 * Checks if the character would never own the player.
 * @returns {boolean} - TRUE if the character is too submissive to own the player.
 */
declare function PrivateNeverTakePlayerAsSub(): boolean;
/**
 * Checks if the character is currently on a trial.
 * @returns {boolean} - TRUE if the trial is in progress.
 */
declare function PrivateTrialInProgress(): boolean;
/**
 * Checks if the trial period is over and the character likes the player enough.
 * @returns {boolean} - TRUE if the trial period is over and the character loves the player enough.
 */
declare function PrivateTrialDoneEnoughLove(): boolean;
/**
 * Checks if the trial period is over, but the character does not like the player enough.
 * @returns {boolean} - TRUE if the trial period is over, but the character does not like the player enough.
 */
declare function PrivateTrialDoneNotEnoughLove(): boolean;
/**
 * Checks if the player can cancel an active trial with the current NPC.
 * @returns {boolean} - TRUE if the player can cancel the trial.
 */
declare function PrivateTrialCanCancel(): boolean;
/**
 * Checks if the current NPC will forgive the player for refusing to play.
 * @returns {boolean} - TRUE if the NPC forgives the player.
 */
declare function PrivateWillForgive(): boolean;
/**
 * Checks if the player can ask to be uncollared.
 * @returns {boolean} - TRUE if the NPC will allow the player to be uncollared.
 */
declare function PrivateCanAskUncollar(): boolean;
/**
 * Checks if the player cannot ask to be uncollared.
 * @returns {boolean} - TRUE if the player cannot ask to be uncollared.
 */
declare function PrivateCannotAskUncollar(): boolean;
/**
 * Checks if the current character is a mistress.
 * @returns {boolean} - TRUE if the NPC is a club mistress.
 */
declare function PrivateIsMistress(): boolean;
/**
 * Checks if the NPC is willing to take the player as her owner.
 * @returns {boolean} - TRUE if the player can own the NPC
 */
declare function PrivateWouldTakePlayerAsDom(): boolean;
/**
 * Checks if the NPC is not willing to take the player as her owner
 * @returns {boolean} - TRUE if the player cannot own the NPC
 */
declare function PrivateWontTakePlayerAsDom(): boolean;
/**
 * Checks if the NPC is willing to be own, but the waiting period is not over.
 * @returns {boolean} - TRUE if the NPC can be own, but more time is needed.
 */
declare function PrivateNeedTimeToTakePlayerAsDom(): boolean;
/**
 * Checks if the NPC would never take the player as an owner
 * @returns {boolean} - TRUE if the character has a dominant reputation above 50
 */
declare function PrivateNeverTakePlayerAsDom(): boolean;
/**
 * Checks if the NPC is happy.
 * @returns {boolean} - TRUE if the love value is above 30.
 */
declare function PrivateIsHappy(): boolean;
/**
 * Checks if the NPC is unhappy
 * @returns {boolean} - TRUE if the love value is below -30.
 */
declare function PrivateIsUnhappy(): boolean;
/**
 * Checks if the NPC is in a neutral mood.
 * @returns {boolean} - TRUE if the love value is between -30 and 30
 */
declare function PrivateIsNeutral(): boolean;
/**
 * Checks if the lover NPC is happy.
 * @returns {boolean} - TRUE if the NPC is a lover and the love value is above 30
 */
declare function PrivateIsLoverHappy(): boolean;
/**
 * Checks if the lover NPC is unhappy.
 * @returns {boolean} - TRUE if the NPC is a lover and the love value is below -30
 */
declare function PrivateIsLoverUnhappy(): boolean;
/**
 * Checks if the lover NPC is in a neutral mood.
 * @returns {boolean} - TRUE if the NPC is a lover and the love value is between -30 and 30
 */
declare function PrivateIsLoverNeutral(): boolean;
/**
 * Checks if the sub trial for the NPC is over.
 * @returns {boolean} - TRUE if the trial period is over.
 */
declare function PrivateSubTrialInProgress(): boolean;
/**
 * Checks if the NPC is willing to be fully collared after the trial.
 * @returns {boolean} - TRUE if the NPC is willing to be fully collared after the trial.
 */
declare function PrivateSubTrialOverWilling(): boolean;
/**
 * Checks if the NPC is not willing to be fully collared after the trial.
 * @returns {boolean} - TRUE if the NPC is not willing to be fully collared after the trial.
 */
declare function PrivateSubTrialOverUnwilling(): boolean;
/**
 * Checks if the player can be pet by a NPC.
 * @returns {boolean} - TRUE if the player is restrained by a petsuit and the NPC is free.
 */
declare function PrivateCanPet(): boolean;
/**
 * Checks if the player can sell her slave.
 * @returns {boolean} - TRUE if the player is free and the slave is not a bondage college NPC.
 */
declare function PrivateCanSellSlave(): boolean;
/**
 * Checks if the player cannot sell her slave.
 * @returns {boolean} - TRUE if the player is free and the slave is not a bondage college NPC, but the current love value is negative.
 */
declare function PrivateCannotSellSlave(): boolean;
/**
 * Checks if the player can get the college outfit.
 * @returns {boolean} - TRUE if the player does not have the college outfit and the current NPC is a bondage college NPC.
 */
declare function PrivateCanGetCollegeClothes(): boolean;
/**
 * Checks if the current NPC is a lover of the player.
 * @returns {boolean} - TRUE if the NPC is a lover of the player.
 */
declare function PrivateIsLover(): boolean;
/**
 * Checks if the current NPC is a lover of the player and currently on the Fiancée stage.
 * @returns {boolean} - TRUE if the NPC is a fiancee for the player.
 */
declare function PrivateIsFiancee(): boolean;
/**
 * Checks if the current NPC is a lover of the player and currently on the Wife stage.
 * @returns {boolean} - TRUE if the NPC is a wife for the player.
 */
declare function PrivateIsWife(): boolean;
/**
 * Checks if the NPC will take the player as a lover.
 * @returns {boolean} - TRUE if the player can have one more lover, the NPC loves the player enough and the event delay has expired.
 */
declare function PrivateWillTakePlayerAsLover(): boolean;
/**
 * Checks if the NPC will not take the player as a lover.
 * @returns {boolean} - TRUE if the player cannot have one more lover, the NPC does not love the player enough, or the event delay has not expired yet.
 */
declare function PrivateWontTakePlayerAsLover(): boolean;
/**
 * Checks if the NPC will not take the player as a lover because she is already dating someone.
 * @returns {boolean} - TRUE if the NPC is already dating something.
 */
declare function PrivateWontTakePlayerAsLoverAlreadyDating(): boolean;
/**
 * Checks if the NPC will not take the player as a lover because the player reached the lover limit.
 * @returns {boolean} - TRUE if the NPC is free, but the player has 5 lovers.
 */
declare function PrivateWontTakePlayerAsLoverPlayerDating(): boolean;
/**
 * Checks if the NPC will upgrade her lovership from girlfriend to fiancée
 * @returns {boolean} - TRUE if the NPC is already a girlfriend, her love is at least 70 and enough time has gone by
 */
declare function PrivateWillTakePlayerAsFiancee(): boolean;
/**
 * Checks if the NPC will not upgrade her lovership from girlfriend to fiancée
 * @returns {boolean} - TRUE if the NPC is already a girlfriend, her love is below 70 or not enough time has gone by
 */
declare function PrivateWontTakePlayerAsFiancee(): boolean;
/**
 * Checks if the NPC will upgrade her lovership from fiancée to wife
 * @returns {boolean} - TRUE if the NPC is already a fiancée, her love is at least 90 and enough time has gone by
 */
declare function PrivateWillTakePlayerAsWife(): boolean;
/**
 * Checks if the NPC will not upgrade her lovership from fiancée to wife
 * @returns {boolean} - TRUE if the NPC is already a fiancée, her love is below 90 or not enough time has gone by
 */
declare function PrivateWontTakePlayerAsWife(): boolean;
/**
 * Checks if it's possible for the player to turn the tables against her NPC owner
 * @returns {boolean} - TRUE if turning the tables is possible
 */
declare function PrivatePlayerCanTurnTables(): boolean;
/**
 * Checks if it's possible for the submissive to turn the tables against her player owner
 * @returns {boolean} - TRUE if turning the tables is possible
 */
declare function PrivateSubCanTurnTables(): boolean;
/**
 * Checks if it's possible to use cheats on an NPC
 * @returns {boolean} - TRUE if we allow NPC cheats
 */
declare function PrivateNPCAllowCheat(): boolean;
/**
 * Checks if the character comes from Pandora's Box and she has a negative opinion of the player
 * @returns {boolean} - TRUE if the character is from Pandora's Box and has a negative opinion
 */
declare function PrivateIsFromPandoraNegative(): boolean;
/**
 * Checks if the character comes from Pandora's Box and she has a neutral opinion of the player
 * @returns {boolean} - TRUE if the character is from Pandora's Box and has a neutral opinion
 */
declare function PrivateIsFromPandoraNeutral(): boolean;
/**
 * Checks if the character comes from Pandora's Box and she has a positive opinion of the player
 * @returns {boolean} - TRUE if the character is from Pandora's Box and has a positive opinion
 */
declare function PrivateIsFromPandoraPositive(): boolean;
/**
 * Checks if the private character has a specific title
 * @returns {boolean} - TRUE if the character has the title in the parameter
 */
declare function PrivateTitleIs(Title: any): boolean;
/**
 * Returns TRUE if it's the player birthday of at least 1 year (based on same month and day, different year)
 * @returns {boolean} - TRUE if it's the birthday
 */
declare function PrivateIsPlayerBirthday(): boolean;
/**
 * Returns TRUE if the private room friend will join the player in bed, love must be positive and higher than frigid trait
 * @returns {boolean} - TRUE if she will join
 */
declare function PrivateWillJoinBed(): boolean;
/**
 * Returns TRUE if the private room friend will not join the player in bed, love must be positive and higher than frigid trait
 * @returns {boolean} - TRUE if she will not join
 */
declare function PrivateWillNotJoinBed(): boolean;
/**
 * Returns TRUE if the private room friend will join the player in bed, love must be positive and higher than frigid trait (gagged version)
 * @returns {boolean} - TRUE if she will join
 */
declare function PrivateWillJoinBedGag(): boolean;
/**
 * Returns TRUE if the private room friend will not join the player in bed, love must be positive and higher than frigid trait (gagged version)
 * @returns {boolean} - TRUE if she will not join
 */
declare function PrivateWillNotJoinBedGag(): boolean;
/**
 * Returns TRUE if the both players can play club cards (no restraints or gag)
 * @returns {boolean} - TRUE if both parties can play
 */
declare function PrivateCanPlayClubCard(): boolean;
/**
 * Returns TRUE if the club card victory mode is active
 * @returns {boolean} - TRUE if active
 */
declare function PrivateClubCardVictoryModeActive(): boolean;
/**
 * Loads the private room screen and the vendor NPC.
 * @returns {void} - Nothing.
 */
declare function PrivateLoad(): void;
/**
 * NPCs can change clothes randomly everyday
 * @param {Character} C - The NPC to change
 * @returns {void} - Nothing.
 */
declare function PrivateNewCloth(C: Character): void;
/**
 * Draws all the characters in the private room.
 * @returns {void} - Nothing.
 */
declare function PrivateDrawCharacter(): void;
/**
 * Runs the top Y position for a button
 * @param {number} Position - The button position from 0 to 8
 * @returns {number} - The Y position
 */
declare function PrivateButtonTop(Position: number): number;
/**
 * Runs the private room screen.
 * @returns {void} - Nothing.
 */
declare function PrivateRun(): void;
/**
 * Handles clicks on the buttons below NPCs.
 * @returns {void} - Nothing.
 */
declare function PrivateClickCharacterButton(): void;
/**
 * Handles clicks on the NPCs.
 * @returns {void} - Nothing.
 */
declare function PrivateClickCharacter(): void;
/**
 * Handles clicks in the private room.
 * @returns {void} - Nothing.
 */
declare function PrivateClick(): void;
/**
 * Triggered when the player rents the room.
 * @returns {void} - Nothing.
 */
declare function PrivateRentRoom(): void;
/**
 * Triggered when the player gets the wardrobe.
 * @returns {void} - Nothing.
 */
declare function PrivateGetWardrobe(): void;
/**
 * Triggered when the player gets the cage.
 * @returns {void} - Nothing.
 */
declare function PrivateGetCage(): void;
/**
 * Triggered when the player gets the room expansion.
 * @returns {void} - Nothing.
 */
declare function PrivateGetExpansion(): void;
/**
 * Triggered when the player gets the second room expansion.
 * @returns {void} - Nothing.
 */
declare function PrivateGetSecondExpansion(): void;
/**
 * Triggered when the player gets the security service against Pandora's kidnappings.
 * @returns {void} - Nothing.
 */
declare function PrivateGetSecurity(): void;
/**
 * Triggered when the player cancels the security service against Pandora's kidnappings.
 * @returns {void} - Nothing.
 */
declare function PrivateCancelSecurity(): void;
/**
 * Loads a given private room character.
 * @param {number} C - Index of the private character to load.
 * @returns {boolean} - Update required.
 */
declare function PrivateLoadCharacter(C: number): boolean;
/**
 * Triggered when a new character is added to the player's private room.
 * @param {NPCCharacter} Template - The base of the character, includes the name and appearance.
 * @param {"" | NPCArchetype} [Archetype] - The type of character such as maid or mistress.
 * @param {boolean} [CustomData=false] - Whether or not the character has non-random traits.
 * @returns {NPCCharacter} - The new private room character.
 */
declare function PrivateAddCharacter(Template: NPCCharacter, Archetype?: "" | NPCArchetype, CustomData?: boolean): NPCCharacter;
/**
 * Gets the index of a given private room character.
 * @returns {number} - Index of the NPC inside the private characters array.
 */
declare function PrivateGetCurrentID(): number;
/**
 * Triggered when the player kicks out a character.
 * @returns {void} - Nothing.
 */
declare function PrivateKickOut(): void;
/**
 * Triggered when the player tells a NPC to change.
 * @param {string} NewCloth - The new appearance to dress the NPC with
 * @returns {void} - Nothing.
 */
declare function PrivateChange(NewCloth: string): void;
/**
 * Checks if the player's owner is inside her private room.
 * @returns {boolean} - Returns TRUE if the player's owner is inside her private room.
 */
declare function PrivateOwnerInRoom(): boolean;
/**
 * Checks if the player's lover is inside her private room.
 * @param {number} L - Index of the lover to check for.
 * @returns {boolean} - Returns TRUE if the player's lover is inside her private room.
 */
declare function PrivateLoverInRoom(L: number): boolean;
/**
 * Triggered when a NPC restrains the player, there's a 1-2 minute timer before the player can be released.
 * @returns {void} - Nothing.
 */
declare function PrivateRestrainPlayer(): void;
/**
 * Alters relationships to make them decay after some time. Below -100, the NPC leaves if she's not caged.
 * @returns {boolean} - Whether or not any private characters require updating.
 */
declare function PrivateRelationDecay(): boolean;
/**
 * Triggered when the player starts a submissive trial with an NPC
 * @param {number} ChangeRep - Amount of dominant reputation to lose.
 * @returns {void} - Nothing.
 */
declare function PrivateStartTrial(ChangeRep: number): void;
/**
 * Triggered when the player stops a submissive trial with an NPC
 * @param {number} ChangeRep - Amount of dominant reputation to gain/lose.
 * @returns {void} - Nothing.
 */
declare function PrivateStopTrial(ChangeRep: number): void;
/**
 * Shows the number or hours remaining for the trial in the dialog phrase.
 * @returns {void} - Nothing.
 */
declare function PrivateShowTrialHours(): void;
/**
 * Runs the currently selected activity
 * @param {number} LoveFactor - Amount of love to be added or removed from the NPC.
 * @returns {void} - Nothing.
 */
declare function PrivateActivityRun(LoveFactor: number): void;
/**
 * Checks if the player is owned. (In general)
 * @returns {boolean} - Returns TRUE if the player has an owner.
 */
declare function PrivatePlayerIsOwned(): boolean;
/**
 * Checks if an NPC in the private room can be restrained by another.
 * @returns {boolean} - Returns TRUE if someone else in the room can be restrained by the player's owner, keep that target in a variable to be used later
 */
declare function PrivateCanRestrainOther(): boolean;
/**
 * Starts a random activity for the player as submissive.
 * @returns {void} - Nothing.
 */
declare function PrivateStartActivity(): void;
/**
 * Set the no change rule for the player.
 * @param {number} Minutes - The number of minutes to apply the rule for
 * @returns {void} - Nothing.
 */
declare function PrivateBlockChange(Minutes: number): void;
/**
 * Starts a random punishment for the player as submissive.
 * @returns {void} - Nothing.
 */
declare function PrivateSelectPunishment(): void;
/**
 * Runs the currently selected player punishment.
 * @param {number} LoveFactor - Amount of love to be added or removed from the NPC.
 * @returns {void} - Nothing.
 */
declare function PrivateRunPunishment(LoveFactor: number): void;
/**
 * Sets up the player collaring ceremony cutscene.
 * @returns {void} - Nothing.
 */
declare function PrivatePlayerCollaring(): void;
/**
 * Starts the D/s trial period with the player as the owner.
 * @param {number} TrialTime - amount of days the trial will go for.
 * @returns {void} - Nothing.
 */
declare function PrivateStartDomTrial(TrialTime: number): void;
/**
 * Sets up the NPC collaring ceremony cutscene.
 * @returns {void} - Nothing.
 */
declare function PrivateNPCCollaring(): void;
/**
 * Triggered when the player gets a NPC lover, it assigns the current character as one of the player's lovers.
 * @returns {void} - Nothing.
 */
declare function PrivateStartGirlfriend(): void;
/**
 * Puts a wedding ring of a specified color on a specified character
 * @param {Character} C - The character that must wear the ring.
 * @param {string} Color - The color of the ring #D0D000 is gold, #B0B0B0 is silver.
 * @returns {void} - Nothing.
 */
declare function PrivateWearRing(C: Character, Color: string): void;
/**
 * Triggered when the player upgrades her NPC girlfriend to Fiancee
 * @returns {void} - Nothing.
 */
declare function PrivateStartFiancee(): void;
/**
 * Triggered when the player upgrades her NPC fiancee to wife, gets two wedding items for free
 * @returns {void} - Nothing.
 */
declare function PrivateStartWife(): void;
/**
 * Processes a love change for a NPC.The NPC love can only reach 60 without a proper relationship, 100 if in a relationship.
 * @param {number} LoveFactor - Amount of love to gain or lose.
 * @returns {void} - Nothing.
 */
declare function PrivateNPCInteraction(LoveFactor: number): void;
/**
 * Triggered when the slave market transation starts (10$ + 1$ per day for sold slave + 0% to 100% from the random auction, divide in 7 for rentals)
 * @param {"Rent" | "Sell"} AuctionType - Type of the auction to start.
 * @returns {void} - Nothing.
 */
declare function PrivateSlaveMarketStart(AuctionType: "Rent" | "Sell"): void;
/**
 * Triggered when the player selects how to improve her slave.
 * @param {string} Type - Trait to improve.
 * @returns {void} - Nothing.
 */
declare function PrivateSlaveImproveSelect(Type: string): void;
/**
 * Triggered when the player's slave is sent to the asylum to have a trait corrected. (The higher the value, the slower it raises)
 * @returns {void} - Nothing.
 */
declare function PrivateSlaveImproveSend(): void;
/**
 * Triggered when Amanda/Sarah/Sidney/Jennifer gives her college outfit to the player.
 * @returns {void} - Nothing.
 */
declare function PrivateGetCollegeClothes(): void;
/**
 * Triggered when the player says "I love you" to her NPC girlfriend.
 * @returns {void} - Nothing.
 */
declare function PrivateLoveYou(): void;
/**
 * Triggered when the player starts turning the tables on her NPC owner.  The player stands up.
 * @returns {void} - Nothing.
 */
declare function PrivatePlayerTurnTablesStart(): void;
/**
 * Triggered when the player turns the table with her owner but only removes her collar
 * @returns {void} - Nothing.
 */
declare function PrivatePlayerTurnTablesRemove(): void;
/**
 * Triggered when the player turns the table with her owner and transfer her collar
 * @returns {void} - Nothing.
 */
declare function PrivatePlayerTurnTablesCollar(): void;
/**
 * Triggered when the sub starts to the turn the tables against the player
 * @returns {void} - Nothing.
 */
declare function PrivateSubTurnTablesStart(): void;
/**
 * Triggered when the sub turns the table on the player
 * @returns {void} - Nothing.
 */
declare function PrivateSubTurnTablesDone(): void;
/**
 * When the player triggers a cheat on a NPC
 * @returns {void} - Nothing.
 */
declare function PrivateNPCCheat(Type: any): void;
/**
 * Get a bed from the NPC vendor
 * @param {"White" | "Black" | "Pink"} Type - The bed type (White or Black for now)
 * @returns {void} - Nothing.
 */
declare function PrivateGetBed(Type: "White" | "Black" | "Pink"): void;
/**
 * When the player exits the private room
 * @returns {void} - Nothing.
 */
declare function PrivateExit(Type: any): void;
/**
 * When the player joins the NPC in bed
 * @returns {void} - Nothing.
 */
declare function PrivateJoinInBed(): void;
/**
 * When the NPC enters the bed
 * @returns {void} - Nothing.
 */
declare function PrivateEnterBed(): void;
/**
 * Horny NPCs will randomly be in the character bed when the player enters her private room (20% odds).
 * @returns {void} - Nothing.
 */
declare function PrivateRandomBed(): void;
/**
 * Returns the Club Card Deck that will be used by the NPC
 * @returns {Array} - The Deck to useRule
 */
declare function PrivateGetClubCardDeck(C: any): any[];
/**
 * When the club card game against a friend NPC starts
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsFriendStart(): void;
/**
 * When the club card game against a friend NPC ends
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsFriendEnd(): void;
/**
 * When the club card game against an owner NPC starts
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsOwnerStart(): void;
/**
 * When the club card game against an owner NPC ends
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsOwnerEnd(): void;
/**
 * When the club card game against a submissive NPC starts
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsSubStart(): void;
/**
 * When the club card game against a submissive NPC ends
 * @returns {void} - Nothing
 */
declare function PrivateClubCardVsSubEnd(): void;
/**
 * When the club card game victory mode ends
 * @returns {void} - Nothing
 */
declare function PrivateEndClubCardVictoryMode(): void;
/**
 * When the NPC does an activity on the player after winning at club card
 * @returns {void} - Nothing
 */
declare function PrivateClubCardDefeatActivity(): void;
/**
 * The consequence activity to do
 * @param {string} Act - The activity to do
 * @param {string} LoveFactor - The love to change
 * @returns {void} - Nothing.
 */
declare function PrivateClubCardDoConsequence(Act: string, LoveFactor: string): void;
/**
 * Do the spanking club card consequence on the player
 * @param {ExpressionName} Eyes - The eye experssion to apply
 * @param {string} Strip - Underwear, Naked or NULL to strip the player or not
 * @returns {void} - Nothing.
 */
declare function PrivateClubCardKinkyConsequence(Eyes: ExpressionName, Strip: string): void;
declare var PrivateBackground: string;
/** @type {null | NPCCharacter} */
declare var PrivateVendor: null | NPCCharacter;
/** @type {NPCCharacter[]} */
declare var PrivateCharacter: NPCCharacter[];
declare var PrivateCharacterOffset: number;
declare var PrivateCharacterToSave: number;
declare var PrivateCharacterMax: number;
declare var PrivateReleaseTimer: number;
declare var PrivateActivity: string;
declare var PrivateActivityCount: number;
declare var PrivateActivityAffectLove: boolean;
declare var PrivateActivityList: string[];
/** @type {null | NPCCharacter} */
declare var PrivateActivityTarget: null | NPCCharacter;
declare var PrivatePunishment: string;
declare var PrivatePunishmentList: string[];
/** @type {null | NPCCharacter} */
declare var PrivateCharacterNewClothes: null | NPCCharacter;
declare var PrivateSlaveImproveType: string;
declare var PrivateNextLoveYou: number;
declare var PrivateLoverActivity: string;
declare var PrivateLoverActivityList: string[];
declare var PrivateBeltList: string[];
declare var PrivateEntryEvent: boolean;
declare var PrivateClubCardVictoryMode: boolean;
declare var PrivateClubCardDefeatConsequence: string[];
