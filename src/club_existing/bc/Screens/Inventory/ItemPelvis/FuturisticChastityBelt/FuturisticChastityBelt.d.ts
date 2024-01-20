/**
 * @param {Item} Item
 */
declare function InventoryFuturisticChastityBeltCheckPunish(Item: Item): "" | "Struggle" | "Orgasm" | "StruggleOther";
/**
 * @param {DynamicScriptCallbackData<FuturisticChastityBeltPersistentData>} data
 */
declare function AssetsItemPelvisFuturisticChastityBeltScriptUpdatePlayer(data: DynamicScriptCallbackData<FuturisticChastityBeltPersistentData>): void;
/**
 * Trigger a shock automatically
 * @param {Character} C
 * @param {Item} Item
 * @param {string} ShockType
 * @param {string} [ReplacementWord]
 * @param {boolean} [NoShock]
 */
declare function AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C: Character, Item: Item, ShockType: string, ReplacementWord?: string, NoShock?: boolean): void;
declare function AssetsItemPelvisFuturisticChastityBeltScriptDraw(drawData: DynamicScriptCallbackData<FuturisticChastityBeltPersistentData>): void;
declare var FuturisticChastityBeltShockCooldownOrgasm: number;
declare var InventoryItemPelvisFuturisticChastityBeltTamperZones: string[];
type FuturisticChastityBeltPersistentData = {
    UpdateTime?: number;
    LastMessageLen?: number;
};
