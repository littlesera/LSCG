//#region Common

declare namespace SocketIO {
	type Socket = import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents>
}

declare function io(serv: string): SocketIO.Socket;

type ClientEvent = import("@socket.io/component-emitter").EventNames<ClientToServerEvents>;
type ClientEventParams<Ev extends ClientEvent> = import("@socket.io/component-emitter").EventParams<ClientToServerEvents, Ev>;

interface String {
	replaceAt(index: number, character: string): string;
}

declare function parseInt(s: string | number, radix?: number): number;

type MemoizedFunction<T extends Function> = T & {
	/** Clears the cache of the memoized function */
	clearCache(): void;
};

// GL shim
interface WebGLTextureData {
	width: number,
	height: number,
	texture: WebGLTexture,
}

interface WebGL2RenderingContext {
	program?: WebGLProgram;
	programFull?: WebGLProgram;
	programHalf?: WebGLProgram;
	programTexMask?: WebGLProgram;
	textureCache?: Map<string, WebGLTextureData>;
	maskCache?: Map<string, WebGLTexture>;
}

interface WebGLProgram {
	u_alpha?: WebGLUniformLocation;
	u_color?: WebGLUniformLocation;
	a_position?: number;
	a_texcoord?: number;
	u_matrix?: WebGLUniformLocation;
	u_texture?: WebGLUniformLocation;
	u_alpha_texture?: WebGLUniformLocation;
	position_buffer?: WebGLBuffer;
	texcoord_buffer?: WebGLBuffer;
}

interface HTMLCanvasElement {
	GL?: WebGL2RenderingContext;
}

interface HTMLImageElement {
	errorcount?: number;
}

interface HTMLElement {
	setAttribute(qualifiedName: string, value: any): void;
	removeAttribute(qualifiedName: string): void;
}

interface GamepadButton {
	/** Whether the button was pressed the last input event */
	repeat: boolean;
}

interface RGBColor {
	r: number;
	g: number;
	b: number;
}

interface RGBAColor extends RGBColor {
	a: number;
}

/**
 * A singleton for explicitly signifying to {@link ElementCreate} that it should have no parent element.
 *
 * Can be used for overriding any function that would otherwise default to {@link document.body} when a nullish value is provided as parent.
 */
type ElementNoParent = 0;

/**
 * A {@link HTMLElementTagNameMap} subtype with all non-scalar properties removed from the HTML elements
 *
 * Serves as an approximation (and superset) of all element-specific attributes
 */
type HTMLElementScalarTagNameMap = {
	[k1 in keyof HTMLElementTagNameMap]: {
		[k2 in keyof HTMLElementTagNameMap[k1] as Required<HTMLElementTagNameMap[k1][k2]> extends (boolean | number | string | null) ? k2 : never]:
			HTMLElementTagNameMap[k1][k2]
	}
};

type HTMLOptions<T extends keyof HTMLElementTagNameMap> = {
	/** The elements HTML tag */
	tag: T,
	/** Scalar-valued attributes that will be set on the HTML element. */
	attributes?: Partial<HTMLElementScalarTagNameMap[T]> & Partial<Record<string, number | boolean | string>>;
	/** Data attributes that will be set on the HTML element (see {@link HTMLElement.dataset}). */
	dataAttributes?: Partial<Record<string, number | boolean | string>>;
	/** CSS style declarations that will be set on the HTML element (see {@link HTMLElement.style}). */
	style?: Record<string, string>;
	/** Event listeners that will be attached to the HTML element (see {@link HTMLElement.addEventListener}). */
	eventListeners?: { [k in keyof HTMLElementEventMap]?: (this: HTMLElementTagNameMap[T], event: HTMLElementEventMap[k]) => any };
	/** The elements parent (if any) to which it will be attached (see {@link HTMLElement.parentElement}). */
	parent?: ElementNoParent | Node;
	/** A list of CSS classes to-be assigned to the element (see {@link HTMLElement.classList}). */
	classList?: readonly (null | undefined | string)[];
	/** Any to-be added child elements. */
	children?: readonly (null | undefined | string | Node | HTMLOptions<keyof HTMLElementTagNameMap>)[];
	/** The {@link HTMLElement.innerHTML} of the element; will be assigned before appending children */
	innerHTML?: string;
};

type Rect = { x: number, y: number, w: number, h: number };

/** A 4-tuple with X & Y coordinates, width and height */
type RectTuple = [X: number, Y: number, W: number, H: number];

/** A 4-tuple with X & Y coordinates and, optionally, width and height */
type PartialRectTuple = [X: number, Y: number, W?: number, H?: number];

type CommonSubstituteReplacer = (match: string, offset: number, replacement: string, string: string) => string;
type CommonSubtituteSubstitution = [tag: string, substitution: string, replacer?: CommonSubstituteReplacer];

interface CommonGenerateGridParameters {
	/** Starting X coordinate of the grid */
	x: number,
	/** Starting Y coordinate of the grid */
	y: number,
	/** Maximum width of the grid */
	width: number,
	/** Maximum height of the grid */
	height: number,
	/** Width of one grid item */
	itemWidth: number,
	/** Height of one grid item */
	itemHeight: number,
	/**
	 * Margin of one grid item in the X direction.
	 * Not giving a value will calculate a margin from the item's size and the grid size
	 */
	itemMarginX?: number;
	/**
	 * Margin of one grid item in the Y direction
	 * Not giving a value will calculate a margin from the item's size and the grid size
	 */
	itemMarginY?: number;
	/**
	 * The direction the items are layed out
	 * @default "horizontal"
	 */
	direction?: "horizontal" | "vertical";
}

type CommonGenerateGridCallback<T> = (item: T, x: number, y: number, width: number, height: number) => boolean;

/**
 * An object for holding arbitrary values with a mechanism to reset them to a default
 */
type VariableContainer<T1, T2> = T1 & T2 & {
	/** Default values that should be restored to the container upon calling {@link Reset} */
	readonly Defaults: Readonly<T1>,
	/** Restore the container to its default state */
	readonly Reset: () => void,
}

//#endregion

//#region Enums

type ChatRoomSpaceLabel = "MIXED" | "FEMALE_ONLY" | "MALE_ONLY" | "ASYLUM";

type DialogMenuMode = (
	"activities"
	| "colorDefault"
	| "colorExpression"
	| "colorItem"
	| "crafted"
	| "dialog"
	| "extended"
	| "items"
	| "layering"
	| "locking"
	| "locked"
	| "permissions"
	| "struggle"
	| "tighten"
);

type DialogMenuButton = "Activity" |
	"ColorCancel" | "ColorChange" | "ColorChangeMulti" | "ColorDefault" | "ColorPickDisabled" | "ColorSelect" |
	"Crafting" |
	"NormalMode" | "PermissionMode" |
	"Dismount" | "Escape" | "Remove" |
	"Exit" |
	"GGTSControl" |
	"InspectLock" | "InspectLockDisabled" |
	"Layering" |
	"Lock" | "LockDisabled" | "LockMenu" |
	"Swap" | "Next" | "Prev" | `PickLock${PickLockAvailability}` |
	"Remote" | "RemoteDisabled" | `RemoteDisabledFor${VibratorRemoteAvailability}` |
	"Unlock" | "Use" | "UseDisabled" | "Struggle" | "TightenLoosen" |
	// Wardrobe buttons
	"Wardrobe" | "WardrobeDisabled" | "Reset" | "WearRandom" | "Random" | "Copy" | "Paste" | "Naked" | "Accept" | "Cancel" | "Character"
	;

type DialogSortOrder = | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type DialogStruggleActionType = "ActionUse" | "ActionSwap" | "ActionRemove" | "ActionUnlock" | "ActionUnlockAndRemove" | "ActionStruggle" | "ActionEscape" | "ActionDismount";

type CharacterType = "online" | "npc" | "simple";

type CharacterPronouns = "SheHer" | "HeHim";

type VibratorIntensity = -1 | 0 | 1 | 2 | 3;

type VibratorModeState = "Default" | "Deny" | "Orgasm" | "Rest";

type VibratorMode = "Off" | "Low" | "Medium" | "High" | "Maximum" | "Random" | "Escalate" | "Tease" | "Deny" | "Edge";

type VibratorRemoteAvailability = "Available" | "NoRemote" | "NoRemoteOwnerRuleActive" | "NoLoversRemote" | "RemotesBlocked" | "CannotInteract" | "NoAccess" | "InvalidItem";

type PickLockAvailability = "" | "Disabled" | "PermissionsDisabled" | "InaccessibleDisabled" | "NoPicksDisabled";

type ItemVulvaFuturisticVibratorAccessMode = "" | "ProhibitSelf" | "LockMember";

type SpeechTransformName = "gagGarble" | "stutter" | "babyTalk" | "deafen";

/** The {@link EffectName} values for all gag-related effects. */
type GagEffectName = (
	"GagVeryLight"
	| "GagEasy"
	| "GagLight"
	| "GagNormal"
	| "GagMedium"
	| "GagHeavy"
	| "GagVeryHeavy"
	| "GagTotal"

	// Those are only supposed to be "transient", as in, they appear because of stacked gags
	| "GagTotal2"
	| "GagTotal3"
	| "GagTotal4"
);

/** The {@link EffectName} values for all blindness-related effects. */
type BlindEffectName = "BlindLight" | "BlindNormal" | "BlindHeavy" | "BlindTotal";

/** The {@link EffectName} values for all blurring-related effects. */
type BlurEffectName = "BlurLight" | "BlurNormal" | "BlurHeavy" | "BlurTotal";

/** The {@link EffectName} values for all deafness-related effects. */
type DeafEffectName = "DeafLight" | "DeafNormal" | "DeafHeavy" | "DeafTotal";

/** All known effects */
type EffectName =
	GagEffectName | BlindEffectName | BlurEffectName | DeafEffectName |
	"Freeze" | "BlockWardrobe" | "Block" | "Mounted" |
	"CuffedFeet" | "CuffedLegs" | "CuffedArms" | "IsChained" | "FixedHead" | "MergedFingers" |
	"Shackled" | "Tethered" | "MapImmobile" | "Enclose" | "OneWayEnclose" | "OnBed" | "Lifted" | "Suspended" |
	"Slow" | "FillVulva" | "VulvaShaft" | "IsPlugged" |
	"Egged" | "Vibrating" | "ForcedErection" |
	"Edged" | "DenialMode" | "RuinOrgasms" |
	"Remote" | "UseRemote" | "BlockRemotes" |
	"Lock" | "NotSelfPickable" |
	"Chaste" | "BreastChaste" | "ButtChaste" |
	"Leash" | "IsLeashed" | "CrotchRope" |
	"ReceiveShock" | "TriggerShock" |
	"OpenPermission" | "OpenPermissionArm" | "OpenPermissionLeg" | "OpenPermissionChastity" |
	"BlockMouth" | "OpenMouth" |
	"VR" | "VRAvatars" | "KinkyDungeonParty" |
	"RegressedTalk" |
	"HideRestraints" |
	"UnlockMetalPadlock" | "UnlockOwnerPadlock" | "UnlockOwnerTimerPadlock" |
	"UnlockLoversPadlock" | "UnlockLoversTimerPadlock" |
	"UnlockFamilyPadlock" | "UnlockMistressPadlock" | "UnlockMistressTimerPadlock" |
	"UnlockPandoraPadlock" | "UnlockMetalCuffs" | "UnlockEscortAnkleCuffs" | "UnlockPortalPanties" |
	"ProtrudingMouth" | "Wiggling"
	;

interface ExpressionNameMap {
	Eyebrows: null | "Raised" | "Lowered" | "OneRaised" | "Harsh" | "Angry" | "Soft",
	Eyes: (
		null | "Closed" | "Dazed" | "Shy" | "Sad" | "Horny" | "Lewd" | "VeryLewd" |
		"Heart" | "HeartPink" | "LewdHeart" | "LewdHeartPink" | "Dizzy" | "Daydream" |
		"ShylyHappy" | "Angry" | "Surprised" | "Scared"
	),
	Eyes2: ExpressionNameMap["Eyes"],
	Mouth: (
		null | "Frown" | "Sad" | "Pained" | "Angry" | "HalfOpen" | "Open" | "Ahegao" | "Moan" |
		"TonguePinch" | "LipBite" | "Happy" | "Devious" | "Laughing" | "Grin" | "Smirk" | "Pout"
	),
	Pussy: null | "Hard",
	Blush: null | "Low" | "Medium" | "High" | "VeryHigh" | "Extreme" | "ShortBreath",
	Fluids: (
		null | "DroolLow" | "DroolMedium" | "DroolHigh" | "DroolSides" | "DroolMessy" | "DroolTearsLow" |
		"DroolTearsMedium" | "DroolTearsHigh" | "DroolTearsMessy" | "DroolTearsSides" |
		"TearsHigh" | "TearsMedium" | "TearsLow"
	),
	Emoticon: (
		null | "Afk" | "Whisper" | "Sleep" | "Hearts" | "Tear" | "Hearing" | "Confusion" | "Exclamation" |
		"Annoyed" | "Read" | "RaisedHand" | "Spectator" | "ThumbsDown" | "ThumbsUp" | "LoveRope" |
		"LoveGag" | "LoveLock" | "Wardrobe" | "Gaming" | "Coffee" | "Fork" | "Music" | "Car" | "Hanger" |
		"Call" | "Lightbulb" | "Warning" | "BrokenHeart" | "Drawing" | "Coding" | "TV" | "Bathing"
	),
}

type ExpressionGroupName = keyof ExpressionNameMap;
type ExpressionName = ExpressionNameMap[ExpressionGroupName];

type AssetGroupItemName =
	'ItemAddon' | 'ItemArms' | 'ItemBoots' | 'ItemBreast' | 'ItemButt' |
	'ItemDevices' | 'ItemEars' | 'ItemFeet' | 'ItemHands' | 'ItemHead' |
	'ItemHood' | 'ItemLegs' | 'ItemMisc' | 'ItemMouth' | 'ItemMouth2' |
	'ItemMouth3' | 'ItemNeck' | 'ItemNeckAccessories' | 'ItemNeckRestraints' |
	'ItemNipples' | 'ItemNipplesPiercings' | 'ItemNose' | 'ItemPelvis' |
	'ItemTorso' | 'ItemTorso2'| 'ItemVulva' | 'ItemVulvaPiercings' |
	'ItemHandheld'
	;

type AssetGroupScriptName = 'ItemScript';

type AssetGroupBodyName =
	ExpressionGroupName | 'BodyLower' | 'BodyUpper' | 'BodyMarkings' | 'Bra' | 'Bracelet' | 'Cloth' |
	'ClothAccessory' | 'ClothLower' | 'Corset' | 'EyeShadow' | 'FacialHair' | 'Garters' | 'Glasses' | 'Gloves' |
	'HairAccessory1' | 'HairAccessory2' | 'HairAccessory3' | 'HairBack' |
	'HairFront' | 'FacialHair' | 'Hands' | 'Hat' | 'Head' | 'Height' | 'Jewelry' | 'LeftAnklet' | 'LeftHand' | 'Mask' |
	'Necklace' | 'Nipples' | 'Panties' | 'Pronouns' | 'RightAnklet' | 'RightHand' |
	'Shoes' | 'Socks' | 'SocksLeft' | 'SocksRight' | 'Suit' | 'SuitLower' | 'TailStraps' | 'Wings'
	;

type AssetGroupName = AssetGroupBodyName | AssetGroupItemName | AssetGroupScriptName;

interface AssetPoseMap {
	BodyHands: 'TapedHands',
	BodyUpper: 'BaseUpper' | 'BackBoxTie' | 'BackCuffs' | 'BackElbowTouch' | 'OverTheHead' | 'Yoked',
	BodyLower: 'BaseLower' | 'Kneel' | 'KneelingSpread' | 'LegsClosed' | 'LegsOpen' | 'Spread',
	BodyFull: 'Hogtied' | 'AllFours',
	BodyAddon: 'Suspension',
}

type AssetPoseCategory = keyof AssetPoseMap;
type AssetPoseName = AssetPoseMap[keyof AssetPoseMap];

/**
 * A record mapping pose names to the actually to-be drawn poses.
 * Special values can be specified, via use of {@link PoseType}, for either hiding the asset or using pose-agnostic assets.
 */
type AssetPoseMapping = Partial<Record<AssetPoseName, AssetPoseName | PoseType>>;

type PoseType = "Hide" | PoseTypeDefault;
type PoseTypeDefault = "";

type PoseChangeStatus = 0 | 1 | 2 | 3;

type AssetLockType =
	"CombinationPadlock" | "ExclusivePadlock" | "HighSecurityPadlock" |
	"IntricatePadlock" | "LoversPadlock" | "LoversTimerPadlock" | "FamilyPadlock" |
	"MetalPadlock" | "MistressPadlock" | "MistressTimerPadlock" |
	"OwnerPadlock" | "OwnerTimerPadlock" | "PandoraPadlock" |
	"PasswordPadlock" | "PortalLinkPadlock" | "SafewordPadlock" | "TimerPadlock" |
	"TimerPasswordPadlock"
	;

type CraftingPropertyType =
	"Normal" | "Large" | "Small" | "Thick" | "Thin" | "Secure" | "Loose" | "Decoy" |
	"Malleable" | "Rigid" | "Simple" | "Puzzling" | "Painful" | "Comfy" | "Strong" |
	"Flexible" | "Nimble" | "Arousing" | "Dull" | "Heavy" | "Light"
	;

type AssetAttribute =
	"Skirt" | "SuitLower" | "UpperLarge" |
	"ShortHair" | "SmallEars" | "NoEars" | "NoseRing" | "HoodieFix" |
	"CanAttachMittens" |
	"IsChestHarness" | "IsHipHarness" |
	"PenisLayer" | "PussyLayer" | "GenitaliaCover" | "Pussy1" | "Pussy2" | "Pussy3" |
	"CagePlastic2" | "CageTechno" | "CageFlat" |
	"FuturisticRecolor" | "FuturisticRecolorDisplay" |
	"PortalLinkLockable" | `PortalLinkChastity${string}` | `PortalLinkActivity${ActivityName}` | `PortalLinkTarget${AssetGroupItemName}`
	;

type PosePrerequisite = `Can${AssetPoseName}`;

type AssetPrerequisite =
	PosePrerequisite | "AccessBreast" | "AccessBreastSuitZip" | "AccessButt" | "AccessFullPenis" | "AccessMouth" | "AccessTorso" | "AccessVulva" | "AccessCrotch" |
	"BlockedMouth" | "ButtEmpty" | "CanBeCeilingTethered" | "CanCoverVulva" | "CanHaveErection" | "CanBeLimp" | "CanKneel" | "CannotBeSuited" | "CannotHaveWand" |
	"CanAttachMittens" |
	"ClitEmpty" | "Collared" | "CuffedArms" | "CuffedArmsOrEmpty" | "CuffedFeet" | "CuffedFeetOrEmpty" | "CuffedLegs" | "CuffedLegsOrEmpty" |
	"DisplayFrame" | "EyesEmpty" | "GagCorset" | "GagFlat" | "GagUnique" | "GasMask" | "HasBreasts" | "HasFlatChest" | "HasPenis" | "HasVagina" |
	"HoodEmpty" | "NakedFeet" | "NakedHands" | "NeedsChestHarness" | "NeedsHipHarness" | "NeedsNippleRings" |
	"NoChastityCage" | "NoErection" | "NoClothLower" | "NoItemArms" |
	"NoItemFeet" | "NoItemHands" | "NoItemLegs" | "NoMaidTray" | "NoOuterClothes" | "NotChained" | "NotChaste" | "NotKneeling" |
	"NotLifted" | "NotMasked" | "NotMounted" | "NotProtrudingFromMouth" | "NotSuspended" | "OnBed" |
	"RemotesAllowed" | "VulvaEmpty"
;

type CraftingStatusType = 0 | 1 | 2;

type ItemColorMode = "Default" | "ColorPicker";

type CharacterHook = "BeforeSortLayers" | "AfterLoadCanvas";

type AnimationDataTypes = "AssetGroup" | "" | "DynamicPlayerCanvas" | "PersistentData" | "Rebuild" | "RefreshTime" | "RefreshRate";

