/**
 * Checks if the player is helpless (maids disabled) or not.
 * @returns {boolean} - Returns true if the player still has time remaining after asking the maids to stop helping
 */
declare function PhotographicIsMaidsDisabled(): boolean;
declare function PhotographicPlayerCanChangeCloth(): boolean;
declare function PhotographicPlayerHatAvailable(): boolean;
declare function PhotographicPlayerGlovesAvailable(): boolean;
declare function PhotographicPlayerClothAvailable(): boolean;
declare function PhotographicPlayerClothLowerAvailable(): boolean;
declare function PhotographicPlayerShoesAvailable(): boolean;
declare function PhotographicPlayerSocksAvailable(): boolean;
declare function PhotographicPlayerBraAvailable(): boolean;
declare function PhotographicPlayerPantiesAvailable(): boolean;
declare function PhotographicSubIsRestrained(): boolean;
declare function PhotographicSubHatAvailable(): boolean;
declare function PhotographicSubGlovesAvailable(): boolean;
declare function PhotographicSubClothAvailable(): boolean;
declare function PhotographicSubClothLowerAvailable(): boolean;
declare function PhotographicSubShoesAvailable(): boolean;
declare function PhotographicSubSocksAvailable(): boolean;
declare function PhotographicSubBraAvailable(): boolean;
declare function PhotographicSubPantiesAvailable(): boolean;
declare function PhotographicSubCanAskForPhoto(): boolean;
declare function PhotographicSubCanWinkForPhoto(): boolean;
declare function PhotographicIsRestrainedWithLock(): boolean;
declare function PhotographicIsRestrainedWithoutLock(): boolean;
declare function PhotographicIsRestrainedWithLockAndMaidsNotDisabled(): boolean;
declare function PhotographicIsRestrainedWithoutLockAndMaidsNotDisabled(): boolean;
declare function PhotographicIsMaidsDisabledAndRestrained(): boolean;
declare function PhotographicLoad(): void;
declare function PhotographicRun(): void;
declare function PhotographicClick(): void;
declare function PhotographicShotThePlayerPhoto(): void;
/**
 * @param {AssetGroupName} Group
 */
declare function PhotographicPlayerClothRemove(Group: AssetGroupName): void;
/**
 * @param {Character} C
 * @param {AssetGroupName} Group
 */
declare function PhotographicAppearanceAvailable(C: Character, Group: AssetGroupName): boolean;
/**
 * @param {string} Asset
 * @param {AssetGroupName} Group
 */
declare function PhotographicPlayerAssetAvailable(Asset: string, Group: AssetGroupName): boolean;
declare function PhotographicPlayerRelease(): void;
/**
 * @param {string} Asset
 * @param {AssetGroupName} Group
 */
declare function PhotographicUseAsset(Asset: string, Group: AssetGroupName): void;
declare function PhotographicPlayerDressBack(): void;
declare function PhotographicSubDressBack(): void;
/**
 * @param {AssetPoseCategory} PoseCategory
 * @returns {boolean}
 */
declare function PhotographicSubPoseCategoryAllowed(PoseCategory: AssetPoseCategory): boolean;
/**
 * @param {AssetPoseName} PoseName
 */
declare function PhotographicSubSetPose(PoseName: AssetPoseName): void;
/**
 * @param {AssetGroupName} Group
 */
declare function PhotographicSubClothRemove(Group: AssetGroupName): void;
/**
 * @param {AssetGroupName} ItemGroup
 */
declare function PhotographicStartInventoryPlayer(ItemGroup: AssetGroupName): void;
declare var PhotographicBackground: string;
/** @type {null | NPCCharacter} */
declare var PhotographicSub: null | NPCCharacter;
declare var PhotographicGroupStarted: boolean;
declare var PhotographicCurrendGroup: any;
/** @type {null | Item[]} */
declare var PhotographicSubAppearance: null | Item[];
declare var PhotographicSelectText: string;
