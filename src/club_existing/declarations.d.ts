declare const LSCG_VERSION: string;

interface Window {
	LSCG_Loaded?: boolean;
	LSCG_Version?: string;
}

// TODO: Remove once >= R125 types are installed
interface CraftingItem {
	/** The crafted item effects mapped to their effect strength. */
	Effects: Partial<Record<CraftingPropertyType, number>>;
}

// bc-stubs types InventoryWear's Craft as a full CraftingItem, but Item.Craft is a CraftingPartialItem
// (BC validates/fills partial crafts at runtime). Overload so passing an item's Craft type-checks.
declare function InventoryWear(C: Character, AssetName: AssetName, AssetGroup: AssetGroupName, ItemColor?: null | ItemColor, Difficulty?: null | number, MemberNumber?: null | number, Craft?: null | CraftingPartialItem, Refresh?: boolean): Item | null;

declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}