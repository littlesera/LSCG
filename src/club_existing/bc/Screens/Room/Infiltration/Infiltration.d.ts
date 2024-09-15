/**
 * Returns TRUE if the mission can complete as a success
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanSuccess(): boolean;
/**
 * Returns TRUE if the mission can complete as a failure
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanFail(): boolean;
/**
 * Returns TRUE if the player can go back to Pandora's Box to pursue her mission
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanGoBack(): boolean;
/**
 * Returns TRUE if the player can start the Pandora Padlock Mission, needs to be missing the item and infiltration 6 or more
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanGetPandoraLock(): boolean;
/**
 * Returns TRUE if the player can ask to get Pandora's locks as a reward for the mission
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanAskForPandoraLock(): boolean;
/**
 * Returns TRUE if the player can turn in the cat burglar mission
 * @returns {boolean} - TRUE if possible
 */
declare function InfiltrationCatBurglarHasMoney(): boolean;
/**
 * Returns TRUE if the player can complete the reverse maid mission, at least 50% of the job must be done
 * @returns {boolean} - TRUE if possible
 */
declare function InfiltrationReverseMaidCanComplete(): boolean;
/**
 * Returns TRUE if the player hasat least 1 NPC from Pandora in their private room and has reached 5 infiltration
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationPandoraPrisonerPresent(): boolean;
/**
 * Returns TRUE if the player brought back a Mistress from Pandoras Box
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationPartyPrisonerIsMistress(): boolean;
/**
 * Returns TRUE if there is still free space in private room.
 * @returns {boolean} - TRUE if successful
 */
