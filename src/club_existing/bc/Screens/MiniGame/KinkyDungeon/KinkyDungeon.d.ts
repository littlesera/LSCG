declare function KDSetDefaultKeybindings(): void;
declare function KinkyDungeonLeashingEnemy(): any;
/**
 *
 * @returns {entity}
 */
declare function KinkyDungeonJailGuard(): entity;
declare function KinkyDungeonAngel(): any;
declare function KDUnlockPerk(Perk: any): void;
declare function KDLoadPerks(Perk: any): void;
/**
 *
 * @param {any[]} list
 * @return {Record<any, any>}
 */
declare function KDMapInit(list: any[]): Record<any, any>;
declare function KDistEuclidean(x: any, y: any): number;
declare function KDistChebyshev(x: any, y: any): number;
/**
 * Loads the kinky dungeon game
 * @returns {void} - Nothing
 */
declare function KinkyDungeonLoad(): void;
/**
 * Restricts Devious Dungeon Challenge to only occur when inside the arcade
 * @returns {boolean} - If the player is in the arcade
 */
declare function KinkyDungeonDeviousDungeonAvailable(): boolean;
/**
 * Returns whether or not the player is the one playing, which determines whether or not to draw the UI and struggle groups
 * @returns {boolean} - If the player is the game player
 */
declare function KinkyDungeonIsPlayer(): boolean;
declare function KinkyDungeonRun(): void;
/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables the border and stuff
 * @returns {void} - Nothing
 */
declare function DrawButtonKD(name: string, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean): void;
/**
 * Draws a button component
 * @param {string} name - Name of the button element
 * @param {(bdata: any) => boolean} func - Whether or not you can click on it
 * @param {boolean} enabled - Whether or not you can click on it
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {boolean} [NoBorder] - Disables border
 * @param {string} [FillColor] - BG color
 * @param {number} [FontSize] - Font size
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha] - Dont show text backgrounds
 * @param {number} [options.zIndex] - zIndex
 * @returns {void} - Nothing
 */
declare function DrawButtonKDEx(name: string, func: (bdata: any) => boolean, enabled: boolean, Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, options?: {
    noTextBG?: boolean;
    alpha?: number;
    zIndex?: number;
}): void;
declare function KDProcessButtons(): boolean;
/**
 * Buttons are clickable one frame later, please factor this in to UI design (especially when enforcing validation)
 * @param {string} name
 * @returns {boolean}
 */
declare function KDClickButton(name: string): boolean;
declare function MouseInKD(name: any): boolean;
declare function KinkyDungeonGetTraitsCount(): number;
declare function KDSendTrait(trait: any): void;
declare function KDSendSpell(spell: any): void;
declare function KDSendSpellCast(spell: any): void;
declare function KDSendWeapon(weapon: any): void;
declare function KDSendStatus(type: any, data: any, data2: any): void;
declare function KDSendEvent(type: any): void;
declare function KinkyDungeonLoadStats(): void;
declare function KDInitializeJourney(Journey: any): void;
declare function KDCommitKeybindings(): void;
declare function KinkyDungeonStartNewGame(Load: any): void;
declare function KDUpdatePlugSettings(): void;
declare function KinkyDungeonHandleClick(): boolean;
/**
 * Handles clicks during the kinky dungeon game
 * @returns {void} - Nothing
 */
declare function KinkyDungeonClick(): void;
/**
 * Handles exit during the kinky dungeon game
 * @returns {void} - Nothing
 */
declare function KinkyDungeonExit(): void;
/**
 * Handles key presses during the mini game. (Both keyboard and mobile)
 * @returns {void} - Nothing
 */
declare function KinkyDungeonKeyDown(): void;
/**
 * Outputs a savegame
 * @returns {KinkyDungeonSave} - Saved game object
 */
