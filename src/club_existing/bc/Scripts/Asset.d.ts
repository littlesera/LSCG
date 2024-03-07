/**
 * Adds a new asset group to the main list
 * @param {IAssetFamily} Family
 * @param {AssetGroupDefinition} GroupDef
 * @returns {AssetGroup}
 */
declare function AssetGroupAdd(Family: IAssetFamily, GroupDef: AssetGroupDefinition): AssetGroup;
/**
 * Parse the passed {@link AssetDefinition.Top} and Left values
 * @param {undefined | TopLeft.Definition} value
 * @param {number | TopLeft.Data} fallback
 * @returns {TopLeft.Data}
 */
declare function AssetParseTopLeft(value: undefined | TopLeft.Definition, fallback: number | TopLeft.Data): TopLeft.Data;
/**
 * Collects the group equivalence classes defined by the MirrorActivitiesFrom property into a map for easy access to
 * mirror group sets (i.e. all groups that are mirror activities from, or are mirrored by, each other).
 * @param {AssetGroup} group - The group to register
 */
declare function AssetActivityMirrorGroupSet(group: AssetGroup): void;
/**
 * Adds a new asset to the main list
 * @param {AssetGroup} Group
 * @param {AssetDefinition} AssetDef
 * @param {ExtendedItemMainConfig} ExtendedConfig
 * @returns {void} - Nothing
 */
declare function AssetAdd(Group: AssetGroup, AssetDef: AssetDefinition, ExtendedConfig: ExtendedItemMainConfig): void;
/**
 * Automatically generated pose-related asset prerequisites
 * @param {Partial<Pick<Asset, "AllowActivePose" | "SetPose" | "Prerequisite" | "Effect">>} asset The asset or any other object with the expected asset interface subset
 * @returns {{ Prerequisite?: AssetPrerequisite[], AllowActivePose?: AssetPoseName[] }} The newly generated prerequisites
 */
declare function AssetParsePosePrerequisite({ SetPose, AllowActivePose, Effect, Prerequisite }: Partial<Pick<Asset, "AllowActivePose" | "SetPose" | "Prerequisite" | "Effect">>): {
    Prerequisite?: AssetPrerequisite[];
    AllowActivePose?: AssetPoseName[];
};
/**
 * Construct the items extended item config, merging via {@link AssetArchetypeConfig.CopyConfig} if required.
 * Potentially updates the passed {@link AssetArchetypeConfig} object inplace.
 * @param {Asset} A - The asset to configure
 * @param {AssetArchetypeConfig} config - The extended item configuration of the base item
 * @param {ExtendedItemMainConfig} extendedConfig - The extended item configuration object for the asset's family
 * @returns {null | AssetArchetypeConfig} - The oiginally passed base item configuration, potentially updated inplace.
 * Returns `null` insstead if an error was encountered.
 */
declare function AssetBuildConfig(A: Asset, config: AssetArchetypeConfig, extendedConfig: ExtendedItemMainConfig): null | AssetArchetypeConfig;
/**
 * Constructs extended item functions for an asset, if extended item configuration exists for the asset.
 * Updates the passed config inplace if {@link ExtendedItem.CopyConfig} is present.
 * @param {Asset} A - The asset to configure
 * @param {AssetArchetypeConfig} baseConfig - The extended item configuration of the base item
 * @param {ExtendedItemMainConfig} extendedConfig - The extended item configuration object for the asset's family
 * @param {null | ExtendedItemOption} parentOption
 * @param {boolean} createCallbacks
 * @returns {null | AssetArchetypeData} - The extended itemdata or `null` if an error was encoutered
 */
declare function AssetBuildExtended(A: Asset, baseConfig: AssetArchetypeConfig, extendedConfig: ExtendedItemMainConfig, parentOption?: null | ExtendedItemOption, createCallbacks?: boolean): null | AssetArchetypeData;
/**
 * Finds the extended item configuration for the provided group and asset name, if any exists
 * @param {ExtendedItemMainConfig} ExtendedConfig - The full extended item configuration object
 * @param {AssetGroupName} GroupName - The name of the asset group to find extended configuration for
 * @param {string} AssetName - The name of the asset to find extended configuration fo
 * @returns {AssetArchetypeConfig | undefined} - The extended asset configuration object for the specified asset, if
 * any exists, or undefined otherwise
 */
