/** Types for representing the left/top coordinate of a target draw rect. */
declare namespace TopLeft {
	/**
	 * The parsed top/left coordinate translation.
	 * Will include a default value under {@link PoseType.DEFAULT} and may include pose-specific values
	 * under their respective pose names.
	 */
	type Data = Readonly<Partial<Record<AssetPoseName, number>> & Record<PoseTypeDefault, number>>;
	/**
	 * The unparsed top/left coordinate translation.
	 * Can be either a number or, if one wants to specify pose-specific translations, a record mapping pose names to numbers.
	 * The {@link PoseType.DEFAULT} key can be specified in the record-notation as a default pose-agnostic value.
	 */
	type Definition = number | Partial<Record<AssetPoseName | PoseTypeDefault, number>>;
}

/** Types for objects defining a group of alpha masks to be applied when drawing an asset layer. */
declare namespace Alpha {
	/** The parsed alpha masks. */
	interface Data {
		/**
		 * A list of alpha masks.
		 * Consists of 4-tuples defining the top & left coordinate of a rectangle followed by the rectangle's width & height
		 */
		readonly Masks: readonly RectTuple[];
		/**
		 * A list of the group names that the given alpha masks should be applied to.
		 * If empty or not present, the alpha masks will be applied to every layer underneath the present one.
		 */
		readonly Group?: readonly AssetGroupName[];
		/**
		 * A list of the extended types that the given alpha masks should be applied to.
		 * If empty or not present, the alpha masks will be applied regardless of the extended type.
		 */
		readonly AllowTypes: null | AllowTypes.Data;
		/**
		 * A record mapping pose categories to a list of the poses that the given alpha masks should be applied to.
		 * If empty or not present, the alpha masks will be applied regardless of character pose.
		 */
		readonly Pose: null | Readonly<Partial<Record<AssetPoseCategory, readonly AssetPoseName[]>>>;
	}
	/** The unparsed alpha masks. */
	interface Definition extends Partial<Omit<Data, "Pose" | "AllowTypes">> {
		Masks: RectTuple[];
		Group?: AssetGroupName[];
		/**
		 * A list of the extended types that the given alpha masks should be applied to.
		 * If empty or not present, the alpha masks will be applied regardless of the extended type.
		 */
		AllowTypes?: null | AllowTypes.Definition;
		/**
		 * A list of the poses that the given alpha masks should be applied to.
		 * If empty or not present, the alpha masks will be applied regardless of character pose.
		 */
		Pose?: AssetPoseName[];
	}
}

declare namespace AllowTypes {
	/** @see {@link AllowTypes.Definition} */
	type _DefinitionRecord = Record<string, number | readonly number[]>;
	/**
	 * A record (or list thereof) with required screen names + option indices.
	 * If a list of indices is provided all combinations involving one of its indices is considered valid.
	 *
	 * For example `{"a": [0, 1], "b": [0, 1], "c": [0, 1]}`, with its 3 lists of length 2, will produce a total of 3*2 combinations.
	 * @see {@link TypeRecord}
	 */
	type Definition = _DefinitionRecord | _DefinitionRecord[];
	interface Data {
		/**
		 * A record mapping partial {@link TypeRecord} types to a set of IDs.
		 * Each ID represents one or more unique type records for which a layer must be drawn.
		 * It is possible that multiple partial types are required for a single ID (see {@link IDToTypeKey}).
		 */
		readonly TypeToID: Readonly<Record<PartialType, Readonly<Set<number>>>>;
		/**
		 * A record mapping IDs to a set of {@link TypeRecord} keys.
		 * The key set represents *all* keys for a given ID that must be present for a layer to be drawn (an AND condition).
		 */
		readonly IDToTypeKey: Readonly<Record<number, readonly string[]>>;
		/**
		 * A record mapping type record key to a set of all values referenced in this `AllowTypes` instance.
		 * Equivalent to all the (un-stringified) keys of {@link TypeToID}.
		 */
		readonly AllTypes: Readonly<Record<string, Readonly<Set<number>>>>;
	}
}

/**
 * Properties common to groups, assets and layers
 *
 * Those properties will be inherited by default from layer, to asset, to group.
 * Defining it will override the parent's value altogether.
 */
interface AssetCommonPropertiesGroupAssetLayer {

	/** The drawing priority of the target */
	Priority?: number;

	/**
	 * The left coordinate of the target draw rect or a record with pose-specific left coordinates.
	 *
	 * @example
	 * Left: {
	 *     [PoseType.Default]: 100,
	 *     Kneeling: 150,
	 * },
	 */
	Left?: TopLeft.Definition;
	/**
	 * The top coordinate of the target draw rect or a record with pose-specific top coordinates.
	 *
	 * @example
	 * Top: {
	 *     [PoseType.Default]: 100,
	 *     Kneeling: 150,
	 * },
	 */
	Top?: TopLeft.Definition;

	/** The group the target should inherit its color from. */
	InheritColor?: AssetGroupName;

	/** A group identifier that will be used to inherit the body size */
	ParentGroup?: AssetGroupName | null;

	/**
	 * The poses that have pose-specific assets.
	 *
	 * Used when building the file paths for the asset's layers.
	 *
	 * If a pose is absent then the asset corresponding to the default pose will be used in its place.
	 * Note that a pose's absence from this list does *not* prevent its usage.
	 *
	 * @deprecated - Superceded by {@link PoseMapping}
	 */
	AllowPose?: never;

	/**
     * A record mapping pose names to the actually to-be drawn poses.
     * Special values can be specified, via use of {@link PoseType}, for either hiding the asset or using pose-agnostic assets.
	 *
	 * Poses that are absent from the mapping (or whose value is set to {@link PoseType.DEFAULT}) will use the default pose-agnostic path.
	 */
	PoseMapping?: AssetPoseMapping;

