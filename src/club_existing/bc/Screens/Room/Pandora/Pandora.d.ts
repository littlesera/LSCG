/**
 * NPC Dialog functions
 * @returns {boolean} - TRUE if the dialog option will be available to the player
 */
declare function PandoraCanStartRecruit(): boolean;
declare function PandoraCanRecruit(): boolean;
declare function PandoraCharacterCanJoin(): boolean;
declare function PandoraCharacterCanLeave(): boolean;
declare function PandoraOdds75(): boolean;
declare function PandoraOdds50(): boolean;
declare function PandoraOdds25(): boolean;
/** @param {string} Costume */
declare function PandoraCostumeIs(Costume: string): boolean;
/** @param {number} Number */
declare function PandoraQuizIs(Number: number): boolean;
declare function PandoraCanAskForPaint(): boolean;
/**
 * Loads the Pandora's Box screen
 * @returns {void} - Nothing
 */
declare function PandoraLoad(): void;
/**
 * Returns the color of the direction buttons, it can change if the direction was recently navigated to
 * The Cartographer perk can show the returning path in yellow
 * @param {"North" | "South" | "East" | "West"} Direction - The cardinal direction
 * @returns {string} - The color to use
 */
declare function PandoraDirectionButtonColor(Direction: "North" | "South" | "East" | "West"): string;
/**
 * Returns whether the player can move in the specified direction
 * @param {"North" | "South" | "East" | "West"} Direction - The cardinal direction to check
 * @returns {boolean} - Whether the direction can be accessed
 */
declare function PandoraDirectionAvailable(Direction: "North" | "South" | "East" | "West"): boolean;
/**
 * Draws the Pandora text data
 * @param {Number} Y - The Y position
 * @returns {boolean} - Whether the direction can be accessed
 */
declare function PandoraDrawData(Y: number): boolean;
/**
 * Runs and draws all Pandora's Box screens
 * @returns {void} - Nothing
 */
declare function PandoraRun(): void;
/**
 * Enters a new mode for the Pandora screen, such as rest or search mode
 * @param {PandoraMode} NewMode
 * @returns {void} - Nothing
 */
declare function PandoraSetMode(NewMode: "" | "Rest" | "Search" | "Paint"): void;
/**
 * Handles clicks in all Pandora's screen
 * @returns {void} - Nothing
 */
declare function PandoraClick(): void;
/**
 * Handles the key pressed in Pandora's Box, allow WASD to move around
 * @returns {void} - Nothing
 */
declare function PandoraKeyDown(): void;
/**
 * Prepares a text popup for Pandora's Box
 * @param {string} Text
 * @returns {void} - Nothing
 */
declare function PandoraMsgBox(Text: string): void;
/**
 * Generates a random NPC for Pandora's Box missions, clear the cache if it was generated before
 * @param {string} Group - The main group for that NPC (Random, Entrance, Underground)
 * @param {NPCArchetype} Archetype - The NPC function within Pandora's (Guard, Mistress, Slave, Maid, etc.)
 * @param {string} Name - The name to give to that NPC, can be RANDOM for a fully random name
 * @param {boolean} AllowItem - TRUE if we allow using items on her by default
 * @returns {NPCCharacter} - The NPC character to return
 */
declare function PandoraGenerateNPC(Group: string, Archetype: NPCArchetype, Name: string, AllowItem: boolean): NPCCharacter;
/**
 * Dress a character in the Rival Club fashion
 * @param {NPCCharacter} C
 * @param {string} Type
 * @returns {void} - Nothing
 */
declare function PandoraDress(C: NPCCharacter, Type: string): void;
/**
 * When the players enters a new room, we keep the previous room
 * @param {PandoraBaseRoom} Room - The room to step into
 * @param {PandoraDirection | ""} [Direction] - The direction the player comes from
 * @returns {void} - Nothing
 */
declare function PandoraEnterRoom(Room: PandoraBaseRoom, Direction?: PandoraDirection | ""): void;
/**
 * Generates a chest randomly in the room cell (35% odds in cat burglar missions, 5% in other missions)
 * @param {object} Room - The room in which the chest could be placed
 * @returns {void} - Nothing
 */
declare function PandoraCreateChest(Room: object): void;
/**
 * Generates random rooms linked on the entry room
 * @param {PandoraBaseRoom} EntryRoom - The room object that's leading to that floor
 * @param {PandoraFloorDirection} DirectionFrom - The entry direction
 * @param {number} RoomLevel - The room level, the higher it goes, the higher the chances it will be a dead-end
 * @param {number} MaxRoom - The max number of rooms to generate.
 * @returns {void} - Nothing
 */
