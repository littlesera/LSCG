declare const LSCG_VERSION: string;

interface Window {
	LSCG_Loaded?: boolean;
	LSCG_Version?: string;
}

// >= R115 stuff

interface ExpressionPair {
	Group: Exclude<ExpressionGroupName, "Eyes2">,
	Expression: null | ExpressionName,
}

interface MenuButtonValidateData {
	state: null | "hidden" | "disabled";
	status?: null | string;
}

type MenuButtonValidator = (
	button: HTMLButtonElement,
	properties: { C: PlayerCharacter },
	equippedItem?: Item | null
) => MenuButtonValidateData | null;


declare const DialogSelfMenuMapping: {
	Expression: {
		clickStatusCallbacks: Record<string, (C: Character, clickedObj: ExpressionPair, equippedItem?: null | Item) => null | string>,
		menubarEventListeners: Record<string, {
			click(button: HTMLButtonElement, ev: MouseEvent, properties: { C: PlayerCharacter }, equippedItem?: null | Item): any,
			validate?: Record<string, MenuButtonValidator>,
		}>,
		Reload(): Promise<boolean>,
		C: PlayerCharacter,
	},
};