	/**
	 * Whether that layer is colorized
	 *
	 * @default true
	 *
	 * Set to `true`, the target will be colorized when drawing.
	 * Set to `false`, the color will be used as part of the image file name.
	 *
	 * Mainly useful for inheriting the body color around.
	 */
	AllowColorize?: boolean;
}

/**
 * Properties common to groups and assets
 *
 * Those properties will be inherited by default from the group.
 * Defining it will override the parent's value altogether.
 */
interface AssetCommonPropertiesGroupAsset {

	/** A list of group names the asset blocks access to */
	Block?: AssetGroupItemName[];

	/** A list of group names that get hidden when the asset is worn */
	Hide?: AssetGroupName[];

	/** A list of effects wearing the asset causes on the character */
	Effect?: EffectName[];

	/** A pose that the character will change to when wearing the asset */
	SetPose?: AssetPoseName[];

	/**
	 * A list of pose categories that the character will be prevented to change
	 * @deprecated Use {@link AssetDefinition.AllowActivePose} instead
	 */
	FreezeActivePose?: never;

	/** Which expression the group allows to be set on it */
	AllowExpression?: ExpressionName[];

	/**
	 * Whether the asset can be selected for a random appearance.
	 *
	 * @default true
	 */
	Random?: boolean;

	/**
	 * Is the asset considered a restraint?
	 *
	 * Any asset with that property set will be removed when the character is released,
	 * and the safeword system will consider them as freeable.
	 *
	 * @default false
	 */
	IsRestraint?: boolean;

	/**
	 * Is the asset considered body cosplay?
	 *
	 * Any asset with that property set will be blocked from being removed if the
	 * character has {@link Character.OnlineSharedSettings.BlockBodyCosplay} set to true.
	 *
	 * They will also be considered their own strip layer when making a character naked in
	 * the wardrobe.
	 *
	 * @default false
	 */
	BodyCosplay?: boolean;
}

/** Input interface for constructing {@link AssetGroup} objects. */
interface AssetGroupDefinitionBase extends AssetCommonPropertiesGroupAsset, AssetCommonPropertiesGroupAssetLayer {
	/** The internal identifier for the group */
	Group: AssetGroupName;
	/** The list of assets defined by the group */
	Asset: (AssetDefinition | string)[];

	/**
	 * The type of the group
	 *
	 * `Item` groups are the normal groups, and `Appearance` groups are only
	 * accessible in the wardrobe.
	 *
	 * @default "Appearance"
	 */
	Category?: 'Appearance' | 'Item' | 'Script';

	/**
	 * Whether the group is considered clothing
	 *
	 * This is used when stripping a character, as well as automatically blocking
	 * some groups if an asset is worn in those (like wearing a bra blocking nipples).
	 *
	 * @default false
	 */
	Clothing?: boolean;

	/** Whether the group is considered underwear
	 *
	 * This is used when stripping a character.
	 *
	 * @default false
	 */
	Underwear?: boolean;

	/**
	 * Whether the group should have an asset selected at random at character creation
	 *
	 * @default true
	 */
	Default?: boolean;

	/**
	 * Whether the group is allowed to have no asset
	 *
	 * Used for body-related characteristics
	 *
	 * @default true
	 */
	AllowNone?: boolean;

	/**
	 * Whether the group can be customized
	 *
	 * Only applicable to Appearance groups.
	 *
	 * This is how groups like the expression groups are hidden from it.
	 *
	 * @default true
	 */
	AllowCustomize?: boolean;

	/**
	 * A list of color codes
	 *
	 * Those are used when generating random appearances or cycling colors in the wardrobe
	 */
	Color?: HexColor[];

	/**
	 * A group that will be used to copy the size info from
	 *
	 */
	ParentSize?: AssetGroupName;

	/**
	 * A group that will be used to copy the color data from
	 */
	ParentColor?: AssetGroupName;

	/**
	 * The clickable area(s) of the group
	 *
	 * Only applicable for "Item" groups
	 */
	Zone?: RectTuple[];

	/**
	 * If the group is empty, it'll automatically mirror an asset from the group specified
	 */
	MirrorGroup?: AssetGroupName;

	/**
	 * A list of assets that should also be removed if an asset in this group is removed
	 *
	 * Used for things like auto-removing collar accessories if the collar is removed.
	 */
	RemoveItemOnRemove?: { Group: AssetGroupItemName, Name: string, TypeRecord?: TypeRecord }[];

	/**
	 * Whether the group has a blinking variant
	 *
	 * Only used by eyes
	 */
	Blink?: boolean;

	/** A rect used when generating dynamic previews of the group */
	PreviewZone?: RectTuple;

	/**
	 * An alternate name for the group
	 *
	 * If this is set, this will be used as the base group when generating layer file URLs.
	 * Useful if you have a case like `ItemTorso`/`ItemTorso2` which shares all their layers.
	 */
	DynamicGroupName?: AssetGroupName;

	/**
	 * A group activities will be mirrored from
	 *
	 * If set, activities from the given group will be shown as if they applied to the
	 * selected group.
	 */
	MirrorActivitiesFrom?: AssetGroupItemName;

	/**
	 * The group actually recieving arousal events
	 *
	 * Used to proxy around a group that does not have activities
	 * enabled (and thus arousal settings.
	 */
	ArousalZone?: AssetGroupItemName;

	ColorSuffix?: Record<string, string>;
	ExpressionPrerequisite?: AssetPrerequisite[];
	HasPreviewImages?: boolean;
}