declare function KinkyDungeonGenerateSaveData(): KinkyDungeonSave;
declare function KinkyDungeonSaveGame(ToString: any): string;
declare function KinkyDungeonCompressSave(save: any): string;
declare function KinkyDungeonLoadGame(String: any): boolean;
/**
 *
 * @param {boolean} Native Decides whether or not to use native KDRandom to randomize
 */
declare function KDrandomizeSeed(Native: boolean): void;
declare function KDsetSeed(string: any): void;
/**
 * It takes a string and returns a function that returns a random number
 * @param str - The string to hash.
 * @returns A function that returns a random number.
 */
declare function xmur3(str: any): () => number;
/**
 * It takes four 32-bit integers and returns a function that returns a random number between 0 and 1
 * @param a - The first parameter.
 * @param b - 0x9e3779b9
 * @param c - 0x9e3779b9
 * @param d - The seed.
 * @returns A function that returns a random number between 0 and 1.
 */
declare function sfc32(a: any, b: any, c: any, d: any): () => number;
declare function sfc32(a: number, b: number, c: number, d: number): () => number;
/**
 *
 * @param {string} Path
 * @param {number} [volume]
 */
declare function AudioPlayInstantSoundKD(Path: string, volume?: number): void;
/**
 * From https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
declare function hashCode(s: any): number;
declare function TextGetKD(Text: any): any;
declare function KinkyDungeonCheckPlayerRefresh(): void;
declare let KinkyDungeonPlayerNeedsRefresh: boolean;
declare let KinkyDungeonNextRefreshCheck: number;
declare const pp: URLSearchParams;
declare let param_branch: string;
declare let param_test: string;
declare let param_localhost: string;
declare let TestMode: string | boolean;
declare let KDDebugMode: boolean;
declare let KDDebug: boolean;
declare let KDDebugPerks: boolean;
declare let KDDebugGold: boolean;
declare let KDAllModFiles: any[];
declare let KDModFiles: {};
declare let KDClasses: number;
declare let KinkyDungeonPerksConfig: string;
declare let KDUnlockedPerks: any[];
declare let KinkyDungeonBackground: string;
/**
 * @type {Character}
 */
