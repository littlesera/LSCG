/**
 * Gather all color-layers and -groups absent from their respective .csv files
 * @returns {[colorLayers: TestingStruct<string>[], colorGroups: TestingStruct<string>[]]}
 */
declare function TestingGetMissingColorLayersGroups(): [colorLayers: TestingStruct<string>[], colorGroups: TestingStruct<string>[]];
/**
 * Test whether all asset default colors are valid.
 * @returns {TestingStruct<string[]>[]}
 */
declare function TestingValidateDefaultColor(): TestingStruct<string[]>[];
/**
 * A module with helper utilities for testing.
 * Note that this file and its content therein should only be executed when running
 * the `AssetCheck` test suit, and should therefore *not* be added to `index.html`.
 *
 * NOTE: Make sure to declare module-level objects as `var` if they should appear in
 * the VM context output.
 */
/** @type {Set<string>} */
declare var TestingColorLayers: Set<string>;
/** @type {Set<string>} */
declare var TestingColorGroups: Set<string>;
declare var TestingMisingColorLayers: TestingStruct<string>[];
declare var TestingMisingColorGroups: TestingStruct<string>[];
declare var TestingInvalidDefaultColor: TestingStruct<string[]>[];
declare var TestingModularItemDataLookup: Record<string, ModularItemData>;
declare var TestingTypedItemDataLookup: Record<string, TypedItemData>;
declare var TestingVibratingItemDataLookup: Record<string, VibratingItemData>;
declare var TestingVariableHeightItemDataLookup: Record<string, VariableHeightData>;
declare var TestingTextItemDataLookup: Record<string, TextItemData>;
declare var TestingNoArchItemDataLookup: Record<string, NoArchItemData>;
/** A record mapping pose categories to pose names */
declare var TestingPoseMap: Record<keyof AssetPoseMap, Set<AssetPoseName>>;
