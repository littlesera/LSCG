/**
 * Checks if the player can add the current character to her whitelist.
 * @returns {boolean} - TRUE if the current character is not in the player's whitelist nor blacklist.
 */
declare function ChatRoomCanAddWhiteList(): boolean;
/**
 * Checks if the player can add the current character to her blacklist.
 * @returns {boolean} - TRUE if the current character is not in the player's whitelist nor blacklist.
 */
declare function ChatRoomCanAddBlackList(): boolean;
/**
 * Checks if the player can remove the current character from her whitelist.
 * @returns {boolean} - TRUE if the current character is in the player's whitelist, but not her blacklist.
 */
declare function ChatRoomCanRemoveWhiteList(): boolean;
/**
 * Checks if the player can remove the current character from her blacklist.
 * @returns {boolean} - TRUE if the current character is in the player's blacklist, but not her whitelist.
 */
declare function ChatRoomCanRemoveBlackList(): boolean;
/**
 * Checks if the player can add the current character to her friendlist
 * @returns {boolean} - TRUE if the current character is not in the player's friendlist yet.
 */
declare function ChatRoomCanAddFriend(): boolean;
/**
 * Checks if the player can remove the current character from her friendlist.
 * @returns {boolean} - TRUE if the current character is in the player's friendlist.
 */
declare function ChatRoomCanRemoveFriend(): boolean;
/**
 * Checks if the player can add the current character to her ghostlist
 * @returns {boolean} - TRUE if the current character is not in the player's ghostlist yet.
 */
declare function ChatRoomCanAddGhost(): boolean;
/**
 * Checks if the player can remove the current character from her ghostlist.
 * @returns {boolean} - TRUE if the current character is in the player's ghostlist.
 */
declare function ChatRoomCanRemoveGhost(): boolean;
/**
 * Checks if the player can change the current character's clothes
 * @returns {boolean} - TRUE if the player can change the character's clothes and is allowed to.
 */
declare function DialogCanChangeClothes(): boolean;
/**
 * Checks if the specified owner option is available.
 * @param {ChatRoomOwnershipOption} Option - The option to check for availability
 * @returns {boolean} - TRUE if the current ownership option is the specified one.
 */
declare function ChatRoomOwnershipOptionIs(Option: ChatRoomOwnershipOption): boolean;
/**
 * Checks if the specified lover option is available.
 * @param {ChatRoomLovershipOption} Option - The option to check for availability
 * @returns {boolean} - TRUE if the current lover option is the specified one.
 */
declare function ChatRoomLovershipOptionIs(Option: ChatRoomLovershipOption): boolean;
/**
 * Checks if the player can take a drink from the current character's tray.
 * @returns {boolean} - TRUE if the current character is wearing a drinks tray and the player can interact.
 */
declare function ChatRoomCanTakeDrink(): boolean;
/**
 * Checks if the current character is owned by the player.
 * @returns {boolean} - TRUE if the current character is owned by the player.
 */
declare function ChatRoomIsCollaredByPlayer(): boolean;
/**
 * Checks if the current character is owned by the player. (Including trial)
 * @returns {boolean} - TRUE if the current character is owned by the player.
 */
declare function ChatRoomIsOwnedByPlayer(): boolean;
/**
 * Checks if the current character is wearing any collar.
 * @returns {boolean} - TRUE if the current character is owned by the player.
 */
declare function ChatRoomIsWearingCollar(): boolean;
/**
 * Checks if the current character is lover of the player.
 * @returns {boolean} - TRUE if the current character is lover of the player.
 */
declare function ChatRoomIsLoverOfPlayer(): boolean;
/**
 * Checks if the current character can serve drinks.
 * @returns {boolean} - TRUE if the character is a maid and is free.
 */
declare function ChatRoomCanServeDrink(): boolean;
/**
 * Checks if the player can give a money envelope to her owner
 * @returns {boolean} - TRUE if the current character is the owner of the player, and the player has the envelope
 */
declare function ChatRoomCanGiveMoneyForOwner(): boolean;
/**
 * Checks if the player is a chatroom admin.
 * @returns {boolean} - TRUE if the player is an admin of the current chatroom.
 */
declare function ChatRoomPlayerIsAdmin(): boolean;
/**
 * Checks if the current character is an admin of the chatroom.
 * @returns {boolean} - TRUE if the current character is an admin.
 */
declare function ChatRoomCurrentCharacterIsAdmin(): boolean;
/**
 * Checks if the room allows the photograph feature to be used.
 * @returns {boolean} - TRUE if the player can take a photo.
 */
declare function DialogCanTakePhotos(): boolean;
/**
 * Checks if the current character has a lucky wheel to spin
 * @returns {boolean} - TRUE if the player can take a photo.
 */
declare function ChatRoomCanStartWheelFortune(): boolean;
/**
 * Starts the current character lucky wheel
 * @returns {void} - Nothing
 */
declare function ChatRoomStartWheelFortune(): void;
/**
 * If the player is owner and wearing a wheel of fortune, she can force her sub to spin it
 * @returns {boolean} - TRUE if the player can take a photo.
 */
declare function ChatRoomCanForceWheelFortune(): boolean;
/**
 * Checks if the player can start searching a player
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCanTakeSuitcase(): boolean;
/**
 * Checks if the player can start searching a player
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCanTakeSuitcaseOpened(): boolean;
/**
 * Checks if the player carries a bounty
 * @param {Character} C - The character to search
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCarryingBounty(C: Character): boolean;
/**
 * Checks if the player carries an opened bounty
 * @param {Character} C - The character to search
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCarryingBountyOpened(C: Character): boolean;
/**
 * Checks if the player can start searching a player but the player is unbound
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCantTakeSuitcase(): boolean;
/**
 * Checks if the player can start searching a player but the player is unbound
 * @returns {boolean} - Returns TRUE if the player can start searching a player
 */
declare function ChatRoomCantTakeSuitcaseOpened(): boolean;
/**
 * Attempts to take the suitcase from the current player
 * @returns {void}
 */
declare function ChatRoomTryToTakeSuitcase(): void;
/**
 * Receives money from the suitcase
 * @returns {void}
 */
declare function ChatRoomReceiveSuitcaseMoney(): void;
/**
 * Checks if the player can give the target character her high security keys.
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanGiveHighSecurityKeys(): boolean;
/**
 * Checks if the player can give the target character her high security keys, while also removing the ones from her
 * possession
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanGiveHighSecurityKeysAll(): boolean;
declare function ChatRoomGiveHighSecurityKeys(): void;
declare function ChatRoomGiveHighSecurityKeysAll(): void;
/**
 * Checks if the player can help the current character by giving them a lockpick
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanGiveLockpicks(): boolean;
/**
 * Checks if the player can help the current character by giving her lockpicks
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanAssistStruggle(): boolean;
/**
 * Checks if the character options menu is available.
 * @returns {boolean} - Whether or not the player can interact with the target character
 */
