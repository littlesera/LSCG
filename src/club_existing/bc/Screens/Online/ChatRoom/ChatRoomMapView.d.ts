/**
 * Returns TRUE if the player is an admin and activated her super powers on the map
 * @returns {boolean} - TRUE if super powers are active
 */
declare function ChatRoomMapViewHasSuperPowers(): boolean;
/**
 * Initializes the map to its default blank state
 * @param {ChatRoomMapType} mode
 * @returns {ServerChatRoomMapData}
 */
declare function ChatRoomMapViewInitialize(mode: ChatRoomMapType): ServerChatRoomMapData;
/**
 * Initializes the player map data to its default blank state
 * @param {Character} C - The character to be initialized
 * @returns {ChatRoomMapData}
 */
declare function ChatRoomMapViewInitializeCharacter(C: Character): ChatRoomMapData;
/**
 * Validate the passed chat room map positions.
 * @param {unknown} pos
 * @returns {ChatRoomMapPos}
 */
declare function ChatRoomMapViewValidatePos(pos: unknown): ChatRoomMapPos;
/**
 * Performs cleanup when leaving the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewLeave(): void;
/**
 * Activates the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewActivate(): void;
/**
 * Deactivates the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewDeactivate(): void;
/**
 * Indicates if the chat room map view is active or not
 * @returns {boolean} - TRUE if the chat room character view is active, false if not
 */
declare function ChatRoomMapViewIsActive(): boolean;
declare function ChatRoomMapViewRun(time: number): void;
/**
 * Alter the received message to what will be displayed in the chat log
 *
 * @param {ServerChatRoomMessage} data
 * @param {string} msg
 * @param {Character} SenderCharacter
 * @param {IChatRoomMessageMetadata} metadata
 * @returns {string|null} - The string to display or null if the message should be hidden
 */
declare function ChatRoomMapViewDisplayMessage(data: ServerChatRoomMessage, msg: string, SenderCharacter: Character, metadata: IChatRoomMessageMetadata): string | null;
/**
 * Returns TRUE if the player can leave from the map
 * @returns {boolean} - True if the player can leave
 */
declare function ChatRoomMapViewCanLeave(): boolean;
/**
 * Take a screenshot of the current section of the map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewScreenshot(): void;
/**
 * Returns TRUE if the player can enter in whisper mode on the current view with the currently focused character
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE is whipser can be started
 */
declare function ChatRoomMapViewCanStartWhisper(C: Character): boolean;
/**
 * Handles the reception of the room properties from the server.
 * @param {ServerChatRoomSyncMessage} data - Room object containing the updated chatroom properties.
 * @returns {void} - Nothing.
 */
declare function ChatRoomMapViewSyncRoomProperties(data: ServerChatRoomSyncMessage): void;
/**
 * Gets a index number for the tile and obejct lists and returns the corrosponting coordinates in X and Y
 * @param {number} index - Index number for the tile and object lists
 * @returns {{x: number, y: number}} - Object containing the resulting x and y coordinates.
 */
declare function ChatRoomMapViewIndexToCoordinates(index: number): {
    x: number;
    y: number;
};
/**
 * Gets coordinates in X and Y and returns the corrosponding index number for the tile and object list
 * @param {number} x - X-coordinate to be translated
 * @param {number} y - Y-coordinate to be translated
 * @returns {number} - Index number for the tile and object lists
 */
declare function ChatRoomMapViewCoordinatesToIndex(x: number, y: number): number;
/**
 * Calculates the visibility mask and audibility mask for the map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewCalculatePerceptionMasks(): void;
/**
 * Returns the sight range for the current player, based on the blindness level
 * @returns {number} - The number of visible tiles
 */
declare function ChatRoomMapViewGetSightRange(): number;
/**
 * Returns the hearing range for the current player, based on the deafness level
 * @returns {number} - The number of tiles
 */
declare function ChatRoomMapViewGetHearingRange(): number;
/**
 * Returns TRUE if the player can see a character at her sight range
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if visible
 */
declare function ChatRoomMapViewCharacterIsVisible(C: Character): boolean;
/**
 * Returns TRUE if the player can see hear a character at her hearing range
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if hearable
 */
declare function ChatRoomMapViewCharacterIsHearable(C: Character): boolean;
/**
 * Returns TRUE if the player is on whisper range to another character (1 tile)
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if on whisper range
 */
declare function ChatRoomMapViewCharacterOnWhisperRange(C: Character): boolean;
/**
 * Returns TRUE if the player is within interaction range of another character
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if on interaction range
 */
