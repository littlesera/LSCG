/**
 * Checks to what extent the given character can change to a given pose.
 *
 * @see {@link PoseCanChangeUnaided} Check whether one can change to a pose _unaided_
 * @param {Character} C - The character to check
 * @param {AssetPoseName} poseName - The name of the pose to check for
 * @returns {PoseChangeStatus} - A status code denoting if and under what conditions the character can change pose
 */
declare function PoseCanChangeUnaidedStatus(C: Character, poseName: AssetPoseName): PoseChangeStatus;
/**
 * Checks whether the given character can change to the pose unaided.
 *
 * Equivalent to checking whether a pose change has the {@link PoseChangeStatus.ALWAYS} status.
 * @param {Character} C - The character to check
 * @param {AssetPoseName} poseName - The name of the pose to check for
 * @returns {boolean} - Returns true if the character can always change a pose without struggle or external aid
 */
declare function PoseCanChangeUnaided(C: Character, poseName: AssetPoseName): boolean;
/**
 * Returns whether a pose is available.
 * @param {Character} C - Character to check for the pose
 * @param {AssetPoseCategory} category - The pose category
 * @param {AssetPoseName} poseName - The pose in question
 * @returns {boolean}
 */
declare function PoseAvailable(C: Character, category: AssetPoseCategory, poseName: AssetPoseName): boolean;
/**
 * Returns whether any poses are available in the passed category
 * @param {Character} C - Character to check for the pose category
 * @param {AssetPoseCategory} category - The pose category in question
 * @returns {boolean}
 */
declare function PoseCategoryAvailable(C: Character, category: AssetPoseCategory): boolean;
/**
 * Return whether the items on a character set a given pose.
 * Note that this does not guarantee that the pose is actually active.
 * @param {Character} C - Character to check for the pose
 * @param {AssetPoseCategory} category - The pose category
 * @param {AssetPoseName} poseName - The pose in question
 * @returns {boolean}
 */
declare function PoseSetByItems(C: Character, category: AssetPoseCategory, poseName: AssetPoseName): boolean;
/**
 * Sets a new pose for the character
 * @param {Character} C - Character for which to set the pose
 * @param {null | AssetPoseName} poseName - Name of the pose to set as active or `null` to return to the default pose
 * @param {boolean} [ForceChange=false] - TRUE if the set pose(s) should overwrite current active pose(s)
 * @returns {void} - Nothing
 */
declare function PoseSetActive(C: Character, poseName: null | AssetPoseName, ForceChange?: boolean): void;
/**
 * Refreshes the list of poses for a character. Each pose can only be found once in the pose array
 * @param {Character} C - Character for which to refresh the pose list
 * @returns {void} - Nothing
 */
declare function PoseRefresh(C: Character): void;
/**
 * A list with all kneeling {@link AssetPoseMap["BodyLower"]} pose names.
 * @satisfies {readonly AssetPoseMap["BodyLower"][]}
 */
declare const PoseAllKneeling: readonly ("Kneel" | "KneelingSpread")[];
/**
 * A list with all standing {@link AssetPoseMap["BodyLower"]} pose names.
 * @satisfies {readonly AssetPoseMap["BodyLower"][]}
 */
declare const PoseAllStanding: readonly ("BaseLower" | "LegsClosed" | "LegsOpen" | "Spread")[];
declare namespace PoseToMapping {
    function Array(poses: readonly AssetPoseName[], warningPrefix?: null | string): Partial<Record<AssetPoseCategory, AssetPoseName[]>>;
    function Scalar(poses: readonly AssetPoseName[], warningPrefix?: null | string): Partial<Record<AssetPoseCategory, AssetPoseName>>;
}
declare namespace PoseChangeStatus {
    let NEVER: 0;
    let NEVER_WITHOUT_AID: 1;
    let ALWAYS_WITH_STRUGGLE: 2;
    let ALWAYS: 3;
}