type ChatColorThemeType = "Light" | "Dark" | "Light2" | "Dark2";
type ChatEnterLeaveType = "Normal" | "Smaller" | "Hidden";
type ChatMemberNumbersType = "Always" | "Never" | "OnMouseover";
type ChatFontSizeType = "Small" | "Medium" | "Large";

type ArousalActiveName = "Inactive" | "NoMeter" | "Manual" | "Hybrid" | "Automatic";
type ArousalVisibleName = "All" | "Access" | "Self";
type ArousalAffectStutterName = "None" | "Arousal" | "Vibration" | "All";

/**
 * A listener for KeyboardEvents
 *
 * Cheat-sheet about how to do key checks with it:
 * - {@link KeyboardEvent.code} is the layout-insensitive code
 * for the key (so KeyA, Space, etc.) Use this if you want to
 * keep the QWERTY location, like movement keys.
 *
 * {@link KeyboardEvent.key} is the layout-dependent string
 * for the key (so "a" (or "q" on AZERTY), "A" (or "Q"), " ", etc.)
 * Use this if you want the key to correspond to what's actually on
 * the user's keyboard.
 *
 * @see {@link CommonKeyMove}
 */
type KeyboardEventListener = ScreenFunctions["KeyDown"];
type MouseEventListener = ScreenFunctions["MouseDown"];

type SettingsSensDepName = "SensDepLight" | "Normal" | "SensDepNames" | "SensDepTotal" | "SensDepExtreme";
type SettingsVFXName = "VFXInactive" | "VFXSolid" | "VFXAnimatedTemp" | "VFXAnimated";
type SettingsVFXVibratorName = "VFXVibratorInactive" | "VFXVibratorSolid" | "VFXVibratorAnimated";
type SettingsVFXFilterName = "VFXFilterLight" | "VFXFilterMedium" | "VFXFilterHeavy";

type GraphicsFontName =
	"Arial" | "TimesNewRoman" | "Papyrus" | "ComicSans" | "Impact" | "HelveticaNeue" | "Verdana" |
	"CenturyGothic" | "Georgia" | "CourierNew" | "Copperplate"
	;

type PreferenceSubscreenName =
	"General" | "Difficulty" | "Restriction" | "Chat" | "CensoredWords" | "Audio" | "Arousal" |
	"Security" | "Online" | "Visibility" | "Immersion" | "Graphics" | "Controller" | "Notifications" |
	"Gender" | "Scripts" | "Extensions" | "Main"
	;

interface PreferenceSubscreen {
	name: PreferenceSubscreenName;
	description?: string;
	icon?: string;
	hidden?: boolean;
	load?: () => void;
	run: () => void;
	click: () => void;
	exit?: () => boolean;
}

interface PreferenceGenderSetting {
	/** Whether the setting is active for female cases */
	Female: boolean;
	/** Whether the setting is active for male cases */
	Male: boolean;
}

type FetishName =
	"Bondage" | "Gagged" | "Blindness" | "Deafness" | "Chastity" | "Exhibitionist" | "Masochism" |
	"Sadism" | "Rope" | "Latex" | "Leather" | "Metal" | "Tape" | "Nylon" | "Lingerie" | "Pet" |
	"Pony" | "ABDL" | "Forniphilia"
	;

type BackgroundTag =
	"Filter by tag" | "Indoor" | "Outdoor" | "Aquatic" | "Special Events" | "SciFi & Fantasy" |
	"Club & College" | "Regular house" | "Dungeon" | "Asylum"
	;

// NOTE: `NPCArchetype` is for NPC's only
type TitleName =
	NPCArchetype | "None" | "Mistress" | "Master" | "Mistree" | "ClubSlave" | "Maid" | "HeadMaid" | "BondageMaid" | "Kidnapper" |
	"MasterKidnapper" | "Patient" | "PermanentPatient" | "EscapedPatient" | "Nurse" | "Doctor" | "AnimeBoy" |
	"LadyLuck" | "LordFortune" | "Patron" | "CollegeStudent" |"Nawashi" | "Houdini" | "PonyAlicorn" |
	"PonyPegasus" | "PonyUnicorn" | "PonyWild" | "PonyHot" | "PonyWarm" | "PonyCold" | "PonyFarm" |
	"PonyFoal" | "InfilrationMole" | "InfilrationInfiltrator" | "InfilrationAgent" |
	"InfilrationOperative" | "InfilrationSuperspy" | "MagicSchoolWizard" | "MagicSchoolMagus" |
	"MagicSchoolMagician" | "MagicSchoolSorcerer" | "MagicSchoolSage" | "MagicSchoolOracle" |
	"MagicSchoolWitch" | "MagicSchoolWarlock" | "Duchess" | "Duke" | "LittleOne" | "Baby" | "DL" |
	"BondageBaby" | "Switch" | "Princess" |	"Prince" | "Liege" | "Majesty" | "Missy" | "Sissy" | "Tomboy" | "Femboy" | "GoodOne" |
	"Pet" |	"Brat" | "Kitten" | "Puppy" | "Foxy" | "Bunny" | "Doll" | "Demon" | "Angel" | "Alien" | "Captain" | "Admiral" |
	"Succubus" | "Incubus" | "Concubus" | "GoodGirl" | "GoodBoy" | "GoodSlaveGirl" | "GoodSlaveBoy" | "GoodSlave" | "Drone"
	;

type MagicSchoolHouse = "Maiestas" | "Vincula" | "Amplector" | "Corporis";

type ModuleType = "Character" | "Cutscene" | "MiniGame" | "Online" | "Room";

type AssetCategory = "Medical" | "Extreme" | "Pony" | "SciFi" | "ABDL" | "Fantasy";

type PortalLinkStatus = "PortalLinkInvalidCode" | "PortalLinkClipboardError" | "PortalLinkValidCode" | `PortalLinkSearching${number}` | "PortalLinkDuplicateCode" | "PortalLinkTargetNotFound" | "PortalLinkEstablished";
type PortalLinkFunction = "PortalLinkFunctionLock" | "PortalLinkFunctionUnlock" | "PortalLinkFunctionCycleChastity" | `PortalLinkFunctionActivity${ActivityName}`;

/** Valid thumb icons for range slider elements */
type ThumbIcon = "lock" | "blindfold" | "lightbulb" | "player" | "rope";

//#endregion

//#region Chat

type ChatRoomLovershipOption = "" | "CanOfferBeginWedding" | "CanBeginWedding";
type ChatRoomOwnershipOption = "" | "CanOfferEndTrial" | "CanOfferTrial" | "CanEndTrial";

type ChatRoom = ServerChatRoomData;
type ChatRoomSettings = ServerChatRoomSettings;

type StimulationAction = "Kneel" | "Walk" | "Struggle" | "StruggleFail" | "Talk";

interface StimulationEvent {
	/** The chance that this event will trigger at 0 arousal */
	Chance: number;
	/** Scaling factor for chance, depending on the arousal */
	ArousalScaling?: number;
	/** Scaling factor for chance, depending on the vibe intensity */
	VibeScaling?: number;
	/** Scaling factor for chance, depending on the inflation amount */
	InflationScaling?: number;
	/** The chance that this event will trigger when talking */
	TalkChance?: number;
}

type StimulationEventType = "CrotchRope" | "Talk" | "Vibe" | "Inflated" | "Wiggling" | "PlugFront" | "PlugBack" | "PlugBoth";

interface StimulationEventItem {
	/** The item that caused the stimulation event */
    item: Item;
	/** The type of stimulation event */
    event: StimulationEventType;
	/** The chance of the event occurring */
    chance: number;
	/** Arousal booost from the event */
    arousal: number;
}

interface ChatRoomChatLogEntry {
	Chat: string;
	Garbled: string;
	Original: string;
	SenderName: string;
	SenderMemberNumber: number;
	Time: number;
}

interface IChatRoomMessageMetadata {
	/** The name of the sender character, appropriately garbled if deafened */
	senderName?: string;
	/** The character targetted by the message */
	TargetCharacter?: Character;
	AdditionalTargets?: Record<number, Character>;
	/** The character sending the message */
	SourceCharacter?: Character;
	/** The member number of the target */
	TargetMemberNumber?: number;
	/** Whether the message is considered game-initiated. Used for automatic vibe changes for example. */
	Automatic?: boolean;
	/** The group that has been interacted with to trigger the message */
	FocusGroup?: AssetItemGroup;
	/** The name of the group that has been interacted with to trigger the message */
	GroupName?: AssetGroupName;
	/** The assets referenced in the message */
	Assets?: Record<string, Asset>;
	/** The {@link CraftingItem.Name} of the assets referenced in the message (if applicable) */
	CraftingNames?: Record<string, string>;
	/** The groups referenced in the message */
	Groups?: Partial<Record<AssetGroupName, AssetGroup[]>>;
	/** How intense the shock should be */
	ShockIntensity?: number;
	ActivityCounter?: number;
	/** The triggered activity */
	ActivityName?: ActivityName;
	/** The name of the asset used for the activity */
	ActivityAsset?: Asset;
	/** The name of the chatroom, appropriately garbled */
	ChatRoomName?: string;
	/** The original, ungarbled message, if provided by the sender */
	OriginalMsg?: string;
}

/**
 * A metadata extractor for a given message.
 *
 * @param data - The chat message to extract from.
 * @param sender - The character that sent the message.
 * @return An object with the following keys:
 *  - `metadata`: an object for the extracted metadata (key/value)
 *  - `substitutions`: an array of [tag, substitutions] to perform on the message.
 * @return null if the extraction has nothing to report.
 */
type ChatRoomMessageExtractor =
	(data: ServerChatRoomMessage, sender: Character) => { metadata: IChatRoomMessageMetadata, substitutions: CommonSubtituteSubstitution[] } | null;

/**
 * A chat message handler.
 *
 * This is used in ChatRoomMessage to perform filtering and actions on
 * the recieved message. You can register one of those with
 * ChatRoomRegisterMessageHandler if you need to peek at incoming messages.
 *
 * Message processing is done in three phases:
 * - all pre-handlers are called
 * - metadata extraction & tag substitutions are collected
 *   from the message's dictionary, then latter are applied to
 *   the message's contents.
 * - finally, post-handlers are called.
 *
 * The handler's priority determines when the handler will get executed:
 * - Negative values make the handler run before metadata extraction
 * - Positive values make it run afterward.
 * In both cases, lower values mean higher priority, so -100 handler will
 * run before a -1, and a 1 handler will run before a 100.
 *
 * The return from the callback determines what will happen: if it's true,
 * message processing will stop, making the filter act like a handler.
 * If it's false, then it will continue. You can also return an object with
 * a `msg` property if the handler is a transformation and wishes to update
 * the message's contents inflight and/or a `skip` property if you'd like
 * to cause a subsequent handler to not be called.
 *
 * @warning Note that the in-flight message is only escaped when it gets
 * sent to the chat log via ChatRoomMessageDisplay. If you're manipulating
 * that by any other means, make sure to call ChatRoomEscapeEntities on its
 * content to close any injection attacks.
 *
 * A few notable priority values are:
 *
 * -200: ghosted player cutoff
 * -1: default Hidden message processing (and cutoff)
 * 0: emotes reformatting
 * 100: sensory-deprivation processing
 * 200: automatic actions on others' cutoff
 * 300: sensory-deprivation cutoff.
 * 500: usually output handlers. That's when audio, notifications and the
 *      message being added to the chat happens.
 *
 * Hidden messages never make it to post-processing.
 *
 */
interface ChatRoomMessageHandler {
	/** A short description of what the handler does. For debugging purposes */
	Description?: string;

	/**
	 * This handler's priority, used to determine when the code should run.
	 */
	Priority: number;

	/**
	 * Actual action to perform.
	 * @param data - The chat message to handle.
	 * @param sender - The character that sent the message.
	 * @param msg - The formatted string extracted from the message.
	 *              If the handler is in "post" mode, all substitutions have been performed.
	 * @param metadata - The collected metadata from the message's dictionary, only available in "post" mode.
	 * @returns {boolean} true if the message was handled and the processing should stop, false otherwise.
	 */
	Callback: (data: ServerChatRoomMessage, sender: Character, msg: string, metadata?: IChatRoomMessageMetadata) => boolean | { msg?: string; skip?: (handler: ChatRoomMessageHandler) => boolean };
}

//#endregion

//#region FriendList

interface IFriendListBeepLogMessage {
	MemberNumber?: number; /* undefined for NPCs */
	MemberName: string;
	ChatRoomName?: string;
	Private: boolean;
	ChatRoomSpace?: string;
	Sent: boolean;
	Time: Date;
	Message?: string;
}

//#endregion

/**
 * Make all properties in T mutable.
 * Opposite of {@link Readonly}
 */
type Mutable<T> = {
    -readonly[P in keyof T]: T[P];
};

//#region Assets

type IAssetFamily = "Female3DCG";

type WardrobeReorderType = "None" | "Select" | "Place";

interface AssetGroup {
	readonly Family: IAssetFamily;
	readonly Name: AssetGroupName;
	readonly Description: string;
	readonly Asset: readonly Asset[];
	readonly ParentGroupName: AssetGroupName | null;
	readonly Category: 'Appearance' | 'Item' | 'Script';
	readonly IsDefault: boolean;
	readonly IsRestraint: boolean;
	readonly AllowNone: boolean;
	readonly AllowColorize: boolean;
	readonly AllowCustomize: boolean;
	readonly Random?: boolean;
	readonly ColorSchema: readonly string[];
	/**
	 * The first color in the groups {@link ColorSchema}.
	 * The value is used for padding the {@link Asset.DefaultColor} array if required.
	 */
	readonly DefaultColor: string;
	readonly ParentSize: AssetGroupName | "";
	readonly ParentColor: AssetGroupName | "";
	readonly Clothing: boolean;
	readonly Underwear: boolean;
	readonly BodyCosplay: boolean;
	readonly Hide?: readonly AssetGroupName[];
	readonly Block?: readonly AssetGroupItemName[];
	readonly Zone?: readonly RectTuple[];
	readonly SetPose?: readonly AssetPoseName[];
	/** @deprecated - Superceded by {@link PoseMapping} */
	readonly AllowPose?: never;
	readonly PoseMapping: AssetPoseMapping;
	readonly AllowExpression?: readonly ExpressionName[];
	readonly Effect: readonly EffectName[];
	readonly MirrorGroup: AssetGroupName | "";
	readonly RemoveItemOnRemove: readonly Readonly<{ Group: AssetGroupItemName; Name: string; TypeRecord?: TypeRecord }>[];
	readonly EditOpacity: boolean;
	readonly MinOpacity: number;
	readonly MaxOpacity: number;
	readonly DrawingPriority: number;
	readonly DrawingLeft: TopLeft.Data;
	readonly DrawingTop: TopLeft.Data;
	readonly DrawingBlink: boolean;
	readonly InheritColor: AssetGroupName | null;
	/** @deprecated Use {@link Asset.AllowActivePose} instead */
	readonly FreezeActivePose?: never;
	readonly PreviewZone?: RectTuple;
	readonly DynamicGroupName: AssetGroupName;

	readonly MirrorActivitiesFrom?: AssetGroupItemName;
	readonly ArousalZone?: AssetGroupItemName;
	readonly ArousalZoneID?: number;

	/** A dict mapping colors to custom filename suffices.
	The "HEX_COLOR" key is special-cased to apply to all color hex codes. */
	readonly ColorSuffix: Readonly<Record<string, string>>;
	readonly ExpressionPrerequisite?: readonly AssetPrerequisite[];
	readonly HasPreviewImages: boolean;
	/** Return whether this group belongs to the `Appearance` {@link AssetGroup.Category} */
	IsAppearance(): this is AssetAppearanceGroup;
	/** Return whether this group belongs to the `Item` {@link AssetGroup.Category} */
	IsItem(): this is AssetItemGroup;
	/** Return whether this group belongs to the `Script` {@link AssetGroup.Category} */
	IsScript(): this is AssetScriptGroup;
}

/** An AssetGroup subtype for the `Appearance` {@link AssetGroup.Category} */
interface AssetAppearanceGroup extends AssetGroup {
	readonly Category: "Appearance";
	readonly Name: AssetGroupBodyName;
	readonly IsRestraint: false;
}

/** An AssetGroup subtype for the `Item` {@link AssetGroup.Category} */
interface AssetItemGroup extends AssetGroup {
	readonly Category: "Item";
	readonly Name: AssetGroupItemName;
	readonly Underwear: false;
	readonly BodyCosplay: false;
	readonly Clothing: false;
	readonly IsDefault: false;
	readonly Zone: readonly RectTuple[];
}

/** An AssetGroup subtype for the `Script` {@link AssetGroup.Category} */
interface AssetScriptGroup extends AssetGroup {
	readonly Category: "Script";
	readonly Name: AssetGroupScriptName;
	readonly IsRestraint: false;
	readonly BodyCosplay: false;
	readonly Underwear: false;
	readonly Clothing: false;
	readonly IsDefault: false;
}

/** Mapped type for mapping group names to their respective {@link AssetGroup} subtype */
type AssetGroupMap = (
	{[k in AssetGroupBodyName]: AssetAppearanceGroup}
	& {[k in AssetGroupItemName]: AssetItemGroup}
	& {[k in AssetGroupScriptName]: AssetScriptGroup}
);

/** An object defining a drawable layer of an asset */
interface AssetLayer {
	/** The name of the layer - may be null if the asset only contains a single default layer */
	readonly Name: string | null;
	/** whether or not this layer can be colored */
	readonly AllowColorize: boolean;
	/** if not null, specifies that this layer should always copy the color of the named layer */
	readonly CopyLayerColor: string | null;
	/** specifies the name of a color group that this layer belongs to. Any layers within the same color group can be colored together via the item color UI */
	readonly ColorGroup: string | null;
	/** whether or not this layer can be colored in the coloring UI */
	readonly HideColoring: boolean;
	/** A record mapping stringified {@link PartialType} values to a set of unique IDs. */
	readonly AllowTypes: AllowTypes.Data | null;
	/** @deprecated - superceded by {@link CreateLayerTypes} */
	readonly HasType?: never;
	/** The name of the parent group for this layer. If null, the layer has no parent group. If
	undefined, the layer inherits its parent group from it's asset/group. */
	readonly ParentGroupName: AssetGroupName | null;
	/** @deprecated - Superceded by {@link PoseMapping} */
	readonly AllowPose?: never;
	/** @deprecated - Superceded by {@link PoseMapping} */
	readonly HideForPose?: never;
	/** An array of objects mapping poses to other poses to determine their draw folder */
	readonly PoseMapping: Readonly<AssetPoseMapping>;
	/** The drawing priority of this layer. Inherited from the parent asset/group if not specified in the layer
	definition. */
	readonly Priority: number;
	readonly InheritColor: AssetGroupName | null;
	readonly Alpha: readonly Alpha.Data[];
	/** The asset that this layer belongs to */
	readonly Asset: Asset;
	readonly DrawingLeft: TopLeft.Data;
	readonly DrawingTop: TopLeft.Data;
	readonly HideAs?: Readonly<{ Group: AssetGroupName; Asset?: string }>;
	/** That layer is drawing at a fixed Y position */
	readonly FixedPosition?: boolean;
	readonly HasImage: boolean;
	readonly Opacity: number;
	readonly MinOpacity: number;
	readonly MaxOpacity: number;
	readonly BlendingMode: GlobalCompositeOperation;
	readonly LockLayer: boolean;
	readonly MirrorExpression?: AssetGroupName;
	/** @deprecated */
	readonly AllowModuleTypes?: never;
	/** The coloring index for this layer */
	readonly ColorIndex: number;
	/** Any group-specific alpha masks that should be applied when drawing the layer. Only available on layers that have
	been created prior to drawing */
	readonly GroupAlpha?: readonly Alpha.Data[];
	/** @deprecated - Superceded by {@link CreateLayerTypes} */
	readonly ModuleType?: never;
	readonly CreateLayerTypes: readonly string[];
	/* Specifies that this layer should not be drawn if the character is wearing any item with the given attributes */
	readonly HideForAttribute: readonly AssetAttribute[] | null;
	/* Specifies that this layer should not be drawn unless the character is wearing an item with one of the given attributes */
	readonly ShowForAttribute: readonly AssetAttribute[] | null;
	/** Used along with a hook to make layers of an asset disappear in some cases. */
	readonly Visibility: "Player" | "AllExceptPlayerDialog" | "Others" | "OthersExceptDialog" | "Owner" | "Lovers" | "Mistresses" | null;
	readonly ColorSuffix: Readonly<Record<string, string>> | null;
}