declare function AssetFindExtendedConfig(ExtendedConfig: ExtendedItemMainConfig, GroupName: AssetGroupName, AssetName: string): AssetArchetypeConfig | undefined;
/**
 * Maps a layer definition to a drawable layer object
 * @param {AssetLayerDefinition} Layer - The raw layer definition
 * @param {Asset} A - The built asset
 * @param {number} I - The index of the layer within the asset
 * @return {AssetLayer} - A Layer object representing the drawable properties of the given layer
 */
declare function AssetMapLayer(Layer: AssetLayerDefinition, A: Asset, I: number): AssetLayer;
/**
 * @param {AllowTypes.Definition} allowTypes
 * @returns {AllowTypes.Data}
 */
declare function AssetParseAllowTypes(allowTypes: AllowTypes.Definition): AllowTypes.Data;
/**
 * Parses and validates asset's opacity
 * @param {number|undefined} opacity
 * @param {number} min - The minimum opacity
 * @param {number} max - The maximum opacity
 * @returns {number}
 */
declare function AssetParseOpacity(opacity: number | undefined, min?: number, max?: number): number;
/**
 * Parse the passed alpha mask definitions.
 * @param {undefined | Alpha.Definition[]} alphaDef The unparsed alpha mask definition
 * @param {null | string} warningPrefix - A prefix to-be prepended to any warning messages
 * @returns {null | Alpha.Data[]} The parsed alpha mask data
 */
declare function AssetParseAlpha(alphaDef: undefined | Alpha.Definition[], warningPrefix?: null | string): null | Alpha.Data[];
/**
 * Parse the passed layers alpha mask definitions.
 * @param {AssetLayerDefinition} Layer - The raw layer definition
 * @param {Asset} NewAsset - The raw asset definition
 * @param {number} I - The index of the layer within its asset
 * @return {Alpha.Data[]} - a list of alpha mask data for the layer
 */
declare function AssetParseLayerAlpha(Layer: AssetLayerDefinition, NewAsset: Asset, I: number): Alpha.Data[];
/**
 * Assigns color indices to the layers of an asset. These determine which colors get applied to the layer. Also adds
 * a count of colorable layers to the asset definition.
 * @param {Mutable<Asset>} A - The built asset
 * @returns {void} - Nothing
 */
declare function AssetAssignColorIndices(A: Mutable<Asset>): void;
/**
 * Builds the asset description from the CSV file
 * @param {IAssetFamily} Family
 * @param {string[][]} CSV
 */
declare function AssetBuildDescription(Family: IAssetFamily, CSV: string[][]): void;
/**
 * Loads the description of the assets in a specific language
 * @param {IAssetFamily} Family The asset family to load the description for
 */
declare function AssetLoadDescription(Family: IAssetFamily): void;
/**
 * Loads a specific asset file
 * @param {readonly AssetGroupDefinition[]} Groups
 * @param {IAssetFamily} Family
 * @param {ExtendedItemMainConfig} ExtendedConfig
 */
declare function AssetLoad(Groups: readonly AssetGroupDefinition[], Family: IAssetFamily, ExtendedConfig: ExtendedItemMainConfig): void;
/** Reset and load all the assets */
declare function AssetLoadAll(): void;
/**
 * Gets a specific asset by family/group/name
 * @param {IAssetFamily} Family - The family to search in (Ignored until other family is added)
 * @param {AssetGroupName} Group - Name of the group of the searched asset
 * @param {string} Name - Name of the searched asset
 * @returns {Asset | null}
 */
declare function AssetGet(Family: IAssetFamily, Group: AssetGroupName, Name: string): Asset | null;
/**
 * Gets all activities on a family and name
 * @param {IAssetFamily} family - The family to search in
 * @returns {Activity[]}
 */
