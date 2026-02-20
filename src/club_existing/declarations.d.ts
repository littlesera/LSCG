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