declare let KinkyDungeonPlayer: Character;
declare let KinkyDungeonState: string;
declare let KinkyDungeonRep: number;
declare let KinkyDungeonKeybindings: any;
declare let KinkyDungeonKeybindingsTemp: any;
declare let KinkyDungeonKeybindingCurrentKey: string;
declare let KinkyDungeonKeybindingCurrentKeyRelease: string;
declare let KinkyDungeonNewGame: number;
declare let KinkyDungeonGameRunning: boolean;
declare let KDLose: boolean;
declare let KinkyDungeonKey: string[];
declare let KinkyDungeonKeySpell: string[];
declare let KinkyDungeonKeyWait: string[];
declare let KinkyDungeonKeySkip: string[];
declare let KinkyDungeonKeyEnter: string[];
declare let KinkyDungeonKeySprint: string[];
declare let KinkyDungeonKeyWeapon: string[];
declare let KinkyDungeonKeyUpcast: string[];
declare let KinkyDungeonKeyMenu: string[];
declare let KinkyDungeonKeyToggle: string[];
declare let KinkyDungeonKeySpellPage: string[];
declare let KinkyDungeonKeySwitchWeapon: string[];
declare let KDLoadingTextKeys: {};
declare namespace KDDefaultKB {
    const Down: string;
    const DownLeft: string;
    const DownRight: string;
    const Left: string;
    const Right: string;
    const Up: string;
    const UpLeft: string;
    const UpRight: string;
    const Spell1: string;
    const Spell2: string;
    const Spell3: string;
    const Spell4: string;
    const Spell5: string;
    const Spell6: string;
    const Spell7: string;
    const SpellWeapon: string;
    const Wait: string;
    const Skip: string;
    const Enter: string;
    const Sprint: string;
    const SpellPage: string;
    const SwitchWeapon: string;
    const QInventory: string;
    const Inventory: string;
    const Reputation: string;
    const Magic: string;
    const Log: string;
    const Upcast: string;
    const UpcastCancel: string;
    const MsgLog: string;
    const Pass: string;
    const Door: string;
    const AStruggle: string;
    const APathfind: string;
    const AInspect: string;
}
declare let KinkyDungeonRootDirectory: string;
declare let KinkyDungeonPlayerCharacter: any;
declare let KinkyDungeonGameData: any;
declare let KinkyDungeonGameDataNullTimer: number;
declare let KinkyDungeonGameDataNullTimerTime: number;
declare let KinkyDungeonStreamingPlayers: any[];
declare let KinkyDungeonInitTime: number;
declare let KinkyDungeonSleepTime: number;
declare let KinkyDungeonFreezeTime: number;
declare let KinkyDungeonAutoWait: boolean;
declare let KinkyDungeonConfigAppearance: boolean;
declare const Consumable: "consumable";
declare const Restraint: "restraint";
declare const LooseRestraint: "looserestraint";
declare const Outfit: "outfit";
declare const Accessory: "accessory";
declare const Weapon: "weapon";
declare const Misc: "misc";
declare let KinkyDungeonStatsChoice: Map<any, any>;
declare let KDJourney: string;
declare let KDOptOut: boolean;
type KDGameDataBase = {
    KeysNeeded: boolean;
    PoolUses: number;
    PoolUsesGrace: number;
    JailRemoveRestraintsTimer: number;
    KinkyDungeonSpawnJailers: number;
    KinkyDungeonSpawnJailersMax: number;
    KinkyDungeonLeashedPlayer: number;
    KinkyDungeonLeashingEnemy: number;
    KinkyDungeonJailGuard: number;
    KinkyDungeonGuardTimer: number;
    KinkyDungeonGuardTimerMax: number;
    KinkyDungeonGuardSpawnTimer: number;
    KinkyDungeonGuardSpawnTimerMax: number;
    KinkyDungeonGuardSpawnTimerMin: number;
    KinkyDungeonMaxPrisonReduction: number;
    KinkyDungeonPrisonReduction: number;
    KinkyDungeonPrisonExtraGhostRep: number;
    PrisonGoodBehaviorFromLeash: number;
    KinkyDungeonJailTourTimer: number;
    KinkyDungeonJailTourTimerMin: number;
    KinkyDungeonJailTourTimerMax: number;
    KinkyDungeonPenanceCostCurrent: number;
    KinkyDungeonAngel: number;
    KDPenanceStage: number;
    KDPenanceStageEnd: number;
    AngelCurrentRep: string;
    KDPenanceMode: string;
    OrgasmStage: number;
    OrgasmTurns: number;
    OrgasmStamina: number;
    SleepTurns: number;
    PlaySelfTurns: number;
    RescueFlag: boolean;
    KinkyDungeonPenance: boolean;
    GuardApplyTime: number;
    WarningLevel: number;
    AncientEnergyLevel: number;
    OrigEnergyLevel: number;
    LastMP: number;
    LastAP: number;
    LastSP: number;
    LastWP: number;
    Outfit: string;
    Champion: string;
    ChampionCurrent: number;
    JailPoints: {
        x: number;
        y: number;
        type: string;
        radius: number;
        requireLeash?: boolean;
        requireFurniture?: boolean;
    }[];
    LastMapSeed: string;
    AlreadyOpened: {
        x: number;
        y: number;
    }[];
    Journey: string;
    CheckpointIndices: number[];
    PrisonerState: string;
    TimesJailed: number;
    JailTurns: number;
    JailKey: boolean;
    CurrentDialog: string;
    CurrentDialogStage: string;
    OrgasmNextStageTimer: number;
    DistractionCooldown: number;
    ConfirmAttack: boolean;
    CurrentDialogMsg: string;
    CurrentDialogMsgSpeaker: string;
    CurrentDialogMsgPersonality: string;
    CurrentDialogMsgID: number;
    CurrentDialogMsgData: Record<string, string>;
    CurrentDialogMsgValue: Record<string, number>;
    AlertTimer: number;
    RespawnQueue: {
        enemy: string;
        faction: string;
    }[];
    HeartTaken: boolean;
    CurrentVibration: KinkyVibration;
    Edged: boolean;
    TimeSinceLastVibeStart: Record<string, number>;
    TimeSinceLastVibeEnd: Record<string, number>;
    OfferFatigue: number;
    Favors: Record<string, number>;
    RoomType: string;
    MapMod: string;
    HunterTimer: number;
    Hunters: number[];
    Quests: string[];
    MapFaction: string;
    PriorJailbreaks: number;
    PreviousWeapon: string;
    StaminaPause: number;
    StaminaSlow: number;
    ManaSlow: number;
    TempFlagFloorTicks: Record<string, number>;
    KneelTurns: number;
    HiddenSpellPages: Record<string, boolean>;
    KeyringLocations: {
        x: number;
        y: number;
    }[];
    HiddenItems: Record<string, boolean>;
    CagedTime: number;
    ShopItems: shopItem[];
    DelayedActions: KDDelayedAction[];
    JailFaction: string[];
    GuardFaction: string[];
    OfferCount: number;
};
declare namespace KDGameDataBase {
    export const CagedTime: number;
    export const HiddenItems: {};
    export const KeyringLocations: any[];
    export const HiddenSpellPages: {};
    export const PriorJailbreaks: number;
    export const MapFaction: string;
    export const KeysNeeded: boolean;
    export const RoomType: string;
    const MapMod_1: string;
    export { MapMod_1 as MapMod };
    export const Quests: any[];
    export const HunterTimer: number;
    export const Hunters: any[];
    export const AlertTimer: number;
    export const OrgasmNextStageTimer: number;
    export const DistractionCooldown: number;
    export const PoolUses: number;
    export const PoolUsesGrace: number;
    export const JailRemoveRestraintsTimer: number;
    export const KinkyDungeonSpawnJailers: number;
    export const KinkyDungeonSpawnJailersMax: number;
    export const KinkyDungeonLeashedPlayer: number;
    export const KinkyDungeonLeashingEnemy: number;
    export const KinkyDungeonJailGuard: number;
    export const KinkyDungeonGuardTimer: number;
    export const KinkyDungeonGuardTimerMax: number;
    export const KinkyDungeonGuardSpawnTimer: number;
    export const KinkyDungeonGuardSpawnTimerMax: number;
    export const KinkyDungeonGuardSpawnTimerMin: number;
    export const KinkyDungeonMaxPrisonReduction: number;
    export const KinkyDungeonPrisonReduction: number;
    export const KinkyDungeonPrisonExtraGhostRep: number;
    export const PrisonGoodBehaviorFromLeash: number;
    export const KinkyDungeonJailTourTimer: number;
    export const KinkyDungeonJailTourTimerMin: number;
    export const KinkyDungeonJailTourTimerMax: number;
    export const KinkyDungeonPenanceCostCurrent: number;
    export const KinkyDungeonAngel: number;
    export const KDPenanceStage: number;
    export const KDPenanceStageEnd: number;
    export const AngelCurrentRep: string;
    export const KDPenanceMode: string;
    export const OrgasmStage: number;
    export const OrgasmTurns: number;
    export const OrgasmStamina: number;
    export const KinkyDungeonPenance: boolean;
    export const RescueFlag: boolean;
    export const SleepTurns: number;
    export const PlaySelfTurns: number;
    export const GuardApplyTime: number;
    export const AncientEnergyLevel: number;
    export const OrigEnergyLevel: number;
    export const LastAP: number;
    export const LastSP: number;
    export const LastMP: number;
    export const LastWP: number;
    export const Outfit: string;
    export const Champion: string;
    export const ChampionCurrent: number;
    export const JailPoints: any[];
    export const WarningLevel: number;
    export const LastMapSeed: string;
    export const AlreadyOpened: any[];
    export const Journey: string;
    export const CheckpointIndices: number[];
    export const TempFlagFloorTicks: {};
    export const PrisonerState: string;
    export const TimesJailed: number;
    export const JailTurns: number;
    export const JailKey: boolean;
    export const CurrentDialog: string;
    export const CurrentDialogStage: string;
    export const CurrentDialogMsg: string;
    export const CurrentDialogMsgSpeaker: string;
    export const CurrentDialogMsgPersonality: string;
    export const CurrentDialogMsgData: {};
    export const CurrentDialogMsgValue: {};
    export const CurrentDialogMsgID: number;
    export const ConfirmAttack: boolean;
    export const RespawnQueue: any[];
    export const HeartTaken: boolean;
    export const CurrentVibration: any;
    export const Edged: boolean;
    export const TimeSinceLastVibeStart: {};
    export const TimeSinceLastVibeEnd: {};
    export const OfferFatigue: number;
    export const Favors: {};
    export const PreviousWeapon: any;
    export const StaminaPause: number;
    export const StaminaSlow: number;
    export const ManaSlow: number;
    export const KneelTurns: number;
    export const ShopItems: any[];
    export const DelayedActions: any[];
    export const JailFaction: any[];
    export const GuardFaction: any[];
    export const OfferCount: number;
}
/**
 * @type {KDGameDataBase}
 */