/** Input interface for constructing {@link AssetGroup} objects. */
declare namespace AssetGroupDefinition {
	/** An {@link AssetGroupDefinition} subtype for groups of the `Item` category. */
	interface Item extends AssetGroupDefinitionBase {
		Group: AssetGroupItemName;
		Asset: (AssetDefinition.Item | string)[];
		Category: "Item";
		Clothing?: false;
		Underwear?: false;
		Default?: false;
		AllowCustomize?: true;
		ExpressionPrerequisite?: never;
		Blink?: false;
		BodyCosplay?: false;
		AllowNone?: true;
		Zone?: RectTuple[];
	}
	/** An {@link AssetGroupDefinition} subtype for groups of the `Appearance` category. */
	interface Appearance extends AssetGroupDefinitionBase {
		Group: AssetGroupBodyName;
		Asset: (AssetDefinition.Appearance | string)[];
		Category?: "Appearance";
		IsRestraint?: false;
		Zone?: never;
		Time?: never;
	}
	/** An {@link AssetGroupDefinition} subtype for groups of the `Script` category. */
	interface Script extends AssetGroupDefinitionBase {
		Group: AssetGroupScriptName;
		Asset: (AssetDefinition.Script | string)[];
		Category: "Script";
	}
}

type AssetGroupDefinition = (
	AssetGroupDefinition.Item
	| AssetGroupDefinition.Appearance
	| AssetGroupDefinition.Script
);

type AssetBonusName = "KidnapDomination" | "KidnapSneakiness" | "KidnapBruteForce";
type AssetGender = 'F' | 'M';

interface AssetCommonPropertiesAssetLayer {
	/**
	 * A list of poses that hide the asset when they get set.
	 *
	 * Note that this does not prevent usage of the pose (see {@link AssetDefinition.AllowActivePose}).
	 * Values are automatically added to {@link Asset.AllowPose}.
	 *
	 * @deprecated - Superceded by {@link AssetCommonPropertiesGroupAssetLayer.PoseMapping}
	 */
	HideForPose?: never;

	/** A list of alpha mask definitions. */
	Alpha?: Alpha.Definition[];

	ColorSuffix?: Record<string, string>;

	/** Whether the asset is drawn at an absolute position. */
	FixedPosition?: boolean;

	Opacity?: number;
	MinOpacity?: number;
	MaxOpacity?: number;
}

/** Input interface for constructing {@link Asset} objects. */
interface AssetDefinitionBase extends AssetCommonPropertiesGroupAsset, AssetCommonPropertiesAssetLayer, AssetCommonPropertiesGroupAssetLayer {
	/** The asset's internal name. */
	Name: string,

	/**
	 * Link an asset to another.
	 *
	 * Used for the random appearance generator, to ensure combined assets match.
	 * Eyes, as well as the student tops and bottoms make use of it.
	 */
	ParentItem?: string;

	/**
	 * Whether the asset is enabled or not.
	 *
	 * @default true
	 *
	 * A disabled asset cannot be used on a character.
	 * They will also never be used as part of a random appearance.
	 */
	Enable?: boolean;

	/** Whether the asset appears visually. Defaults to true. */
	Visible?: boolean;

	/** A list of screens where current asset won't be shown. */
	NotVisibleOnScreen?: string[];

	/**
	 * Whether the asset can be worn.
	 *
	 * @default true
	 * An unwearable asset will not actually end up in the group it's used on.
	 */
	Wear?: boolean;

	/** Applying that asset triggers the following activity */
	Activity?: ActivityName;

	/** Activities that wearing this asset enables. */
	AllowActivity?: ActivityName[];

	/** Array of sound effects for each one of the item's allowed activities */
	ActivityAudio?: string[];

	/** The expression on the targeted character */
	ActivityExpression?: Partial<Record<ActivityName, ExpressionTrigger[]>>;

	/** A list of groups that should still be allowed to be acted on even though they should be blocked by the asset. */
	AllowActivityOn?: AssetGroupItemName[];

	/** Identifies a set of assets that's part of the same group for shopping purposes. Buying one will give access to all of them. */
	BuyGroup?: string;

	/** Identifies a BuyGroup that, we bought one item of, will cause that asset to also be owned, without showing it in the shopping list. Only used by the SpankingToys */
	PrerequisiteBuyGroups?: string[];

	/** Whether wearing the asset gives a bonus in the Kidnap minigame. */
	Bonus?: AssetBonusName;

	/**
	 * A list of group names the asset restores access to.
	 *
	 * Mostly used for clothes, and might be considered a duplicate of AllowActivityOn.
	 */
	Expose?: AssetGroupItemName[];

	/** A list of asset names that get hidden when the asset is worn. */
	HideItem?: string[];

	/** A list of asset names that get shown when the asset is worn. Only useful when combined with Hide */
	HideItemExclude?: string[];

	/**
	 * A list of body group that becomes required when this asset is worn.
	 *
	 * Used by the random appearance generator to know that it should also pick a random asset
	 * from the required group when that asset is used.
	 */
	Require?: AssetGroupBodyName[];

	/**
	 * A list of poses that represents all poses that wearing the asset enables.
	 *
	 * Automatically concatenated with {@link AssetDefinition.SetPose} members.
	 *
	 * Contrary to {@link AssetDefinition.AllowPose} poses that are absent from this list can *not* be used.
	 */
	AllowActivePose?: AssetPoseName[];

	/** @deprecated - Use {@link AssetDefinition.AllowActivePose} instead */
	WhitelistActivePose?: never;

	/**
	 * The cost of the asset in the shop. Defaults to 0.
	 *
	 * A value of -1 makes the asset unavailable, a value of 0 makes it always available.
	 */
	Value?: number;

	/** A measure of how hard it is to remove the asset. Defaults to 0. */
	Difficulty?: number;

	SelfBondage?: number;
	SelfUnlock?: boolean;
	ExclusiveUnlock?: boolean;