interface TintDefinition {
	Color: number | string;
	Strength: number;
	DefaultColor?: string;
}

interface ResolvedTintDefinition extends TintDefinition {
	Item: Item;
}

interface ExpressionTriggerBase<GroupName extends ExpressionGroupName> {
	Group: GroupName;
	Name: null | ExpressionNameMap[GroupName];
	Timer: number;
}
type ExpressionTriggerMap<T> = T extends ExpressionGroupName ? ExpressionTriggerBase<T> : never;
type ExpressionTrigger = ExpressionTriggerMap<ExpressionGroupName>;

interface ExpressionItem {
	Appearance: Item,
	Group: ExpressionGroupName,
	CurrentExpression: null | ExpressionName,
	ExpressionList: ExpressionName[],
}

/**
 * The internal Asset definition of an asset.
 *
 * See {@link AssetDefinition} in Female3DCG.d.ts for documentation.
 */
interface Asset {
	readonly Name: string;
	readonly Description: string;
	readonly Group: AssetGroup;
	readonly ParentItem?: string;
	readonly ParentGroupName: AssetGroupName | null;
	readonly Enable: boolean;
	readonly Visible: boolean;
	readonly NotVisibleOnScreen?: readonly string[];
	readonly Wear: boolean;
	readonly Activity: ActivityName | null;
	readonly AllowActivity?: readonly ActivityName[];
	readonly ActivityAudio?: readonly string[];
	readonly ActivityExpression: Readonly<Partial<Record<ActivityName, readonly ExpressionTrigger[]>>>;
	readonly AllowActivityOn?: readonly AssetGroupItemName[];
	readonly InventoryID?: number;
	readonly BuyGroup?: string;
	readonly Effect: readonly EffectName[];
	readonly Bonus?: AssetBonusName;
	readonly Block?: readonly AssetGroupItemName[];
	readonly Expose: readonly AssetGroupItemName[];
	readonly Hide?: readonly AssetGroupName[];
	readonly HideItem?: readonly string[];
	readonly HideItemExclude: readonly string[];
	readonly HideItemAttribute: readonly AssetAttribute[];
	readonly Require: readonly AssetGroupBodyName[];
	readonly SetPose?: readonly AssetPoseName[];
	/** @deprecated - Superceded by {@link Asset.PoseMapping} */
	readonly AllowPose?: never;
	/** @deprecated - Superceded by {@link Asset.PoseMapping} */
	readonly HideForPose?: never;
	readonly PoseMapping: Readonly<AssetPoseMapping>;
	readonly AllowActivePose?: readonly AssetPoseName[];
	/** @deprecated Use {@link Asset.AllowActivePose} instead */
	readonly WhitelistActivePose?: never;
	readonly Value: number;
	readonly NeverSell: boolean;
	readonly Difficulty: number;
	readonly SelfBondage: number;
	readonly SelfUnlock: boolean;
	readonly ExclusiveUnlock: boolean;
	readonly Random: boolean;
	readonly RemoveAtLogin: boolean;
	readonly WearTime: number;
	readonly RemoveTime: number;
	readonly RemoveTimer: number;
	readonly MaxTimer: number;
	readonly DrawingPriority?: number;
	readonly DrawingLeft: TopLeft.Data;
	readonly DrawingTop: TopLeft.Data;
	readonly HeightModifier: number;
	readonly ZoomModifier: number;
	readonly Alpha: null | readonly Alpha.Data[];
	readonly Prerequisite: readonly AssetPrerequisite[];
	readonly Extended: boolean;
	readonly AlwaysExtend: boolean;
	readonly AlwaysInteract: boolean;
	readonly AllowLock: boolean;
	readonly LayerVisibility: boolean;
	readonly IsLock: boolean;
	readonly PickDifficulty: number;
	readonly OwnerOnly: boolean;
	readonly LoverOnly: boolean;
	readonly FamilyOnly: boolean;
	readonly ExpressionTrigger?: readonly ExpressionTrigger[];
	readonly RemoveItemOnRemove: readonly { Name: string; Group: AssetGroupName; TypeRecord?: TypeRecord; }[];
	readonly AllowEffect?: readonly EffectName[];
	readonly AllowBlock?: readonly AssetGroupItemName[];
	readonly AllowHide?: readonly AssetGroupName[];
	readonly AllowHideItem?: readonly string[];
	/** @deprecated */
	readonly AllowTypes?: never;
	readonly AllowTighten?: boolean;
	/**
	 * The default color of the item: an array of length {@link Asset.ColorableLayerCount} consisting of {@link AssetGroup.DefaultColor} and/or valid color hex codes.
	 */
	readonly DefaultColor: readonly string[];
	readonly Opacity: number;
	readonly MinOpacity: number;
	readonly MaxOpacity: number;
	readonly EditOpacity: boolean;
	readonly Audio?: string;
	readonly Category?: readonly AssetCategory[];
	readonly Fetish?: readonly FetishName[];
	readonly CustomBlindBackground?: string;
	readonly ArousalZone: AssetGroupItemName;
	readonly IsRestraint: boolean;
	readonly BodyCosplay: boolean;
	readonly OverrideBlinking: boolean;
	readonly DialogSortOverride?: DialogSortOrder;
	readonly DynamicDescription: (C: Character) => string;
	readonly DynamicPreviewImage: (C: Character) => string;
	readonly DynamicAllowInventoryAdd: (C: Character) => boolean;
	readonly DynamicName: (C: Character) => string;
	readonly DynamicGroupName: AssetGroupName;
	readonly DynamicActivity: (C: Character) => ActivityName | null | undefined;
	readonly DynamicAudio: ((C: Character) => string) | null;
	readonly CharacterRestricted: boolean;
	readonly AllowRemoveExclusive: boolean;
	readonly InheritColor: null | AssetGroupName;
	readonly DynamicBeforeDraw: boolean;
	readonly DynamicAfterDraw: boolean;
	readonly DynamicScriptDraw: boolean;
	/** @deprecated - superceded by {@link CreateLayerTypes} */
	readonly HasType?: never;
	/**
	 * A module for which the layer can have types.
	 * Allows one to define different module-specific assets for a single layer.
	 */
	readonly CreateLayerTypes: readonly string[];
	/** A record that maps {@link ExtendedItemData.name} to a set with all option indices that support locks */
	readonly AllowLockType: null | Record<string, Set<number>>;
	readonly AllowColorizeAll: boolean;
	readonly AvailableLocations: readonly string[];
	readonly OverrideHeight?: Readonly<AssetOverrideHeight>;
	/** @deprecated Use {@link Asset.AllowActivePose} instead */
	readonly FreezeActivePose?: never;
	readonly DrawLocks: boolean;
	readonly AllowExpression?: readonly ExpressionName[];
	readonly MirrorExpression?: AssetGroupName;
	readonly FixedPosition: boolean;
	readonly Layer: readonly AssetLayer[];
	/** The number of colorable layers. Guaranteed to be >= 1 */
	readonly ColorableLayerCount: number;
	readonly Archetype?: ExtendedArchetype;
	readonly Attribute: readonly AssetAttribute[];
	readonly PreviewIcons: readonly InventoryIcon[];
	readonly Tint: readonly Readonly<TintDefinition>[];
	readonly AllowTint: boolean;
	readonly DefaultTint?: string;
	readonly Gender?: AssetGender;
	readonly CraftGroup: string;
	readonly ColorSuffix: Readonly<Record<string, string>>;
	readonly FullAlpha: boolean;
	readonly ExpressionPrerequisite?: readonly AssetPrerequisite[];
	readonly AllowColorize: boolean;
}

//#endregion

type ItemBundle = ServerItemBundle;

/** A tuple-based version of {@link ItemBundle} */
type WardrobeItemBundle = [
	Name: string,
	Group: AssetGroupName,
	Color?: ItemColor,
	Property?: ItemProperties,
];

/** An AppearanceBundle is whole minified appearance of a character */
type AppearanceBundle = ItemBundle[];

interface Pose {
	Name: AssetPoseName;
	Category: AssetPoseCategory;
	AllowMenu?: true;
	/** Only show in menu if an asset supports it */
	AllowMenuTransient?: true;
	OverrideHeight?: AssetOverrideHeight;
	MovePosition?: { Group: AssetGroupName; X: number; Y: number; }[];
}

type ActivityNameBasic = "Bite" | "Caress" | "Choke" | "Cuddle" | "FrenchKiss" |
	"GagKiss" | "GaggedKiss" | "Grope" | "HandGag" | "Kick" |
	"Kiss" | "Lick" | "MassageFeet" | "MassageHands" | "MasturbateFist" |
	"MasturbateFoot" |"MasturbateHand" | "MasturbateTongue" |
	"MoanGag" | "MoanGagAngry" | "MoanGagGiggle" | "MoanGagGroan" | "MoanGagTalk" |
	"MoanGagWhimper" | "Nibble" | "Nod" | "PenetrateFast" |
	"PenetrateSlow" | "Pet" | "Pinch" | "PoliteKiss" | "Pull" |
	"RestHead" | "Rub" | "Scratch" | "Sit" | "Slap" | "Spank" | "Step" | "StruggleArms" | "StruggleLegs" |
	"Suck" | "TakeCare" | "Tickle" | "Whisper" | "Wiggle" |
	"SistersHug" | "BrothersHandshake" | "SiblingsCheekKiss"
;

type ActivityNameItem = "Inject" | "MasturbateItem" | "PenetrateItem" | "PourItem" | "RollItem" | "RubItem" | "ShockItem" | "SipItem" | "SpankItem" | "TickleItem" | "EatItem" | "Scratch" | "ThrowItem";

type ActivityName = ActivityNameBasic | ActivityNameItem;

type ActivityPrerequisite =
	"AssEmpty" | "CantUseArms" | "CantUseFeet" | "CanUsePenis" | "CanUseTongue" | "HasVagina" | "IsGagged" | "MoveHead" |
	`Needs-${ActivityNameItem}` |
	"TargetCanUseTongue" | "TargetKneeling" | "TargetMouthBlocked" | "TargetMouthOpen" | "TargetZoneAccessible" | "TargetZoneNaked" |
	"UseArms" | "UseFeet" | "UseHands" | "UseMouth" | "UseTongue" | "VulvaEmpty" | "ZoneAccessible" | "ZoneNaked" |
	"Sisters" | "Brothers" | "SiblingsWithDifferentGender"
;

interface Activity {
	Name: ActivityName;
	ActivityID: number,
	MaxProgress: number;
	MaxProgressSelf?: number;
	Prerequisite: ActivityPrerequisite[];
	Target: AssetGroupItemName[];
	TargetSelf?: AssetGroupItemName[] | true;
	/** Whether to reverse the prerequisite checks for that one */
	Reverse?: true;
	/** used for setting {@link ExtendedItemAutoPunishHandled} */
	MakeSound?: boolean;
	/** An action that trigger when that activity is used */
	StimulationAction?: StimulationAction;
	/** The default expression for that activity. Can be overriden using ActivityExpression on the asset */
	ActivityExpression?: ExpressionTrigger[];
}

type ItemActivityRestriction = "blocked" | "limited" | "unavail";

interface ItemActivity {
	/** The activity performed */
	Activity: Activity;
	/** An optional item used for the activity. Null if the player is used their hand, for example. */
	Item?: Item;
	/** Whether the item is blocked or limited on the target character, or unavailable because the player is blocked. Undefined means no restriction. */
	Blocked?: ItemActivityRestriction;
}

type ItemColor = string | string[];

/** An item is a pair of asset and its dynamic properties that define a worn asset. */
interface Item {
	Asset: Asset;
	Color?: ItemColor;
	Difficulty?: number;
	Craft?: CraftingItem;
	Property?: ItemProperties;
}

type FavoriteIcon = "Favorite" | "FavoriteBoth" | "FavoritePlayer";
type ItemEffectIcon = "BlindLight" | "BlindNormal" | "BlindHeavy" | "DeafLight" | "DeafNormal" | "DeafHeavy" | "GagLight" | "GagNormal" | "GagHeavy" | "GagTotal";
type ShopIcon = "Extended" | "BuyGroup";
type InventoryIcon = (
	FavoriteIcon
	| ItemEffectIcon
	| "AllowedLimited"
	| "Handheld"
	| "Locked"
	| "LoverOnly"
	| "FamilyOnly"
	| "OwnerOnly"
	| "Unlocked"
	| AssetLockType
	| ShopIcon
);

interface InventoryItem {
	Group: AssetGroupName;
	Name: string;
	Asset: Asset;
}

type SkillType = "Bondage" | "SelfBondage" | "LockPicking" | "Evasion" | "Willpower" | "Infiltration" | "Dressage";

interface Skill {
	Type: SkillType;
	Level: number;
	Progress: number;
	Ratio?: number;
	ModifierLevel?: number;
	ModifierTimeout?: number;
}

type ReputationType =
	"Dominant" | "Kidnap" | "ABDL" | "Gaming" | "Maid" | "LARP" | "Asylum" | "Gambling" |
	"HouseMaiestas" | "HouseVincula" | "HouseAmplector" | "HouseCorporis";

interface Reputation {
	Type: ReputationType;
	Value: number;
}

interface Ownership {
	Name: string;
	MemberNumber: number;
	Stage: 0 | 1;
	Start: number;
}

interface Lovership {
	/** The name of the loved one. */
	Name: string;
	/** The member number of the loved one. Only exists for online characters */
	MemberNumber?: number;
	/** The stage of the love. 0 is Girlfriend, 1 is Fiancée, 2 is Wife */
	Stage?: 0 | 1 | 2;
	/** The timestamp of the beginning of the relationship */
	Start?: number;
	// Bad data sometimes received from server
	BeginDatingOfferedByMemberNumber?: never;
	BeginEngagementOfferedByMemberNumber?: never;
	BeginWeddingOfferedByMemberNumber?: never;
}

interface ScreenFunctions {
	// Required
	/**
	 * Called each frame
	 * @param {number} time - The current time for frame
	 */
	Run(time: number): void;
	/**
	 * Called if the user presses the mouse button or touches the touchscreen on the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	MouseDown?(event: MouseEvent | TouchEvent): void;
		/**
	 * Called if the user releases the mouse button or the touchscreen on the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	MouseUp?(event: MouseEvent | TouchEvent): void;
	/**
	 * Called if the user moves the mouse cursor or the touch on the touchscreen over the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	MouseMove?(event: MouseEvent | TouchEvent): void;
	/**
	 * Called if the user moves the mouse wheel on the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	MouseWheel?(event: WheelEvent): void;
	/**
	 * Called if the user clicks on the canvas
	 * @param {MouseEvent | TouchEvent} event - The event that triggered this
	 */
	Click(event: MouseEvent | TouchEvent): void;

	// Optional
	/** Called when screen is loaded using `CommonSetScreen` */
	Load?(): void;
	/** Called when this screen is being replaced */
	Unload?(): void;
	/** Called each frame when the screen needs to be drawn. */
	Draw?() : void;
	/**
	 * Called when screen size or position changes or after screen load
	 * @param {boolean} load - If the reason for call was load (`true`) or window resize (`false`)
	 */
	Resize?(load: boolean): void;
	/**
	 * Called if the the user presses any key
	 * @param {KeyboardEvent} event - The event that triggered this
	 */
	KeyDown?(event: KeyboardEvent): boolean;
	/**
	 * Called if the user releases a pressed key
	 * @param {KeyboardEvent} event - The event that triggered this
	 */
	KeyUp?(event: KeyboardEvent): void;
	/** Called when user presses Esc */
	Exit?(): void;
}

//#region Characters

/** The different types of (mutually exclusive) permissions an item or item option can have */
type ItemPermissionMode = "Default" | "Block" | "Limited" | "Favorite";

/**
 * A struct for representing an item with special permissions (limited, favorited, etc) in the client.
 */
interface ItemPermissions {
	/** Whether the item is hidden */
	Hidden: boolean;
	/** The permission associated with the item */
	Permission: ItemPermissionMode;
	/** The permission associated with specific extended options of the item */
	TypePermissions: Record<string, ItemPermissionMode>;
}

interface ScriptPermission {
	permission: number;
}

type ScriptPermissionProperty = "Hide" | "Block";

type ScriptPermissionLevel = "Self" | "Owner" | "Lovers" | "Friends" | "Whitelist" | "Public";

type ScriptPermissions = Record<ScriptPermissionProperty, ScriptPermission>;

interface DialogLine {
	Stage: string;
	NextStage: string;
	Option: string;
	Result: string;
	Function: string;
	Prerequisite: string;
	Group: string;
	Trait: string;
}

interface DialogInfo {
	module: ModuleType;
	screen: string;
	name: string;
}

/** The packed representation of a Private Room NPC */
interface PrivateCharacterData {
	Name: string;
	Love: number;
	Title: TitleName;
	Trait: NPCTrait[];
	Cage: boolean;
	Owner: string;
	Lover: string;
	AssetFamily: "Female3DCG";
	Appearance: AppearanceBundle,
	AppearanceFull: AppearanceBundle,
	ArousalSettings: Character["ArousalSettings"];
	Event: NPCTrait[];
	FromPandora?: boolean;
}

interface Character {
	/**
	 * The character's cache slot ID in the Character array
	 *
	 * Usually meaningless, except that ID 0 is always the player,
	 * but please use `IsPlayer()` instead of checking that.
	 */
	ID: number;
	/**
	 * The unique identifier for the character
	 *
	 * A value of `""` indicates the player before the login happens
	 */
	CharacterID: string;
	/** The type of character: online, npc, or simple */
	Type: CharacterType;
	/**
	 * The character's account name
	 *
	 * Note that it's only meaningful for the logged in player as the server never provides account names.
	 * Online characters will use `"Online-"` plus their character ID, NPCs will have their dialog identifier,
	 * and simple characters set it to CharacterID.
	 */
	AccountName: string;
	/**
	 * The character's loaded dialog info
	 */
	DialogInfo?: DialogInfo;
	/**
	 * A deprecated identifier for online characters
	 * Only exists on the player, has the same value as their character ID.
	 * @deprecated
	 */
	OnlineID?: string;
	/** The asset family used by the character */
	AssetFamily: IAssetFamily;
	Name: string;
	Nickname?: string;
	Owner: string;
	Lover: string;
	Money: number;
	Inventory: InventoryItem[];
	InventoryData?: string;
	Appearance: Item[];
	Stage: string;
	CurrentDialog: string;
	Dialog: DialogLine[];
	Reputation: Reputation[];
	Skill: Skill[];
	/**
	 * Get a copy or set the array of currently enabled poses.
	 * @see {@link PoseMapping} - The underlying record of this property, usage of which is recommended
	 */
	get Pose(): readonly AssetPoseName[];
	set Pose(value: readonly AssetPoseName[]);
	/**
	 * Get a copy or set the array of the last set of manually activated poses.
	 *
	 * Note that these poses are by no means guaranted to be enabled, as they do not reflect any item-specific automatic pose changes (see {@link Pose}).
	 * @see {@link ActivePoseMapping} - The underlying record of this property, usage of which is recommended
	 */
	get ActivePose(): readonly AssetPoseName[];
	set ActivePose(value: readonly AssetPoseName[]);
	/**
	 * Get a copy or set the array of the last of a subset of all allowed poses.
	 *
	 * Only guaranteed to reflect the total number of allowed poses if, for a given pose category, at least one pose is allowed.
	 * @see {@link ActivePoseMapping} - The underlying record of this property, usage of which is recommended
	 */
	get AllowedActivePose(): readonly AssetPoseName[];
	set AllowedActivePose(value: readonly AssetPoseName[]);
	/**
	 * Get a copy or set the array of something something poses.
	 * @see {@link DrawPoseMapping} - The underlying record of this property, usage of which is recommended
	 */
	get DrawPose(): readonly AssetPoseName[];
	set DrawPose(value: readonly AssetPoseName[]);
	/**
	 * A record mapping pose categories to the currently enabled pose belonging to it.
	 *
	 * @see {@link ItemProperties.SetPose} - The item-/asset-level equivalent of this property
	 */
	PoseMapping: Partial<Record<AssetPoseCategory, AssetPoseName>>;
	/**
	 * A record mapping pose categories to the last manually enabled pose belonging to it.
	 *
	 * Note that these poses are by no means guaranted to be enabled, as they do not reflect any item-specific automatic pose changes (see {@link PoseMapping}).
	 */
	ActivePoseMapping: Partial<Record<AssetPoseCategory, AssetPoseName>>;
	/**
	 * A record mapping pose categories to all allowed poses belonging to it.
	 *
	 * A value of `null` implies that all poses within the category are allowed.
	 *
	 * @see {@link ItemProperties.AllowActivePose} - The item-/asset-level equivalent of this property
	 */
	AllowedActivePoseMapping: Partial<Record<AssetPoseCategory, AssetPoseName[]>>;
	/**
	 * A record mapping pose categories to something something.
	 */
	DrawPoseMapping: Partial<Record<AssetPoseCategory, AssetPoseName>>;
	Effect: EffectName[];
	Tints: ResolvedTintDefinition[];
	Attribute: AssetAttribute[];
	FocusGroup: AssetItemGroup | null;
	Canvas: HTMLCanvasElement | null;
	CanvasBlink: HTMLCanvasElement | null;
	MustDraw: boolean;
	BlinkFactor: number;
	AllowItem: boolean;
	/** @deprecated - superseded by {@link Character.PermissionItems} */
	BlockItems?: never;
	/** @deprecated - superseded by {@link Character.PermissionItems} */
	FavoriteItems?: never;
	/** @deprecated - superseded by {@link Character.PermissionItems} */
	LimitedItems?: never;
	/** A record with all asset- and type-specific permission settings */
	PermissionItems: Partial<Record<`${AssetGroupName}/${string}`, ItemPermissions>>;
	WhiteList: number[];
	HeightModifier: number;
	MemberNumber?: number;
	ItemPermission?: 0 | 1 | 2 | 3 | 4 | 5;
	Ownership?: Ownership;
	Lovership?: Lovership[];
	ExpressionQueue?: ExpressionQueueItem[];
	CanTalk: () => boolean;
	CanWalk: () => boolean;
	CanKneel: () => boolean;
	CanInteract: () => boolean;

