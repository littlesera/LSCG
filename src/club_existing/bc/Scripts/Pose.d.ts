/**
 * Checks whether the given character can change to the named pose (without aid by default).
 * @param {Character} C - The character to check
 * @param {AssetPoseName} poseName - The name of the pose to check for
 * @returns {boolean} - Returns true if the character has no conflicting items and is not prevented from changing to
 * the provided pose
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
    function Array(poses: readonly AssetPoseName[], warningPrefix?: string): Partial<Record<keyof AssetPoseMap, AssetPoseName[]>>;
    function Scalar(poses: readonly AssetPoseName[], warningPrefix?: string): Partial<Record<keyof AssetPoseMap, AssetPoseName>>;
}
