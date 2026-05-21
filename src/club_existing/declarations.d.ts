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

declare module 'leo-profanity' {
    const leoProfanity: {
        loadDictionary(lang?: string): void;
        check(str: string): boolean;
        badWordsUsed(str: string): string[];
        clean(str: string, replaceKey?: string): string;
        list(): string[];
        add(word: string | string[]): void;
        remove(word: string | string[]): void;
        reset(): void;
        clearList(): void;
    };
    export = leoProfanity;
}