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

declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}