	/**
	 * Check whether a character can change its own outfit.
	 *
	 * @warning Only usable on Player
	 * @returns {boolean} - TRUE if changing is possible, FALSE otherwise.
	 */
	CanChangeOwnClothes: () => boolean;

	/**
	 * Check whether a character can change another one's outfit.
	 */
	CanChangeClothesOn: (C: Character) => boolean;
	IsRestrained: () => boolean;
	IsBlind: () => boolean;
	IsEnclose: () => boolean;
	IsChaste: () => boolean;
	IsVulvaChaste: () => boolean;
	IsBreastChaste: () => boolean;
	IsButtChaste: () => boolean;
	IsEgged: () => boolean;
	/**
	 * Whether the character is owned, and who owns it
	 */
	IsOwned: () => "online"|"npc"|"ggts"|"player"|false;
	/** Whether the character is owned by the given character */
	IsOwnedByCharacter: (C: Character) => boolean;
	/** Whether the character is owned by the given character, number form */
	IsOwnedByMemberNumber: (memberNumber: number) => boolean;
	/** Whether the character has completed their ownership trial */
	IsFullyOwned: () => boolean;
	/** The name of this character's owner */
	OwnerName: () => string;
	/** The character's owner number. Might be -1 for non-online characters */
	OwnerNumber: () => number;
	/** Whether the player owns that character */
	IsOwnedByPlayer: () => boolean;
	/** The number of days since the character has been owned (-1 means not owned) */
	OwnedSince: () => number;
	/** Whether the given character owns the player */
	IsOwner: () => boolean;
	IsKneeling: () => boolean;
	IsStanding: () => boolean;
	IsNaked: () => boolean;
	IsDeaf: () => boolean;
	IsGagged: () => boolean;
	HasNoItem: () => boolean;
	/** Whether the character is in love with the given character */
	IsLoverOfCharacter: (C: Character) => boolean;
	/** Whether the character is in love with the given character, number form */
	IsLoverOfMemberNumber: (memberNumber: number) => boolean;
	/** The character's lover name. NPC-only */
	LoverName: () => string;
	/** Whether the character is in love with the player */
	IsLoverOfPlayer: () => boolean;
	/** Returns the list of member numbers (or names, for NPCs) the character is in love with */
	GetLoversNumbers: (MembersOnly?: boolean) => (number | string)[];
	/** Returns the lovership data for the character */
	GetLovership: (MembersOnly?: boolean) => Lovership[];
	/** @deprecated Use IsLoverOfCharacter() */
	IsLover: (C: Character) => boolean;
	/** @deprecated - superseded by {@link Character.PermissionItems} */
	HiddenItems?: never;
	HeightRatio: number;
	HasHiddenItems: boolean;
	SavedColors: HSVColor[];
	GetBlindLevel: (eyesOnly?: boolean) => number;
	GetBlurLevel: () => number;
	IsLocked: () => boolean;
	IsMounted: () => boolean;
	IsPlugged: () => boolean;
	IsShackled: () => boolean;
	IsSlow: () => boolean;
	GetSlowLevel: () => number;
	IsMouthBlocked: () => boolean;
	IsMouthOpen: () => boolean;
	IsVulvaFull: () => boolean;
	IsAssFull: () => boolean;
	IsFixedHead: () => boolean;
	GetDeafLevel: () => number;
	CanPickLocks: () => boolean;
	IsEdged: () => boolean;
	IsPlayer: () => this is PlayerCharacter;
	IsBirthday: () => boolean;
    IsSiblingOfCharacter: (C: Character) => boolean;
	IsFamilyOfPlayer: () => boolean;
	IsInFamilyOfMemberNumber: (MemberNum: number) => boolean;
	IsOnline: () => this is Character;
	IsNpc: () => this is NPCCharacter;
	IsSimple: () => boolean;
	GetDifficulty: () => number;
	IsSuspended: () => boolean;
	IsInverted: () => boolean;
	CanChangeToPose: (Pose: AssetPoseName) => boolean;
	GetClumsiness: () => number;
	HasEffect: (Effect: EffectName) => boolean;
	HasTints: () => boolean;
	GetTints: () => RGBAColor[];
	HasAttribute: (attribute: AssetAttribute) => boolean;
	DrawAppearance?: Item[];
	AppearanceLayers?: Mutable<AssetLayer>[];
	Hooks: Map<CharacterHook, Map<string, () => void>> | null;
	RegisterHook: (hookName: CharacterHook, hookInstance: string, callback: () => void) => boolean;
	UnregisterHook: (hookName: CharacterHook, hookInstance: string) => boolean;
	RunHooks: (hookName: CharacterHook) => void;
	HeightRatioProportion?: number;
	GetGenders: () => AssetGender[];
	GetPronouns: () => CharacterPronouns;
	HasPenis: () => boolean;
	HasVagina: () => boolean;
	IsFlatChested: () => boolean;
	// Properties created in other places
	ArousalSettings?: ArousalSettingsType;
	AppearanceFull?: Item[];
	// Online character properties
	Title?: TitleName;
	LabelColor?: HexColor;
	Creation?: number;
	Description?: string;
	OnlineSharedSettings?: CharacterOnlineSharedSettings;
	Game?: CharacterGameParameters;
	MapData?: ChatRoomMapData;
	BlackList: number[];
	RunScripts?: boolean;
	HasScriptedAssets?: boolean;
	Cage?: boolean;
	Difficulty?: {
		Level: number;
		LastChange?: number;
	};
	ArousalZoom?: boolean;
	FixedImage?: string;
	Rule?: LogRecord[];
	Status?: string | null;
	StatusTimer?: number;
	Crafting?: (null | CraftingItem)[];
	LastMapData?: ChatRoomMapData;
	/**
	 * The custom background to use for the current room
	 * Only valid on {@link Player}
	 */
	CustomBackground?: string;
}

interface CharacterGameParameters {
	LARP?: GameLARPParameters,
	MagicBattle?: GameMagicBattleParameters,
	GGTS?: GameGGTSParameters,
	Poker?: GamePokerParameters,
	ClubCard?: GameClubCardParameters,
}

/**
 * The characters online shared settings.
 * @see {@link Character.OnlineSharedSettings}
 */
interface CharacterOnlineSharedSettings {
	AllowFullWardrobeAccess: boolean;
	BlockBodyCosplay: boolean;
	AllowPlayerLeashing: boolean;
	AllowRename: boolean;
	DisablePickingLocksOnSelf: boolean;
	GameVersion?: string;
	ItemsAffectExpressions: boolean;
	ScriptPermissions: ScriptPermissions;
	WheelFortune: string;
}

type NPCArchetype =
	/* Pandora NPCs */
	"MemberNew"|"MemberOld"|"Cosplay"|"Mistress"|"Slave"|"Maid"|"Guard"|
	/* Pandora Special */
	"Victim"|"Target"|"Chest"|
	// Misc
	"Dominatrix" | "Nurse" | "Submissive" | "Mistress" | "Patient" | "Maid" | "Mistress" | "Maiestas" | "Vincula" | "Amplector" | "Corporis" | "AnimeGirl" | "Bunny" | "Succubus"
	;

/** NPC Character extension */
// FIXME: That one should find its way down to NPCCharacter, but
// there's too many accesses to those properties from Character
// to do so.
interface Character {
	/** NPC type: Slave, Maid, etc. */
	Archetype?: NPCArchetype;
	Love?: number; /** The NPC's love value */
	WillRelease?(): boolean; /** Shop NPC-only: will it release the player when asked */
}

/** NPC-only */
interface NPCCharacter extends Character {
	Archetype?: NPCArchetype;
	Trait?: NPCTrait[];
	Event?: NPCTrait[];
	Affection?: number;
	Domination?: number;
}

/** College & Asylum */
interface NPCCharacter {
	GoneAway?: boolean;
}

/** Movie Studio */
interface NPCCharacter {
	TrialDone?: boolean;
	CanGetLongDuster?: boolean;
	CanGetForSaleSign?: boolean;
	OweFavor?: boolean;
	KissCount?: number;
	MasturbateCount?: number;
	ClothesTaken?: boolean;
}

/** Sarah */
interface Character {
	OrgasmMeter?: number;
	OrgasmDone?: boolean;
}

/** Private Room & Private Bed */
interface Character {
	PrivateBed?: boolean;
	PrivateBedActivityTimer?: number;
	PrivateBedLeft?: number;
	PrivateBedTop?: number;
	PrivateBedMoveTimer?: number;
	PrivateBedAppearance?: string;
}

interface KidnapCard {
	Move: number;
	Value?: number;
}

/** Kidnap minigame */
interface Character {
	KidnapWillpower?: number;
	KidnapMaxWillpower?: number;
	KidnapCard?: KidnapCard[];
	KidnapStat?: [number, number, number, number];
}

type PandoraPrisonActivity = "Beat" | "Water" | "Transfer" | "Quickie" | "Strip" | "Chastity" | "Tickle" | "ChangeBondage";

/** Pandora NPCs */
interface Character {
	Recruit?: number;
	RecruitOdds?: number;
	RandomOdds?: number;
	QuizLog?: number[];
	QuizFail?: number;
	AllowMove?: boolean;
	DrinkValue?: number;
	TriggerIntro?: boolean;
	FromPandora?: boolean;
	// Pandora Prison
	LastActivity?: PandoraPrisonActivity;
}

/** Magic School */
interface Character {
	House?: "" | MagicSchoolHouse;
}

/** MovieStudio */
interface Character {
	Friendship?: string;
	InterviewCleanCount?: number;
}

/** Slave market */
interface Character {
	ExpectedTraining?: number;
	CurrentTraining?: number;
	TrainingIntensity?: number;
	TrainingCount?: number;
	TrainingCountLow?: number;
	TrainingCountHigh?: number;
	TrainingCountPerfect?: number;
}

interface ExtensionSettings {
	[key: string]: any;
}

interface ControllerSettingsOld {
	ControllerA: number;
	ControllerB: number;
	ControllerX: number;
	ControllerY: number;
	ControllerStickUpDown: number;
	ControllerStickLeftRight: number;
	ControllerStickRight: number;
	ControllerStickDown: number;
	ControllerDPadUp: number;
	ControllerDPadDown: number;
	ControllerDPadLeft: number;
	ControllerDPadRight: number;
}

interface PlayerCharacter extends Character {
	// PreferenceInitPlayer() must be updated with defaults, when adding a new setting
	ChatSettings?: ChatSettingsType;
	VisualSettings?: VisualSettingsType;
	AudioSettings?: AudioSettingsType;
	ControllerSettings?: ControllerSettingsType;
	GameplaySettings?: GameplaySettingsType;
	ImmersionSettings?: ImmersionSettingsType;
	/** The chat room we were previous in. Used for relog room re-creation */
	// TODO: the fact that this is set *might* be used to also fold the "relog" enabled checks
	// If we have a chatroom, then we relog to it. If we don't, then the player didn't have the
	// setting enabled in the first place
	LastChatRoom?: ChatRoomSettings;
	RestrictionSettings?: RestrictionSettingsType;
	OnlineSettings?: PlayerOnlineSettings;
	GraphicsSettings?: GraphicsSettingsType;
	NotificationSettings?: NotificationSettingsType;
	GhostList?: number[];
	Wardrobe?: ItemBundle[][];
	WardrobeCharacterNames?: string[];
	SavedExpressions?: ({ Group: ExpressionGroupName, CurrentExpression?: ExpressionName }[] | null)[];
	SavedColors: HSVColor[];
	FriendList?: number[];
	FriendNames?: Map<number, string>;
	SubmissivesList?: Set<number>;
	ChatSearchFilterTerms?: string;
	GenderSettings: GenderSettingsType;
	/** The list of items we got confiscated in the Prison */
	ConfiscatedItems?: { Group: AssetGroupName, Name: string }[];
	ExtensionSettings: ExtensionSettings;
}

/** A type defining which genders a setting is active for */
interface GenderSetting {
	/** Whether the setting is active for female cases */
	Female: boolean;
	/** Whether the setting is active for male cases */
	Male: boolean;
}

interface GenderSettingsType {
	HideShopItems: GenderSetting;
	AutoJoinSearch: GenderSetting;
	HideTitles: GenderSetting;
}

interface NotificationSettingsType {
	/** @deprecated */
	Audio?: boolean;
	Beeps: NotificationSetting;
	/** @deprecated */
	Chat?: any;
	ChatMessage: NotificationSetting & {
		/** @deprecated */
		IncludeActions?: any;
		Mention?: boolean;
		Normal?: boolean;
		Whisper?: boolean;
		Activity?: boolean;
	};
	/** @deprecated */
	ChatActions?: any;
	ChatJoin: NotificationSetting & {
		/** @deprecated */
		Enabled?: any;
		Owner?: boolean;
		Lovers?: boolean;
		Friendlist?: boolean;
		Subs?: boolean;
	};
	Disconnect: NotificationSetting;
	Larp: NotificationSetting;
	Test: NotificationSetting;
}

interface GraphicsSettingsType {
	Font: GraphicsFontName;
	InvertRoom: boolean;
	StimulationFlashes: boolean;
	DoBlindFlash: boolean;
	AnimationQuality: number;
	StimulationFlash: boolean;
	SmoothZoom: boolean;
	CenterChatrooms: boolean;
	AllowBlur: boolean;
	ShowFPS: boolean;
	/** 0 means unlimited */
	MaxFPS: number;
	MaxUnfocusedFPS: number;
}

interface RestrictionSettingsType {
	BypassStruggle: boolean;
	SlowImmunity: boolean;
	BypassNPCPunishments: boolean;
	NoSpeechGarble: boolean;
}

interface ImmersionSettingsType {
	/** @deprecated Removed as it prevents players from having the possibility of using OOC to discuss the scene */
	BlockGaggedOOC: never;
	StimulationEvents: boolean;
	ReturnToChatRoom: boolean;
	ReturnToChatRoomAdmin: boolean;
	ChatRoomMapLeaveOnExit: boolean;
	SenseDepMessages: boolean;
	ChatRoomMuffle: boolean;
	BlindAdjacent: boolean;
	AllowTints: boolean;
	/**
	 * Whether garbled messages that have a non-garbled variant will be decoded.
	 */
	ShowUngarbledMessages: boolean;
}

type ControllerButton = typeof ControllerButton[keyof typeof ControllerButton];
type ControllerAxis = typeof ControllerAxis[keyof typeof ControllerAxis];

interface ControllerSettingsType {
	ControllerActive: boolean;
	ControllerSensitivity: number;
	ControllerDeadZone: number;
	Buttons: Record<ControllerButton, number>;
	Axis: Record<ControllerAxis, number>;
}

interface ChatSettingsType {
	ColorActions: boolean;
	ColorActivities: boolean;
	ColorEmotes: boolean;
	ColorNames: boolean;
	ColorTheme: ChatColorThemeType;
	DisplayTimestamps: boolean;
	EnterLeave: ChatEnterLeaveType;
	FontSize: ChatFontSizeType;
	MemberNumbers: ChatMemberNumbersType;
	MuStylePoses: boolean;
	ShowActivities: boolean;
	ShowAutomaticMessages: boolean;
	ShowBeepChat: boolean;
	ShowChatHelp: boolean;
	ShrinkNonDialogue: boolean;
	WhiteSpace: "" | "Preserve";
	/** @deprecated */
	AutoBanBlackList?: any;
	/** @deprecated */
	AutoBanGhostList?: any;
	/** @deprecated */
	SearchFriendsFirst?: any;
	/** @deprecated */
	DisableAnimations?: any;
	/** @deprecated */
	SearchShowsFullRooms?: any;
	CensoredWordsList: string;
	CensoredWordsLevel: number;
	/** Whether to preserve the chat log when switching rooms */
	PreserveChat: boolean;
	OOCAutoClose: boolean;
}

interface GameplaySettingsType {
	SensDepChatLog: SettingsSensDepName;
	BlindDisableExamine: boolean;
	DisableAutoRemoveLogin: boolean;
	ImmersionLockSetting: boolean;
	EnableSafeword: boolean;
	DisableAutoMaid: boolean;
	OfflineLockedRestrained: boolean;
}

interface AudioSettingsType {
	Volume: number;
	MusicVolume: number;
	PlayBeeps: boolean;
	/** Play items sounds in chatrooms */
	PlayItem: boolean;
	/** Play sounds only if the player is involved */
	PlayItemPlayerOnly: boolean;
	Notifications: boolean;
}

interface VisualSettingsType {
	ForceFullHeight?: boolean;
	UseCharacterInPreviews?: boolean;
	MainHallBackground?: string;
	PrivateRoomBackground?: string;
}

/**
 * The player's online settings.
 * @see {@link Player.OnlineSettings}
 */
interface PlayerOnlineSettings {
	AutoBanBlackList: boolean;
	AutoBanGhostList: boolean;
	DisableAnimations: boolean;
	SearchShowsFullRooms: boolean;
	SearchFriendsFirst: boolean;
	SendStatus?: boolean;
	ShowStatus?: boolean;
	EnableAfkTimer: boolean;
	ShowRoomCustomization: 0 | 1 | 2 | 3; // 0 - Never, 1 - No by default, 2 - Yes by default, 3 - Always
	FriendListAutoRefresh: boolean;
}

/** Pandora Player extension */
interface PlayerCharacter {
	Infiltration?: InfiltrationType;
}

interface InfiltrationType {
	Punishment?: {
		Minutes: number;
		Timer?: number;
		Background: string;
		Difficulty: number;
		FightDone?: boolean;
	}
	Perks?: string;
}

/** Kinky Dungeon Player extension */
interface PlayerCharacter {
	KinkyDungeonKeybindings?: any;
	KinkyDungeonExploredLore?: any[];
}

interface NPCTrait {
	Name: string;
	Value: number;
}

//#endregion

//#region Extended items

/**
 * An interface with all available element metadata fields.
 * Note that only a subset of fields are generally used by a given archetype.
 * @see {@link ElementData}
 * @see {@link ExtendedItemDrawData}
 */
