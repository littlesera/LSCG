interface PlayerCharacter extends Character {
    LSCG: import("Settings/Models/settings").SettingsModel;
}

interface OtherCharacter extends Character {
    LSCG: import("Settings/Models/settings").IPublicSettingsModel;
}

interface PlayerOnlineSettings {
	LSCG: import("Settings/Models/settings").SettingsModel | string;
}

interface ExtensionSettings {
    LSCG: string;
}

interface LSCGChatRoomMessageMetadata extends Omit<IChatRoomMessageMetadata, "ActivityName"> {
    ActivityName?: LSCGActivityName;
}

interface LSCGMessageDictionaryEntry {
    message: LSCGMessageModel;
}

type LSCGMessageModelType = "init" | "sync" | "command" | "broadcast";

type LSCGCommandName = "debug" | "grab" | "release" | "remote" | "escape" | "collar-tighten" | "collar-loosen" | "collar-stats" | "photo" | "spell" | "spell-teach" | "pair" | "unpair" | "pairing-update" | "get-spell" | "get-spell-response" | "get-suggestions" | "get-suggestions-response" | "set-suggestions" | "add-leashing" | "remove-leashing" | "craft-share" | "splat" | "swap-ask" | "swap-respond";

type LSCGState = "none" | "hypnotized" | "asleep" | "horny" | "choking" | "held" | "blind" | "deaf" | "frozen" | "gagged" | "redressed" | "arousal-paired" | "orgasm-siphoned" | "leashed" | "resized" | "buffed" | "polymorphed" | "x-ray-vision" | "denied" | "protected" | "spreading-outfit";

type LSCGImmersiveOption = "true" | "false" | "whenImmersive";

interface LSCGMessageModel {
    IsLSCG: boolean;
    type: LSCGMessageModelType;
    version: string;
    settings: import("Settings/Models/settings").IPublicSettingsModel | null,
    target: number | null,
    reply: boolean,
    command?: {
        name: LSCGCommandName,
        args: {name: string, value: any}[]
    }
}

interface ItemProperties {
    LSCGOpacity?: number;
    LSCGLeadLined?: boolean;
    SipCount?: number;
    SipLimit?: number;
}

type LSCGEffectName = EffectName
    | "ForceKneel"
;

type LSCGAssetGroupBodyName = AssetGroupBodyName
    | "FaceMarkings"
;

type LSCGAssetGroupItemName = AssetGroupItemName
    | "ItemGlans"
    | "ItemPenis"
;

type LSCGAssetGroupName = LSCGAssetGroupBodyName | LSCGAssetGroupItemName;

type LSCGActivityName = ActivityName
    | "Bap"
    | "Chew"
    | "Chomp"
    | "CollarTighten"
    | "CollarLoosen"
    | "CollarStats"
    | "Eat"
    | "Flop"
    | "FuckWithAss"
    | "FuckWithPussy"
    | "FunnelPour"
    | "Flick"
    | "Grab"
    | "GrabTongue"
    | "GrabTongueWithFoot"
    | "Headbutt"
    | "HoldHand"
    | "Hug"
    | "KissEyes"
    | "NetGun"
    | "Nuzzle"
    | "Quaff"
    | "Release"
    | "ReleaseChomp"
    | "ReleaseCollar"
    | "ReleaseEar"
    | "ReleaseFootGrabbedTongue"
    | "ReleaseHand"
    | "ReleaseMouth"
    | "ReleaseNeck"
    | "ReleaseTongue"
    | "RubPussy"
    | "SlapPenis"
    | "Splat"
    | "SuckHandheld"
    | "SwallowLoad"
    | "Tackle"
    | "Throat"
    | "ThroatHandheld"
    | "Tug"
    | "LSCG_FunnelPour"
    | "LSCG_Splat"
;

type LSCGSpecialItems =
    | "ChewableItem"
    | "EdibleItem"
    | "FellatioItem"
    | "PourableItem"
    | "QuaffableItem"
;

type LSCGActivityPrerequisite = ActivityPrerequisite
    | "CanChomp"
    | "CanCustomFlick"
    | "CanCustomNibble"
    | "CanGrindWithPussy"
    | "CanGive"
    | "CanHeadbutt"
    | "CanPourIntoFunnel"
    | "CanSquirt"
    | "CanSteal"
    | "CanSwap"
    | "CustomNibbleAccessible"
    | "CheckTongueGrabbing"
    | "DevicesSlotIsFree"
    | "HasCoiledRope"
    | "HasCrotchRope"
    | "HasHalo"
    | "HasNetgun"
    | "HasPenis"
    | "HasShark"
    | "HasWings"
    | "HoldingGag"
    | "IsChomping"
    | "IsWearingChokeCollar"
    | "InjectorIsNotNetgun"
    | `Needs-${LSCGSpecialItems}`
    | "SourceAssEmpty"
    | "SourceCanSwallowSplatter"
    | "SourceCanLickSplatter"
    | "TargetCanBePinched"
    | "TargetCanToeTongueGrab"
    | "TargetIsArmAvailable"
    | "TargetIsBeingPulled"
    | "TargetIsCollarGrabbed"
    | "TargetIsEarPinched"
    | "TargetIsGagged"
    | "TargetIsGaggedWithNecklace"
    | "TargetIsGrabbed"
    | "TargetIsHandGagged"
    | "TargetIsHandLeashed"
    | "TargetIsHandUnleashed"
    | "TargetIsNeckChoked"
    | "TargetIsWearingGagNecklace"
    | "TargetHasPenis"
    | "TargetHornAvailable"
    | "TargetNotAlreadyCollarGrabbed"
    | "TargetNotAlreadyHandGagged"
    | "TargetTailAvailable"
    | "TargetTongueIsNotGrabbed"
    | "TargetTongueIsGrabbed"
    | "TargetTongueIsToeGrabbed"
    | "UseLegs"
;

interface LSCGActivity extends Omit<Activity, "ActivityID" | "Name" | "Prerequisite" | "Target" | "TargetSelf"> {
    Name: LSCGActivityName;
    Prerequisite: LSCGActivityPrerequisite[];
    Target?: LSCGAssetGroupItemName[];
    TargetSelf?: LSCGAssetGroupItemName[] | true;
}
