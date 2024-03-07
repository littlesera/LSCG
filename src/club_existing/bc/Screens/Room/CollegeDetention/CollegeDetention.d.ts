/**
 * Checks, if Yuki can be invited to the private room
 * @returns {boolean} - Returns true, if Yuki can be invited, false otherwise
 */
declare function CollegeDetentionCanInviteToPrivateRoom(): boolean;
/**
 * Checks Yuki's current love level
 * @param {string} LoveLevel - The love level that should be checked
 * @returns {boolean} - Returns true, if Yuki's love is greater or equal the given level, false otherwise
 */
declare function CollegeDetentionYukiLoveIs(LoveLevel: string): boolean;
/**
 * Adds the sleeping pill to the player's invertory
 * @returns {void} - Nothing
 */
declare function CollegeDetentionGetSleepingPills(): void;
/**
 * Adds the teacher key to the players 'inventory'
 * @returns {void} - Nothing
 */
declare function CollegeDetentionGetTeacherKey(): void;
/**
 * Checks, if Yuki will release the player
 * @returns {boolean} - Returns true if the detention time is over, flase otherwise
 */
declare function CollegeDetentionYukiWillRelease(): boolean;
/**
 * Checks, if Yuki dominated the player in the library and player is not owned
 * @returns {boolean} - Returns true if Yuki is Dominant and player is not owned
 */
declare function CollegeDetentionIsYukiDominant(): boolean;
/**
 * Checks, if Yuki was blackmailed in the library
 * @returns {boolean} - Returns true if Yuki is Submissive
 */
declare function CollegeDetentionIsYukiSubmissive(): boolean;
/**
 * Creates a fully dressed Yuki
 * @param {Character} C - The character object to dress up
 * @returns {void} - Nothing
 */
declare function CollegeDetentionYukiClothes(C: Character): void;
/**
 * Loads the room and generates Yuki
 * @returns {void} - Nothing
 */
declare function CollegeDetentionLoad(): void;
/**
 * Runs the room (shows the player and Yuki)
 * @returns {void} - Nothing
 */
declare function CollegeDetentionRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function CollegeDetentionClick(): void;
/**
 * When Yuki's love towards the player changes, it can also trigger an event.
 * When a good or bad move is done, her expression will change quickly.
 * @param {string} LoveChange - The amount the love of Yuki towards the player is altered
 * @param {*} Event - This parameter is never used. Perhaps legacy code from the college?
 * @returns {void} - Nothing
 */
declare function CollegeDetentionYukiLoveChange(LoveChange: string, Event: any): void;
/**
 * Dress the player and Yuki back
 * @returns {void} - Nothing
 */
declare function CollegeDetentionDressBack(): void;
/**
 * Strips both the player and Yuki
 * @returns {void} - Nothing
 */
declare function CollegeDetentionBothNaked(): void;
/**
 * When the player pleases Yuki, it's a race against the clock to make her orgasm
 * @param {string} Factor - The factor that alters Yuki's love towards the player
 * @returns {void} - Nothing
 */
declare function CollegeDetentionPleaseYuki(Factor: string): void;
/**
 * Yuki restraints the player
 * @param {"Arms" | "Legs" | "Mouth"} Type - The type of restraint to use
 * @returns {void} - Nothing
 */
declare function CollegeDetentionRestrainPlayer(Type: "Arms" | "Legs" | "Mouth"): void;
/**
 * The player invites Yuki to her room. Add her ribbon and the sleeping pill to the player's inventory
 * @param {string} Role - How Yuki should join private room (Default: "None")
 * @returns {void} - Nothing
 */
declare function CollegeDetentionInviteToPrivateRoom(Role?: string): void;
declare var CollegeDetentionBackground: string;
/** @type {null | NPCCharacter} */
declare var CollegeDetentionYuki: null | NPCCharacter;
declare var CollegeDetentionYukiLove: number;
declare var CollegeDetentionYukiWillReleaseAt: number;