interface ElementMetaData {
	/** Whether to draw an element-accompanying image or not */
	drawImage?: boolean,
	/**
	 * The static image path of the to-be drawn image.
	 * A value of `null` either implies that it should not be drawn (per {@link ElementMetaData.drawImage})
	 * or that it's a dynamic image path (_e.g._ modular item modules).
	 */
	imagePath?: null | string,
	/** The name of a supported thumbnail image in \CSS\Styles.css that will show the current position on the slider */
	icon?: ThumbIcon,
	/** Whether an options shows up in the UI. Useful for options that are managed programmatically. */
	hidden?: boolean,
}

declare namespace ElementMetaData {
	interface Typed { drawImage: boolean, hidden: boolean, imagePath: null | string }
	interface Modular { drawImage: boolean, hidden: boolean, imagePath: null | string }
	interface Vibrating  { drawImage: false, hidden: false, imagePath: null }
	interface Text {}
	interface VariableHeight { icon: ThumbIcon }
	type NoArch = ElementMetaData;
}

/** @see {@link ElementData} */
type ElementConfigData<MetaData extends ElementMetaData> = {
	/** A 4-tuple with X & Y coordinates, width and height. */
	position?: PartialRectTuple,
} & MetaData;

/**
 * An interface with element coordinates and additional (archetype-specific metadata).
 * @template MetaData A record with (archetype-specific) additional element metadata
 * @see {@link ExtendedItemDrawData}
 */
type ElementData<MetaData extends ElementMetaData> = {
	/** A 4-tuple with X & Y coordinates, width and height. */
	position: RectTuple,
} & MetaData;

/** @see {@link ExtendedItemDrawData} */
interface ExtendedItemConfigDrawData<MetaData extends ElementMetaData> {
	/** An array with two-tuples of X and Y coordinates for the buttons and, optionally, the buttons width and height */
	elementData?: ElementConfigData<MetaData>[],
	/** The number of buttons to be drawn per page */
	itemsPerPage?: number,
}

/** @see {@link ExtendedItemDrawData} */
interface VariableHeightConfigDrawData extends ExtendedItemConfigDrawData<{}> {
	elementData: { position: RectTuple, icon: ThumbIcon }[],
}

/** @see {@link ExtendedItemDrawData} */
interface NoArchConfigDrawData extends ExtendedItemConfigDrawData<ElementMetaData> {
	elementData?: ElementData<ElementMetaData>[],
}

/**
 * An interface with element-specific drawing data for a given screen.
 * @template MetaData A record with (archetype-specific) additional element metadata
 */
interface ExtendedItemDrawData<MetaData extends ElementMetaData> extends Required<ExtendedItemConfigDrawData<MetaData>> {
	/** A list of {@link ElementData} interfaces, one for each to-be drawn element (_e.g._ buttons) */
	elementData: ElementData<MetaData>[],
	/** The number of pages */
	pageCount: number,
	/** Whether pagination is required; i.e. if the number of buttons is larger than {@link ExtendedItemDrawData.itemsPerPage} */
	paginate: boolean,
}

type ExtendedItemHeaderCallback<DataType extends ExtendedItemData<any>> = (
	data: DataType,
	C: Character,
	item: Item,
) => string;

/** A record containing various dialog keys used by the extended item screen */
interface ExtendedItemDialog<
	DataType extends ExtendedItemData<any>,
	OptionType extends ExtendedItemOption,
> {
	/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
	header: string | ExtendedItemHeaderCallback<DataType>;
	/** The dialogue prefix for the name of each module */
	module?: string;
	/** The dialogue prefix for the name of each option */
	option?: string;
	/** The dialogue prefix that will be used for each of the item's chatroom messages */
	chat?: string | ExtendedItemChatCallback<OptionType>;
	/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
	npc?: string | ExtendedItemNPCCallback<OptionType>;
}


/** A record containing various dialog keys used by the extended item screen */
interface ExtendedItemCapsDialog<
	DataType extends ExtendedItemData<any>,
	OptionType extends ExtendedItemOption,
> {
	/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
	Header?: string | ExtendedItemHeaderCallback<DataType>;
	/** The dialogue prefix for the name of each module */
	Module?: string;
	/** The dialogue prefix for the name of each option */
	Option?: string;
	/** The dialogue prefix that will be used for each of the item's chatroom messages */
	Chat?: string | ExtendedItemChatCallback<OptionType>;
	/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
	Npc?: string | ExtendedItemNPCCallback<OptionType>;
}

/** Basic callback for extended item script hooks */
type ExtendedItemScriptHookCallback<DataType extends ExtendedItemData<any>, T extends any[], RT=void> = (
	data: DataType,
	originalFunction: null | ((...args: T) => RT),
	...args: T,
) => RT;

type ExtendedItemScriptHookCallbackNoNull<DataType extends ExtendedItemData<any>, T extends any[], RT=void> = (
	data: DataType,
	originalFunction: ((...args: T) => RT),
	...args: T,
) => RT;

/** Basic callback for extended item functions */
type ExtendedItemCallback<T extends any[], RT=void> = (
	...args: T,
) => RT;

/** An interface-based version of {@link ExtendedItemScriptHookCallbacks} with decapitalized keys */
interface ExtendedItemScriptHookStruct<
	DataType extends ExtendedItemData<any>,
	OptionType extends ExtendedItemOption
> {
	init: ExtendedItemScriptHookCallbacks.Init<DataType>,
	load: ExtendedItemScriptHookCallbacks.Load<DataType>,
	draw: ExtendedItemScriptHookCallbacks.Draw<DataType>,
	click: ExtendedItemScriptHookCallbacks.Click<DataType>,
	exit: null | ExtendedItemScriptHookCallbacks.Exit<DataType>,
	validate: null | ExtendedItemScriptHookCallbacks.Validate<DataType, OptionType>,
	publishAction: null | ExtendedItemScriptHookCallbacks.PublishAction<DataType, OptionType>,
	setOption: null | ExtendedItemScriptHookCallbacks.SetOption<DataType, OptionType>,
	beforeDraw: null | ExtendedItemScriptHookCallbacks.BeforeDraw<DataType>,
	afterDraw: null | ExtendedItemScriptHookCallbacks.AfterDraw<DataType>,
	scriptDraw: null | ExtendedItemScriptHookCallbacks.ScriptDraw<DataType>,
}

/** An interface-based version of {@link ExtendedItemScriptHookCallbacks} */
interface ExtendedItemCapsScriptHooksStruct<
	DataType extends ExtendedItemData<any>,
	OptionType extends ExtendedItemOption
> {
	Init?: ExtendedItemScriptHookCallbacks.Init<DataType>,
	Load?: ExtendedItemScriptHookCallbacks.Load<DataType>,
	Draw?: ExtendedItemScriptHookCallbacks.Draw<DataType>,
	Click?: ExtendedItemScriptHookCallbacks.Click<DataType>,
	Exit?: ExtendedItemScriptHookCallbacks.Exit<DataType>,
	Validate?: ExtendedItemScriptHookCallbacks.Validate<DataType, OptionType>,
	PublishAction?: ExtendedItemScriptHookCallbacks.PublishAction<DataType, OptionType>,
	SetOption?: ExtendedItemScriptHookCallbacks.SetOption<DataType, OptionType>,
	BeforeDraw?: ExtendedItemScriptHookCallbacks.BeforeDraw<DataType>,
	AfterDraw?: ExtendedItemScriptHookCallbacks.AfterDraw<DataType>,
	ScriptDraw?: ExtendedItemScriptHookCallbacks.ScriptDraw<DataType>,
}

/** An interface-based version of {@link ExtendedItemCallbacks} with decapitalized keys*/
interface ExtendedItemCallbackStruct<
	OptionType extends ExtendedItemOption
> {
	init: ExtendedItemCallbacks.Init,
	load: ExtendedItemCallbacks.Load,
	draw: ExtendedItemCallbacks.Draw,
	click: ExtendedItemCallbacks.Click,
	exit?: ExtendedItemCallbacks.Exit,
	validate?: ExtendedItemCallbacks.Validate<OptionType>,
	publishAction?: ExtendedItemCallbacks.PublishAction<OptionType>,
	setOption?: ExtendedItemCallbacks.SetOption<OptionType>,
	beforeDraw?: ExtendedItemCallbacks.BeforeDraw,
	afterDraw?: ExtendedItemCallbacks.AfterDraw,
	scriptDraw?: ExtendedItemCallbacks.ScriptDraw,
}

/** Namespace with item-specific functions typically called by extended items. */
declare namespace ExtendedItemCallbacks {
	/**
	 * Callback for extended item `Load` functions.
	 * `Load` functions are responsible for setting up the UI when initially opening the extended item menu.
	 */
	type Load = ExtendedItemCallback<[]>;
	/**
	 * Callback for extended item `Draw` functions.
	 * `Draw` functions are responsible for drawing any UI elements within the extended item menu.
	 */
	type Draw = ExtendedItemCallback<[]>;
	/**
	 * Callback for extended item `Click` functions.
	 * `Click` functions are responsible for managing any mouse clicks within the extended item menu.
	 */
	type Click = ExtendedItemCallback<[]>;
	/**
	 * Callback for extended item `Exit` functions.
	 * `Exit` functions are responsible for cleaning up any UI elements when closing the extended item menu.
	 */
	type Exit = ExtendedItemCallback<[]>;
	/**
	 * Callback for extended item `Validate` functions.
	 * `Validate` functions are responsible for validating any change in an item's properties.
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 * @param permitExisting - Determines whether the validation should allow the new option and previous option
	 * to be identical. Defaults to false.
	 * @returns A non-empty message string if the item failed validation, or an empty string otherwise
	 */
	type Validate<
		OptionType extends ExtendedItemOption
	> = ExtendedItemCallback<[C: Character, item: Item, newOption: OptionType, previousOption: OptionType, permitExisting?: boolean], string>;
	/**
	 * Callback for extended item `PublishAction` functions.
	 * `PublishAction` functions are responsible for reporting any changes to an item's properties via a chat message.
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 */
	type PublishAction<
		OptionType extends ExtendedItemOption
	> = ExtendedItemCallback<[C: Character, item: Item, newOption: OptionType, previousOption: OptionType]>;
	/**
	 * Callback for extended item `Init` functions.
	 * `Init` functions are responsible for setting the initial properties of an extended item.
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param push Whether to push to changes to the server
	 * @param refresh Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
	 * @returns Whether the items properties were actually updated or not
	 */
	type Init = ExtendedItemCallback<[C: Character, item: Item, push: boolean, refresh: boolean], boolean>;
	/**
	 * Callback for extended item `SetOption` functions.
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 * @param push Whether to push to changes to the server
	 * @param refresh Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
	 */
	type SetOption<
		OptionType extends ExtendedItemOption
	> = ExtendedItemCallback<[C: Character, item: Item, newOption: OptionType, previousOption: OptionType, push: boolean, refresh: boolean]>;
	/**
	 * Callback for extended item `AfterDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicAfterDraw}.
	 * @param drawData The dynamic draw data
	 */
	type AfterDraw<
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemCallback<[drawData: DynamicDrawingData<PersistentData>]>;
	/**
	 * Callback for extended item `BeforeDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicBeforeDraw}.
	 * @param drawData The dynamic draw data
	 * @returns A record with any and all to-be overriden draw data
	 */
	type BeforeDraw<
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemCallback<[drawData: DynamicDrawingData<PersistentData>], DynamicBeforeDrawOverrides>;
	/**
	 * Callback for extended item `ScriptDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicScriptDraw}.
	 * @param drawData The dynamic draw data
	 */
	type ScriptDraw<
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemCallback<[drawData: DynamicScriptCallbackData<PersistentData>]>;
}

/**
 * Namespace with item-specific script hooks used for constructing typical extended items functions.
 * @see {@link ExtendedItemCallbacks}
 */
declare namespace ExtendedItemScriptHookCallbacks {
	/**
	 * Callback for extended item `Load` script hooks.
	 * `Load` functions are responsible for setting up the UI when initially opening the extended item menu.
	 * @param data The items extended item data
	 * @param originalFunction The function that is normally called when an archetypical item reaches this point
	 */
	type Load<
		DataType extends ExtendedItemData<any>
	> = ExtendedItemScriptHookCallbackNoNull<DataType, []>;
	/**
	 * Callback for extended item `Draw` script hooks.
	 * `Draw` functions are responsible for drawing any UI elements within the extended item menu.
	 * @param data The items extended item data
	 * @param originalFunction The function that is normally called when an archetypical item reaches this point
	 */
	type Draw<
		DataType extends ExtendedItemData<any>
	> = ExtendedItemScriptHookCallbackNoNull<DataType, []>;
	/**
	 * Callback for extended item `Click` script hooks.
	 * `Click` functions are responsible for managing any mouse clicks within the extended item menu.
	 * @param data The items extended item data
	 * @param originalFunction The function that is normally called when an archetypical item reaches this point
	 */
	type Click<
		DataType extends ExtendedItemData<any>
	> = ExtendedItemScriptHookCallbackNoNull<DataType, []>;
	/**
	 * Callback for extended item `Exit` script hooks.
	 * `Exit` functions are responsible for cleaning up any UI elements when closing the extended item menu.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 */
	type Exit<
		DataType extends ExtendedItemData<any>
	> = ExtendedItemScriptHookCallback<DataType, []>;
	/**
	 * Callback for extended item `Validate` script hooks.
	 * `Validate` functions are responsible for validating any change in an item's properties.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 * @param permitExisting - Determines whether the validation should allow the new option and previous option
	 * to be identical. Defaults to false.
	 * @returns A non-empty message string if the item failed validation, or an empty string otherwise
	 */
	type Validate<
		DataType extends ExtendedItemData<any>,
		OptionType extends ExtendedItemOption
	> = ExtendedItemScriptHookCallback<DataType, [C: Character, item: Item, newOption: OptionType, previousOption: OptionType, permitExisting?: boolean], string>;
	/**
	 * Callback for extended item `PublishAction` script hooks.
	 * `PublishAction` functions are responsible for reporting any changes to an item's properties via a chat message.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 */
	type PublishAction<
		DataType extends ExtendedItemData<any>,
		OptionType extends ExtendedItemOption
	> = ExtendedItemScriptHookCallback<DataType, [C: Character, item: Item, newOption: OptionType, previousOption: OptionType]>;
	/**
	 * Callback for extended item `Init` script hooks.
	 * `Init` functions are responsible for setting the initial properties of an extended item.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param push Whether to push to changes to the server
	 * @param refresh Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
	 * @returns Whether the items properties were actually updated or not
	 */
	type Init<
		DataType extends ExtendedItemData<any>
	> = ExtendedItemScriptHookCallbackNoNull<DataType, [C: Character, item: Item, push: boolean, refresh: boolean], boolean>;
	/**
	 * Callback for extended item `SetOption` functions.
	 * @param data The items extended item data
	 * @param originalFunction The function that is normally called when an archetypical item reaches this point
	 * @param C The character that has the item equiped
	 * @param item The item in question
	 * @param newOption The newly selected extended item option
	 * @param previousOption The previusly selected extended item option
	 * @param push Whether to push to changes to the server
	 * @param refresh Whether to refresh the character. This should generally be `true`, with custom script hooks being a potential exception.
	 * @returns
	 */
	type SetOption<
		DataType extends ExtendedItemData<any>,
		OptionType extends ExtendedItemOption
	> = ExtendedItemScriptHookCallback<DataType, [C: Character, item: Item, newOption: OptionType, previousOption: OptionType, push: boolean, refresh: boolean]>;
	/**
	 * Callback for extended item `AfterDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicAfterDraw}.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param drawData The dynamic draw data
	 */
	type AfterDraw<
		DataType extends ExtendedItemData<any>,
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemScriptHookCallback<DataType, [drawData: DynamicDrawingData<PersistentData>]>;
	/**
	 * Callback for extended item `BeforeDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicBeforeDraw}.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param drawData The dynamic draw data
	 * @returns A record with any and all to-be overriden draw data
	 */
	type BeforeDraw<
		DataType extends ExtendedItemData<any>,
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemScriptHookCallback<DataType, [drawData: DynamicDrawingData<PersistentData>], DynamicBeforeDrawOverrides>;
	/**
	 * Callback for extended item `ScriptDraw` functions.
	 * Relevant for assets that define {@link Asset.DynamicScriptDraw}.
	 * @param data The items extended item data
	 * @param originalFunction The function (if any) that is normally called when an archetypical item reaches this point
	 * @param drawData The dynamic draw data
	 */
	type ScriptDraw<
		DataType extends ExtendedItemData<any>,
		PersistentData extends Record<string, any> = Record<string, unknown>
	> = ExtendedItemScriptHookCallback<DataType, [drawData: DynamicScriptCallbackData<PersistentData>]>;
}

/** Union of all (archetype-specific) {@link ExtendedItemData.chatSetting} allowed values. */
type ExtendedItemChatSetting = "default" | TypedItemChatSetting | ModularItemChatSetting;

/**
 * Abstract extended item data interface that all archetypical item data interfaces must implement.
 * Archetypes are free to demand any appropriate subtype for a given property.
 */
interface ExtendedItemData<OptionType extends ExtendedItemOption> {
	/** The archetype of the extended item data */
	archetype: ExtendedArchetype;
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item.
	 * Archetypes must use the `"default"` literal string as default value.
	 */
	chatSetting: ExtendedItemChatSetting;
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: ExtendedItemDialog<any, OptionType>;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	scriptHooks: ExtendedItemScriptHookStruct<any, OptionType>;
	/** The asset reference */
	asset: Asset;
	/** A key uniquely identifying the asset */
	key: string;
	/** The common prefix used for all extended item functions associated with the asset */
	functionPrefix: string;
	/** The common prefix used for all dynamic asset hook functions for the asset */
	dynamicAssetsFunctionPrefix: string;
	/** An array of the chat message tags that should be included in the item's chatroom messages. */
	chatTags: CommonChatTags[];
	/** Contains custom dictionary entries in the event that the base ones do not suffice. */
	dictionary: ExtendedItemDictionaryCallback<OptionType>[];
	/**
	 * To-be initialized properties independent of the selected item module(s).
	 * Relevant if there are properties that are (near) exclusively managed by {@link ExtendedItemData.scriptHooks} functions.
	 */
	baselineProperty: PropertiesNoArray.Item | null;
	/** The extended item option of the super screen that this archetype was initialized from (if any) */
	parentOption: null | ExtendedItemOption;
	/** An interface with element-specific drawing data for a given screen. */
	drawData: ExtendedItemDrawData<{}>;
	/**
	 * A list with extra to-be allowed effect names.
	 * Should only defined when there are effects that are exclusively managed by script hooks and thus cannot be extracted from the normal extended item options.
	 */
	allowEffect: readonly EffectName[];
	/**
	 * The unique name for this (sub)-screen used for the automatic construction of {@link ItemProperties.TypeRecord} keys.
	 * Names *should* be short.
	 *
	 * If not explicitly specified defaults to the name of {@link ExtendedItemData.parentOption}
	 * for sub screens and the name of the archetype in case of the (outer-most) super screen.
	 */
	name: string;
}

/** A struct-type that maps archetypes to their respective extended item data.  */
interface ExtendedDataLookupStruct {
	[ExtendedArchetype.TYPED]: TypedItemData;
	[ExtendedArchetype.MODULAR]: ModularItemData;
	[ExtendedArchetype.VIBRATING]: VibratingItemData;
	[ExtendedArchetype.VARIABLEHEIGHT]: VariableHeightData;
	[ExtendedArchetype.TEXT]: TextItemData;
	[ExtendedArchetype.NOARCH]: NoArchItemData;
}

interface AssetOverrideHeight {
	Height: number;
	Priority: number;
	HeightRatioProportion?: number;
}

/**
 * The type for OverridePriority in extended items.
 *
 * Either a single number that will cause all of the asset's layer to
 * inherit that priority, or a more precise specifier keyed by layer name.
 */
type AssetLayerOverridePriority = Record<string, number> | number;

/**
 * Base properties of extended items derived from their respective {@link Asset} definition.
 *
 * Those are the properties the main game code enforces.
 */
interface AssetDefinitionProperties {
	/**
	 * The difficulty of the item
	 * @see {@link Asset.Difficulty}
	 */
	Difficulty?: number;
	/**
	 * ???
	 * @see {@link Asset.Attribute}
	 */
	Attribute?: AssetAttribute[];

