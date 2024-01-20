/**
 * Prepares the character's drawing canvases before drawing the character's appearance.
 * @param {Character} C - The character to prepare
 * @returns {void} - Nothing
 */
declare function CommonDrawCanvasPrepare(C: Character): void;
/**
 * Draws the given character's appearance using the provided drawing callbacks
 * @param {Character} C - The character whose appearance to draw
 * @param {CommonDrawCallbacks} callbacks - The drawing callbacks to be used
 */
declare function CommonDrawAppearanceBuild(C: Character, { clearRect, clearRectBlink, drawCanvas, drawCanvasBlink, drawImage, drawImageBlink, drawImageColorize, drawImageColorizeBlink, }: CommonDrawCallbacks): void;
/**
 * Determines whether the provided color is valid
 * @param {string} Color - The color
 * @param {AssetGroup} AssetGroup - The asset group the color is being used fo
 * @returns {boolean} - Whether the color is valid
 */
declare function CommonDrawColorValid(Color: string, AssetGroup: AssetGroup): boolean;
/**
 * Finds the correct pose to draw for drawable layer for the provided character from the provided list of allowed poses
 * @param {Character} C - The character to check for poses against
 * @param {Partial<Record<AssetPoseCategory, readonly AssetPoseName[]>>} AllowedPoses - The list of permitted poses for the current layer
 * @return {AssetPoseName | null} - The name of the pose to draw for the layer, or an empty string if no pose should be drawn
 */
declare function CommonDrawFindPose(C: Character, AllowedPoses: Partial<Record<AssetPoseCategory, readonly AssetPoseName[]>>): AssetPoseName | null;
/**
 * Finds the pose that should be used when a given asset (and optionally layer) is drawn.
 * @param {Character} C - The character whose poses to check
 * @param {AssetLayer} [Layer] - The layer to check (optional)
 * @returns {AssetPoseName | null} - The pose to use when drawing the given asset (or layer)
 */
declare function CommonDrawResolveAssetPose(C: Character, Layer?: AssetLayer): AssetPoseName | null;