declare function AssetAllActivities(family: IAssetFamily): Activity[];
/**
 * Gets an activity asset by family and name
 * @param {IAssetFamily} family - The family to search in
 * @param {ActivityName} name - Name of activity to search for
 * @returns {Activity|undefined}
 */
declare function AssetGetActivity(family: IAssetFamily, name: ActivityName): Activity | undefined;
/**
 * Get the list of all activities on a group for a given family.
 *
 * @description Note that this just returns activities as defined, no checks are
 * actually done on whether the activity makes sense.
 *
 * @param {IAssetFamily} family
 * @param {AssetGroupName} groupname
 * @param {"self" | "other" | "any"} onSelf
 * @returns {Activity[]}
 */
declare function AssetActivitiesForGroup(family: IAssetFamily, groupname: AssetGroupName, onSelf?: "self" | "other" | "any"): Activity[];
/**
 * Cleans the given array of assets of any items that no longer exists
 * @param {readonly ItemPermissions[]} AssetArray - The arrays of items to clean
 * @returns {ItemPermissions[]} - The cleaned up array
 */
declare function AssetCleanArray(AssetArray: readonly ItemPermissions[]): ItemPermissions[];
/**
 * Gets an asset group by the asset family name and group name
 * @template {AssetGroupName} T
 * @param {IAssetFamily} Family - The asset family that the group belongs to (Ignored until other family is added)
 * @param {T} Group - The name of the asset group to find
 * @returns {AssetGroupMap[T] | null} - The asset group matching the provided family and group name
 */
declare function AssetGroupGet<T extends AssetGroupName>(Family: IAssetFamily, Group: T): AssetGroupMap[T];
/**
 * Utility function for retrieving the preview image directory path for an asset
 * @param {Asset} A - The asset whose preview path to retrieve
 * @returns {string} - The path to the asset's preview image directory
 */
declare function AssetGetPreviewPath(A: Asset): string;
/**
 * Utility function for retrieving the base path of an asset's inventory directory, where extended item scripts are
 * held
 * @param {Asset} A - The asset whose inventory path to retrieve
 * @returns {string} - The path to the asset's inventory directory
 */
declare function AssetGetInventoryPath(A: Asset): string;
/**
 * Sort a list of asset layers for the {@link Character.AppearanceLayers } property.
 * Performs an inplace update of the passed array and then returns it.
 * @param {AssetLayer[]} layers - The to-be sorted asset layers
 * @returns {AssetLayer[]} - The newly sorted asset layers
 */
declare function AssetLayerSort(layers: AssetLayer[]): AssetLayer[];
/**
 * Convert {@link AssetDefinition} default color into a {@link Asset} default color list
 * @param {number} colorableLayerCount The number of colorable layers
 * @param {string} fillValue The default color. Usually `"Default"` though skin colors can also be supplied on occasion.
 * @param {string | readonly string[]} [color] See {@link AssetDefinition.DefaultColor}
 * @returns {string[]} See {@link Asset.DefaultColor}
 */
declare function AssetParseDefaultColor(colorableLayerCount: number, fillValue: string, color?: string | readonly string[]): string[];
/** @type {Asset[]} */
declare var Asset: Asset[];
/** @type {AssetGroup[]} */
declare var AssetGroup: AssetGroup[];
/** @type {Map<`${AssetGroupName}/${string}`, Asset>} */
declare var AssetMap: Map<`${AssetGroupName}/${string}`, Asset>;
/** @type {Map<AssetGroupName, AssetGroup>} */
declare var AssetGroupMap: Map<AssetGroupName, AssetGroup>;
/** @type {Pose[]} */
declare var Pose: Pose[];
/** A record mapping pose names to their respective {@link Pose}. */
declare const PoseRecord: Record<AssetPoseName, Pose>;
/** @type {Map<AssetGroupName, AssetGroup[]>} */
declare var AssetActivityMirrorGroups: Map<AssetGroupName, AssetGroup[]>;
declare namespace PoseType {
    let HIDE: "Hide";
    let DEFAULT: "";
}