declare let KDGameData: KDGameDataBase;
declare let KDLeashingEnemy: any;
declare let KDJailGuard: any;
declare let KDAngel: any;
/**
 * Runs the kinky dungeon game and draws its components on screen
 * @returns {void} - Nothing
 */
declare let KinkyDungeonCreditsPos: number;
declare let KDMaxPatronPerPage: number;
declare let KDMaxPatron: number;
declare let KinkyDungeonPatronPos: number;
declare let KinkyDungeonSound: boolean;
declare let KinkyDungeonFullscreen: boolean;
declare let KinkyDungeonDrool: boolean;
declare let KinkyDungeonArmor: boolean;
declare let KinkyDungeonGraphicsQuality: boolean;
declare let KinkyDungeonFastWait: boolean;
declare let KinkyDungeonTempWait: boolean;
declare let KinkyDungeonSexyMode: boolean;
declare let KinkyDungeonClassMode: string;
declare let KinkyDungeonRandomMode: boolean;
declare let KinkyDungeonSaveMode: boolean;
declare let KinkyDungeonSexyPiercing: boolean;
declare let KinkyDungeonSexyPlug: boolean;
declare let KDOldValue: string;
declare let KDOriginalValue: string;
declare let KDRestart: boolean;
declare let fpscounter: number;
declare let lastfps: number;
declare let dispfps: number;
/**
 * @type {Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean}>}
 */
declare let KDButtonsCache: Record<string, {
    Left: number;
    Top: number;
    Width: number;
    Height: number;
    enabled: boolean;
    func?: (bdata: any) => boolean;
}>;
/**
 * @type {Record<string, {Left: number, Top: number, Width: number, Height: number, enabled: boolean, func?: (bdata: any) => boolean}>}
 */
declare let KDLastButtonsCache: Record<string, {
    Left: number;
    Top: number;
    Width: number;
    Height: number;
    enabled: boolean;
    func?: (bdata: any) => boolean;
}>;
declare let KinkyDungeonReplaceConfirm: number;
declare let KinkyDungeonGameFlag: boolean;
declare let KDDefaultJourney: string[];
declare let KDDefaultAlt: string[];
declare let KDHardModeThresh: number;
declare let mouseDown: boolean;
/**
 * Game keyboard input handler object: Handles keyboard inputs.
 * @constant
 * @type {object} - The game keyboard input handler object. Contains the functions and properties required to handle key press events.
 */
declare let KinkyDungeonGameKey: object;
declare let KinkyDungeonSeed: string;
declare let KDRandom: () => number;
/**
 * @type {Map<string, HTMLAudioElement>}
 */
declare let kdSoundCache: Map<string, HTMLAudioElement>;
