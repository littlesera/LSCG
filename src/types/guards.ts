/**
 * Type Guards for LSCG
 * Safe type checking functions to replace 'as any' casts
 *
 * Type guards use the TypeScript 'is' keyword to narrow types at runtime,
 * providing both type safety and runtime validation.
 */

import type { SettingsModel } from "../Settings/Models/settings";
import type { MagicSettingsModel } from "../Settings/Models/magic";

/**
 * Type guard to check if a value is a valid Character
 */
export function isCharacter(value: unknown): value is Character {
	return (
		typeof value === 'object' &&
		value !== null &&
		'MemberNumber' in value &&
		'Name' in value
	);
}

/**
 * Type guard for LSCG-enabled characters
 * Checks if a character has the LSCG property
 */
export function hasLSCGData(char: unknown): char is Character & { LSCG: SettingsModel } {
	return (
		isCharacter(char) &&
		'LSCG' in char &&
		char.LSCG !== null &&
		typeof char.LSCG === 'object'
	);
}

/**
 * Type guard for characters with specific LSCG modules
 * This is a more specific check that validates both LSCG existence and the specific module
 */
export function hasLSCGModule<K extends keyof SettingsModel>(
	char: unknown,
	moduleName: K
): char is Character & { LSCG: SettingsModel & { [P in K]: NonNullable<SettingsModel[P]> } } {
	return (
		hasLSCGData(char) &&
		moduleName in char.LSCG &&
		char.LSCG[moduleName] !== null &&
		char.LSCG[moduleName] !== undefined &&
		typeof char.LSCG[moduleName] === 'object'
	);
}

/**
 * Type guard for characters with MagicModule enabled
 * Common enough to warrant its own guard
 */
export function hasMagicModule(char: unknown): char is Character & { LSCG: SettingsModel & { MagicModule: MagicSettingsModel & { enabled: true } } } {
	return (
		hasLSCGModule(char, 'MagicModule') &&
		'enabled' in char.LSCG.MagicModule &&
		char.LSCG.MagicModule.enabled === true
	);
}

/**
 * Type guard for file input events
 * Validates that an event target is an HTMLInputElement with files
 */
export function isFileInputEvent(event: Event): event is Event & { target: HTMLInputElement & { files: FileList } } {
	return (
		event.target !== null &&
		event.target instanceof HTMLInputElement &&
		'files' in event.target &&
		event.target.files instanceof FileList
	);
}

/**
 * Safe property access with type guard
 * Checks if an object has a specific property
 */
export function hasProperty<K extends string>(
	obj: unknown,
	key: K
): obj is Record<K, unknown> {
	return typeof obj === 'object' && obj !== null && key in obj;
}

/**
 * Type guard for objects with specific property types
 * Performs both property existence and type checking
 */
export function hasTypedProperty<K extends string, T>(
	obj: unknown,
	key: K,
	typeCheck: (value: unknown) => value is T
): obj is Record<K, T> {
	return hasProperty(obj, key) && typeCheck((obj as Record<K, unknown>)[key]);
}

/**
 * Type guard for checking if a value is a string
 */
export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

/**
 * Type guard for checking if a value is a number
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

/**
 * Type guard for checking if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

/**
 * Type guard for Player.OnlineSettings with extended properties
 * Used for checking legacy settings that need cleanup
 */
export interface ExtendedOnlineSettings {
	LittleSera?: unknown;
	ClubGames?: unknown;
	LSCG?: unknown;
}

export function hasExtendedOnlineSettings(player: typeof Player): player is typeof Player & { OnlineSettings: ExtendedOnlineSettings } {
	return (
		player.OnlineSettings !== null &&
		typeof player.OnlineSettings === 'object'
	);
}

/**
 * Type guard for Player with MBS Settings
 * Third-party mod integration
 */
