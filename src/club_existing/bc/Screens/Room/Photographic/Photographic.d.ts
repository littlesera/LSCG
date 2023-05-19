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
declare function PhotographicPlayerClothRemove(Group: any): void;
declare function PhotographicAppearanceAvailable(C: any, Group: any): boolean;
declare function PhotographicPlayerAssetAvailable(Asset: any, Group: any): boolean;
declare function PhotographicPlayerRelease(): void;
declare function PhotographicUseAsset(Asset: any, Group: any): void;
declare function PhotographicPlayerDressBack(): void;
declare function PhotographicSubDressBack(): void;
declare function PhotographicSubPoseCategoryAllowed(PoseCategory: any): boolean;
declare function PhotographicSubSetPose(PoseName: any): void;
declare function PhotographicSubClothRemove(Group: any): void;
declare function PhotographicStartInventoryPlayer(ItemGroup: any): void;
declare var PhotographicBackground: string;
/** @type {null | NPCCharacter} */
declare var PhotographicSub: null | NPCCharacter;
declare var PhotographicGroupStarted: boolean;
declare var PhotographicCurrendGroup: any;
/** @type {null | Item[]} */
declare var PhotographicSubAppearance: null | Item[];
declare var PhotographicSelectText: string;