	/**
	 * Override the height of the item
	 * @see {@link Asset.OverrideHeight}
	 */
	OverrideHeight?: AssetOverrideHeight;
	/**
	 * How much the character should be moved up
	 * @see {@link Asset.HeightModifier}
	 */
	HeightModifier?: number;
	/**
	 * The drawing priority of the item
	 * @see {@link Asset.OverridePriority}
	 */
	OverridePriority?: AssetLayerOverridePriority;
	/**
	 * The default color of the item.
	 * Used by extended items that need one of their layers to have a different per-type default color
	 * FIXME: That should be hoisted in the extended config, since it's set by the definition and {@link Item.Color} should be the actual colors used
	 * @see {@link Asset.DefaultColor}
	 */
	DefaultColor?: ItemColor;

	/**
	 * A list of allowed activities
	 * @see {@link Asset.AllowActivity}
	 */
	AllowActivity?: ActivityName[];
	/**
	 * A list of groups allowed activities
	 * @see {@link Asset.AllowActivityOn}
	 */
	AllowActivityOn?: AssetGroupName[];

	/**
	 * Items that should be hidden by this item
	 * @see {@link Asset.HideItem}
	 */
	HideItem?: string[];
	/**
	 * Items that should not be hidden by this item
	 * @see {@link Asset.HideItemExclude}
	 */
	HideItemExclude?: string[];
	/**
	 * Items groups that should be hidden by this item
	 * @see {@link Asset.Hide}
	 */
	Hide?: AssetGroupName[];

	/**
	 * The groups that this item blocks
	 * @see {@link Asset.Block}
	 */
	Block?: AssetGroupItemName[];

	/**
	 * Effects that are applied by this item
	 * @see {@link Asset.Effect}
	 */
	Effect?: EffectName[];

	/**
	 * A list of custom tints
	 * @see {@link Asset.Tint}
	 */
	Tint?: TintDefinition[];

	// Pose-related properties

	/**
	 * A list of poses that should forcefully be set
	 * @see {@link Asset.SetPose}
	 */
	SetPose?: AssetPoseName[];
	/**
	 * A list of poses
	 * @see {@link Asset.AllowActivePose}
	 */
	AllowActivePose?: AssetPoseName[];
	/**
	 * A list of allowed poses
	 * @see {@link Asset.AllowPose}
	 * @deprecated - Was never actually functional
	 */
	AllowPose?: never;
	/**
	 * A list of poses
	 * @see {@link Asset.WhitelistActivePose}
	 * @deprecated Use {@link ItemProperties.AllowActivePose} instead
	 */
	WhitelistActivePose?: never;
	/**
	 * A list of poses that should be frozen
	 * @see {@link Asset.FreezeActivePose}
	 * @deprecated Use {@link ItemProperties.AllowActivePose} instead
	 */
	FreezeActivePose?: never;

	/**
	 * Whether an item can be unlocked by the player even if they're restrained
	 * @see {@link Asset.SelfUnlock}
	 */
	SelfUnlock?: boolean;

	/**
	 * The timer for after how long until a lock should be removed.
	 * @see {@link Asset.RemoveTimer}
	 */
	RemoveTimer?: number;

	/**
	 * The asset's draw opacity
	 * @see {@link Asset.Opacity}
	 */
	Opacity?: number | number[];

	/**
	 * A custom background for this option that overrides the default
	 * @see {@link Asset.CustomBlindBackground}
	 */
	CustomBlindBackground?: string;

	/**
	 * A list of fetishes affected by the item
	 * @see {@link Asset.Fetish}
	 */
	Fetish?: FetishName[];
}

/** A concatenation of a single {@link TypeRecord} key/value pair. */
type PartialType = `${string}${number}`;

/**
 * A record mapping screen names to option indices.
 * @see {@link PartialType} A concatenation of a single `TypeRecord` key/value pair.
 */
type TypeRecord = Record<string, number>;

/**
 * Properties for Expression Queue item
 */

interface ExpressionQueueItem {
	Time?: number;
	Group?: ExpressionGroupName;
	Expression?: ExpressionName;
}

/**
 * Base properties for extended items
 *
 * Those are the properties the main game code enforces.
 */
interface ItemPropertiesBase {
	/**
	 * A string (or `null`) denoting the state of an extended item.
	 * How the type-string translate to concrete properties depends on the Archetype in question.
	 * @deprecated Superseded by {@link ItemPropertiesBase.TypeRecord}. Old type strings can be convert to records via {@link ExtendedItemTypeToRecord}.
	 */
	Type?: null | string;
	/** A record mapping screen names to option indices. */
	TypeRecord?: TypeRecord;

	/** A facial expression */
	Expression?: ExpressionName;

	// Vibratory-related properties

	/** The vibrator mode */
	Mode?: VibratorMode;
	/** The vibrator intensity */
	Intensity?: VibratorIntensity;
	/** The vibrator's state; only relevant for advanced vibrator modes */
	State?: VibratorModeState;

	/** KD modules */
	// FIXME: Note that, as far as I can see, it's only ever set, never read
	Modules?: number[];
}

/**
 * Custom properties for extended items
 *
 * Those are properties that are asset-specific, so the handling might be done
 * per-item.
 */
interface ItemPropertiesCustom {
	/**
	 * The member number of the player adding the item.
	 * Only set if the asset is marked as {@link AssetDefinition.CharacterRestricted}.
	 */
	ItemMemberNumber?: number;

	//#region Lock properties

	/** Asset name of the lock */
	LockedBy?: AssetLockType;
	/** The member number of the person that applied the lock */
	LockMemberNumber?: number | string;
	/** `/^[A-Z]{1,8}$/`, Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` lock */
	Password?: string;
	/** Comma separated numbers */
	LockPickSeed?: string;
	/** `/^[0-9]{4}$/`, Used by `CombinationPadlock` lock */
	CombinationNumber?: string;
	/** Comma separated numbers; used by `HighSecurityPadlock` */
	MemberNumberListKeys?: string;
	/** Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` locks */
	Hint?: string;
	/** Used by `PasswordPadlock`, `SafewordPadlock` and `TimerPasswordPadlock` locks; if the lock has been set with password */
	LockSet?: boolean;
	/** Whether to remove item on timer lock unlock; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPadlock`, `TimerPasswordPadlock` */
	RemoveItem?: boolean;
	/** Only for `PasswordPadlock` */
	RemoveOnUnlock?: boolean;
	/** Whether time is shown or "Unknown time left"; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	ShowTimer?: boolean;
	/** Enable input; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	EnableRandomInput?: boolean;
	/** List of people who publicly modified time on lock; used by `LoversTimerPadlock`, `MistressTimerPadlock`, `OwnerTimerPadlock`, `TimerPasswordPadlock` */
	MemberNumberList?: number[];

	//#endregion

	/** The inflation level of inflatable items */
	InflateLevel?: 0 | 1 | 2 | 3 | 4;

	/** The suction level of items with a suction effect */
	SuctionLevel?: 0 | 1 | 2 | 3 | 4;

	/** 1st line of text for user-entered text data */
	Text?: string;
	/** 2nd line of text for user-entered text data */
	Text2?: string;
	/** 3rd line of text for user-entered text data */
	Text3?: string;

	/** Whether the item blocks access to the butt */
	LockButt?: boolean;

	// #region Futuristic Set open permissions

	/** Whether all players can use futuristic head devices */
	OpenPermission?: boolean;
	/** Whether all players can use futuristic arm devices */
	OpenPermissionArm?: boolean;
	/** Whether all players can use futuristic leg devices */
	OpenPermissionLeg?: boolean;
	/** Whether all players can use futuristic chastity devices */
	OpenPermissionChastity?: boolean;
	/** Whether the usage of remotes is blocked */
	BlockRemotes?: boolean;

	// #endregion

	/** The futuristic bra's heart rate value */
	HeartRate?: number;

	// #region Futuristic gag & panel gag settings */

	/** The item's auto-punishment sensitivity */
	AutoPunish?: 0 | 1 | 2 | 3;
	/** The remaining time for the gag's auto-inflation */
	AutoPunishUndoTime?: number;
	/** The default time for the gag's auto-inflation */
	AutoPunishUndoTimeSetting?: 120000 | 300000 | 900000 | 3600000 | 72000000;
	/** The gag module-index prior to triggering auto-inflation */
	OriginalSetting?: 0 | 1 | 2 | 3;
	/** Whether gag's blinking light is on or off */
	BlinkState?: boolean;
	/**
	 * An extended item option
	 * @todo Investigate whether this property still actually exists
	 */
	Option?: ExtendedItemOption;

	// #endregion

	// #region Futuristic chastity settings

	/** Whether attempting to remove the belt should result in punishment */
	PunishStruggle?: boolean;
	/** Whether attempting to remove an item in general should result in punishment */
	PunishStruggleOther?: boolean;
	/** Whether orgasms should result in punishment */
	PunishOrgasm?: boolean;
	/** Whether standing up should result in punishment */
	PunishStandup?: boolean;
	/** Whether performing activities should result in punishment */
	PunishActivity?: boolean;
	/** The punishment for talking; represents an index of {@link FuturisticTrainingBeltSpeechPunishments} */
	PunishSpeech?: 0 | 1 | 2 | 3;
	/** The punishment for not speaking a required word; represents an index of {@link FuturisticTrainingBeltSpeechPunishments} */
	PunishRequiredSpeech?: 0 | 1 | 2 | 3;
	/** A string with comma-separated required words */
	PunishRequiredSpeechWord?: string;
	/** The punishment for speaking a prohibited word; represents an index of {@link FuturisticTrainingBeltSpeechPunishments} */
	PunishProhibitedSpeech?: 0 | 1 | 2 | 3;
	/** A string with comma-separated prohibited words */
	PunishProhibitedSpeechWords?: string;
	/** Internal cooldown timer for automatic shocks */
	NextShockTime?: number;
	/** The mode of the belts vibrator; represents an index of {@link FuturisticTrainingBeltModes} */
	PublicModeCurrent?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/** An integer denoting who can access the belt; represents an index of {@link FuturisticTrainingBeltPermissions} */
	PublicModePermission?: 0 | 1 | 2;

	// #endregion

	/** A comma-separated string with the futuristic vibrator's trigger words */
	TriggerValues?: string;
	/** A string denoting who has permission to use the vibrator's trigger words */
	AccessMode?: ItemVulvaFuturisticVibratorAccessMode;

	/** How intense the shock should be */
	ShockLevel?: 0 | 1 | 2;

	/** The number of inserted beads */
	InsertedBeads?: 1 | 2 | 3 | 4 | 5;

	/** Whether the item displays a chat message to all other people in the room */
	ShowText?: boolean;

	/** Number of times the item was triggered; often used by shock collars */
	TriggerCount?: number;

	/** Modular Belt: Number of times the wearer had orgasm;*/
	OrgasmCount?: number;

	/** Modular Belt: Number of times the wearer had ruined orgasm;*/
	RuinedOrgasmCount?: number;

	/** Modular Belt: Amount of time since the item is being worn;*/
	TimeWorn?: number;

	/** Modular Belt: Amount of time since last detected orgasm;*/
	TimeSinceLastOrgasm?: number;

	/** Number of times the suitcase got cracked */
	Iterations?: number;

	/** Allows reverting back to these properties on exiting an extended menu */
	Revert?: boolean;

	/** Whether the kennel door is open */
	Door?: boolean;
	/** Whether the kennel has padding */
	Padding?: boolean;

	/** Only available as overrides on the script item */
	UnHide?: AssetGroupName[];

	/** Lucky Wheel: the section labels */
	Texts?: string[];

	/** Lucky Wheel: the angle the wheel should spin to */
	TargetAngle?: number;

	/** PortalLink: Used to link a remote to its target asset. */
	PortalLinkCode?: string;
}

interface ItemProperties extends ItemPropertiesBase, AssetDefinitionProperties, ItemPropertiesCustom { }

/** All item/asset/group properties with all array-based values removed */
declare namespace PropertiesNoArray {
	/** All {@link ItemProperties} properties with array-based values removed */
	type Item = { [k in keyof ItemProperties as NonNullable<ItemProperties[k]> extends readonly any[] ? never : k]: ItemProperties[k] };
	/** All {@link Asset} properties with array-based values removed */
	type Asset = { [k in keyof globalThis.Asset as NonNullable<globalThis.Asset[k]> extends readonly any[] ? never : k]: globalThis.Asset[k] };
	/** All {@link Group} properties with array-based values removed */
	type Group = { [k in keyof AssetGroup as NonNullable<AssetGroup[k]> extends readonly any[] ? never : k]: AssetGroup[k] };
}
type PropertiesNoArray = PropertiesNoArray.Item & PropertiesNoArray.Asset & PropertiesNoArray.Group;

/** All item/asset/group properties with array-based values */
declare namespace PropertiesArray {
	/** All {@link ItemProperties} properties with array-based values */
	type Item = { [k in keyof ItemProperties as NonNullable<ItemProperties[k]> extends readonly any[] ? k : never]: ItemProperties[k] };
	/** All {@link Asset} properties with array-based values */
	type Asset = { [k in keyof globalThis.Asset as NonNullable<globalThis.Asset[k]> extends readonly any[] ? k : never]: globalThis.Asset[k] };
	/** All {@link Group} properties with array-based values */
	type Group = { [k in keyof AssetGroup as NonNullable<AssetGroup[k]> extends readonly any[] ? k : never]: AssetGroup[k] };
}
type PropertiesArray = PropertiesArray.Item & PropertiesArray.Asset & PropertiesArray.Group;

/**
 * All item/asset/group properties with record-based values.
 * @note This includes a number of somewhat unexpected values as arrays are treated as a record subtype.
 */
declare namespace PropertiesRecord {
	/** All {@link ItemProperties} properties with record-based values. */
	type Item = { [k in keyof ItemProperties as NonNullable<ItemProperties[k]> extends Record<string, any> ? k : never]: ItemProperties[k] };
	/** All {@link Asset} properties with record-based values. */
	type Asset = { [k in keyof globalThis.Asset as NonNullable<globalThis.Asset[k]> extends Record<string, any> ? k : never]: globalThis.Asset[k] };
	/** All {@link Group} properties with record-based values. */
	type Group = { [k in keyof AssetGroup as NonNullable<AssetGroup[k]> extends Record<string, any> ? k : never]: AssetGroup[k] };
}
type PropertiesRecord = PropertiesRecord.Item & PropertiesRecord.Asset & PropertiesRecord.Group;

//#endregion

/** An object containing modular item configuration for an asset. Contains all of the necessary information for the
 * item's load, draw & click handlers.
 */
interface ModularItemData extends ExtendedItemData<ModularItemOption> {
	archetype: "modular";
	/**
	 * The item's chatroom message setting. Determines the level of
	 * granularity for chatroom messages when the item's module values change.
	 */
	chatSetting: ModularItemChatSetting;
	/** The total number of types permitted by the item */
	typeCount: number;
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: {
		/** The dialogue prefix for the player prompt that is displayed on each module's menu screen */
		header: string | ExtendedItemHeaderCallback<ModularItemData>;
		/** The dialogue prefix for the name of each module */
		module: string;
		/** The dialogue prefix for the name of each option */
		option: string;
		/** The dialogue prefix that will be used for each of the item's chatroom messages */
		chat: string | ExtendedItemChatCallback<ModularItemOption>;
	};
	/** The module definitions for the modular item */
	modules: ModularItemModule[];
	/** Name of currently active module */
	currentModule: string;
	/** A lookup for the current page in the extended item menu for each of the item's modules */
	pages: Record<string, number>;
	/** A lookup for the draw data for each of the item's modules */
	drawData: ExtendedItemDrawData<ElementMetaData.Modular>;
	/** A lookup for the draw functions for each of the item's modules */
	drawFunctions: Record<string, () => void>;
	/** A lookup for the click functions for each of the item's modules */
	clickFunctions: Record<string, () => void>;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	scriptHooks: ExtendedItemScriptHookStruct<ModularItemData, ModularItemOption>;
	parentOption: null;
}

/** A 3-tuple containing data for drawing a button in a modular item screen. A button definition takes the
 * format:
 * ```
 * [moduleOrOption, currentOption, prefix]
 * ```
 * The moduleOrOption is the to be drawn item module or option.
 * The currentOption is currently active option within the relevant module.
 * The prefix is the dialog prefix for the buttons text.
 */
type ModularItemButtonDefinition = [
	moduleOrOption: ModularItemOption | ModularItemModule,
	currentOption: ModularItemOption,
	prefix: string,
];

//#endregion

//#region Typed Items

/**
 * An object containing typed item configuration for an asset. Contains all of the necessary information for the item's
 * load, draw & click handlers.
 */
interface TypedItemData extends ExtendedItemData<TypedItemOption> {
	archetype: "typed";
	drawData: ExtendedItemDrawData<ElementMetaData.Typed>;
	/** The list of extended item options available for the item */
	options: TypedItemOption[];
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		header: string | ExtendedItemHeaderCallback<TypedItemData>;
		/** The prefix used for dialog keys representing the display names of the item's types */
		option: string;
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chat: string | ExtendedItemChatCallback<TypedItemOption>;
		/** The prefix used for dialog keys representing an NPC's reactions to item type changes */
		npc: string | ExtendedItemNPCCallback<TypedItemOption>;
	};
	/**
	 * The chat message setting for the item. This can be provided to allow
	 * finer-grained chatroom message keys for the item. Defaults to {@link TypedItemChatSetting.TO_ONLY}
	 */
	chatSetting: TypedItemChatSetting;
	/**
	 * A recond containing functions that are run on load, click, draw, exit, validate and publishaction,
	 * with the original archetype function and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	scriptHooks: ExtendedItemScriptHookStruct<TypedItemData, TypedItemOption>;
	parentOption: null;
}

//#region Validation

/**
 * A parameter object containing information used to validate and sanitize character appearance update diffs. An
 * appearance update has a source character (the player that sent the update) and a target character (the character
 * being updated). What is allowed in an update varies depending on the status of the target character in relation to
 * the source character (i.e. whether they are the target's lover/owner, or the target themselves, and also whether or
 * not they have been whitelisted by the target).
 */
interface AppearanceUpdateParameters {
	/** The character whose appearance is being updated */
	C: Character;
	/** Whether or not the source player is the same as the target player */
	fromSelf: boolean;
	/**
	 * Whether or not the source player has permissions to use owner-only items (i.e. they are either the target
	 * themselves, or the target's owner)
	 */
	fromOwner: boolean;
	/**
	 * Whether or not the source player has permissions to use lover-only items (i.e. they are the target themselves,
	 * one of the target's lovers, or the target's owner, provided the target's lover rules permit their owner using
	 * lover-only items)
	 */
	fromLover: boolean;
	/**
	 * Whether or not the source player has permissions to use family-only items (in same BDSM family)
	 */
	fromFamily: boolean;
	/** The script permission levels that the source player has with respect to the receiver */
	permissions: ScriptPermissionLevel[];
	/** The member number of the source player */
	sourceMemberNumber: number;
}

/**
 * A wrapper object containing the results of a diff resolution. This includes the final item that the diff resolved to
 * (or null if the diff resulted in no item, for example in the case of item removal), along with a valid flag which
 * indicates whether or not the diff was fully valid or not.
 */
interface ItemDiffResolution {
	/**
	 * The resulting item after resolution of the item diff, or null if the diff resulted in no item being equipped in
	 * the given group
	 */
	item: Item | null;
	/**
	 * Whether or not the diff was fully valid. In most cases, an invalid diff will result in the whole appearance
	 * update being rolled back, but in some cases the change will be accepted, but some properties may be modified to
	 * keep the resulting item valid - in both situations, the valid flag will be returned as false, indicating that a
	 * remedial appearance update should be made by the target player.
	 */
	valid: boolean;
}

/**
 * A wrapper object containing the results of an appearance validation. Contains a sanitized appearance array and a
 * valid flag which indicates whether or not the appearance was fully valid or not.
 */
interface AppearanceValidationWrapper {
	/** The resulting appearance after validation */
	appearance: Item[];
	/**
	 * Whether or not the appearance was valid. A value of false indicates that the appearance has been modified, and a
	 * remedial appearance update should be made by the target player.
	 */
	valid: boolean;
}

//#endregion

//#region Vibrating items