	/** Whether the asset gets removed automatically when the character log in. Defaults to false. */
	RemoveAtLogin?: boolean;

	Time?: number;
	/** Enables advanced layer visibility on the asset. See {@link AssetLayerDefinition.Visibility} for more information. */
	LayerVisibility?: boolean;
	RemoveTime?: number;
	RemoveTimer?: number;
	MaxTimer?: number;

	Height?: number;
	Zoom?: number;
	Prerequisite?: AssetPrerequisite | AssetPrerequisite[];
	Extended?: boolean;
	AlwaysExtend?: boolean;
	AlwaysInteract?: boolean;
	AllowLock?: boolean;
	IsLock?: boolean;
	PickDifficulty?: number | null;

	/** Whether the asset is only available to owners. */
	OwnerOnly?: boolean;

	/** Whether the asset is only available to lovers. */
	LoverOnly?: boolean;

	/** Whether the asset is only available to the family. */
	FamilyOnly?: boolean;

	/** A list of facial expression using the asset causes to the character */
	ExpressionTrigger?: ExpressionTrigger[];

	/** A list of assets to also remove when the asset is taken off. */
	RemoveItemOnRemove?: { Name: string, Group: AssetGroupItemName, TypeRecord?: TypeRecord }[];

	AllowEffect?: EffectName[];
	AllowBlock?: AssetGroupItemName[];
	AllowHide?: AssetGroupItemName[];
	AllowHideItem?: string[];
	/** @deprecated */
	AllowTypes?: never;
	CreateLayerTypes?: string[];
	AllowTighten?: boolean;
	DefaultColor?: ItemColor;
	Audio?: string;

	/** A list of categories. Used to prevent the asset to be used, per chatroom settings */
	Category?: AssetCategory[];

	Fetish?: FetishName[];
	ArousalZone?: AssetGroupItemName;

	OverrideBlinking?: boolean;
	DialogSortOverride?: DialogSortOrder;
	DynamicDescription?: (C: Character) => string;
	DynamicPreviewImage?: (C: Character) => string;
	DynamicAllowInventoryAdd?: (C: Character) => boolean;
	DynamicName?: (C: Character) => string;

	/** The real group name used when building the file paths for the asset's layers */
	DynamicGroupName?: AssetGroupName;

	DynamicActivity?: (C: Character) => ActivityName | null | undefined;
	DynamicAudio?: (C: Character) => string;

	/**
	 * Whether the asset is restricted to a given character.
	 *
	 * When the asset is added to a character, the member number of the character using the
	 * asset will be stored along in its properties, and all subsequent modifications will
	 * only be possible for that character.
	 */
	CharacterRestricted?: boolean;
	AllowRemoveExclusive?: boolean;

	DynamicBeforeDraw?: boolean;
	DynamicAfterDraw?: boolean;
	DynamicScriptDraw?: boolean;
	AllowLockType?: AssetLockType[];

	/** Whether the color picker shows a "Whole Item" layer. Defaults to true. */
	AllowColorizeAll?: boolean;

	/** A list of online spaces (eg. Asylum) where the asset is automatically available */
	AvailableLocations?: string[];

	OverrideHeight?: AssetOverrideHeight;

	/**
	 * Whether a {@link AssetLayerDefinition.LockLayer}-supporting layer should automatically be generated.
	 *
	 * Will always be set to `false` if {@link AssetDefinition.AllowLock} is `false`.
	 *
	 * @default true
	 */
	DrawLocks?: boolean;

	/** Enable the special color drawing mode used for eyes */
	FullAlpha?: boolean;

	MirrorExpression?: AssetGroupBodyName;

	CustomBlindBackground?: string;

	/** The list of layers for the asset. */
	Layer?: AssetLayerDefinition[];

	/** A list of attributes the asset has */
	Attribute?: AssetAttribute[];

	/** A list of attributes that causes this one to become hidden. */
	HideItemAttribute?: AssetAttribute[];

	/**
	 * A list of icons the asset preview should show.
	 * Only used by the handheld items, as the game handles the other icons automatically.
	 */
	PreviewIcons?: InventoryIcon[];

	/** Applies screen tints when the asset is worn */
	Tint?: TintDefinition[];
	/** The default tint color (unless overriden by {@link TintDefinition.DefaultColor} */
	DefaultTint?: string;
	Gender?: AssetGender;

	/**
	 * An identifier that marks the asset as being the same for the purpose of crafting.
	 *
	 * Do note that this expects all the assets in the craft group to have compatible layers, color-wise and type-wise.
	 */
	CraftGroup?: string;

	/** A list of prerequisite checks that must pass for the group's expressions to be selectable */
	ExpressionPrerequisite?: AssetPrerequisite[];
}

/** Input interface for constructing {@link Asset} objects. */
declare namespace AssetDefinition {
	/** An {@link AssetDefinition} subtype for assets whose group is of the `Item` category. */
	interface Item extends AssetDefinitionBase {
		BodyCosplay?: false;
	}
	/** An {@link AssetDefinition} subtype for assets whose group is of the `Appearance` category. */
	interface Appearance extends AssetDefinitionBase {
		AllowLock?: false;
		IsLock?: false;
		PickDifficulty?: never;
		OwnerOnly?: false;
		LoverOnly?: false;
		FamilyOnly?: false;
		AllowTighten?: false;
		DrawLocks?: false;
		CustomBlindBackground?: never;
		CraftGroup?: never;
		AllowLockType?: never;
		CharacterRestricted?: false;
		AllowRemoveExclusive?: false;
		ArousalZone?: never;
		Difficulty?: never;
		SelfBondage?: never;
		SelfUnlock?: false;
		RemoveTime?: never;
		AlwaysInteract?: false;
		IsRestraint?: false;
	}
	/** An {@link AssetDefinition} subtype for assets whose group is of the `Script` category. */
	interface Script extends AssetDefinitionBase {
	}
}