declare function DialogCanPerformCharacterAction(): boolean;
/**
 * Checks if the target character can be helped back on her feet. This is different than CurrentCharacter.CanKneel()
 * because it listens for the current active pose and removes certain checks that are not required for someone else to
 * help a person kneel down.
 * @returns {boolean} - Whether or not the target character can stand
 */
declare function ChatRoomCanAssistStand(): boolean;
/**
 * Checks if the target character can be helped down on her knees. This is different than CurrentCharacter.CanKneel()
 * because it listens for the current active pose and removes certain checks that are not required for someone else to
 * help a person kneel down.
 * @returns {boolean} - Whether or not the target character can stand
 */
declare function ChatRoomCanAssistKneel(): boolean;
/**
* Checks if the player character can attempt to stand up. This is different than CurrentCharacter.CanKneel() because it
* listens for the current active pose, but it forces the player to do a minigame.
 * @returns {boolean} - Whether or not the player character can stand
 */
declare function ChatRoomCanAttemptStand(): boolean;
/**
 * Checks if the player character can attempt to get down on her knees. This is different than
 * CurrentCharacter.CanKneel() because it listens for the current active pose, but it forces the player to do a
 * minigame.
 * @returns {boolean} - Whether or not the player character can stand
 */
declare function ChatRoomCanAttemptKneel(): boolean;
/**
 * Checks if the player can stop the current character from leaving.
 * @returns {boolean} - TRUE if the current character is slowed down and can be interacted with.
 */
declare function ChatRoomCanStopSlowPlayer(): boolean;
/**
 * Checks if the player can grab the targeted player's leash
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanHoldLeash(): boolean;
/**
 * Checks if the player can let go of the targeted player's leash
 * @returns {boolean} - TRUE if the player can interact and is allowed to interact with the current character.
 */
declare function ChatRoomCanStopHoldLeash(): boolean;
/**
 * Checks if the given character is a valid leash target for the player
 * @param {Character} C - The character to search
 * @returns {boolean} - TRUE if the player can be leashed
 */
declare function ChatRoomCanBeLeashed(C: Character): boolean;
/**
 * Checks if the targeted player is a valid leash target for the source member number
 * @param {number} sourceMemberNumber - Member number of the source player
 * @param {Character} C - Target player
 * @returns {boolean} - TRUE if the player can be leashed
 */
declare function ChatRoomCanBeLeashedBy(sourceMemberNumber: number, C: Character): boolean;
/**
 * Checks if the player has waited long enough to be able to call the maids
 * @returns {boolean} - TRUE if the current character has been in the last chat room for more than 30 minutes
 */
declare function DialogCanCallMaids(): boolean;
/**
 * Checks if the player has waited long enough to be able to call the maids
 * @returns {boolean} - TRUE if the current character has been in the last chat room for more than 30 minutes
 */
declare function DialogCanCallMaidsPunishmentOn(): boolean;
/**
 * Checks if the player has waited long enough to be able to call the maids
 * @returns {boolean} - TRUE if the current character has been in the last chat room for more than 30 minutes
 */
declare function DialogCanCallMaidsPunishmentOff(): boolean;
/**
 * Creates the chat room input elements.
 * @returns {void} - Nothing.
 */
declare function ChatRoomCreateElement(): void;
/**
 * Loads the chat room screen by displaying the proper inputs.
 * @returns {void} - Nothing.
 */
declare function ChatRoomLoad(): void;
/**
 * Removes all elements that can be open in the chat room
*/
declare function ChatRoomClearAllElements(): void;
/**
 * Starts the chatroom selection screen.
 * @param {ChatRoomSpaceType} Space - Name of the chatroom space
 * @param {ChatRoomGame} Game - Name of the chatroom game to play
 * @param {null | string} LeaveRoom - Name of the room to go back to when exiting chatsearch.
 * @param {null | ModuleType} LeaveSpace - Name of the space to go back to when exiting chatsearch.
 * @param {string} Background - Name of the background to use in chatsearch.
 * @param {BackgroundTag[]} BackgroundTagList - List of available backgrounds in the chatroom space.
 * @returns {void} - Nothing.
 */
declare function ChatRoomStart(Space: ChatRoomSpaceType, Game: ChatRoomGame, LeaveRoom: null | string, LeaveSpace: null | ModuleType, Background: string, BackgroundTagList: BackgroundTag[]): void;
/**
 * Create the list of chat room menu buttons
 * @returns {void} - Nothing
 */
declare function ChatRoomMenuBuild(): void;
/**
 * Checks if the player's owner is inside the chatroom.
 * @returns {boolean} - Returns TRUE if the player's owner is inside the room.
 */
declare function ChatRoomOwnerInside(): boolean;
/**
 * Updates the temporary drawing arrays for characters, to handle things that are dependent on the drawn chat room
 * characters rather than the ones actually present
 * @returns {void} - Nothing
 */
declare function ChatRoomUpdateDisplay(): void;
/**
 * Draws the status bubble next to the character
 * @param {Character} C - The status bubble to draw
 * @param {number} X - Screen X position
 * @param {number} Y - Screen Y position
 * @param {number} Zoom - Screen zoom
 * @returns {void} - Nothing.
 */
