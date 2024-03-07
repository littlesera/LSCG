/**
 * Returns TRUE if the map button can be used
 * @returns {boolean} - TRUE if can be used
 */
declare function ChatRoomMapButton(): boolean;
/**
 * Returns TRUE if the player is an admin and activated her super powers on the map
 * @returns {boolean} - TRUE if super powers are active
 */
declare function ChatRoomMapHasSuperPowers(): boolean;
/**
 * Initializes the map to its default blank state
 * @param {ChatRoomMapType} mode
 * @returns {ServerChatRoomMapData}
 */
declare function ChatRoomMapInitialize(mode: ChatRoomMapType): ServerChatRoomMapData;
/**
 * Initializes the player map data to its default blank state
 * @param {Character} C - The character to be initialized
 * @returns {ChatRoomMapData}
 */
declare function ChatRoomMapInitializeCharacter(C: Character): ChatRoomMapData;
/**
 * Performs cleanup when leaving the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapLeave(): void;
/**
 * Activates the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapActivate(): void;
/**
 * Deactivates the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapDeactivate(): void;
/**
 * Gets a index number for the tile and obejct lists and returns the corrosponting coordinates in X and Y
 * @param {number} index - Index number for the tile and object lists
 * @returns {{x: number, y: number}} - Object containing the resulting x and y coordinates.
 */
declare function ChatRoomMapIndexToCoordinates(index: number): {
    x: number;
    y: number;
};
/**
 * Gets coordinates in X and Y and returns the corrosponding index number for the tile and object list
 * @param {number} x - X-coordinate to be translated
 * @param {number} y - Y-coordinate to be translated
 * @returns {number} - Index number for the tile and object lists
 */
declare function ChatRoomMapCoordinatesToIndex(x: number, y: number): number;
/**
 * Calculates the visibility mask and audibility mask for the map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapCalculatePerceptionMasks(): void;
/**
 * Returns the sight range for the current player, based on the blindness level
 * @returns {number} - The number of visible tiles
 */
declare function ChatRoomMapGetSightRange(): number;
/**
 * Returns the hearing range for the current player, based on the deafness level
 * @returns {number} - The number of tiles
 */
declare function ChatRoomMapGetHearingRange(): number;
/**
 * Returns TRUE if the player can see a character at her sight range
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if visible
 */
declare function ChatRoomMapCharacterIsVisible(C: Character): boolean;
/**
 * Returns TRUE if the player can see hear a character at her hearing range
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if hearable
 */
declare function ChatRoomMapCharacterIsHearable(C: Character): boolean;
/**
 * Returns TRUE if the player is on whisper range to another character (1 tile)
 * @param {Character} C - The character to evaluate
 * @returns {boolean} - TRUE if on whisper range
 */
declare function ChatRoomMapCharacterOnWhisperRange(C: Character): boolean;
/**
 * Sets the correct wall tile based on it's surrounding (North-West, North-Center, etc.)
 * @param {boolean} CW - If Center West is a wall
 * @param {boolean} CE - If Center East is a wall
 * @param {boolean} SW - If South West is a wall
 * @param {boolean} SC - If South Center is a wall
 * @param {boolean} SE - If South East is a wall
 * @returns {number} - a number linked on the image to use
 */
declare function ChatRoomMapFindWallEffectTile(CW: boolean, CE: boolean, SW: boolean, SC: boolean, SE: boolean): number;
/**
 * Returns TRUE if the X and Y coordinates is a wall tile, if out of bound we also return TRUE
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {boolean} - TRUE if it's a wall
 */
declare function ChatRoomMapIsWall(X: number, Y: number): boolean;
/**
 * Returns the object located at a X and Y position on the map, or NULL if nothing
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {ChatRoomMapTile | null} - The object at the position
 */
declare function ChatRoomMapGetTileAtPos(X: number, Y: number): ChatRoomMapTile | null;
/**
 * Returns the object located at a X and Y position on the map, or NULL if nothing
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {ChatRoomMapObject | null} - The object at the position
 */