type AssetDefinition = (
	AssetDefinition.Item
	| AssetDefinition.Appearance
	| AssetDefinition.Script
);


interface AssetLayerDefinition extends AssetCommonPropertiesGroupAssetLayer, AssetCommonPropertiesAssetLayer {
	/** The layer's name */
	Name?: string;

	/** Uses the color of the named layer. */
	CopyLayerColor?: string;

	/** The color group that layer is part of. Layers part of the same color group get a selector in the Color Picker UI */
	ColorGroup?: string;

	/** Whether the layer is hidden in the Color Picker UI. Defaults to false. */
	HideColoring?: boolean;

	/** A record (or a list thereof) with all screen names + option indices that should make the layer visible */
	AllowTypes?: AllowTypes.Definition;

	/**
	 * This can be used to make a layer invisible depending on certain conditions, provided the {@link AssetDefinition.LayerVisibility} is set correctly.
	 *
	 * Here's what each option means:
	 * - Player: Invisible to the player.
	 * - AllExceptPlayerDialog: Invisible to the player when in a dialog.
	 * - Others: Invisible to others.
	 * - OthersExceptDialog: Invisible to others in a dialog.
	 * - Owner: Invisible to your owner.
	 * - Lovers: Invisible to your lovers.
	 * - Mistresses: Invisible to club mistresses.
	 */
	Visibility?: "Player" | "AllExceptPlayerDialog" | "Others" | "OthersExceptDialog" | "Owner" | "Lovers" | "Mistresses";

	HideAs?: { Group: AssetGroupName, Asset?: string };

	/** Whether the layer uses an image. Defaults to true. */
	HasImage?: boolean;

	/** Set canvas globalCompositeOperation for current layer.
	 *  Use "destination-in" if you want to use layer as an alpha mask.
	 *  Note that game uses WebGL when available, so you might need to implement
	 *  similar blending mode if it's not done already (currently in GLDrawImage() in GLDraw.js).
	 */
	BlendingMode?: GlobalCompositeOperation;

	/**
	 * Specify that this is (one of) the asset's lock layer.
	 *
	 * Allows for the manual specification lock layers as opposed to {@link AssetDefinition.AllowLock}'s automatic assignment.
	 */
	LockLayer?: boolean;

	MirrorExpression?: AssetGroupName;
	PoseMapping?: AssetPoseMapping;
	CreateLayerTypes?: string[];
	/* Specifies that this layer should not be drawn if the character is wearing any item with the given attributes */
	HideForAttribute?: AssetAttribute[];
	/* Specifies that this layer should not be drawn unless the character is wearing an item with one of the given attributes */
	ShowForAttribute?: AssetAttribute[];
}

type ExtendedArchetype = "modular" | "typed" | "vibrating" | "variableheight" | "text" | "noarch";

/**
 * An object containing extended item configurations keyed by group name.
 */
type ExtendedItemMainConfig = Partial<Record<AssetGroupName, ExtendedItemGroupConfig>>;

/**
 * An object containing extended item definitions for a group.
 * Maps asset names within the group to their extended item configuration
 */
type ExtendedItemGroupConfig = Record<string, AssetArchetypeConfig>;

/** A union of all (non-abstract) extended item configs */
type AssetArchetypeConfig = TypedItemConfig | ModularItemConfig | VibratingItemConfig | VariableHeightConfig | TextItemConfig | NoArchItemConfig;

/** A union of all (non-abstract) extended item datas */
type AssetArchetypeData = TypedItemData | ModularItemData | VibratingItemData | VariableHeightData | TextItemData | NoArchItemData;

interface ExtendedItemConfig<OptionType extends ExtendedItemOption> {
	/** The archetype of the extended item config */
	Archetype: ExtendedArchetype;
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item.
	 */
	ChatSetting?: ExtendedItemChatSetting;
	/** A record containing various dialog keys used by the extended item screen */
	DialogPrefix?: ExtendedItemCapsDialog<any, OptionType>;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<any, OptionType>;
	/** An array of the chat message tags that should be included in the item's chatroom messages. */
	ChatTags?: CommonChatTags[];
	/** Contains custom dictionary entries in the event that the base ones do not suffice. */
	Dictionary?: ExtendedItemDictionaryCallback<OptionType>[];
	/**
	 * To-be initialized properties independent of the selected item module(s).
	 * Relevant if there are properties that are (near) exclusively managed by {@link ExtendedItemConfig.ScriptHooks} functions.
	 */
	BaselineProperty?: PropertiesNoArray.Item;
	/** A boolean indicating whether or not images should be drawn for the option and/or module selection screen. */
	DrawImages?: boolean;
	/** The group name and asset name of a configuration to copy - useful if multiple items share the same config */
	CopyConfig?: { GroupName?: AssetGroupName, AssetName: string };
	/** An interface with element-specific drawing data for a given screen. */
	DrawData?: ExtendedItemConfigDrawData<{}>;
	/**
	 * A list with extra to-be allowed effect names.
	 * Should only defined when there are effects that are exclusively managed by script hooks and thus cannot be extracted from the normal extended item options.
	 */
	AllowEffect?: EffectName[];
	/**
	 * The unique name for this (sub)-screen used for the automatic construction of {@link ItemProperties.TypeRecord} keys.
	 * Names *should* be short.
	 *
	 * If not explicitly specified defaults to the name of {@link ExtendedItemData.parentOption}
	 * for sub screens and the name of the archetype in case of the (outer-most) super screen.
	 */
	Name?: string;
}