declare function DrawStatus(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Draws the chatroom characters.
 * @param {boolean} DoClick - Whether or not a click was registered.
 * @returns {void} - Nothing.
 */
declare function ChatRoomDrawCharacter(DoClick: boolean): void;
/**
 * Draw the background of a chat room
 * @param {string} Background - The name of the background image file
 * @param {number} Y - The starting Y co-ordinate of the image
 * @param {number} Zoom - The zoom factor based on the number of characters
 * @param {number} DarkFactor - The value (0 = fully visible, 1 = black) to tint the background
 * @param {boolean} InvertRoom - Whether the background image should be inverted
 * @returns {void} - Nothing
 */
declare function ChatRoomDrawBackground(Background: string, Y: number, Zoom: number, DarkFactor: number, InvertRoom: boolean): void;
/**
 * Draws any overlays on top of character
 * @param {Character} C The target character
 * @param {number} CharX Character's X position on canvas
 * @param {number} CharY Character's Y position on canvas
 * @param {number} Zoom Room zoom
 * @param {number} Pos Index of target character
 */
declare function ChatRoomDrawCharacterOverlay(C: Character, CharX: number, CharY: number, Zoom: number, Pos: number): void;
/**
 * Called when character is clicked
 * @param {Character} C The target character
 * @param {number} CharX Character's X position on canvas
 * @param {number} CharY Character's Y position on canvas
 * @param {number} Zoom Room zoom
 * @param {number} ClickX Click X postion relative to character, without zoom
 * @param {number} ClickY Click Y postion relative to character, without zoom
 * @param {number} Pos Index of target character
 */
declare function ChatRoomClickCharacter(C: Character, CharX: number, CharY: number, Zoom: number, ClickX: number, ClickY: number, Pos: number): void;
/**
 * Select the character (open dialog) and clear other chatroom displays.
 * @param {Character} C - The character to focus on. Does nothing if null.
 * @returns {void} - Nothing
 */
declare function ChatRoomFocusCharacter(C: Character): void;
/**
 * Sends the request to the server to check the current character's relationship status.
 * @returns {void} - Nothing.
 */
declare function ChatRoomCheckRelationships(): void;
/**
 * Displays /help content to the player if it's their first visit to a chatroom this session
 * @returns {void} - Nothing.
 */
declare function ChatRoomFirstTimeHelp(): void;
/**
 * Sets the current whisper target and flags a target update
 * @param {number} MemberNumber - The target member number to set
 * @returns {void} - Nothing
 */
declare function ChatRoomSetTarget(MemberNumber: number): void;
/**
 * Updates the chat input's placeholder text to reflect the current whisper target
 * @returns {void} - Nothing.
 */
declare function ChatRoomTarget(): void;
/**
 * Updates the account to set the last chat room
 * @param {string} room - room to set it to. "" to reset.
 * @returns {void} - Nothing
 */
declare function ChatRoomSetLastChatRoom(room: string): void;
/**
 * Triggers a chat room message for stimulation events.
 *
 * Chance is calculated for worn items can cause stimulation (things like plugs
 * and crotch ropes), then one is randomly selected in the list and if it passes
 * a random chance check, it will send a player-only message.
 *
 * @param {StimulationAction} Action - The action that happened
 * @returns {void} - Nothing.
 */
declare function ChatRoomStimulationMessage(Action: StimulationAction): void;
/**
 * Called when screen size or position changes or after screen load
 * @param {boolean} load - If the reason for call was load (`true`) or window resize (`false`)
 */
declare function ChatRoomResize(load: boolean): void;
/**
 * Draws arousal screen filter
 * @param {number} y1 - Y to draw filter at.
 * @param {number} h - Height of filter
 * @param {number} Width - Width of filter
 * @param {number} ArousalOverride - Override to the existing arousal value
 * @returns {void} - Nothing.
 */
declare function ChatRoomDrawArousalScreenFilter(y1: number, h: number, Width: number, ArousalOverride: number, Color?: string, AlphaBonus?: number): void;
/**
 * Draws vibration screen filter for the specified player
 * @param {number} y1 - Y to draw filter at.
 * @param {number} h - Height of filter
 * @param {number} Width - Width of filter
 * @param {Character} C - Player to draw it for
 * @returns {void} - Nothing.
 */
declare function ChatRoomVibrationScreenFilter(y1: number, h: number, Width: number, C: Character): void;
/**
 * Draws vibration screen filter
 * @param {number} y1 - Y to draw filter at.
 * @param {number} h - Height of filter
 * @param {number} Width - Width of filter
 * @param {number} VibratorLower - 1-100 Strength of the vibrator "Down There"
 * @param {number} VibratorSides - 1-100 Strength of the vibrator at the breasts/nipples
 * @returns {void} - Nothing.
 */
declare function ChatRoomDrawVibrationScreenFilter(y1: number, h: number, Width: number, VibratorLower: number, VibratorSides: number): void;
/**
 * Runs the chatroom online bounty loop.
 * @returns {void} - Nothing.
 */
declare function ChatRoomUpdateOnlineBounty(): void;
/**
 * Updates the local view of character status
 * @param {Character} C - The character whose status we're updating
 * @param {string | null} Status - The new status to use
 * @returns {void} - Nothing.
 */
declare function ChatRoomStatusUpdateLocalCharacter(C: Character, Status: string | null): void;
/**
 * Updates the player status if needed and sends that new status in a chat message
 * @param {string | null} Status - The new status to use
 * @returns {void} - Nothing.
 */
declare function ChatRoomStatusUpdate(Status: string | null): void;
/**
 * Sends the "Talk" status to other players if the player typed in the text box and there's a value in it
 * @param {KeyboardEvent} Key
 * @returns {void} - Nothing.
 */
declare function ChatRoomStatusUpdateTalk(Key: KeyboardEvent): void;
/**
 * Checks if status has expired or is otherwise no longer valid and resets status if so
 * @returns {void} - Nothing.
 */
declare function ChatRoomStatusCheckExpiration(): void;
/**
 * Runs the chatroom screen.
 * @returns {void} - Nothing.
 */
declare function ChatRoomRun(): void;
/**
 * Draws the chat room menu buttons
 * @returns {void} - Nothing
 */
declare function ChatRoomMenuDraw(): void;
/**
 * Handles clicks the chatroom screen.
 * @returns {void} - Nothing.
 */
declare function ChatRoomClick(): void;
/**
 * Process chat room menu button clicks
 * @returns {void} - Nothing
 */
declare function ChatRoomMenuClick(): void;
declare function ChatRoomAttemptStandMinigameEnd(): void;
/**
 * Checks if the player can leave the chatroom.
 * @returns {boolean} - Returns TRUE if the player can leave the current chat room.
 */
declare function ChatRoomCanLeave(): boolean;
/**
 * Make the player exit from the current chatroom
 * @param {boolean} clearCharacters - Whether the online character cache should be cleared
 */
declare function ChatRoomLeave(clearCharacters?: boolean): void;
/**
 * Handles keyboard shortcuts in the chatroom screen.
 * @param {KeyboardEvent} event - The event that triggered this
 * @returns {void} - Nothing.
 */
declare function ChatRoomKeyDown(event: KeyboardEvent): void;
/**
 * Sends the chat message to the room
 * @returns {void} - Nothing.
 */
declare function ChatRoomSendChat(): void;
/**
 * Sends message to user with HTML tags
 * @param {string} Content - InnerHTML for the message
 * @param {number} [Timeout] - total time to display the message in ms
 * @returns {void} - Nothing
 */
declare function ChatRoomSendLocal(Content: string, Timeout?: number): void;
/**
 * Removes (*) (/me) (/action) then sends message as emote
 * @param {string} msg - Emote message
 * @returns {void} - Nothing
 */
declare function ChatRoomSendEmote(msg: string): void;
/**
 * Publishes common player actions (add, remove, swap) to the chat.
 * @param {Character} C - Character on which the action is done.
 * @param {string} Action - Action modifier
 * @param {Item} PrevItem - The item that has been removed.
 * @param {Item} NextItem - The item that has been added.
 * @returns {boolean} - whether we published anything to the chat.
 */
declare function ChatRoomPublishAction(C: Character, Action: string, PrevItem: Item, NextItem: Item): boolean;
/**
 * Updates an item on character for everyone in a chat room - replaces ChatRoomCharacterUpdate to cut on the lag.
 *
 * DO NOT USE. The server doesn't persist changes made that way to the database.
 *
 * @param {Character} C - Character to update.
 * @param {AssetGroupName} [Group] - Item group to update.
 * @returns {void} - Nothing.
 */
declare function ChatRoomCharacterItemUpdate(C: Character, Group?: AssetGroupName): void;
/**
 * Publishes a custom action to the chat
 * @param {string} msg - Tag of the action to send
 * @param {boolean} LeaveDialog - Whether or not the dialog should be left.
 * @param {ChatMessageDictionary} Dictionary - Dictionary of tags and data to send
 *     to the room.
 * @returns {void} - Nothing.
 */
declare function ChatRoomPublishCustomAction(msg: string, LeaveDialog: boolean, Dictionary: ChatMessageDictionary): void;
/**
 * Pushes the new character data/appearance to the server.
 * @param {Character} C - Character to update.
 * @returns {void} - Nothing.
 */
declare function ChatRoomCharacterUpdate(C: Character): void;
/**
 * Checks if the message contains mentions of the character. Case-insensitive.
 * @param {Character} C - Character to check mentions of
 * @param {string} msg - The message to check for mentions
 * @returns {boolean} - msg contains mention of C
 */
declare function ChatRoomMessageMentionsCharacter(C: Character, msg: string): boolean;
/**
 * Escapes a given string.
 * @param {string} str - Text to escape.
 * @returns {string} - Escaped string.
 */
declare function ChatRoomHTMLEntities(str: string): string;
/**
 * Check is the player is either the sender of a message, or its target.
 *
 * @param {IChatRoomMessage} data - The chat message to check for involvment.
 * @returns {boolean} true if the player is involved, false otherwise.
 */
declare function ChatRoomMessageInvolvesPlayer(data: IChatRoomMessage): boolean;
/**
 * Checks whether the given character's interactions are impacted by the player's sensory-deprivation.
 *
 * @param {Character} character - The character to check.
 * @returns true if the player is sensory-deprived from character, false otherwise.
 */
declare function ChatRoomIsCharacterImpactedBySensoryDeprivation(character: Character): boolean;
/**
 * Adds a function to the list of message extractors.
 *
 * @see ChatRoomMessageExtractor for more info.
 *
 * @param {ChatRoomMessageExtractor} func - The extractor to register
 */
declare function ChatRoomRegisterMessageExtractor(func: ChatRoomMessageExtractor): void;
/**
 * Adds a function to the list of message handlers
 *
 * @see ChatRoomMessageHandler for more info.
 *
 * @param {ChatRoomMessageHandler} handler - The handler to register
 */
declare function ChatRoomRegisterMessageHandler(handler: ChatRoomMessageHandler): void;
/**
 * Performs the processing for an hidden message.
 *
 * @param {IChatRoomMessage} data
 * @param {Character} SenderCharacter
 */
declare function ChatRoomMessageProcessHidden(data: IChatRoomMessage, SenderCharacter: Character): boolean;
/**
 * Extracts the metadata and message substitutions from a message's dictionary.
 *
 * @param {IChatRoomMessage} data - The message to parse.
 * @param {Character} SenderCharacter - The resolved character that sent that message.
 * @returns {{ metadata: IChatRoomMessageMetadata, substitutions: CommonSubtituteSubstitution[] }}
 */
declare function ChatRoomMessageDefaultMetadataExtractor(data: IChatRoomMessage, SenderCharacter: Character): {
    metadata: IChatRoomMessageMetadata;
    substitutions: CommonSubtituteSubstitution[];
};
/**
 * Gets a set of dictionary substitutions used when the given character is the source character of a chat message.
 * @param {IChatRoomMessage} data - The raw message data
 * @param {Character} character - The source character
 * @returns {CommonSubtituteSubstitution[]} - A list of dictionary substitutions that should be applied
 */
declare function ChatRoomGetSourceCharacterSubstitutions(data: IChatRoomMessage, character: Character): CommonSubtituteSubstitution[];
/**
 * Gets a set of dictionary substitutions used when the given character is the target character of a chat message.
 * @param {Character} character - The target character
 * @param {boolean} isSelf - If true, indicates that the target character is also the sender of the message (i.e. is
 * doing something to themselves)
 * @param {number} [index] - If the character is an additional target, the index that the substitution tags should be
 * given
 * @returns {CommonSubtituteSubstitution[]} - A list of dictionary substitutions that should be applied
 */
declare function ChatRoomGetTargetCharacterSubstitutions(character: Character, isSelf: boolean, index?: number): CommonSubtituteSubstitution[];
/**
 * Gets a set of dictionary substitutions used for the focus group
 * @param {IChatRoomMessage} data - The raw message data
 * @param {AssetGroup} focusGroup - The group being acted upon by the chat message
 * @param {Character} targetCharacter - The target character of the message
 * @returns {[string,string][]} - A list of dictionary substitutions that should be applied
 */
declare function ChatRoomGetFocusGroupSubstitutions(data: IChatRoomMessage, focusGroup: AssetGroup, targetCharacter: Character): [string, string][];
/**
 * Extracts all metadata and substitutions requested by a message.
 *
 * This goes through ChatRoomMessageExtractors and calls them in order
 * on the recieved message, collecting their output (metadata & tag substitutions).
 *
 * @param {IChatRoomMessage} data
 * @param {Character} sender
 * @returns {{ metadata?: IChatRoomMessageMetadata, substitutions?: CommonSubtituteSubstitution[] }}
 */
declare function ChatRoomMessageRunExtractors(data: IChatRoomMessage, sender: Character): {
    metadata?: IChatRoomMessageMetadata;
    substitutions?: CommonSubtituteSubstitution[];
};
/**
 * Run the message handlers on a given message.
 *
 * This runs a message and its metadata through the prioritized list
 * of ChatRoomMessageHandlers, and stops processing if one of them
 * requests it, ignoring the rest.
 *
 * @param {"pre"|"post"} type - The type of processing to perform
 * @param {IChatRoomMessage} data - The recieved message
 * @param {Character} sender - The actual message sender character object
 * @param {string} msg - The escaped message, likely different from data.Contents
 * @param {IChatRoomMessageMetadata} [metadata] - The message metadata, only available for post-handlers
 */
declare function ChatRoomMessageRunHandlers(type: "pre" | "post", data: IChatRoomMessage, sender: Character, msg: string, metadata?: IChatRoomMessageMetadata): string | boolean;
/**
 * Handles the reception of a chatroom message.
 *
 * @see ChatRoomMessageHandler for more information
 * @param {IChatRoomMessage} data - Message object containing things like the message type, sender, content, etc.
 * @returns {void} - Nothing.
 */
declare function ChatRoomMessage(data: IChatRoomMessage): void;
/**
 * Update the Chat log with the recieved message
 *
 * @param {IChatRoomMessage} data
 * @param {string} msg
 * @param {Character} SenderCharacter
 * @param {IChatRoomMessageMetadata} metadata
 * @returns {void}
 */
declare function ChatRoomMessageDisplay(data: IChatRoomMessage, msg: string, SenderCharacter: Character, metadata: IChatRoomMessageMetadata): void;
/**
 * Whether to replace message details which reveal information about an unseen/unheard character
 * @param {Character} C - The character whose identity should remain unknown
 * @returns {boolean} - Whether the character details should be hidden
 */
declare function ChatRoomHideIdentity(C: Character): boolean;
/**
 * Adds a character into the chat room.
 * @param {Character} newCharacter - The new character to be added to the chat room.
 * @param {object} newRawCharacter - The raw character data of the new character as it was received from the server.
 * @returns {void} - Nothing
 */
declare function ChatRoomAddCharacterToChatRoom(newCharacter: Character, newRawCharacter: object): void;
/**
 * Handles the reception of the complete room data from the server.
 * @param {IChatRoomSyncMessage} chatRoomProperties - Room object containing the updated chatroom data.
 * @returns {boolean} - Returns true if the passed properties are valid and false if they're invalid.
 */
declare function ChatRoomValidateProperties(chatRoomProperties: IChatRoomSyncMessage): boolean;
/**
 * Handles the reception of the new room data from the server.
 * @param {IChatRoomSyncMessage} data - Room object containing the updated chatroom data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSync(data: IChatRoomSyncMessage): void;
/**
 * Handles the reception of the character data of a single player from the server.
 * @param {object} data - object containing the character's data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncCharacter(data: object): void;
/**
 * Handles the reception of the character data of a newly joined player from the server.
 * @param {object} data - object containing the joined character's data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncMemberJoin(data: object): void;
/**
 * Handles the reception of the leave notification of a player from the server.
 * @param {object} data - Room object containing the leaving character's member number.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncMemberLeave(data: object): void;
/**
 * Handles the reception of the room properties from the server.
 * @param {object} data - Room object containing the updated chatroom properties.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncRoomProperties(data: object): void;
/**
 * Handles the swapping of two players by a room administrator.
 * @param {object} data - Object containing the member numbers of the swapped characters.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncReorderPlayers(data: object): void;
/**
 * Updates a single character in the chatroom
 * @param {object} data - Data object containing the new character data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncSingle(data: object): void;
/**
 * Updates a single character's expression in the chatroom.
 * @param {IChatRoomSyncExpressionMessage} data - Data object containing the new character expression data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncExpression(data: IChatRoomSyncExpressionMessage): void;
/**
 * Updates a single character's pose in the chatroom.
 * @param {IChatRoomSyncPoseMessage} data - Data object containing the new character pose data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncPose(data: IChatRoomSyncPoseMessage): void;
/**
 * Updates a single character's arousal progress in the chatroom.
 * @param {IChatRoomSyncArousalMessage} data - Data object containing the new character arousal data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncArousal(data: IChatRoomSyncArousalMessage): void;
/**
 * Updates a single item on a specific character in the chatroom.
 * @param {object} data - Data object containing the data pertaining to the singular item to update.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncItem(data: object): void;
/**
 * Refreshes the chat log elements for Player
 * @returns {void} - Nothing.
 */
declare function ChatRoomRefreshChatSettings(): void;
/**
 * Shows the current character's profile (Information Sheet screen)
 * @returns {void} - Nothing.
 */
declare function DialogViewProfile(): void;
/**
 * Brings the player into the main hall and starts the maid punishment sequence
 * @returns {void}
 */
declare function DialogCallMaids(): void;
/**
 * Triggered when the player assists another player to struggle out, the bonus is evasion / 2 + 1, with penalties if
 * the player is restrained.
 * @returns {void} - Nothing.
 */
declare function ChatRoomStruggleAssist(): void;
/**

 * Triggered when the player assists another player to by giving lockpicks
 * @returns {void} - Nothing.
 */
declare function ChatRoomGiveLockpicks(): void;
/**
 * Triggered when the player grabs another player's leash
 * @returns {void} - Nothing.
 */
declare function ChatRoomHoldLeash(): void;
/**
 * Handle the reply to a leash being held
 * @param {Character} SenderCharacter
 */
declare function ChatRoomDoHoldLeash(SenderCharacter: Character): void;
/**
 * Triggered when the player lets go of another player's leash
 * @returns {void} - Nothing.
 */
declare function ChatRoomStopHoldLeash(): void;
/**
 * Handle the reply to a leash being released
 * @param {Character} SenderCharacter
 */
declare function ChatRoomDoStopHoldLeash(SenderCharacter: Character): void;
/**
 * Triggered when a dom enters the room
 * @returns {void} - Nothing.
 */
declare function ChatRoomPingLeashedPlayers(): void;
/**
 * Handle the reply to a leash ping
 * @param {Character} SenderCharacter
 */
declare function ChatRoomDoPingLeashedPlayers(SenderCharacter: Character): void;
/**
 * Handle the reply to a leash being broken
 * @param {Character} SenderCharacter
 */
declare function ChatRoomDoRemoveLeash(SenderCharacter: Character): void;
/**
 * Triggered when a character makes another character kneel/stand.
 * @returns {void} - Nothing
 */
declare function ChatRoomKneelStandAssist(): void;
/**
 * Triggered when a character stops another character from leaving.
 * @returns {void} - Nothing
 */
declare function ChatRoomStopLeave(): void;
/**
 * Sends an administrative command to the server for the chat room from the character dialog.
 * @param {string} ActionType - Type of action performed.
 * @param {boolean | string} [Publish=true] - Whether or not the action should be published.
 * @returns {void} - Nothing
 */
declare function ChatRoomAdminAction(ActionType: string, Publish?: boolean | string): void;
/**
 * Sends an administrative command to the server from the chat text field.
 * @param {string} ActionType - Type of action performed.
 * @param {string} Argument - Target number of the action.
 * @returns {void} - Nothing
 */
declare function ChatRoomAdminChatAction(ActionType: string, Argument: string): void;
/**
 * Gets the player's current time as a string.
 * @returns {string} - The player's current local time as a string.
 */
declare function ChatRoomCurrentTime(): string;
/**
 * Gets a transparent version of the specified hex color.
 * @param {HexColor} Color - Hex color code.
 * @returns {string} - A transparent version of the specified hex color in the rgba format.
 */
declare function ChatRoomGetTransparentColor(Color: HexColor): string;
/**
 * Adds or removes an online member to/from a specific list. (From the dialog menu)
 * @param {"Add" | "Remove"} Operation - Operation to perform.
 * @param {string} ListType - Name of the list to alter. (Whitelist, friendlist, blacklist, ghostlist)
 * @returns {void} - Nothing
 */
declare function ChatRoomListManage(Operation: "Add" | "Remove", ListType: string): void;
/**
 * Adds or removes an online member to/from a specific list from a typed message.
 * @param {number[]|null} List - List to add to or remove from.
 * @param {boolean} Adding - If TRUE adding to the list, if FALSE removing from the list.
 * @param {string} Argument - Member number to add/remove.
 * @returns {void} - Nothing
 */
declare function ChatRoomListManipulation(List: number[] | null, Adding: boolean, Argument: string): void;
/**
 * Updates character lists for the player and saves the change
 * @param {number[]} list - The array of member numbers to update
 * @param {boolean} adding - If TRUE adding to the list, if FALSE removing from the list
 * @param {number} memberNumber - The member number to add/remove
 * @returns {void} - Nothing
 */
declare function ChatRoomListUpdate(list: number[], adding: boolean, memberNumber: number): void;
/**
 * Handles reception of data pertaining to if applying an item is allowed.
 * @param {object} data - Data object containing if the player is allowed to interact with a character.
 * @returns {void} - Nothing
 */
declare function ChatRoomAllowItem(data: object): void;
/**
 * Triggered when the player wants to change another player's outfit.
 * @returns {void} - Nothing
 */
declare function DialogChangeClothes(): void;
/**
 * Triggered when the player selects an ownership dialog option. (It can change money and reputation)
 * @param {"Propose" | "Accept" | "Release"} RequestType - Type of request being performed.
 * @returns {void} - Nothing
 */
declare function ChatRoomSendOwnershipRequest(RequestType: "Propose" | "Accept" | "Release"): void;
/**
 * Triggered when the player selects an lovership dialog option. (It can change money and reputation)
 * @param {"Propose" | "Accept" | "Break"} RequestType - Type of request being performed.
 * @returns {void} - Nothing
 */
declare function ChatRoomSendLovershipRequest(RequestType: "Propose" | "Accept" | "Break"): void;
/**
 * Triggered when the player picks a drink from a character's maid tray.
 * @param {string} DrinkType - Drink chosen.
 * @param {number} Money - Cost of the drink.
 * @returns {void} - Nothing
 */
declare function ChatRoomDrinkPick(DrinkType: string, Money: number): void;
declare function ChatRoomSendLoverRule(RuleType: any, Option: any): void;
declare function ChatRoomSendOwnerRule(RuleType: any, Option: any): void;
declare function ChatRoomAdvancedRule(RuleType: any): void;
declare function ChatRoomForbiddenWords(): void;
/**
 * Sends a rule / restriction / punishment to the player's slave/lover client, it will be handled on the slave/lover's
 * side when received.
 * @param {LogNameType[keyof LogNameType]} RuleType - The rule selected.
 * @param {"Quest" | "Leave"} Option - If the rule is a quest or we should just leave the dialog.
 * @param {"Owner" | "Lover"} Sender - Type of the sender
 * @returns {void} - Nothing
 */
declare function ChatRoomSendRule(RuleType: LogNameType[keyof LogNameType], Option: "Quest" | "Leave", Sender: "Owner" | "Lover"): void;
/**
 * @param {LogNameType["LoverRule"]} RuleType
 * @returns {boolean}
 */
declare function ChatRoomGetLoverRule(RuleType: LogNameType["LoverRule"]): boolean;
/**
 * @param {LogNameType["OwnerRule"]} RuleType
 * @returns {boolean}
 */
declare function ChatRoomGetOwnerRule(RuleType: LogNameType["OwnerRule"]): boolean;
/**
 * Gets a rule from the current character
 * @param {LogNameType["OwnerRule" | "LoverRule"]} RuleType - The name of the rule to retrieve.
 * @param {"Owner" | "Lover"} Sender - Type of the sender
 * @returns {boolean} - The owner or lover rule corresponding to the requested rule name
 */
declare function ChatRoomGetRule(RuleType: LogNameType["OwnerRule" | "LoverRule"], Sender: "Owner" | "Lover"): boolean;
/**
 * Processes a rule sent to the player from her owner or from her lover.
 * @param {object} data - Received rule data object.
 * @returns {void}
 */
declare function ChatRoomSetRule(data: object): void;
/**
 * Sends quest money to the player's owner.
 * @returns {void} - Nothing
 */
declare function ChatRoomGiveMoneyForOwner(): void;
/**
 * Handles the reception of quest data, when payment is received.
 * @param {number} questGiverNumber
 * @param {number} paymentAmount
 * @returns {void} - Nothing
 */
declare function ChatRoomPayQuest(questGiverNumber: number, paymentAmount: number): void;
/**
 * Triggered when online game data comes in
 * @param {object} data - Game data to process, sent to the current game handler.
 * @returns {void} - Nothing
 */
declare function ChatRoomOnlineBountyHandleData(data: object, sender: any): void;
/**
 * Triggered when a game message comes in, we forward it to the current online game being played.
 * @param {IChatRoomGameResponse} data - Game data to process, sent to the current game handler.
 * @returns {void} - Nothing
 */
declare function ChatRoomGameResponse(data: IChatRoomGameResponse): void;
/**
 * Triggered when the player uses the /safeword command, we revert the character if safewords are enabled, and display
 * a warning in chat if not.
 * @returns {void} - Nothing
 */
declare function ChatRoomSafewordChatCommand(): void;
/**
 * Triggered when the player activates her safeword to revert, we swap her appearance to the state when she entered the
 * chat room lobby, minimum permission becomes whitelist and up.
 * @returns {void} - Nothing
 */
declare function ChatRoomSafewordRevert(): void;
/**
 * Triggered when the player activates her safeword and wants to be released, we remove all bondage from her and return
 * her to the chat search screen.
 * @returns {void} - Nothing
 */
declare function ChatRoomSafewordRelease(): void;
/**
 * Concatenates the list of users to ban.
 * @param {boolean} IncludesBlackList - Adds the blacklist to the banlist
 * @param {boolean} IncludesGhostList - Adds the ghostlist to the banlist
 * @param {number[]} [ExistingList] - The existing Banlist, if applicable
 * @returns {number[]} Complete array of members to ban
 */
declare function ChatRoomConcatenateBanList(IncludesBlackList: boolean, IncludesGhostList: boolean, ExistingList?: number[]): number[];
/**
 * Concatenates the list of users for Admin list.
 * @param {boolean} IncludesOwner - Adds the owner to the admin list
 * @param {boolean} IncludesLovers - Adds lovers to the admin list
 * @param {number[]} [ExistingList] - The existing Admin list, if applicable
 * @returns {number[]} Complete array of admin members
 */
declare function ChatRoomConcatenateAdminList(IncludesOwner: boolean, IncludesLovers: boolean, ExistingList?: number[]): number[];
/**
 * Handles a request from another player to read the player's log entries that they are permitted to read. Lovers and
 * owners can read certain entries from the player's log.
 * @param {Character|number} C - A character object representing the requester, or the account number of the requester.
 * @returns {void} - Nothing
 */
declare function ChatRoomGetLoadRules(C: Character | number): void;
/**
 * Handles a response from another player containing the rules that the current player is allowed to read.
 * @param {Character} C - Character to set the rules on
 * @param {readonly LogRecord[]} Rule - An array of rules that the current player can read.
 * @returns {void} - Nothing
 */
declare function ChatRoomSetLoadRules(C: Character, Rule: readonly LogRecord[]): void;
/**
 * Take a screenshot of all characters in the chatroom
 * @returns {void} - Nothing
 */
declare function ChatRoomPhotoFullRoom(): void;
/**
 * Take a screenshot of the player and current character
 * @returns {void} - Nothing
 */
declare function DialogPhotoCurrentCharacters(): void;
/**
 * Take a screenshot of the player
 * @returns {void} - Nothing
 */
declare function DialogPhotoPlayer(): void;
/**
 * Take a screenshot in a chatroom, temporary removing emoticons
 * @param {number} Left - Position of the area to capture from the left of the canvas
 * @param {number} Top - Position of the area to capture from the top of the canvas
 * @param {number} Width - Width of the area to capture
 * @param {number} Height - Height of the area to capture
 * @param {readonly Character[]} Characters - The characters that will be included in the screenshot
 * @returns {void} - Nothing
 */
declare function ChatRoomPhoto(Left: number, Top: number, Width: number, Height: number, Characters: readonly Character[]): void;
/**
 * Returns whether the most recent chat message is on screen
 * @returns {boolean} - TRUE if the screen has focus and the chat log is scrolled to the bottom
 */
declare function ChatRoomNotificationNewMessageVisible(): boolean;
/**
 * Raise a notification for the new chat message if required
 * @param {Character} C - The character that sent the message
 * @param {string} msg - The text of the message
 * @returns {void} - Nothing
 */
declare function ChatRoomNotificationRaiseChatMessage(C: Character, msg: string): void;
/**
 * Resets any previously raised Chat Message or Chatroom Join notifications if required
 * @returns {void} - Nothing
 */
declare function ChatRoomNotificationReset(): void;
/**
 * Returns whether a notification should be raised for the character entering a chatroom
 * @param {Character} C - The character that entered the room
 * @returns {boolean} - Whether a notification should be raised
 */
declare function ChatRoomNotificationRaiseChatJoin(C: Character): boolean;
/**
 * Updates the chatroom with the player's stored chatroom data if needed (happens when entering a recreated chatroom for
 * the first time)
 * @returns {void} - Nothing
 */
declare function ChatRoomRecreate(): void;
/**
 * Checks whether or not the player's last chatroom data needs updating
 * @returns {void} - Nothing
 */
declare function ChatRoomCheckForLastChatRoomUpdates(): void;
/**
 * Determines whether or not the current chatroom data differs from the locally stroed chatroom data
 * @returns {boolean} - TRUE if the stored chatroom data is different from the current chatroom data, FALSE otherwise
 */
declare function ChatRoomDataChanged(): boolean;
declare function ChatRoomRefreshFontSize(): void;
/**
 * Checks if the message can be sent as chat or the player should be warned
 * @param {string} Message - User input
 * @param {Character} WhisperTarget
 * @returns {boolean}
 */
declare function ChatRoomShouldBlockGaggedOOCMessage(Message: string, WhisperTarget: Character): boolean;
/**
 * Validates that the words said in the local chat are not breaking any forbidden words rule
 * @param {string} Message - The message typed by the player
 * @returns {boolean} - Returns FALSE if we must block the message from being sent
 */
declare function ChatRoomOwnerForbiddenWordCheck(Message: string): boolean;
/**
 * Returns TRUE if the owner presence rule is enforced for the current player
 * @param {LogNameType["OwnerRule"]} RuleName - The name of the rule to validate (BlockWhisper, BlockTalk, etc.)
 * @param {Character} Target - The target character
 * @returns {boolean} - TRUE if the rule is enforced
 */
declare function ChatRoomOwnerPresenceRule(RuleName: LogNameType["OwnerRule"], Target: Character): boolean;
/**
 * Replaces pronoun-related tags with the relevant text for the character
 * @param {Character} C - The character that the message key relates to
 * @param {string} key - Key for the dialog entry to use
 * @param {boolean} hideIdentity - Whether to hide details revealing the character's identity
 * @returns {CommonSubtituteSubstitution[]} - The replacement pronoun text for keywords in the original message
 */
declare function ChatRoomPronounSubstitutions(C: Character, key: string, hideIdentity: boolean): CommonSubtituteSubstitution[];
/**
 * An enum for the options for chat room spaces
 * @type {{ MIXED: "X", FEMALE_ONLY: "", MALE_ONLY: "M", ASYLUM: "Asylum" }}
 */
declare const ChatRoomSpaceType: {
    MIXED: "X";
    FEMALE_ONLY: "";
    MALE_ONLY: "M";
    ASYLUM: "Asylum";
};
declare var ChatRoomBackground: string;
/** @type {null | ChatRoom} */
declare let ChatRoomData: null | ChatRoom;
/** @type {Character[]} */
declare var ChatRoomCharacter: Character[];
/** @type {ChatRoomChatLogEntry[]} */
declare var ChatRoomChatLog: ChatRoomChatLogEntry[];
declare var ChatRoomLastMessage: string[];
declare var ChatRoomLastMessageIndex: number;
/** @type {null | number} */
declare var ChatRoomTargetMemberNumber: null | number;
/** @type {ChatRoomOwnershipOption} */
declare var ChatRoomOwnershipOption: ChatRoomOwnershipOption;
/** @type {ChatRoomLovershipOption} */
declare var ChatRoomLovershipOption: ChatRoomLovershipOption;
declare var ChatRoomPlayerCanJoin: boolean;
declare var ChatRoomMoneyForOwner: number;
/** @type {number[]} */
declare var ChatRoomQuestGiven: number[];
/** @type {ChatRoomSpaceType} */
declare var ChatRoomSpace: ChatRoomSpaceType;
/** @type {ChatRoomGame} */
declare var ChatRoomGame: ChatRoomGame;
/** @type {null | number} */
declare var ChatRoomMoveTarget: null | number;
declare var ChatRoomHelpSeen: boolean;
declare var ChatRoomAllowCharacterUpdate: boolean;
declare var ChatRoomStruggleAssistBonus: number;
declare var ChatRoomStruggleAssistTimer: number;
/**
 * The timer started when a slowed player attempts to leave
 * @type {number}
 */
declare var ChatRoomSlowtimer: number;
/**
 * Whether someone attempted to stop the player in the middle of a slow-leave
 * @type {boolean}
 */
declare var ChatRoomSlowStop: boolean;
declare var ChatRoomChatHidden: boolean;
declare var ChatRoomCharacterCount: number;
/** @type {Character[]} */
declare var ChatRoomCharacterDrawlist: Character[];
declare var ChatRoomSenseDepBypass: boolean;
declare var ChatRoomGetUpTimer: number;
declare var ChatRoomLastName: string;
declare var ChatRoomLastBG: string;
declare var ChatRoomLastPrivate: boolean;
declare var ChatRoomLastSize: number;
/** @type {ChatRoomLanguage} */
declare var ChatRoomLastLanguage: ChatRoomLanguage;
declare var ChatRoomLastDesc: string;
/** @type {number[]} */
declare var ChatRoomLastAdmin: number[];
/** @type {number[]} */
declare var ChatRoomLastBan: number[];
/** @type {string[]} */
declare var ChatRoomLastBlockCategory: string[];
declare var ChatRoomLastSpace: string;
/** @type {null | { Name: string, Description: string, Background: string, Private: boolean, Space: string, Game: ChatRoomGame, Admin: number[], Limit: string, Language: ChatRoomLanguage, BlockCategory: ChatRoomBlockCategory[] }} */
declare var ChatRoomNewRoomToUpdate: null | {
    Name: string;
    Description: string;
    Background: string;
    Private: boolean;
    Space: string;
    Game: ChatRoomGame;
    Admin: number[];
    Limit: string;
    Language: ChatRoomLanguage;
    BlockCategory: ChatRoomBlockCategory[];
};
declare var ChatRoomNewRoomToUpdateTimer: number;
/**
 * The list of MemberNumbers whose characters we're holding the leash of
 * @type {number[]}
 */
declare var ChatRoomLeashList: number[];
/**
 * The MemberNumber of the character holding our leash
 * @type {number|null}
 */
declare var ChatRoomLeashPlayer: number | null;
/**
 * The room name to join when being leashed
 * @type {string}
 */
declare var ChatRoomJoinLeash: string;
declare var ChatRoomTargetDirty: boolean;
/**
 * Chances of a chat message popping up reminding you of some stimulation.
 *
 * @type {Record<StimulationAction, StimulationEvent>}
 */
declare const ChatRoomStimulationEvents: Record<StimulationAction, StimulationEvent>;
declare namespace ChatRoomArousalMsg_Chance {
    const Kneel: number;
    const Walk: number;
    const StruggleFail: number;
    const StruggleAction: number;
    const Gag: number;
}
declare namespace ChatRoomArousalMsg_ChanceScaling {
    const Kneel_1: number;
    export { Kneel_1 as Kneel };
    const Walk_1: number;
    export { Walk_1 as Walk };
    const StruggleFail_1: number;
    export { StruggleFail_1 as StruggleFail };
    const StruggleAction_1: number;
    export { StruggleAction_1 as StruggleAction };
    const Gag_1: number;
    export { Gag_1 as Gag };
}
declare namespace ChatRoomArousalMsg_ChanceVibeMod {
    const Kneel_2: number;
    export { Kneel_2 as Kneel };
    const Walk_2: number;
    export { Walk_2 as Walk };
    const StruggleFail_2: number;
    export { StruggleFail_2 as StruggleFail };
    const StruggleAction_2: number;
    export { StruggleAction_2 as StruggleAction };
    const Gag_2: number;
    export { Gag_2 as Gag };
}
declare namespace ChatRoomArousalMsg_ChanceInflationMod {
    const Kneel_3: number;
    export { Kneel_3 as Kneel };
    const Walk_3: number;
    export { Walk_3 as Walk };
    const StruggleFail_3: number;
    export { StruggleFail_3 as StruggleFail };
    const StruggleAction_3: number;
    export { StruggleAction_3 as StruggleAction };
    const Gag_3: number;
    export { Gag_3 as Gag };
}
declare namespace ChatRoomArousalMsg_ChanceGagMod {
    const Kneel_4: number;
    export { Kneel_4 as Kneel };
    const Walk_4: number;
    export { Walk_4 as Walk };
    const StruggleFail_4: number;
    export { StruggleFail_4 as StruggleFail };
    const StruggleAction_4: number;
    export { StruggleAction_4 as StruggleAction };
    const Gag_4: number;
    export { Gag_4 as Gag };
}
declare var ChatRoomHideIconState: number;
/**
 * The list of buttons in the top-right
 * @type {string[]}
 * */
declare var ChatRoomMenuButtons: string[];
declare let ChatRoomFontSize: number;
declare namespace ChatRoomFontSizes {
    const Small: number;
    const Medium: number;
    const Large: number;
}
declare var ChatRoomCharacterX_Upper: number;
declare var ChatRoomCharacterX_Lower: number;
declare var ChatRoomCharacterZoom: number;
declare var ChatRoomSlideWeight: number;
declare var ChatRoomCharacterInitialize: boolean;
/** Sets whether an add/remove for one list automatically triggers an add/remove for another list */
declare function ChatRoomListOperationTriggers(): {
    list: number[];
    adding: boolean;
    triggers: {
        list: number[];
        add: boolean;
    }[];
}[];
declare namespace ChatRoomResizeManager {
    const atStart: boolean;
    const timer: null | number;
    const timeOut: number;
    const ChatRoomScrollPercentage: number;
    const ChatLogScrolledToEnd: boolean;
    function ChatRoomResizeEvent(): void;
    function ChatRoomResizeEventsEnd(): void;
}
declare let ChatRoomStatusDeadKeys: string[];
/** @type {ChatRoomMessageExtractor[]} */
declare var ChatRoomMessageExtractors: ChatRoomMessageExtractor[];
/**
 * Global list of handlers for incoming messages.
 * @type {ChatRoomMessageHandler[]}
 * */
declare var ChatRoomMessageHandlers: ChatRoomMessageHandler[];