interface VibratingItemData extends ExtendedItemData<VibratingItemOption> {
	archetype: "vibrating";
	drawData: ExtendedItemDrawData<ElementMetaData.Vibrating>;
	/** The list of extended item options available for the item */
	options: VibratingItemOption[];
	/** The list with all groups of extended item options available for the item */
	modeSet: VibratorModeSet[];
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		header: string | ExtendedItemHeaderCallback<VibratingItemData>;
		/** The dialogue prefix for the name of each option */
		option: string;
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chat: string | ExtendedItemChatCallback<VibratingItemOption>;
	};
	/**
	 * A record containing functions that are run on load, click, draw, exit, and validate, with the original archetype function
	 * and parameters passed on to them. If undefined, these are ignored.
	 * Note that scripthook functions must be loaded before `Female3DCGExtended.js` in `index.html`.
	 */
	scriptHooks: ExtendedItemScriptHookStruct<VibratingItemData, VibratingItemOption>;
	chatSetting: "default";
}

/**
 * A wrapper object defining a vibrator state and intensity
 */
interface StateAndIntensity {
	/** The vibrator state */
	State: VibratorModeState;
	/** The vibrator intensity */
	Intensity: VibratorIntensity;
}

//#endregion

//#region Variable Height items

/** The function that handles applying the height setting to the character */
type VariableHeightGetHeightCallback = (
	property: ItemProperties,
) => number | null;

/** The function that handles finding the current variable height setting */
type VariableHeightSetHeightCallback = (
	property: ItemProperties,
	height: number,
	maxHeight: number,
	minHeight: number,
) => void;

/**
 * An object containing typed item configuration for an asset. Contains all of the necessary information for the item's
 * load, draw & click handlers.
 */
interface VariableHeightData extends ExtendedItemData<VariableHeightOption> {
	archetype: "variableheight";
	/** The highest Y co-ordinate that can be set  */
	maxHeight: number;
	/** The lowest Y co-ordinate that can be set  */
	minHeight: number;
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		header: string | ExtendedItemHeaderCallback<VariableHeightData>,
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chat: string | ExtendedItemChatCallback<VariableHeightOption>;
		/** The dialogue prefix for the name of each option */
		option: string;
	};
	scriptHooks: ExtendedItemScriptHookStruct<VariableHeightData, VariableHeightOption>;
	/** The function that handles finding the current variable height setting */
	getHeight: VariableHeightGetHeightCallback;
	/** The function that handles applying the height setting to the character */
	setHeight: VariableHeightSetHeightCallback;
	chatSetting: "default";
	drawData: ExtendedItemDrawData<ElementMetaData.VariableHeight>;
}

//#endregion

// #region TextItem

interface TextItemData extends ExtendedItemData<TextItemOption> {
	archetype: "text";
	/** A record with the maximum length for each text-based properties with an input field. */
	maxLength: TextItemRecord<number>;
	/** A record containing various dialog keys used by the extended item screen */
	dialogPrefix: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		header: string | ExtendedItemHeaderCallback<TextItemData>,
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chat: string | ExtendedItemChatCallback<TextItemOption>;
	};
	scriptHooks: ExtendedItemScriptHookStruct<TextItemData, TextItemOption>;
	chatSetting: "default";
	baselineProperty: PropertiesNoArray.Item;
	eventListeners: TextItemRecord<TextItemEventListener>;
	drawData: ExtendedItemDrawData<ElementMetaData.Text>;
	pushOnPublish: boolean;
	textNames: TextItemNames[];
	/**
	 * The font used for dynamically drawing text.
	 * Requires {@link AssetDefinition.DynamicAfterDraw} to be set.
	 */
	font: null | string;
}

// NOTE: Use the intersection operator to enforce that the it remains a `keyof ItemProperties` subtype
/** Property keys of {@link ItemProperties} with text input fields */
type TextItemNames = keyof ItemProperties & (
	"Text" | "Text2" | "Text3"
);

type TextItemRecord<T> = Partial<Record<TextItemNames, T>>;

/**
 * A callback signature for handling (throttled) text changes.
 * @param C - The character being modified
 * @param item - The item being modified
 * @param name - The property wherein the updated text should be stored
 * @param text - The new text to be assigned to the item
 */
type TextItemEventListener = (
	C: Character,
	item: Item,
	name: TextItemNames,
	text: string,
) => void;

// #endregion

// #region noarch

interface NoArchItemData extends ExtendedItemData<NoArchItemOption> {
	archetype: "noarch";
	scriptHooks: ExtendedItemScriptHookStruct<NoArchItemData, NoArchItemOption>;
	chatSetting: "default";
	baselineProperty: null | ItemProperties;
	drawData: ExtendedItemDrawData<ElementMetaData.NoArch>;
	dialogPrefix: {
		/** The dialog key for the item's load text (usually a prompt to select the type) */
		header: string | ExtendedItemHeaderCallback<NoArchItemData>;
		/** The prefix used for dialog keys representing the display names of the item's types */
		option?: string;
		/** The prefix used for dialog keys representing the item's chatroom messages when its type is changed */
		chat?: string | ExtendedItemChatCallback<NoArchItemOption>;
	}
}

// #endregion

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface ICommand {
	Tag: string;
	Description?: string;
	Reference?: string;
	Action?: (this: Optional<ICommand, 'Tag'>, args: string, msg: string, parsed: string[]) => void
	Prerequisite?: (this: Optional<ICommand, 'Tag'>) => boolean;
	AutoComplete?: (this: Optional<ICommand, 'Tag'>, parsed: string[], low: string, msg: string) => void;
	Clear?: false;
}

// #region Struggle Minigame

type StruggleKnownMinigames = "Strength" | "Flexibility" | "Dexterity" | "Loosen" | "LockPick";

interface StruggleMinigame {
	Setup: (C: Character, PrevItem: Item, NextItem: Item) => void;
	Draw: (C: Character) => void;
	HandleEvent?: (EventType: "KeyDown"|"Click", event: Event) => boolean;
	DisablingCraftedProperty?: CraftingPropertyType;
}

interface StruggleCompletionData {
	Progress: number;
	PrevItem: Item;
	NextItem?: Item;
	Skill: number;
	Attempts: number;
	Interrupted: boolean;
	Auto?: boolean;
}

type StruggleCompletionCallback = (character: Character, game: StruggleKnownMinigames, data: StruggleCompletionData) => void;

// #endregion

//#region Poker Minigame

type PokerGameType = "TwoCards" | "TexasHoldem";
type PokerMode = "" | "DEAL" | "FLOP" | "TURN" | "RIVER" | "RESULT" | "END";
type PokerPlayerType = "None" | "Set" | "Character";
type PokerPlayerFamily = "None" | "Player" | "Illustration" | "Model";
type PokerHand = number[];

interface PokerAsset {
	Family: PokerPlayerFamily;
	Type: PokerPlayerType;
	Opponent: string[];
}

interface PokerPlayer {
	Type: PokerPlayerType;
	Family: PokerPlayerFamily;
	Name: string;
	Chip: number;

	/* Runtime values */
	Difficulty?: number;
	Hand?: PokerHand;
	HandValue?: number;
	Cloth?: Item;
	ClothLower?: Item;
	ClothAccessory?: Item;
	Panties?: Item;
	Bra?: Item;
	Character?: Character;
	Data?: TextCache;
	Image?: string;
	TextColor?: string;
	TextSingle?: TextCache;
	TextMultiple?: TextCache;
	Text?: string;
	WebLink?: string;
	Alternate?: number;
}

interface GamePokerParameters {
	Challenge?: string;
}

interface GameClubCardParameters {
	Deck: string[];
	DeckName?: string[];
	Reward?: string;
	Status?: OnlineGameStatus;
	PlayerSlot?: number;
}

//#endregion

// #region Online Games

/**
 * Online game status values.
 *
 * @property "" - The game is in the setup phase.
 * @property "Running" - The game is currently running.
 *
 * @fix FIXME: "" should really be renamed Setup
 */
type OnlineGameStatus = "" | "Running";

interface GameLARPParameters {
	Status?: OnlineGameStatus;
	Class?: string;
	Team?: string;
	TimerDelay?: number;
	Level?: {
		Name: string;
		Level: number;
		Progress: number;
	}[];
}

type GameLARPOptionName = "Pass" | "Seduce" | "Struggle" | "Hide" | "Cover" |
	"Strip" | "Tighten" | "RestrainArms" | "RestrainLegs" | "RestrainMouth" |
	"Silence" | "Immobilize" | "Detain" | "Dress" | "Costume" | "";

interface GameLARPOption {
	Name: GameLARPOptionName;
	Odds: number;
}

interface GameMagicBattleParameters {
	Status: OnlineGameStatus;
	House: "Independent" | "NotPlaying" | "HouseMaiestas" | "HouseVincula" | "HouseAmplector" | "HouseCorporis";
	TeamType: "FreeForAll" | "House";
}

interface GameGGTSParameters {
	Level: number;
	Time: number;
	Strike: number;
	Rule: string[];
}

// #endregion

// #region Audio

type AudioSoundEffect = [string, number];

interface AudioEffect {
	/** The sound effect name */
	Name: string;

	/** The sound file, or files to choose from randomly */
	File: string | string[];
}

/**
 * Sound effect detector for chat messages.
 */
interface AudioChatAction {
	/** Is that action applicable for that chat message? */
	IsAction: (data: ServerChatRoomMessage) => boolean;

	/** Extracts the actual sound effect from the chat message */
	GetSoundEffect: (data: ServerChatRoomMessage, metadata: IChatRoomMessageMetadata) => (AudioSoundEffect | string | null);
}

// #endregion

// #region Character drawing

/** Options available to most draw calls */
type DrawOptions = {
	/** Transparency between 0-1 */
	Alpha?: number;
	/** Area in original image to draw in format `[left, top, width, height]` */
	SourcePos?: RectTuple;
	/** Width of the drawn image, defaults to width of original image */
	Width?: number;
	/** Height of the drawn image, defaults to height of original image */
	Height?: number;
	/** If image should be flipped vertically */
	Invert?: boolean;
	/** If image should be flipped horizontally */
	Mirror?: boolean;
	/** Zoom factor */
	Zoom?: number;
	/* Color of the image to draw */
	HexColor?: string;
	/* Whether or not it is drawn in full alpha mode */
	FullAlpha?: boolean;
	/** A list of alpha masks to apply to the call */
	readonly AlphaMasks?: readonly RectTuple[];
	/** Blending mode for drawing the image */
	BlendingMode?: GlobalCompositeOperation;
}

/**
 * A callback function used for clearing a rectangular area of a canvas
 * @param {number} x - The x coordinate of the left of the rectangle to clear
 * @param {number} y - The y coordinate of the top of the rectangle to clear
 * @param {number} w - The width of the rectangle to clear
 * @param {number} h - The height of the rectangle to clear
 */
type ClearRectCallback = (x: number, y: number, w: number, h: number) => void;

/**
 * A callback function used to draw a canvas on a canvas
 * @param {HTMLImageElement | HTMLCanvasElement} Img - The canvas to draw
 * @param {number} x - The x coordinate to draw the canvas at
 * @param {number} y - The y coordinate to draw the canvas at
 */
type DrawCanvasCallback = (
	img: HTMLImageElement | HTMLCanvasElement,
	x: number,
	y: number,
	alphaMasks?: RectTuple[],
) => void;

/**
 * A callback function used to draw an image to a canvas
 * @param {string} src - The URL of the image to draw
 * @param {number} x - The x coordinate to draw the image at
 * @param {number} y - The y coordinate to draw the image at
 * @param {RectTuple[]} [alphaMasks] - A list of alpha masks to apply to the image when drawing
 * @param {number} [opacity=1] - The opacity at which to draw the image with
 * @param {boolean} [rotate=false] - If the image should be rotated by 180 degrees
 * @param {string} [blendingMode="source-over"] - blending mode for drawing the image
 */
type DrawImageCallback = (
	src: string,
	x: number,
	y: number,
	options?: DrawOptions
) => void;

/**
 * A callback function used to draw a colorized image to a canvas
 * @callback drawImageColorize
 * @param {string} src - The URL of the image to draw
 * @param {number} x - The x coordinate to draw the image at
 * @param {number} y - The y coordinate to draw the image at
 * @param {string} color - The color to apply to the image
 * @param {boolean} fullAlpha - Whether or not to apply color to the entire image
 * @param {RectTuple[]} [alphaMasks] - A list of alpha masks to apply to the image when drawing
 * @param {number} [opacity=1] - The opacity at which to draw the image with
 * @param {boolean} [rotate=false] - If the image should be rotated by 180 degrees
 * @param {GlobalCompositeOperation} [blendingMode="source-over"] - blending mode for drawing the image
 */
type DrawImageColorizeCallback = (
	src: string,
	x: number,
	y: number,
	options?: DrawOptions
) => void;

interface CommonDrawCallbacks {
	/**
	 * A callback to clear an area of the main character canvas
	 */
	clearRect: ClearRectCallback;
	/**
	 * A callback to clear an area of the blink character canvas
	 */
	clearRectBlink: ClearRectCallback;
	/**
	 * Function used to draw a canvas on top of the normal canvas
	 */
	drawCanvas: DrawCanvasCallback;
	/**
	 * Function used to draw a canvas on top of the blink canvas
	 */
	drawCanvasBlink: DrawCanvasCallback;
	/**
	 * A callback to draw an image to the main character canvas
	 */
	drawImage: DrawImageCallback;
	/**
	 * A callback to draw an image to the blink character canvas
	 */
	drawImageBlink: DrawImageCallback;
	/**
	 * A callback to draw a colorized image to the main character canvas
	 */
	drawImageColorize: DrawImageColorizeCallback;
	/**
	 * A callback to draw a colorized image to the blink character canvas
	 */
	drawImageColorizeBlink: DrawImageColorizeCallback;
}

interface DynamicDrawingData<T extends Record<string, any> = Record<string, unknown>> {
	C: Character;
	X: number;
	Y: number;
	CA: Item;
	GroupName: AssetGroupName;
	Color: string;
	Opacity: number;
	Property: ItemProperties;
	A: Asset;
	G: string;
	AG: AssetGroup;
	L: string;
	Pose: AssetPoseName;
	LayerType: string;
	BlinkExpression: string;
	drawCanvas: DrawCanvasCallback;
	drawCanvasBlink: DrawCanvasCallback;
	AlphaMasks: RectTuple[];
	PersistentData: () => T;
}

/**
 * Drawing overrides that can be returned by a dynamic BeforeDraw function
 */
interface DynamicBeforeDrawOverrides {
	Property?: ItemProperties;
	CA?: Item;
	GroupName?: AssetGroupName;
	Color?: string;
	Opacity?: number;
	X?: number;
	Y?: number;
	LayerType?: string;
	L?: string;
	AlphaMasks?: RectTuple[];
	Pose?: AssetPoseName;
}

type DynamicDrawTextEffect = "burn";

interface DynamicScriptCallbackData<T extends Record<string, any> = Record<string, unknown>> {
	C: Character;
	Item: Item;
	PersistentData: () => T;
}

// #endregion

//#region Infiltration/Pandora

type InfiltrationMissionType = "Rescue" | "Kidnap" | "Retrieve" | "CatBurglar" | "ReverseMaid" | "Steal";

type InfiltrationTargetType = "NPC" | "USBKey" | "BDSMPainting" | "GoldCollar" | "GeneralLedger" | "SilverVibrator" | "DiamondRing" | "SignedPhoto" | "PandoraPadlockKeys";

interface InfiltrationMissionTarget {
	Type: InfiltrationTargetType;
	Name: string;
	/** Whether the target was found */
	Found?: boolean;
	/** Whether the mission failed */
	Fail?: boolean;
	/** Whether this is an Rescue NPC mission from having a Private Room character kidnapped */
	PrivateRoom?: boolean;
}

type PandoraDirection = "North" | "South" | "East" | "West";
type PandoraFloorDirection = "StairsUp" | "StairsDown" | PandoraDirection;
type PandoraFloors = "Ground" | "Second" | "Underground";

interface PandoraSpecialRoom {
	Floor: "Exit" | "Search" | "Rest" | "Paint";
}

interface PandoraBaseRoom {
	Floor: PandoraFloors;
	Background: string;
	Character: NPCCharacter[];
	Path: (PandoraBaseRoom | PandoraSpecialRoom)[];
	PathMap: PandoraBaseRoom[];
	Direction: string[];
	DirectionMap: PandoraFloorDirection[];

	/* SearchRoom */
	SearchSquare?: {
		X: number;
		Y: number;
		W: number;
		H: number;
	}[];
	ItemX?: number;
	ItemY?: number;

	/* PaintRoom */
	Graffiti?: number;
}

//#endregion

//#region Crafting items

type CraftingMode = (
	"Slot"
	| "Name"
	| "Color"
	| "Extended"
	| "OverridePriority"
);

type CraftingReorderType = "None" | "Select" | "Place";


/**
 * A struct with an items crafting-related information.
 * @see {@link Item.Craft}
 */
interface CraftingItem {
	/** The name of the crafted item. */
	Name: string;
	/** The name of the crafter. */
	MemberName?: string;
	/** The member ID of the crafter. */
	MemberNumber?: number;
	/** The custom item description. */
	Description: string;
	/** The crafted item propery. */
	Property: CraftingPropertyType;
	/** The comma-separated color(s) of the item. */
	Color: string;
	/** The name of the lock or, if absent, an empty string. */
	Lock: "" | AssetLockType;
	/** The name of the item; see {@link Asset.Name}. */
	Item: string;
	/** Whether the crafted item should be private or not. */
	Private: boolean;
	/**
	 * The type of the crafted item; only relevant for extended items and should be an empty string otherwise.
	 * @deprecated superseded by {@link CraftingItem.TypeRecord}. Old type strings can be convert to records via {@link ExtendedItemTypeToRecord}.
	 * @see {@link ItemProperties.Type}
	 */
	Type?: string | null;
	/**
	 * An integer (or `null`) representing the item layering priority; see {@link ItemProperties.OverridePriority}.
	 * @deprecated - superseded by {@link CraftingItem.ItemProperty}
	 */
	OverridePriority?: null | number;
	/**
	 * A record with a select few (optional) extra item properties:
	 * * {@link ItemProperties.OverridePriority} in either its record or number form.
	 * * Properties as specified in {@link ExtendedItemData.baselineProperty}
	 */
	ItemProperty: ItemProperties | null;
	/**
	 * A record for extended items mapping screen names to option indices.
	 * @see {@link ItemProperties.TypeRecord}
	 */
	TypeRecord?: null | TypeRecord;
	/**
	 * Whether the crafting item is elligble for use.
	 * Only relevant if the player is the craft's owner but do they not own the underlying item (_e.g._ due to an inventory wipe).
	 */
	Disabled?: boolean;
}

/**
 * A currently selected struct with an items crafting-related information.
 * @see {@link Item.Craft}
 */
interface CraftingItemSelected {
	/** The name of the crafted item. */
	Name: string;
	/** The custom item description. */
	Description: string;
	/** The comma-separated color(s) of the item. */
	Color: string;
	/** The names of the crafted item's supported assets. */
	Assets: readonly Asset[];
	/**
	 * The first member of the {@link CraftingItemSelected.Assets} array.
	 *
	 * The asset is guaranteed to satisfy `Asset.Group.Name === Asset.DynamicGroupName` _if_ any of the list members satisfy this condition.
	 */
	get Asset(): Asset | undefined;
	/** The crafted item propery. */
	Property: CraftingPropertyType;
	/** The lock as equiped on the item or, if absent, `null`. */
	Lock: Asset | null;
	/** Whether the crafted item should be private or not. */
	Private: boolean;
	/**
	 * A record for extended items mapping screen names to option indices.
	 * @see {@link ItemProperties.TypeRecord}
	 */
	TypeRecord: null | TypeRecord;
	/**
	 * A record with a select few (optional) extra item properties:
	 * * {@link ItemProperties.OverridePriority} in either its record or number form.
	 * * Properties as specified in {@link ExtendedItemData.baselineProperty}
	 */
	ItemProperty: ItemProperties;
	/** Get or set the `OverridePriority` property of {@link CraftingItemSelected.ItemProperty} */
	get OverridePriority(): null | AssetLayerOverridePriority;
	set OverridePriority(value: null | AssetLayerOverridePriority);
 }