declare function ChatRoomMapGetObjectAtPos(X: number, Y: number): ChatRoomMapObject | null;
/**
 * Returns TRUE if there's a wall path on the X, Y position that the player can enter
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {boolean} - TRUE if we can enter
 */
declare function ChatRoomMapCanEnterWall(X: number, Y: number): boolean;
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
declare function ChatRoomMapWallEffect(X: number, Y: number, ScreenX: number, ScreenY: number, TileWidth: number, TileHeight: number): void;
/**
 * Apply a wall "3D" effect on the curent map
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {number} - The effect number
 */
declare function ChatRoomMapFloorWallEffect(X: number, Y: number): number;
/**
 * Manages collisions, moves the player if she's on a tile that cannot be entered
 * @returns {void} - Nothing
 */
declare function ChatRoomMapCollision(): void;
/**
 * Find the first {@link ChatRoomCharacter} members at the specified X & Y position
 * @param {number} X - The X position on the screen
 * @param {number} Y - The Y position on the screen
 * @returns {null | Character} A character at the specified X & Y position or, if none can be found, `null`
 */
declare function ChatRoomMapGetCharacterAtPos(X: number, Y: number): null | Character;
/**
 * Returns a object that contains the entry flag's position with x and y parameters or null if no entry flag is set
 * @returns {ChatRoomMapPos|null}
 */
declare function ChatRoomMapGetEntryFlagPosition(): ChatRoomMapPos | null;
/**
 * Returns TRUE if the player can leave from the map, called from ChatRoomCanLeave()
 * @returns {boolean} - True if the player can leave
 */
declare function ChatRoomMapCanLeave(): boolean;
/**
 * Draw the map grid and character on screen
 * @param {number} Left - The X position on the screen
 * @param {number} Top - The Y position on the screen
 * @param {number} Width - The width size of the drawn map
 * @param {number} Height - The height size of the drawn map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapDrawGrid(Left: number, Top: number, Width: number, Height: number): void;
/**
 * Sets the next update flag for the room if it's not already set, the delay is 5 seconds
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUpdateFlag(): void;
/**
 * Sets the next update flags for the player if it's not already set, the delay is 1 seconds for live data and 10 seconds for last map data
 * @param {number} UpdateTimeOffset - A offset for the update time. This can be positive to increase the update time or negative to reduce it.
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUpdatePlayerFlag(UpdateTimeOffset?: number): void;
/**
 * Updates the room data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUpdateRoomSync(): void;
/**
 * Updates the player map data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUpdatePlayerSync(): void;
/**
 * Updates a single character's expression in the chatroom.
 * @param {ServerMapDataResponse} data - Data object containing the new character expression data.
 * @returns {void} - Nothing.
 */
declare function ChatRoomSyncMapData(data: ServerMapDataResponse): void;
/**
 * Updates the player last map data if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUpdateLastMapDataSync(): void;
/**
 * Processes the character movement when the timer has expired
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMovementProcess(): void;
/**
 * Checks if the player is leashed and if she should follow the leash holder
 * @returns {void} - Nothing
 */
declare function ChatRoomMapLeash(): void;
/**
 * Draws the map, characters and buttons of the chat room map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapDraw(): void;
/**
 * Check if a tile on the map can be entered by a player, and return the number of milliseconds required to reach it
 * @param {number} X - The X position on the map
 * @param {number} Y - The Y position on the map
 * @returns {number} - The number of milliseconds
 */
declare function ChatRoomMapCanEnterTile(X: number, Y: number): number;
/**
 * Moves the player
 * @param {"West" | "East" | "North" | "South"} D - The direction being travelled (North, South, East, West)
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMove(D: "West" | "East" | "North" | "South"): void;
/**
 * Undoes the changes made to the map, from the latest backup in the stack
 * @returns {void} - Nothing
 */
declare function ChatRoomMapUndo(): void;
/**
 * Handles keyboard keys in the chat room map screen
 * @param {KeyboardEvent} event - The event that triggered this
 * @returns {boolean} - Nothing
 */