/** Defines a single (partially parsed) extended item option */
interface ExtendedItemOptionConfig {
	/** The name of the type - used for the preview icon and the translation key in the CSV */
	Name: string;
	/** The required bondage skill level for this option */
	BondageLevel?: number;
	/** The required self-bondage skill level for this option when using it on oneself */
	SelfBondageLevel?: number;
	/** The required prerequisites that must be met before this option can be selected */
	Prerequisite?: AssetPrerequisite | AssetPrerequisite[];
	/** A custom background for this option that overrides the default */
	CustomBlindBackground?: string;
	/** Whether the option permits locking - if not set, defaults to the AllowLock property of the parent asset */
	AllowLock?: boolean;
	/**
	 * Whether or not it should be possible to change from this option to another
	 * option while the item is locked (if set to `false`, the player must be able to unlock the item to change its type) -
	 * defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/** The Property object to be applied when this option is used */
	Property?: ItemProperties;
	/**
	 * Trigger this expression when changing to this option
	 *
	 * FIXME: **Currently broken!**
	 */
	Expression?: ExpressionTrigger[];
	/** Whether or not the option should open a subscreen in the extended item menu */
	HasSubscreen?: boolean;
	/** Whether or not this option can be selected by the wearer */
	AllowSelfSelect?: boolean;
	/** A buy group to check for that option to be available */
	PrerequisiteBuyGroup?: string;
	/** If the option has an archetype, sets the config to use */
	ArchetypeConfig?: null | AssetArchetypeConfig;
}

/** Defines a single (fully parsed) extended item option */
interface ExtendedItemOption extends Omit<ExtendedItemOptionConfig, "ArchetypeConfig"> {
	/**
	 * A unique identifier of the struct type.
	 * Its value must be automatically assigned if it's an archetypical extended item option.
	 * If it's not, *e.g.* for a custom script hook button that does not alter the item's state,
	 * then its value must be set `"ExtendedItemOption"`.
	 */
	OptionType: (
		"ExtendedItemOption"
		| "TypedItemOption"
		| "VariableHeightOption"
		| "ModularItemOption"
		| "VibratingItemOption"
		| "TextItemOption"
		| "NoArchItemOption"
	);
	/** The extended item data associated with this option */
	ParentData: ExtendedItemData<any>;
	/** The extended item data of the subscreen associated with this option (if any) */
	ArchetypeData?: null | AssetArchetypeData;
}

type ExtendedItemOptionUnion = (
	TypedItemOption
	| ModularItemOption
	| VibratingItemOption
	| TextItemOption
	| VariableHeightOption
	| NoArchItemOption
);

/**
 * An object containing data about the type change that triggered the chat message
 * @param {Character} C - A reference to the character wearing the item
 * @param {OptionType} previousOption - The previously selected type option
 * @param {OptionType} newOption - The newly selected type option
 * @param {number} previousIndex - The index of the previously selected type option in the item's options
 * config or, depending on the archetype, -1 no such item option config exists.
 * @param {number} newIndex - The index of the newly selected type option in the item's options config or,
 * depending on the archetype, -1 no such item option config exists.
 * @template OptionType
 */
interface ExtendedItemChatData<OptionType extends ExtendedItemOption> {
	C: Character;
	previousOption: OptionType;
	newOption: OptionType;
	previousIndex: number;
	newIndex: number;
}

/**
 * @param {OptionType} chatData - An object containing data about the type change that triggered the chat message
 * @returns {string} - The chat prefix that should be used for this type change
 * @template OptionType
 */
type ExtendedItemChatCallback<OptionType extends ExtendedItemOption> = (
	chatData: ExtendedItemChatData<OptionType>,
) => string;

/**
 * @param {Character} C - The selected NPC
 * @param {OptionType} Option - The currently selected extended item option
 * @param {OptionType} PreviousOption - The previously selected extended item option
 * @returns {string} - The chat prefix that should be used for this type change
 * @template OptionType
 */
type ExtendedItemNPCCallback<OptionType extends ExtendedItemOption> = (
	C: Character,
	Option: OptionType,
	PreviousOption: OptionType,
) => string;

//#endregion

//#region Typed items


/** Partially parsed extended item option subtype for typed items */
interface TypedItemOptionConfig extends ExtendedItemOptionConfig {
	Property?: Omit<ItemProperties, "TypeRecord">;
	/** Whether or not this option can be selected randomly */
	Random?: boolean;
	/** Whether this option should be picked as default for NPC's (rather than just going for the first option) */
	NPCDefault?: boolean;
}

/** Extended item option subtype for typed items */
interface TypedItemOption extends Omit<TypedItemOptionConfig, "ArchetypeConfig">, ExtendedItemOption {
	OptionType: "TypedItemOption";
	Property: ItemProperties & Pick<Required<ItemProperties>, "TypeRecord">;
	ParentData: TypedItemData;
}

type TypedItemChatSetting = "default" | "fromTo" | "silent";

/** An object defining all of the required configuration for registering a typed item */
interface TypedItemConfig extends ExtendedItemConfig<TypedItemOption> {
	Archetype: "typed";
	/** The list of extended item options available for the item */
	Options?: TypedItemOptionConfig[];
	/** The optional text configuration for the item. Custom text keys can be configured within this object */
	DialogPrefix?: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		Header?: string | ExtendedItemHeaderCallback<TypedItemData>;
		/** The dialogue prefix for the name of each option */
		Option?: string;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		Chat?: string | ExtendedItemChatCallback<TypedItemOption>;
		/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
		Npc?: string | ExtendedItemNPCCallback<TypedItemOption>;
	};
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item. Defaults to {@link TypedItemChatSetting.TO_ONLY}
	 */
	ChatSetting?: TypedItemChatSetting;
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to `false`, the player must be able to unlock the item to change its type). Defaults to `true`
	 */
	ChangeWhenLocked?: boolean;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, validate and publishaction,
	 * with the original archetype function and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<TypedItemData, TypedItemOption>;
	DrawData?: ExtendedItemConfigDrawData<Partial<ElementMetaData.Typed>>;
}