export interface PlayerWithMBS extends PlayerCharacter {
	MBSSettings?: {
		FortuneWheelItemSets?: Array<{ itemList?: ItemBundle[] } | null>;
	};
}

export function hasMBSSettings(player: PlayerCharacter): player is PlayerWithMBS {
	return (
		'MBSSettings' in player &&
		player.MBSSettings !== null &&
		typeof player.MBSSettings === 'object'
	);
}

/**
 * Type guard for legacy LSCG module properties
 * Used during migration from old structure to new StateModule
 */
export interface LegacyHypnoModule {
	hypnotized?: boolean;
	hypnotizedBy?: number;
	activatedAt?: number;
	recoveredAt?: number;
	existingEye1Color?: string;
	existingEye1Name?: string;
	existingEye2Color?: string;
	existingEye2Name?: string;
	existingEyeExpression?: string;
	immersive?: boolean;
}

export interface LegacyInjectorModule {
	brainwashed?: boolean;
	asleep?: boolean;
	immersive?: boolean;
}

export interface LegacyMiscModule {
	immersiveChloroform?: boolean;
}

/**
 * Type guard for checking if a module has legacy properties
 * Useful for migration code
 */
export function hasLegacyHypnoProps(module: unknown): module is LegacyHypnoModule {
	return (
		typeof module === 'object' &&
		module !== null &&
		('hypnotized' in module ||
		'existingEye1Color' in module ||
		'immersive' in module)
	);
}

export function hasLegacyInjectorProps(module: unknown): module is LegacyInjectorModule {
	return (
		typeof module === 'object' &&
		module !== null &&
		('brainwashed' in module ||
		'asleep' in module ||
		'immersive' in module)
	);
}

/**
 * Type guard for Asset with dynamic modifications
 * Some assets get properties added at runtime
 * Note: This extends Asset's interface at runtime in ways that TypeScript can't fully validate
 */
export interface ModifiedAsset {
	DynamicBeforeDraw?: boolean;
	Layer?: Array<{ Alpha?: unknown[] }>;
}

export function isModifiedAsset(asset: unknown): asset is Asset & ModifiedAsset {
	return (
		typeof asset === 'object' &&
		asset !== null &&
		'Name' in asset
	);
}

/**
 * Helper function to safely access nested LSCG properties
 * Returns undefined if any part of the chain is missing
 *
 * @example
 * const blockedEffects = safeGetLSCGProp(character, 'MagicModule', 'blockedSpellEffects') ?? [];
 */
export function safeGetLSCGProp<K extends keyof SettingsModel, P extends keyof NonNullable<SettingsModel[K]>>(
	char: unknown,
	moduleName: K,
	propName: P
): NonNullable<SettingsModel[K]>[P] | undefined {
	if (!hasLSCGModule(char, moduleName)) {
		return undefined;
	}
	const module = char.LSCG[moduleName];
	if (module && typeof module === 'object' && propName in module) {
		return (module as NonNullable<SettingsModel[K]>)[propName];
	}
	return undefined;
}

/**
 * Type guard for validating return values from hook functions
 * Hook functions can return any value, but we want to validate it
 */
export function isValidHookReturn(value: unknown): value is unknown {
	// Hooks can return anything, this is more for documentation
	// In practice, you'd check for specific return types based on the hook
	return true;
}

/**
 * Type assertion helper for when we genuinely need to cast but want it documented
 * Use this sparingly and only when a proper type guard isn't feasible
 * 
 * @param value The value to cast
 * @param reason A string explaining why the cast is necessary (for code review)
 * @returns The value cast to type T
 * 
 * @example
 * const defaults = unsafeCast<SettingsModule>(defaultModule.defaultSettings, "Module defaults not typed properly");
 */
export function unsafeCast<T>(value: unknown, reason: string): T {
	// Log in development to track usage
	if (typeof console !== 'undefined' && console.debug) {
		console.debug(`LSCG: Unsafe cast used: ${reason}`);
	}
	return value as T;
}
