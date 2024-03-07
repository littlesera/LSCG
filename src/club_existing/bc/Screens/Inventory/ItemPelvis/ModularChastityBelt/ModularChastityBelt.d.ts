declare function InventoryItemPelvisModularChastityBeltDrawHook(data: ModularItemData, originalFunction: () => void): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltDrawBase(_offset: number): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltDrawIntensity(_offset: number): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltDrawShockModule(_offset: number): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltDrawVoiceControl(_offset: number): void;
declare function InventoryItemPelvisModularChastityBeltDrawVoiceControlCleanup(): void;
declare function InventoryItemPelvisModularChastityBeltExitHook(data: ModularItemData, originalFunction: () => void): void;
declare function InventoryItemPelvisModularChastityBeltClickHook(data: ModularItemData, originalFunction: () => void): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltClickIntensity(_offset: number): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltClickVoiceControl(_offset: number): void;
declare function InventoryItemPelvisModularChastityBeltVoicePrevious(): void;
declare function InventoryItemPelvisModularChastityBeltVoiceNext(): void;
declare function InventoryItemPelvisModularChastityBeltVoiceControlClickSet(): void;
declare function InventoryItemPelvisModularChastityBeltResetOrgasm(): void;
declare function InventoryItemPelvisModularChastityBeltResetDeny(): void;
/**
 * @param {number} _offset //How many pixels down will the UI be shifted
 */
declare function InventoryItemPelvisModularChastityBeltClickShockModule(_offset: number): void;
declare function InventoryItemPelvisModularChastityBeltScriptDrawHook(data: ModularItemData, originalFunction: (drawData: DynamicScriptCallbackData<ModularChastityBeltPersistentData>) => void, drawData: DynamicScriptCallbackData<ModularChastityBeltPersistentData>): void;
/**
 * @param {ModularItemData} data
 * @param {Character} C
 * @param {Item} Item
 * @param {number} LastTime
 * @param {TypeRecord} ItemType
 */
declare function InventoryItemPelvisModularChastityBeltHandleChat(data: ModularItemData, C: Character, Item: Item, LastTime: number, ItemType: TypeRecord): void;
/**
 * @param {string} msg
 * @param {readonly string[]} TriggerValues
 * @returns {number[]}
 */
declare function InventoryItemPelvisModularChastityBeltDetectMsg(msg: string, TriggerValues: readonly string[]): number[];
/**
 * @param {Item} Item
 * @param {Character} C
 * @param {boolean} OrgasmDetected
 * @param {boolean} isPlayerInChatRoom
 * @param {number} ShockCooldown
 */
declare function InventoryItemPelvisModularChastityBeltCheckPunish(Item: Item, C: Character, OrgasmDetected: boolean, isPlayerInChatRoom: boolean, ShockCooldown: number): "Struggle" | "Orgasm" | "StandUp" | "StruggleOther";
/**
 * @param {boolean} PunishStandup
 * @param {Character} C
 * @param {boolean} isPlayerInChatRoom
 * @param {number} ShockCooldown
 * @returns {boolean}
 */
declare function InventoryItemPelvisModularChastityBeltCheckStanding(PunishStandup: boolean, C: Character, isPlayerInChatRoom: boolean, ShockCooldown: number): boolean;
declare function InventoryItemPelvisModularChastityBeltForceKneel(): void;
declare var InventoryItemPelvisModularChastityBeltVoiceTriggers: string[];
/** @type {string[]} */
declare var InventoryItemPelvisModularChastityBeltVoiceTriggerValues: string[];
type ModularChastityBeltPersistentData = {
    Cooldown?: number;
    ShockCooldown?: number;
    LastMessage?: number;
    DenyDetected?: boolean;
    OrgasmDetected?: boolean;
    ChatroomCheck?: boolean;
};
