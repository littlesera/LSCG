declare function InventoryItemPelvisFuturisticTrainingBeltLoadHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisFuturisticTrainingBeltDrawHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisFuturisticTrainingBeltClickHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisFuturisticTrainingBeltExitHook(data: VibratingItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisFuturisticTrainingBeltPublishAction(C: Character, item: Item, newOption: ExtendedItemOption, previousOption: ExtendedItemOption): void;
/**
 * Not called.
 * @param {Character} C
 * @param {string} Setting
 * @param {boolean} Active
 */
declare function InventoryItemPelvisFuturisticTrainingBeltPublishMode(C: Character, Setting: string, Active: boolean): void;
/**
 * Publishes a generic message when the belt gets updated.
 * @param {Character} C
 * @param {string} msg
 */
declare function InventoryItemPelvisFuturisticTrainingBeltPublishGeneric(C: Character, msg: string): void;
/**
 * Get a vibe mode given a belt state
 * @param {Character} C
 * @param {string} State
 * @param {boolean} First
 * @returns {VibratorMode}
 */
declare function InventoryItemPelvisFuturisticTrainingBeltGetVibeMode(C: Character, State: string, First: boolean): VibratorMode;
/**
 * This function sets the vibration mode, similar to the extended vibrators
 * @param {VibratingItemData} data
 * @param {Character} C
 * @param {FuturisticTrainingBeltPersistentData} PersistentData
 * @param {Item} Item
 * @param {boolean} [Force]
 */
declare function InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(data: VibratingItemData, C: Character, PersistentData: FuturisticTrainingBeltPersistentData, Item: Item, Force?: boolean): void;
/**
 * Performs punishment checks on the chat log for the given item and
 * returns an appropriate punishment, if applicable.
 *
 * @param {Item} Item
 * @param {number} LastTime
 * @returns {{ name: "Speech"|"RequiredSpeech"|"ProhibitedSpeech"|"", word?: string }}
 */
declare function InventoryFuturisticTrainingBeltCheckPunishSpeech(Item: Item, LastTime: number): {
    name: "Speech" | "RequiredSpeech" | "ProhibitedSpeech" | "";
    word?: string;
};
/**
 * @param {VibratingItemData} data
 * @param {DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>} drawData
 * @param {number} LastTime
 */
declare function AssetsItemPelvisFuturisticTrainingBeltScriptUpdatePlayer(data: VibratingItemData, drawData: DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>, LastTime: number): void;
/**
 * Handles the vibrator state machine for the belt
 * @param {VibratingItemData} data
 * @param {DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>} drawData
 * @returns
 */
declare function AssetsItemPelvisFuturisticTrainingBeltScriptStateMachine(data: VibratingItemData, drawData: DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>): void;
declare function AssetsItemPelvisFuturisticTrainingBeltScriptDraw(data: VibratingItemData, originalFunction: (drawData: DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>) => void, drawData: DynamicScriptCallbackData<FuturisticTrainingBeltPersistentData>): void;
declare var FuturisticTrainingBeltPermissions: string[];
declare var FuturisticTrainingBeltSpeechPunishments: string[];
declare var FuturisticTrainingBeltModes: string[];
declare var FuturisticTrainingBeltStates: string[];
/** @type {ItemPropertiesCustom["PublicModeCurrent"]} */
declare var FuturisticTrainingBeltSetMode: ItemPropertiesCustom["PublicModeCurrent"];
declare var FuturisticTrainingBeltStandUpFlag: boolean;
declare var FuturisticTrainingBeltSpeechCharacterLimit: number;
declare var FuturisticTrainingBeltRandomEdgeCycle: number;
declare var FuturisticTrainingBeltRandomTeaseDurationMin: number;
declare var FuturisticTrainingBeltRandomTeaseDurationMax: number;
declare var FuturisticTrainingBeltRandomTeaseDurationCooldown: number;
declare var FuturisticTrainingBeltRandomTeaseChance: number;
declare var FuturisticTrainingBeltRandomTeaseMaxChance: number;
declare var FuturisticTrainingBeltRandomDenyChance: number;
declare var FuturisticTrainingBeltRandomDenyDuration: number;
declare var FuturisticTrainingBeltRandomOrgasmDurationMin: number;
declare var FuturisticTrainingBeltRandomOrgasmDurationMax: number;
declare var FuturisticTrainingBeltRandomOrgasmDurationCooldown: number;
declare var FuturisticTrainingBeltRandomOrgasmChance: number;
declare var FuturisticTrainingBeltPunishmentEdgeDuration: number;
declare var FuturisticTrainingBeltPunishmentVibeDuration: number;
declare var FuturisticTrainingBeltConfigure: boolean;
declare var FuturisticTrainingBeltPage: number;
declare var FuturisticTrainingBeltMaxPage: number;
type FuturisticTrainingBeltPersistentData = {
    UpdateTime?: number;
    LastMessageLen?: number;
    CheckTime?: number;
    DeviceState?: number;
    DeviceStateTimer?: number;
    DeviceVibeMode?: VibratorMode;
};