/**
 * @param {object} chatData - An object containing data about the type change that triggered the chat message
 * @param {Character} chatData.C - A reference to the character wearing the item
 * @param {ExtendedItemOption} chatData.previousOption - The previously selected type option
 * @param {ExtendedItemOption} chatData.newOption - The newly selected type option
 * @param {number} chatData.previousIndex - The index of the previously selected type option in the item's options
 * config
 * @param {number} chatData.newIndex - The index of the newly selected type option in the item's options config
 * @returns {[{ Tag: string, Text: string }]} - The dictionary entry to append to the dictionary.
 */
type ExtendedItemDictionaryCallback<OptionType extends ExtendedItemOption> = (
	dictionary: DictionaryBuilder,
	chatData: ExtendedItemChatData<OptionType>
) => void;

//#endregion

//#region Modular items

/** An object defining all of the required configuration for registering a modular item */
interface ModularItemConfig extends ExtendedItemConfig<ModularItemOption> {
	Archetype: "modular";
	/** The module definitions for the item */
	Modules?: ModularItemModuleConfig[];
	/**
	 * The item's chatroom message setting. Determines the level of
	 * granularity for chatroom messages when the item's module values change.
	 */
	ChatSetting?: ModularItemChatSetting;
	/**
	 * A boolean indicating whether or not the item's type can be changed while the
	 * item is locked (if set to false, the player must be able to unlock the item to change its type). Defaults to `true`.
	 * Note that {@link ModularItemOption.ChangeWhenLocked} takes priority over this value if specified.
	 */
	ChangeWhenLocked?: boolean;
	/** The optional text configuration for the item. Custom text keys can be configured within this object */
	DialogPrefix?: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		Header?: string | ExtendedItemHeaderCallback<ModularItemData>;
		/** The dialogue prefix for the name of each module */
		Module?: string;
		/** The dialogue prefix for the name of each option */
		Option?: string;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		Chat?: string | ExtendedItemChatCallback<ModularItemOption>;
	};
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<ModularItemData, ModularItemOption>;
	DrawData?: ExtendedItemConfigDrawData<Partial<ElementMetaData.Modular>>;
}

type ModularItemChatSetting = "default" | "perModule";

/** A (partially parsed) object describing a single module for a modular item. */
interface ModularItemModuleConfig {
	/** The name of this module - this is usually a human-readable string describing what the
	 * module represents (e.g. Straps). It is used for display text keys, and should be unique across all of the modules
	 * for the item.
	 */
	Name: string;
	/** The unique key for this module - this is used as a prefix to designate option names. Each
	 * options in the module will be named with the module's key, followed by the index of the option within the module's
	 * Options array. Keys should be alphabetical only (a-z, A-Z)
	 */
	Key: string;
	/** The list of option definitions that can be chosen within this module. */
	Options: ModularItemOptionConfig[];
	/** Whether or not this module can be selected by the wearer */
	AllowSelfSelect?: boolean;
	/** A unique (automatically assigned) identifier of the struct type */
	OptionType?: "ModularItemModule";
	/** A boolean indicating whether or not images should be drawn within this particular module. */
	DrawImages?: boolean;
	DrawData?: ExtendedItemConfigDrawData<Partial<ElementMetaData.Modular>>;
}

/** An object describing a single module for a modular item. */
interface ModularItemModule extends Omit<ModularItemModuleConfig, "DrawData"> {
	/** A unique (automatically assigned) identifier of the struct type */
	OptionType: "ModularItemModule";
	/** The list of option definitions that can be chosen within this module. */
	Options: ModularItemOption[];
	/** A boolean indicating whether or not images should be drawn within this particular module. */
	DrawImages: boolean;
	drawData: ExtendedItemDrawData<ElementMetaData.Typed>;
}

/** Partially parsed extended item option subtype for modular items */
interface ModularItemOptionConfig extends Omit<ExtendedItemOptionConfig, "Name"> {
	/** The additional difficulty associated with this option - defaults to 0 */
	Difficulty?: number;
	/** A list of groups that this option blocks - defaults to [] */
	Block?: AssetGroupItemName[];
	/** A list of groups that this option hides - defaults to [] */
	Hide?: AssetGroupName[];
	/** A list of items that this option hides */
	HideItem?: string[];
	/** Override height, uses the highest priority of all modules*/
	OverrideHeight?: AssetOverrideHeight;
	/** Whether that option moves the character up */
	HeightModifier?: number;
	/** Whether that option applies effects */
	Effect?: EffectName[];
	/** Whether the option forces a given pose */
	SetPose?: AssetPoseName;
	/** A list of activities enabled by that module */
	AllowActivity?: ActivityName[];
	Property?: Omit<ItemProperties, "TypeRecord">;
}

/** Extended item option subtype for modular items */
interface ModularItemOption extends Omit<ModularItemOptionConfig, "ArchetypeConfig">, Omit<ExtendedItemOption, "Property"> {
	/** The name of the option; automatically set to {@link ModularItemModule.Key} + the option's index */
	Name: PartialType;
	/** A unique (automatically assigned) identifier of the struct type */
	OptionType: "ModularItemOption";
	/** The option's (automatically assigned) parent module name */
	ModuleName: string;
	/** The option's (automatically assigned) index within the parent module */
	Index: number;
	ParentData: ModularItemData;
	Property: ItemProperties & Pick<Required<ItemProperties>, "TypeRecord">;
}