/**
 * A struct with tools for validating {@link CraftingItem} properties.
 * @property {function} Validate - The validation function
 * @property {function} GetDefault - A function that creates default values for when the validation fails
 * @property {CraftingStatusType} - The {@link CraftingStatusType} code for when the validation fails
 */
interface CratingValidationStruct {
	Validate: (craft: CraftingItem, asset: Asset | null, checkPlayerInventory?: boolean) => boolean;
	GetDefault: (craft: CraftingItem, asset: Asset | null, checkPlayerInventory?: boolean) => any;
	StatusCode: CraftingStatusType;
}

//#endregion

//#region Color

/** An object defining a group of layers which can be colored together */
interface ColorGroup {
	/** The name of the color group */
	name: string;
	/** The layers contained within the color group */
	layers: AssetLayer[];
	/** The color index for the color group - this is the lowest color index of any of the layers within the color group */
	colorIndex: number;
}

/**
 * A callback function that is called when the item color UI exits
 * @param c - The character being colored
 * @param item - The item being colored
 * @param save - Whether the item's appearance changes should be saved
 */
type itemColorExitListener = (
	c: Character,
	item: Item,
	save: boolean,
) => void;

interface ItemColorStateType {
	colorGroups: ColorGroup[];
	colors: string[];
	/**
	 * The underlying assets default colors.
	 * @see {@link Asset.DefaultColor}
	 */
	defaultColors: readonly string[];
	simpleMode: boolean;
	paginationButtonX: number;
	cancelButtonX: number;
	saveButtonX: number;
	colorPickerButtonX: number;
	colorDisplayButtonX: number;
	contentY: number;
	groupButtonWidth: number;
	pageSize: number;
	pageCount: number;
	colorInputWidth: number;
	colorInputX: number;
	colorInputY: number;
	editOpacity: boolean;
	exportButtonX: number;
	importButtonX: number;
	resetButtonX: number;
	drawImport: () => Promise<string>;
	drawExport: (data: string) => Promise<void>;
}

/** A hexadecimal color code */
type HexColor = string;

/** A HSV color value */
interface HSVColor {
	H: number;
	S: number;
	V: number;
}

/** The color picker callback called when selection completes. */
type ColorPickerCallbackType = (Color: string) => void;

//#end region

// #region Log

interface LogRecord {
	Name: LogNameType[LogGroupType];
	Group: LogGroupType;
	Value: number;
}

/** The logging groups as supported by the {@link LogRecord.Group} */
type LogGroupType = keyof LogNameType;

type LogNameAdvanced = (
	`BlockScreen${string}`
	| `BlockAppearance${string}`
	| `BlockItemGroup${string}`
	| `ForbiddenWords${string}`
);

/** An interface mapping {@link LogRecord.Group} types to valid {@link LogRecord.Name} types */
interface LogNameType {
	Arcade: "DeviousChallenge",
	Asylum: "Committed" | "Isolated" | "ForceGGTS" | "ReputationMaxed" | "Escaped",
	BadGirl: "Caught" | "Joined" | "Stolen" | "Hide",
	Cell: "Locked" | "KeyDeposit",
	College: "TeacherKey",
	Import: "BondageCollege",
	Introduction: "MaidOpinion" | "DailyJobDone",
	LockPick: "FailedLockPick",
	LoverRule: "BlockLoverLockSelf" | "BlockLoverLockOwner",
	MagicSchool: "Mastery",
	Maid: "JoinedSorority" | "LeadSorority" | "MaidsDisabled",
	MainHall: "IntroductionDone",
	Management: "ClubMistress" | "ClubSlave" | "ReleasedFromOwner" | "MistressWasPaid",
	"NPC-Amanda": "AmandaLover" | "AmandaCollared" | "AmandaCollaredWithCurfew" | "AmandaMistress",
	"NPC-AmandaSarah": "AmandaSarahLovers",
	"NPC-Jennifer": "JenniferLover" | "JenniferCollared" | "JenniferMistress" | "JenniferCollaredWithCurfew",
	"NPC-Sarah": "SarahLover" | "SarahCollared" | "SarahCollaredWithCurfew",
	"NPC-SarahIntro": "SarahWillBePunished" | "SarahCameWithPlayer",
	"NPC-Sidney": "SidneyLover" | "SidneyMistress" | "SidneyCollared" | "SidneyCollaredWithCurfew",
	"NPC-Julia": "Dominant" | "Submissive",
	"NPC-Yuki": "Dominant" | "Submissive",
	"NPC-Mildred": "Dominant" | "Submissive",
	// NOTE: A number of owner rules can have arbitrary suffices, and can thus not be fully expressed as string literals
	OwnerRule: (
		"BlockChange"
		| "BlockTalk"
		| "BlockEmote"
		| "BlockWhisper"
		| "BlockChangePose"
		| "BlockAccessSelf"
		| "BlockAccessOther"
		| "BlockKey"
		| "BlockFamilyKey"
		| "BlockOwnerLockSelf"
		| "BlockRemote"
		| "BlockRemoteSelf"
		| "BlockNickname"
		| "ReleasedCollar"
		| "BlockScreen"
		| "BlockAppearance"
		| "BlockItemGroup"
		| "ForbiddenWords"
		| "BlockTalkForbiddenWords"
		| LogNameAdvanced
	),
	Pony: "JoinedStable",
	PonyExam: "JoinedStable",
	PrivateRoom: (
		"RentRoom"
		| "Expansion"
		| "SecondExpansion"
		| "Wardrobe"
		| "Cage"
		| "OwnerBeepActive"
		| "OwnerBeepTimer"
		| "Security"
		| "BedWhite"
		| "BedBlack"
		| "BedPink"
	),
	Rule: "BlockChange" | "LockOutOfPrivateRoom" | "BlockCage" | "SleepCage",
	Sarah: "KidnapSophie",
	Shibari: "Training",
	SkillModifier: "ModifierDuration" | "ModifierLevel",
	SlaveMarket: "Auctioned",
	Trainer: "JoinedStable",
	TrainerExam: "JoinedStable",
}

// #end region

// #region dialog

interface FavoriteState {
	TargetFavorite: boolean;
	PlayerFavorite: boolean;
	Icon: FavoriteIcon;
	UsableOrder: DialogSortOrder;
	UnusableOrder: DialogSortOrder;
}

interface DialogInventoryItem extends Item {
	Worn: boolean;
	Icons: InventoryIcon[];
	SortOrder: string;
	Vibrating: boolean;
}

interface DialogSelfMenuOptionType {
	Name: string;
	IsAvailable: () => boolean;
	Load?: () => void;
	Draw: () => void;
	Click: () => void;
}

// #end region

// #region Notification

type NotificationAudioType = 0 | 1 | 2;
type NotificationAlertType = 0 | 1 | 3 | 2;
type NotificationEventType = "ChatMessage" | "ChatJoin" | "Beep" | "Disconnect" | "Test" | "Larp";

interface NotificationSetting {
	AlertType: NotificationAlertType,
	Audio: NotificationAudioType,
}

interface NotificationData {
	body?: string,
	character?: Character,
	useCharAsIcon?: boolean,
	memberNumber?: number,
	characterName?: string,
	chatRoomName?: string,
}

// #end region

// #region preference

interface ActivityEnjoyment {
	/** The relevant activity type */
	Name: ActivityName,
	/** The arousal factor for when the activity is performed on the player character */
	Self: ArousalFactor,
	/** The arousal factor for when the activity is performed on someone else */
	Other: ArousalFactor,
}

interface ArousalZone {
	/** The relevant zone */
	Name: AssetGroupItemName,
	/** The arousal factor associated with the zone */
	Factor: ArousalFactor,
	/** Whether one can orgasm from stimulating the zone */
	Orgasm: boolean,
}

interface ArousalFetish {
	/** The name of the fetish */
	Name: FetishName,
	/** The arousal factor associated with the fetish */
	Factor: ArousalFactor,
}

/** The factor of the sexual activity (0 is horrible, 2 is normal, 4 is great) */
type ArousalFactor = 0 | 1 | 2 | 3 | 4;

interface ArousalSettingsType {
	Active: ArousalActiveName;
	Visible: ArousalVisibleName;
	ShowOtherMeter: boolean;
	AffectExpression: boolean;
	AffectStutter: ArousalAffectStutterName;
	VFX: SettingsVFXName;
	VFXVibrator: SettingsVFXVibratorName;
	VFXFilter: SettingsVFXFilterName;
	Progress: number;
	ProgressTimer: number;
	VibratorLevel: 0 | 1 | 2 | 3 | 4;
	ChangeTime: number;
	Activity: string;
	Zone: string;
	Fetish: string;
	OrgasmTimer?: number;
	OrgasmStage?: 0 | 1 | 2;
	OrgasmCount?: number;
	DisableAdvancedVibes: boolean;
}

/** Preference Menu info for extensions settings*/
interface PreferenceExtensionsSettingItem {
	/**
	 * The identifier of the extension.
	 * This is used to identify the extension and must be unique.
	 */
	Identifier: string;

	/**
	 * The label for the extension button.
	 * If it's a Function, it will be called once when entering
	 * the extension setting menu. Use the return value as button text.
	 */
	ButtonText: string | (()=>string);

	/**
	 * The image path of the extension.
	 *
	 * This is passed to {@link DrawButton} directly. You can use a `data` URL here.
	 *
	 * If it's a Function, it will be called once when entering
	 * the extension setting menu. Use the return value as image
	 * path.
	 * If it's undefined, there will be no image for the button
	 */
	Image?: string | (()=>string);

	/**
	 * Called when the extension screen is about to be displayed.
	 *
	 * You can create your own HTML elements in here, or load your data.
	 *
	 * Note that HTML elements with the `HideOnPopup` class will be hidden
	 * automatically when a popup is shown.
	 */
	load?: () => void;

	/**
	 * Called when a click happens on the extension screen.
	 *
	 * Note: your exit button handling *must* call {@link PreferenceSubscreenExit};
	 */
	click: () => void;

	/**
	 * Called every frame while the extension screen is shown.
	 */
	run: () => void;

	/**
	 * Called when the extension screen is about to be closed.
	 *
	 * Handles the unloading of the extension setting, usually when the user clicks the exit button,
	 * but it can also be called by the relog screen being triggered because of a disconnect.
	 *
	 * If you created any HTML elements in {@link PreferenceExtensionsSettingItem.load}, this is a good place to remove them.
	 */
	unload?: () => void;

	/**
	 * Called when the extension screen is about to exit.
	 *
	 * Happens either through a click of the exit button, or the ESC key.
	 *
	 * @returns {boolean | void} If you have some validation that needs to happen
	 * (for example, ensuring that a textfield contains a valid color code), return false;
	 * this will stop the subscreen from exiting.
	 * You might want to show a message to the user explaining why "nothing is happening" in that case,
	 * either through your own means or by setting `PreferenceMessage` to a string.
	 *
	 * If you return true or nothing, your screen's {@link PreferenceExtensionsSettingItem.unload} handler
	 * will be called afterward.
	 */
	exit: () => boolean | void;
}

/** Preference Menu info for extensions settings*/
type PreferenceExtensionsMenuButtonInfo = {
	Button: string;
	Image?: string;
	click: () => void;
}

// #end region

// #region fortune wheel

/** A union of valid wheel of fortune button colors */
type WheelFortuneColor = "Blue" | "Gold" | "Gray" | "Green" | "Orange" | "Purple" | "Red" | "Yellow";

/** Base type for fortune wheel options */
interface WheelFortuneOptionType {
    /** A single-character UTF16 string with the option's ID */
    ID: string;
    /** The color of the option button */
    Color: WheelFortuneColor;
    /** An optional script that will be executed whenever the option is picked */
    Script?: () => void;
}

// #end region

interface ClubCard {
	ID: number;
	Name: string;
	ArrayIndex?: number;
	Type?: string;
	Title?: string;
	Text?: string;
	Prerequisite?: string;
	Reward?: string;
	RewardMemberNumber?: number;
	MoneyPerTurn?: number;
	FamePerTurn?: number;
	RequiredLevel?: number;
	Time?: number;
	ExtraTime?: number;
	ExtraDraw?: number;
	ExtraPlay?: number;
	Group?: string[];
	Location?: string;
	GlowTimer?: number;
	GlowColor?: string;
	OnPlay?: (C: ClubCardPlayer) => void;
	BeforeTurnEnd?: (C: ClubCardPlayer) => void;
	AfterTurnEnd?: (C: ClubCardPlayer) => void;
	BeforeOpponentTurnEnd?: (C: ClubCardPlayer) => void;
	AfterOpponentTurnEnd?: (C: ClubCardPlayer) => void;
	CanPlay?: (C: ClubCardPlayer) => boolean;
	/**
	 * @param C Player that owns the card and played a card
	 * @param Card that was played
	 */
	onPlayedCard?: (C: ClubCardPlayer, Card: ClubCard) => void;
	/**
	 * @param C player that owns the card (not the one who played it in this case)
	 * @param Card the card that was played
	 */
	onOpponentPlayedCard?: (C: ClubCardPlayer, Card: ClubCard) => void;
	/**
	 * Hook to run when card is removed from the board.
	 * @param C Player that owns the card
	 */
	onLeaveClub?: (C: ClubCardPlayer) => void;
	turnStart?: (C: ClubCardPlayer) => void;
}

interface ClubCardPlayer {
	Character: Character;
	Control: string;
	Index: number;
	Sleeve: string;
	Deck: ClubCard[];
	FullDeck: ClubCard[];
	Hand: ClubCard[];
	Board: ClubCard[];
	Event: ClubCard[];
	DiscardPile: ClubCard[];
	Level: number;
	Money: number;
	Fame: number;
	LastFamePerTurn?: number;
	LastMoneyPerTurn?: number;
	ClubCardTurnCounter: number;
	CardsPlayedThisTurn: Record<number, ClubCard[]>
}

// #region drawing

/** Drawing options for an item's preview box */
interface PreviewDrawOptions {
	/** The character using the item (used to calculate dynamic item descriptions/previews) */
	C?: Character;
	/** The preview box description. */
	Description?: string;
	/** The background color to draw the preview box in - defaults to white */
	Background?: string;
	/** The foreground (text) color to draw the description in - defaults to black */
	Foreground?: string;
	/** Whether or not to add vibration effects to the item - defaults to false */
	Vibrating?: boolean;
	/** Whether or not to draw a border around the preview box */
	Border?: boolean;
	/** Whether or not the button should enable hover behavior (background color change) */
	Hover?: boolean;
	/** The background color that should be used on mouse hover, if any */
	HoverBackground?: string;
	/** Whether or not the element is disabled (prevents hover functionality) */
	Disabled?: boolean;
	/** A list of images to draw in the top-left of the preview box */
	Icons?: readonly InventoryIcon[];
	/** The crafted properties of the item */
	Craft?: CraftingItem;
	/** The width of the preview rectangle */
	Width?: number;
	/** The height of the preview rectangle */
	Height?: number;
}

// #end region


// #region Chat Room Maps

interface ChatRoomView extends Pick<ScreenFunctions, "Run" | "MouseDown" | "MouseUp" | "MouseMove" | "MouseWheel" | "Click" | "Draw" | "KeyDown"> {
	Activate?: () => void;
	Deactivate?: () => void;
	Draw: () => void;
	DrawUi: () => void;
	DisplayMessage: (data: ServerChatRoomMessage, msg: string, SenderCharacter: Character, metadata: IChatRoomMessageMetadata) => string|null;
	SyncRoomProperties?: (data: ServerChatRoomSyncMessage) => void;
	CanStartWhisper?: (C: Character) => boolean;
	CanLeave?: () => boolean;
	Screenshot: () => void;
}

type ChatRoomMapType = "Always" | "Hybrid" | "Never";

type ChatRoomMapPos = {
	X: number;
	Y: number;
}

type ChatRoomMapData = {
	Pos: ChatRoomMapPos
	PrivateState: Record<string, Object>
}

type ChatRoomMapDirection = "" | "R" | "L" | "D" | "U";

type ChatRoomMapObjectType = (
	"FloorDecoration"
	| "FloorDecorationThemed"
	| "FloorDecorationParty"
	| "FloorDecorationCamping"
	| "FloorDecorationExpanding"
	| "FloorItem"
	| "FloorObstacle"
	| "WallDecoration"
	| "WallPath"
);

type ChatRoomMapTileType = "Floor" | "FloorExterior" | "Wall" | "Water";

interface ChatRoomMapDoodad {
	ID: number;
	Style: string;
	OccupiedStyle?: "WoodOpen" | "MetalOpen";
	CanEnter?: (direction: ChatRoomMapDirection) => boolean;
	OnEnter?: () => void;
}

interface ChatRoomMapTile extends ChatRoomMapDoodad {
	Type: ChatRoomMapTileType;
	Transparency?: number;
	TransparencyCutoutHeight?: number;
	BlockVision?: boolean;
	BlockHearing?: boolean;
}

interface ChatRoomMapObject extends ChatRoomMapDoodad {
	Type: ChatRoomMapObjectType;
	Top?: number;
	Left?: number;
	Width?: number;
	Height?: number;
	Transparency?: number;
	TransparencyCutoutHeight?: number;
	Exit?: boolean;
	Unique?: boolean;
	AssetGroup?: AssetGroupItemName;
	AssetName?: string;
	BlockVision?: boolean;
	BlockHearing?: boolean;
	IsVisible?: () => boolean;
	BuildImageName?: (X: number, Y: number) => string;
}

interface ChatRoomMapMovement {
	X: number;
	Y: number;
	Direction: "West" | "East" | "North" | "South";
	TimeStart: number;
	TimeEnd: number;
}

// #endregion

// #region shop

/** The current shop mode */
type ShopMode = "Buy" | "Sell" | "Preview" | "Color" | "Extended" | "Layering";

/** The current dressing state of the preview character */
type ShopClothesMode = "Clothes" | "Underwear" | "Cosplay" | "Nude";

/** The currently active dropdown menu */
type ShopDropdownState = "None" | "Group" | "Pose";

interface ShopScreenFunctions extends Omit<Partial<ScreenFunctions>, "Draw"> {
	Draw(...coords: RectTuple): void,
	/** Coordinates associated with a particular to-be drawn/clicked element */
	Coords: RectTuple,
	/** A set of shop modes for which the screen functions must be active */
	Mode: Set<ShopMode>,
}

interface ShopItem {
	/** The underlying asset */
	readonly Asset: Asset,
	/** The assets sorting priority within the asset list; lower values take priority */
	readonly SortPriority: number,
	/** Whether an item should never be able to be sold */
	readonly NeverSell: boolean,
	/** Whether the asset can be bought; `false` implies that it can be sold */
	Buy: boolean,
}

// #endregion

// #region layering

interface LayeringExitOptions {
	screen?: string;
	callback?: (C: Character, item: Item) => void;
}

/** Various display options for the layering screen */
interface LayeringDisplay extends Rect {
	/** The gap between buttons */
	buttonGap: number;
}

// #endregion

// #region deprecation

/** @deprecated superseded by {@link PoseAvailable} */
declare const CharacterItemsHavePoseAvailable: never;
/** @deprecated superseded by {@link PoseAvailable} */
declare const InventoryPrerequisiteCanChangeToPose: never;
/** @deprecated superseded by {@link PoseSetByItems} */
declare const CharacterItemsHavePose: never;
/** @deprecated superseded by {@link PoseSetByItems} */
declare const CharacterDoItemsSetPose: never;
/** @deprecated superseded by {@link PoseCategoryAvailable} */
declare const CharacterItemsHavePoseType: never;
/** @deprecated superseded by {@link PoseRefresh} */
declare const CharacterLoadPose: never;
/** @deprecated superseded by {@link PoseToMapping} */
declare const AssetPoseToMapping: never;
/** @deprecated superseded by {@link InventoryPrerequisiteConflicts.GagPrerequisite} */
declare const InventoryPrerequisiteConflictingGags: never;
/** @deprecated the chat log is now hidden via {@link ChatRoomHideElements}; use {@link ChatRoomShowElements} to unhide it */
declare const RelogChatLog: never;
/** @deprecated the chat log is now hidden via {@link ChatRoomHideElements}; use {@link ChatRoomShowElements} to unhide it */
declare const RelogInputText: never;