declare function PandoraGenerateRoom(EntryRoom: PandoraBaseRoom, DirectionFrom: PandoraFloorDirection, RoomLevel: number, MaxRoom: number): void;
/**
 * Loads the Pandora's Box screen
 * @param {PandoraFloors} FloorName - The name of the floor in which we must generate rooms
 * @param {PandoraBaseRoom} EntryRoom - The room object that's leading to that floor
 * @param {PandoraFloorDirection} DirectionFrom - The entry direction
 * @param {PandoraFloorDirection} DirectionTo - The opposite direction
 * @param {number} MaxRoom - The maximum limit of rooms to generate.
 * @returns {void} - Nothing
 */
declare function PandoraGenerateFloor(FloorName: PandoraFloors, EntryRoom: PandoraBaseRoom, DirectionFrom: PandoraFloorDirection, DirectionTo: PandoraFloorDirection, MaxRoom: number): void;
/**
 * Clears all the rooms and generates the main hall with an introduction maid
 * @returns {void} - Nothing
 */
declare function PandoraBuildMainHall(): void;
/**
 * Removes the current character from the room and deletes that NPC from the array
 * @returns {void} - Nothing
 */
declare function PandoraRemoveCurrentCharacter(): void;
/**
 * Flags the current character to allow moves and exits any dialog with her
 * @returns {void} - Nothing
 */
declare function PandoraCharacterAllowMove(): void;
/**
 * When the current character joins the player's party
 * @returns {void} - Nothing
 */
declare function PandoraCharacterJoin(): void;
/**
 * When the current character leaves the player's party
 * @returns {void} - Nothing
 */
declare function PandoraCharacterLeave(): void;
/**
 * When the current character starts to fight against the player
 * @returns {void} - Nothing
 */
declare function PandoraCharacterFight(): void;
/**
 * Resolves the fight between the player and the current character
 * @returns {void} - Nothing
 */
declare function PandoraCharacterFightEnd(): void;
/**
 * When the mission fails, we go back to the infiltration room
 * @returns {void} - Nothing
 */
declare function PandoraMissionFail(): void;
/**
 * When the player must walk back to the previous room he entered from
 * @returns {void} - Nothing
 */
declare function PandoraWalkBack(): void;
/**
 * When the player must strips the current character
 * @returns {void} - Nothing
 */
declare function PandoraCharacterNaked(): void;
/**
 * When the player changes in the clothes of someone else (type)
 * @param {string} Type - The type of character to dress as (ex: Guard)
 * @returns {void} - Nothing
 */
declare function PandoraPlayerClothes(Type: string): void;
/**
 * The player can only try once to recruit a random NPC, the odds are set when conversation starts
 * @returns {void} - Nothing
 */
declare function PandoraStartRecruit(): void;
/**
 * Increases the infiltration skill on some events
 * @param {string|number} Progress - The progression factor
 * @returns {void} - Nothing
 */
declare function PandoraInfiltrationChange(Progress: string | number): void;
/**
 * Checks if the player can bring the NPC to her private room
 * @returns {boolean} - Returns true if the player can
 */
declare function PandoraCanJoinPrivateRoom(): boolean;
/**
 * When a random NPC joins the player private room, we add that character and exits the dialog
 * @returns {void} - Nothing
 */
declare function PandoraCharacterJoinPrivateRoom(): void;
/**
 * Checks if the mission is the one provided in the parameter
 * @param {string} Type - The mission type
 * @returns {boolean} - Returns TRUE if it's the current mission
 */
declare function PandoraMissionIs(Type: string): boolean;
/**
 * Checks if the perk specified is currently selected
 * @param {string} Type - The perk type
 * @returns {boolean} - Returns TRUE if it's selected
 */
declare function PandoraHasPerk(Type: string): boolean;
/**
 * Prepares an information text based on the bribe amount provided
 * @param {string} Amount - The bribe amount
 * @param {string} Type - The perk type
 * @returns {void} - Nothing
 */
declare function PandoraBribeInfo(Amount: string, Type: string): void;
/**
 * Some dialog activities can boost the recruitment odds
 * @returns {void} - Nothing
 */
declare function PandoraRecruitBoost(): void;
/**
 * Starts the player punishment process and jumps to the punishment Dominatrix
 * @param {Boolean} FromKidnapper
 * @param {string} [FixIntro]
 * @returns {void} - Nothing
 */