//#endregion

//#region Vibrating Items

/** Partially parsed extended item option subtype for vibrating items */
interface VibratingItemOptionConfig extends ExtendedItemOptionConfig {
	Name: VibratorMode;
	Property: ItemProperties & Pick<Required<ItemProperties>, "Intensity" | "Effect"> & Omit<ItemProperties, "TypeRecord">;
	ArchetypeConfig?: null;
	/** Whether this option should be picked as default for NPC's (rather than just going for the first option) */
	NPCDefault?: boolean;
}

/** Extended item option subtype for vibrating items */
interface VibratingItemOption extends Omit<VibratingItemOptionConfig, "ArchetypeConfig">, Omit<ExtendedItemOption, "Name" | "Property"> {
	OptionType: "VibratingItemOption";
	ParentData: VibratingItemData;
	Property: ItemProperties & Pick<Required<ItemProperties>, "TypeRecord" | "Intensity" | "Effect">;
	ArchetypeData?: null;
}

/** An object defining all of the required configuration for registering a vibrator item */
interface VibratingItemConfig extends ExtendedItemConfig<VibratingItemOption> {
	Archetype: "vibrating";
	/** The list of vibrator mode sets that are available on this item */
	Options?: VibratorModeSet[];
	/**
	 * A record containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<VibratingItemData, VibratingItemOption>;
	/** The optional text configuration for the item. Custom text keys can be configured within this object */
	DialogPrefix?: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		Header?: string | ExtendedItemHeaderCallback<VibratingItemData>;
		/** The dialogue prefix for the name of each option */
		Option?: string;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		Chat?: string | ExtendedItemChatCallback<VibratingItemOption>;
	};
	DrawImages?: false;
	ChatSetting?: "default";
	DrawData?: ExtendedItemConfigDrawData<Partial<ElementMetaData.Vibrating>>;
}

type VibratorModeSet = "Standard" | "Advanced";

//#endregion

//#region Variable Height items

/** Extended item option subtype for variable height items */
interface VariableHeightOption extends ExtendedItemOption {
	OptionType: "VariableHeightOption";
	Property: Pick<Required<ItemProperties>, "OverrideHeight">;
	Name: "newOption" | "previousOption";
	ParentData: VariableHeightData;
	ArchetypeData?: null;
}

interface VariableHeightConfig extends ExtendedItemConfig<VariableHeightOption> {
	Archetype: "variableheight";
	/** The highest Y co-ordinate that can be set  */
	MaxHeight: number;
	/** The lowest Y co-ordinate that can be set  */
	MinHeight: number;
	/** A record containing various dialog keys used by the extended item screen */
	DialogPrefix: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		Header?: string | ExtendedItemHeaderCallback<VariableHeightData>;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		Chat?: string | ExtendedItemChatCallback<VariableHeightOption>;
		/** The dialogue prefix for the name of each option */
		Option?: string;
	};
	/** The function that handles finding the current variable height setting */
	GetHeightFunction?: (property: ItemProperties) => number | null;
	/** The function that handles applying the height setting to the character */
	SetHeightFunction?: (property: ItemProperties, height: number, maxHeight: number, minHeight: number) => void;
	DrawImages?: false;
	ChatSetting?: "default";
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<VariableHeightData, VariableHeightOption>;
	DrawData: VariableHeightConfigDrawData;
}

//#endregion

//#region text items

interface TextItemConfig extends ExtendedItemConfig<TextItemOption> {
	Archetype: "text";
	/** A record with the maximum length for each text-based properties with an input field. */
	MaxLength: TextItemRecord<number>;
	/** A record containing various dialog keys used by the extended item screen */
	DialogPrefix?: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		Header?: string | ExtendedItemHeaderCallback<TextItemData>;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		Chat?: string | ExtendedItemChatCallback<TextItemOption>;
	};
	DrawImages?: false;
	ChatSetting?: "default";
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<TextItemData, TextItemOption>;
	EventListeners?: TextItemRecord<TextItemEventListener>;
	DrawData?: ExtendedItemConfigDrawData<Partial<ElementMetaData.Text>>;
	PushOnPublish?: boolean;
	/**
	 * The font used for dynamically drawing text.
	 * Requires {@link AssetDefinition.DynamicAfterDraw} to be set.
	 */
	Font?: null | string;
}

/** Extended item option subtype for text-supporting items */
interface TextItemOption extends ExtendedItemOption {
	OptionType: "TextItemOption";
	Property: TextItemRecord<string>;
	Name: "newOption" | "previousOption";
	ParentData: TextItemData;
	ArchetypeData?: null;
}

// #endregion

// #region noarch

interface NoArchItemConfig extends ExtendedItemConfig<NoArchItemOption> {
	Archetype: "noarch";
	DrawImages?: false;
	ChatSetting?: "default";
	ScriptHooks?: ExtendedItemCapsScriptHooksStruct<NoArchItemData, NoArchItemOption>;
	DrawData?: NoArchConfigDrawData;
	DialogPrefix?: ExtendedItemCapsDialog<NoArchItemData, NoArchItemOption>,
	BaselineProperty?: ItemProperties;
}

/** Extended item option subtype for text-supporting items */
interface NoArchItemOption extends ExtendedItemOption {
	OptionType: "NoArchItemOption";
	ParentData: NoArchItemData;
	ArchetypeData?: null;
}

// #endregion

// #region Testing

/** An interface representing missing or invalid data for a given (simplified) asset */
interface TestingStruct<T> {
	/** The asset's group */
	readonly Group: AssetGroupName;
	/** The asset's name */
	readonly Name: string;
	/** A representation of the asset's missing or invalid data */
	readonly Invalid: T;
}

// #endregion
