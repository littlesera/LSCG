declare function InventoryItemNeckSlaveCollarLoadHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckSlaveCollarDrawHook(data: NoArchItemData, originalFunction: () => void): void;
declare function InventoryItemNeckSlaveCollarClickHook(data: NoArchItemData, originalFunction: () => void): void;
/**
 * Sets the slave collar model
 * @param {number} NewType
 */
declare function InventoryItemNeckSlaveCollarSetType(NewType: number): void;
declare var InventoryItemNeckSlaveCollarColorMode: boolean;
/** @type {ItemColor} */
declare var InventoryItemNeckSlaveCollarColor: ItemColor;
declare var InventoryItemNeckSlaveCollarOffset: number;
/** @type {{ Name: string, Property: ItemProperties & { TypeRecord: TypeRecord }, Image: string }[]} */
declare var InventoryItemNeckSlaveCollarTypes: {
    Name: string;
    Property: ItemProperties & {
        TypeRecord: TypeRecord;
    };
    Image: string;
}[];