declare function ChatRoomMapKeyDown(event: KeyboardEvent): boolean;
/**
 * Mouse click event is used to focus a character
 * @returns {void} - Nothing
 */
declare function ChatRoomMapClick(): void;
/**
 * Mouse down event is used to draw on screen and handle the tiles buttons
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMouseDown(): void;
/**
 * Mouse move event is used to draw on screen
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMouseMove(): void;
/**
 * Mouse up event is used to stop drawing
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMouseUp(): void;
/**
 * Mouse wheel event is used to zoom the map
 * @returns {void} - Nothing
 */
declare function ChatRoomMapMouseWheel(Event: any): void;
/**
 * Copies the current map in the clipboard.  Called from the chat field command "mapcopy"
 * @returns {void} - Nothing
 */
declare function ChatRoomMapCopy(): void;
/**
 * Pastes the current map Param data to load it.  Called from the chat field command "mappaste"
 * @param {string} Param - The parameter that comes with the command
 * @returns {void} - Nothing
 */
declare function ChatRoomMapPaste(Param: string): void;
/**
 * Make sure the whisper target is still valid on the map, and leave whipser mode if needed
 * @returns {void} - Nothing
 */
declare function ChatRoomMapWhisperValid(): void;
declare var ChatRoomMapVisible: boolean;
declare var ChatRoomMapAllow: boolean;
declare var ChatRoomMapWidth: number;
declare var ChatRoomMapHeight: number;
declare var ChatRoomMapViewRange: number;
declare var ChatRoomMapViewRangeMin: number;
declare var ChatRoomMapViewRangeMax: number;
declare var ChatRoomMapObjectStartID: number;
declare var ChatRoomMapObjectEntryID: number;
/** @type {"" |  "Tile" | "Object" | "TileType" | "ObjectType"} */
declare var ChatRoomMapEditMode: "" | "Tile" | "Object" | "TileType" | "ObjectType";
/** @type {"" | ChatRoomMapTileType | ChatRoomMapObjectType} */
declare var ChatRoomMapEditSubMode: "" | ChatRoomMapTileType | ChatRoomMapObjectType;
declare var ChatRoomMapEditStarted: boolean;
/** @type {null | ChatRoomMapDoodad} */
declare var ChatRoomMapEditObject: null | ChatRoomMapDoodad;
/** @type {number[]} */
declare var ChatRoomMapEditSelection: number[];
declare var ChatRoomMapEditRange: number;
/** @type {ServerChatRoomMapData[]} */
declare var ChatRoomMapEditBackup: ServerChatRoomMapData[];
/** @type {null | number} */
declare var ChatRoomMapUpdateRoomNext: null | number;
/** @type {null | number} */
declare var ChatRoomMapUpdatePlayerNext: null | number;
/** @type {null | number} */
declare var ChatRoomMapUpdateLastMapDataNext: null | number;
/** @type {null | Character} */
declare var ChatRoomMapFocusedCharacter: null | Character;
declare var ChatRoomMapSuperPowersActive: boolean;
declare var ChatRoomMapBaseMovementSpeed: number;
/** @type {null | ChatRoomMapMovement} */
declare var ChatRoomMapMovement: null | ChatRoomMapMovement;
/** @type {ChatRoomMapType[]} */
declare var ChatRoomMapTypeList: ChatRoomMapType[];
declare var ChatRoomMapUpdatePlayerTime: number;
declare const ChatRoomMapPerceptionRaycastOffset: 0.4999;
/** @type {boolean[]} */
declare var ChatRoomMapVisibilityMask: boolean[];
/** @type {boolean[]} */
declare var ChatRoomMapAudibilityMask: boolean[];
/** @type {ChatRoomMapTile[]} */
declare const ChatRoomMapTileList: ChatRoomMapTile[];
/** @type {ChatRoomMapObject[]} */
declare const ChatRoomMapObjectList: ChatRoomMapObject[];