declare function ChatRoomMapViewCharacterOnInteractionRange(C: Character): boolean;
/**
 * Sets the correct wall tile based on it's surrounding (North-West, North-Center, etc.)
 * @param {boolean} CW - If Center West is a wall
 * @param {boolean} CE - If Center East is a wall
 * @param {boolean} SW - If South West is a wall
 * @param {boolean} SC - If South Center is a wall
 * @param {boolean} SE - If South East is a wall
 * @returns {number} - a number linked on the image to use
 */
declare function ChatRoomMapViewFindWallEffectTile(CW: boolean, CE: boolean, SW: boolean, SC: boolean, SE: boolean): number;
/**
 * Returns TRUE if the X and Y coordinates is a wall tile, if out of bound we also return TRUE
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {boolean} - TRUE if it's a wall
 */
declare function ChatRoomMapViewIsWall(X: number, Y: number): boolean;
/**
 * Returns the object located at a X and Y position on the map, or NULL if nothing
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {ChatRoomMapTile | null} - The object at the position
 */
declare function ChatRoomMapViewGetTileAtPos(X: number, Y: number): ChatRoomMapTile | null;
/**
 * Returns the object located at a X and Y position on the map, or NULL if nothing
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {ChatRoomMapObject | null} - The object at the position
 */
declare function ChatRoomMapViewGetObjectAtPos(X: number, Y: number): ChatRoomMapObject | null;
/**
 * Returns TRUE if there's a wall path on the X, Y position that the player can enter
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {boolean} - TRUE if we can enter
 */
declare function ChatRoomMapViewCanEnterWall(X: number, Y: number): boolean;
/**
 * Returns TRUE if the fog of war feature is currently activated on the map
 * @returns {boolean} - TRUE if fog of war is active
 */
declare function ChatRoomMapFogIsActive(): boolean;
/**
 * Returns TRUE if a tile is fully hidden from hide
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {boolean} - TRUE if the tile is hidden
 */
declare function ChatRoomMapViewTileIsHidden(X: number, Y: number): boolean;
/**
 * Apply a wall "3D" effect on the curent map
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @param {number} ScreenX - The X position on the screen
 * @param {number} ScreenY - The Y position on the screen
 * @param {number} TileWidth - The visible width of a tile
 * @param {number} TileHeight - The visible height of a tile
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewWallEffect(X: number, Y: number, ScreenX: number, ScreenY: number, TileWidth: number, TileHeight: number): void;
/**
 * Apply a wall "3D" effect on the curent map
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {number} - The effect number
 */
declare function ChatRoomMapViewFloorWallEffect(X: number, Y: number): number;
/**
 * Manages collisions, moves the player if she's on a tile that cannot be entered
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewCollision(): void;
/**
 * Find the first {@link ChatRoomCharacter} members at the specified X & Y position
 * @param {number} X - The X position on the screen
 * @param {number} Y - The Y position on the screen
 * @returns {null | Character} A character at the specified X & Y position or, if none can be found, `null`
 */
declare function ChatRoomMapViewGetCharacterAtPos(X: number, Y: number): null | Character;
/**
 * Returns a object that contains the entry flag's position with x and y parameters or null if no entry flag is set
 * @returns {ChatRoomMapPos|null}
 */
declare function ChatRoomMapViewGetEntryFlagPosition(): ChatRoomMapPos | null;
/**
 * Draw the map grid and character on screen
 * @param {number} Left - The X position on the screen
 * @param {number} Top - The Y position on the screen
 * @param {number} Width - The width size of the drawn map
 * @param {number} Height - The height size of the drawn map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewDrawGrid(Left: number, Top: number, Width: number, Height: number): void;
/**
 * Sets the next update flag for the room if it's not already set, the delay is 5 seconds
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUpdateFlag(): void;
/**
 * Sets the next update flags for the player if it's not already set, the delay is 1 seconds for live data and 10 seconds for last map data
 * @param {number} UpdateTimeOffset - A offset for the update time. This can be positive to increase the update time or negative to reduce it.
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUpdatePlayerFlag(UpdateTimeOffset?: number): void;
/**
 * Updates the room data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUpdateRoomSync(): void;
/**
 * Updates the player map data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUpdatePlayerSync(): void;
/**
 * Updates a single character's expression in the chatroom.
 * @param {ServerMapDataResponse} data - Data object containing the new character expression data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomMapViewSyncMapData(data: ServerMapDataResponse): void;
/**
 * Updates the player last map data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUpdateLastMapDataSync(): void;
/**
 * Processes the character movement when the timer has expired
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewMovementProcess(): void;
/**
 * Checks if the player is leashed and if she should follow the leash holder
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewLeash(): void;
/**
 * Draws the map and characters of the chat room map on the left side of the screen
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewDraw(): void;
/**
 * Draws the buttons of the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewDrawUi(): void;
/**
 * Check if a tile on the map can be entered by a player, and return the number of milliseconds required to reach it
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {number} - The number of milliseconds
 */