declare function InfiltrationCanJoinPrivateRoom(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained and gagged
 */
declare function InfiltrationCanPlayClubCard(): boolean;
/**
 * Returns TRUE if the player has free space and is skilled enough.
 * @returns {boolean} - * Returns TRUE if the player has free space and is skilled enough.
 */
declare function InfiltrationCanBrainwashCaptive(): boolean;
/**
 * Loads the infiltration screen by generating the supervisor.
 * @returns {void} - Nothing
 */
declare function InfiltrationLoad(): void;
/**
 * Runs and draws the infiltration screen.  Shows the player and the opponent.
 * @returns {void} - Nothing
 */
declare function InfiltrationRun(): void;
/**
 * Handles clicks in the infiltration screen
 * @returns {void} - Nothing
 */
declare function InfiltrationClick(): void;
/**
 * Sets the infiltration mission challenge difficulty
 * @param {string} Difficulty
 * @returns {void} - Nothing
 */
declare function InfiltrationSelectChallenge(Difficulty: string): void;
/**
 * Prepares the mission and presents it to the player
 * @returns {void} - Nothing
 */
declare function InfiltrationPrepareMission(): void;
/**
 * Starts the mission and jumps to Pandora's box
 * @returns {void} - Nothing
 */
declare function InfiltrationStartMission(): void;
/**
 * Returns to Pandora's box with the same stats and room layout
 * @returns {void} - Nothing
 */
declare function InfiltrationReturnMission(): void;
/**
 * When the player completes the mission, she gains
 * @returns {void} - Nothing
 */
declare function InfiltrationCompleteMission(): void;
/**
 * Before all missions, the player can wear random clothes
 * @returns {void} - Nothing
 */
declare function InfiltrationRandomClothes(): void;
/**
 * Before the cat burglar mission, we dress the player in black latex
 * @returns {void} - Nothing
 */
declare function InfiltrationCatBurglarClothes(): void;
/**
 * When the infiltration supervisor pays the player for ransoming a Dominatrix
 * @param {string} Type - The ransom type to be paid (Money, Skill or None)
 * @returns {void} - Nothing
 */
declare function InfiltrationPayRansom(Type: string): void;
/**
 * The revenge kidnapping can happen when infiltration level is at 4 or more, in that case, a Pandora girl can try to kidnap the player from the club and bring her to a Pandora's Box prison
 * @returns {void} - Nothing
 */
declare function InfiltrationStartKidnapping(): void;
/**
 * Ends the revenge kidnapping scenario and goes back to the main hall
 * @param {"Money"|"Skill"|"Private"} [Reward]
 * @returns {void} - Nothing
 */
declare function InfiltrationEndKidnapping(Reward?: "Money" | "Skill" | "Private"): void;
/**
 * When the player surrenders to her kidnapper
 * @returns {void} - Nothing
 */
declare function InfiltrationKidnapperSurrender(): void;
/**
 * Starts the fight with the NPC kidnapper
 * @returns {void} - Nothing
 */
declare function InfiltrationKidnapperStartFight(): void;
/**
 * Ends the fight with the NPC kidnapper
 * @returns {void} - Nothing
 */
declare function InfiltrationKidnapperEndFight(): void;
/**
 * Enter Pandora's Box as the kidnapper victim
 * @returns {void} - Nothing
 */
declare function InfiltrationKidnapperEnterPandora(): void;
/**
 * Removes the gag from the kidnapper
 * @returns {void} - Nothing
 */
declare function InfiltrationKidnapperUngag(): void;
/**
 * Returns TRUE if the player can bring the current NPC to her room
 * @returns {boolean} - TRUE if it's possible
 */
declare function InfiltrationCanBringToRoom(): boolean;
/**
 * Removes the Pandora Locks and Keys from the player inventory, ends the scene
 * @returns {void} - Nothing
 */
declare function InfiltrationStealItems(): void;
/**
 * Starts the Pandora's padlock special mission, cannot be given randomly
 * @returns {void} - Nothing
 */
declare function InfiltrationStartPandoraLock(): void;
/**
 * Add the Pandora locks and keys to the player inventory
 * @returns {void} - Nothing
 */
declare function InfiltrationGetPandoraLock(): void;
/**
 * Pays for the ransom to free a friend from the private room
 * @returns {void} - Nothing
 */
declare function InfiltrationRansomFriend(): void;
/**
 * Starts a rescue mission for the NPC in the private room
 * @returns {void} - Nothing
 */
declare function InfiltrationStartNPCRescue(): void;
/**
 * Dresses the player as a maid for the reverse maid mission
 * @param {string} Rep - The reputation change to apply
 * @returns {void} - Nothing
 */
declare function InfiltrationDressMaid(Rep: string): void;
/**
 * Takes captured infiltrator for brainwashing.
 * @returns {void} - Nothing
 */
declare function InfiltrationPandoraPrisonerBrainwash(): void;
/**
 * Picks captured infiltrator at random.
 * @returns {void} - Nothing
 */
declare function InfiltrationSetPandoraPrisoner(): void;
/**
 * When the player starts a club card game against the supervisor
 * @returns {void} - Nothing
 */
declare function InfiltrationClubCardStart(): void;
/**
 * When the player ends a club card game against the supervisor
 * @returns {void} - Nothing
 */
declare function InfiltrationClubCardEnd(): void;
declare var InfiltrationBackground: string;
/** @type {NPCCharacter} */
declare var InfiltrationSupervisor: NPCCharacter;
declare var InfiltrationDifficulty: number;
/** @type {InfiltrationMissionType | ""} */
declare var InfiltrationMission: InfiltrationMissionType | "";
/** @type {InfiltrationMissionType[]} */
declare var InfiltrationMissionType: InfiltrationMissionType[];
/** @type {InfiltrationTargetType[]} */
declare var InfiltrationObjectType: InfiltrationTargetType[];
/** @type {InfiltrationMissionTarget | null} */
declare var InfiltrationTarget: InfiltrationMissionTarget | null;
declare var InfiltrationCollectRansom: boolean;
/** @type {NPCCharacter} */
declare var InfiltrationKidnapper: NPCCharacter;
/** @type {NPCCharacter} */
declare var InfiltrationPandoraPrisoner: NPCCharacter;
/** @type {NPCCharacter} */
declare var InfiltrationPartyPrisoner: NPCCharacter;