declare function PandoraPunishmentIntro(FromKidnapper: boolean, FixIntro?: string): void;
/**
 * Puts the player in lots of random restraints
 * @returns {void} - Nothing
 */
declare function PandoraRestrainPlayer(): void;
/**
 * When the player purchases a drink from the maid, she can heal by the money value
 * @param {number} Money
 * @returns {void} - Nothing
 */
declare function PandoraBuyMaidDrink(Money: number): void;
/**
 * Generates new random odds for a character, based on Pandora's difficulty
 * @returns {void} - Nothing
 */
declare function PandoraCharacterGenerateRandomOdds(): void;
/**
 * Starts the guard quiz, the player needs 5 good answers to be let go
 * @returns {void} - Nothing
 */
declare function PandoraQuizStart(): void;
/**
 * Generates questions that guards will challenge the player with
 * @returns {void} - Nothing
 */
declare function PandoraQuizNext(): void;
/**
 * When the player gives an answer to the guard quiz, the guard will give a visual hint if the answer is incorrect
 * @param {string} Answer
 * @returns {void} - Nothing
 */
declare function PandoraQuizAnswer(Answer: string): void;
/**
 * When the player gets ungagged by an NPC, we remove everything on the head
 * @returns {void} - Nothing
 */
declare function PandoraPlayerUngag(): void;
/**
 * Sets the punishment sentence in minutes
 * @param {string|number} Minutes
 * @returns {void} - Nothing
 */
declare function PandoraPunishmentSentence(Minutes: string | number): void;
/**
 * Starts the punishment
 * @returns {void} - Nothing
 */
declare function PandoraPunishmentStart(): void;
/**
 * When an NPC pays the player for a service
 * @param {string} Amount - The paid amount
 * @returns {void} - Nothing
 */
declare function PandoraPlayerPay(Amount: string): void;
/**
 * When the player pays an NPC to wear her clothes
 * @returns {void} - Nothing
 */
declare function PandoraBuyRandomClothes(): void;
/**
 * Starts the chest lockpicking mini-game
 * @returns {void} - Nothing
 */
declare function PandoraChestLockpickStart(): void;
/**
 * When the picklock mini-game ends, adds 30 seconds to the timer
 * @returns {void} - Nothing
 */
declare function PandoraChestLockEnd(): void;
/**
 * When the player loots the chest, we add some money and the chest disappear
 * @returns {void} - Nothing
 */
declare function PandoraChestLoot(): void;
/**
 * When the player gets the paint cans from a cosplay girl
 * @returns {void} - Nothing
 */
declare function PandoraGetPaint(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function PandoraClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function PandoraClubCardEnd(): void;
declare var PandoraBackground: string;
/** @type {PandoraBaseRoom} */
declare var PandoraCurrentRoom: PandoraBaseRoom;
/** @type {PandoraBaseRoom} */
declare var PandoraPreviousRoom: PandoraBaseRoom;
/** @type {PandoraBaseRoom[]} */
declare var PandoraRoom: PandoraBaseRoom[];
/** @type {PandoraFloorDirection[]} */
declare var PandoraDirectionList: PandoraFloorDirection[];
/** @type {PandoraFloorDirection[]} */
declare var PandoraDirectionListFrom: PandoraFloorDirection[];
/** @type {""|"Search"|"Rest"|"Paint"} */
declare var PandoraMode: "" | "Search" | "Rest" | "Paint";
declare var PandoraModeTimer: number;
declare var PandoraModeAppearance: any;
declare var PandoraMessage: any;
/** @type {NPCCharacter[]} */
declare var PandoraParty: NPCCharacter[];
/** @type {null | NPCCharacter} */
declare var PandoraFightCharacter: null | NPCCharacter;
declare var PandoraRandomNPCList: string[];
declare namespace PandoraMoveDirectionTimer {
    let Direction: string;
    let Timer: number;
}
/** @type {null | PandoraBaseRoom} */
declare var PandoraTargetRoom: null | PandoraBaseRoom;
declare var PandoraClothes: string;
declare var PandoraWillpower: number;
declare var PandoraMaxWillpower: number;
declare var PandoraMoney: number;
declare var PandoraTimer: number;
declare var PandoraChestCount: number;
declare var PandoraPaint: boolean;
declare var PandoraReverseMaidDone: number;
declare var PandoraReverseMaidTotal: number;