declare function ChatRoomMapViewCanEnterTile(X: number, Y: number): number;
/**
 * Moves the player
 * @param {"West" | "East" | "North" | "South"} D - The direction being travelled (North, South, East, West)
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewMove(D: "West" | "East" | "North" | "South"): void;
/**
 * Undoes the changes made to the map, from the latest backup in the stack
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewUndo(): void;
/**
 * Handles keyboard keys in the chat room map screen
 * @param {KeyboardEvent} event - The event that triggered this
 * @returns {boolean} - Nothing
 */
declare function ChatRoomMapViewKeyDown(event: KeyboardEvent): boolean;
/**
 * Handles clicks the chatroom screen view.
 * @returns {void} - Nothing.
 */
declare function ChatRoomMapViewClick(): void;
/**
 * Mouse down event is used to draw on screen and handle the tiles buttons
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewMouseDown(): void;
/**
 * Mouse move event is used to draw on screen
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewMouseMove(): void;
/**
 * Mouse up event is used to stop drawing
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewMouseUp(): void;
declare function ChatRoomMapViewMouseWheel(event: WheelEvent): void;
/**
 * Copies the current map in the clipboard.  Called from the chat field command "mapcopy"
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewCopy(): void;
/**
 * Pastes the current map Param data to load it.  Called from the chat field command "mappaste"
 * @param {string} Param - The parameter that comes with the command
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewPaste(Param: string): void;
/**
 * Make sure the whisper target is still valid on the map, and leave whipser mode if needed
 * @deprecated Unused
 * @returns {void} - Nothing
 */
declare function ChatRoomMapViewWhisperValid(): void;
declare const ChatRoomMapViewName: "Map";
declare var ChatRoomMapViewWidth: number;
declare var ChatRoomMapViewHeight: number;
declare var ChatRoomMapViewPerceptionRange: number;
declare var ChatRoomMapViewPerceptionRangeMin: number;
declare var ChatRoomMapViewPerceptionRangeMax: number;
declare var ChatRoomMapViewObjectStartID: number;
declare var ChatRoomMapViewObjectEntryID: number;
/** @type {"" |  "Tile" | "Object" | "TileType" | "ObjectType"} */
declare var ChatRoomMapViewEditMode: "" | "Tile" | "Object" | "TileType" | "ObjectType";
/** @type {"" | ChatRoomMapTileType | ChatRoomMapObjectType} */
declare var ChatRoomMapViewEditSubMode: "" | ChatRoomMapTileType | ChatRoomMapObjectType;
declare var ChatRoomMapViewEditStarted: boolean;
/** @type {null | ChatRoomMapDoodad} */
declare var ChatRoomMapViewEditObject: null | ChatRoomMapDoodad;
/** @type {number[]} */
declare var ChatRoomMapViewEditSelection: number[];
declare var ChatRoomMapViewEditRange: number;
/** @type {ServerChatRoomMapData[]} */
declare var ChatRoomMapViewEditBackup: ServerChatRoomMapData[];
/** @type {null | number} */
declare var ChatRoomMapViewUpdateRoomNext: null | number;
/** @type {null | number} */
declare var ChatRoomMapViewUpdatePlayerNext: null | number;
/** @type {null | number} */
declare var ChatRoomMapViewUpdateLastMapDataNext: null | number;
/** @type {null | Character} */
declare var ChatRoomMapViewFocusedCharacter: null | Character;
declare var ChatRoomMapViewFocusedCharacterX: number;
declare var ChatRoomMapViewFocusedCharacterY: number;
declare var ChatRoomMapViewSuperPowersActive: boolean;
declare var ChatRoomMapViewBaseMovementSpeed: number;
/** @type {null | ChatRoomMapMovement} */
declare var ChatRoomMapViewMovement: null | ChatRoomMapMovement;
/** @type {ChatRoomMapType[]} */
declare var ChatRoomMapViewTypeList: ChatRoomMapType[];
declare var ChatRoomMapViewUpdatePlayerTime: number;
declare const ChatRoomMapViewPerceptionRaycastOffset: 0.4999;
declare const ChatRoomMapViewWhisperRange: 1;
declare const ChatRoomMapViewInteractionRange: 1;
declare const ChatRoomMapViewRemoteRange: number;
/** @type {boolean[]} */
declare var ChatRoomMapViewVisibilityMask: boolean[];
/** @type {boolean[]} */
declare var ChatRoomMapViewAudibilityMask: boolean[];
declare var ChatRoomMapViewTileFog: string;
declare var ChatRoomMapViewObjectFog: string;
/** @type {ChatRoomMapTile[]} */
declare const ChatRoomMapViewTileList: ChatRoomMapTile[];
/** @type {ChatRoomMapObject[]} */
declare const ChatRoomMapViewObjectList: ChatRoomMapObject[];
