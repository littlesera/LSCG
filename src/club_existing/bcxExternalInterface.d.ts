interface BCXVersion {
	major: number;
	minor: number;
	patch: number;
	extra?: string;
	dev?: boolean;
}

interface BCX_Events {
	curseTrigger: {
		/** Which action the curses did to the item */
		action: "remove" | "add" | "swap" | "update" | "color" | "autoremove";
		/** Name of asset group that was changed */
		group: string;
	};
}

interface BCX_ModAPI extends BCXEventEmitter<BCX_Events> {
	/** Name of the mod this API was requested for */
	readonly modName: string;

	/** Returns state handler for a rule or `null` for unknown rule */
	//getRuleState<ID extends BCX_Rule>(rule: ID): BCX_RuleStateAPI<ID> | null;
}

interface BCX_ConsoleInterface {
	/** Version of loaded BCX */
	readonly version: string;

	/** Version parsed to components */
	readonly versionParsed: Readonly<BCXVersion>;

	/**
	 * Gets BCX version of another character in room
	 * @param target - The membernumber of character to get; undefined = Player
	 */
	getCharacterVersion(target?: number): string | null;

	/** Gets if BCX runs in development mode */
	readonly isDevel: boolean;

	/**
	 * Get access to BCX Mod API.
	 * @param mod - Same identifier of your mod as used for ModSDK
	 */
	getModApi(mod: string): BCX_ModAPI;
}

interface Window {
	bcx?: BCX_ConsoleInterface;
}

type BCXEvent = Record<never, unknown>;
type BCXAnyEvent<T extends BCXEvent> = {
	[key in keyof T]: {
		event: key;
		data: T[key];
	};
}[keyof T];

interface BCXEventEmitter<T extends BCXEvent> {
	on<K extends keyof T>(s: K, listener: (v: T[K]) => void): () => void;
	onAny(listener: (value: BCXAnyEvent<T>) => void): () => void;
}
