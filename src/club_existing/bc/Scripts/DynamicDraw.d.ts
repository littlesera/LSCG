/**
 * Pre-loads a font family and calculates font measurements for the family. This should generally be called in an item's load function so
 * that font data is loaded in preparation for dynamic font drawing. This will also be called at draw-time, but if the font is already
 * pre-loaded, this function will do nothing.
 * @param {string} fontFamily - the font family to load. Can be a single font name or a full CSS font stack
 * (e.g. "'Helvetica', 'Arial', sans-serif")
 * @returns {void} - Nothing
 */
declare function DynamicDrawLoadFont(fontFamily: string): void;
/**
 * Draws the given text to the provided canvas rendering context at the given positions. Text is drawn horizontally, respecting the
 * configuration in the provided options (if any).
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to draw the text
 * @param {number} y - The y coordinate at which to draw the text
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
declare function DynamicDrawText(text: string, ctx: CanvasRenderingContext2D, x: number, y: number, options: DynamicDrawOptions): void;
/**
 * Draws the given text in a straight line between the two provided coordinates. If the contain option is specified, the text will be fully
 * contained in the rectangle defined by the from and to positions.
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {readonly number[]} from - The [x, y] coordinates to start drawing the text at
 * @param {readonly number[]} to - The [x, y] coordinates to end drawing the text at
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
declare function DynamicDrawTextFromTo(text: string, ctx: CanvasRenderingContext2D, from: readonly number[], to: readonly number[], options: DynamicDrawOptions): void;
/**
 * Draws the given text in a circular arc at the given [x, y] coordinate. The text will be drawn so that the center of the text is
 * positioned on the given coordinates.
 * @see {@link DynamicDrawOptions}
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to center the text
 * @param {number} y - The y coordinate at which to center the text
 * @param {DynamicDrawOptions} options - Additional drawing options. These can be used to specify the radius of the circle (determining how
 * curved the text appears), as well as the direction along the circle that the text is drawn in (by default, text is drawn clockwise).
 * @returns {void} - Nothing
 */
declare function DynamicDrawTextArc(text: string, ctx: CanvasRenderingContext2D, x: number, y: number, options: DynamicDrawOptions): void;
/**
 * Internal utility function for drawing text and applying text effects.
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {number} x - The x coordinate at which to draw the text
 * @param {number} y - The y coordinate at which to draw the text
 * @param {DynamicDrawOptions} options - Additional drawing options
 * @returns {void} - Nothing
 */
declare function DynamicDrawTextAndEffects(text: string, ctx: CanvasRenderingContext2D, x: number, y: number, options: DynamicDrawOptions): void;
/**
 * Parses a dynamic drawing options object, returning default values for properties that aren't defined.
 * @param {DynamicDrawOptions} [options] - The options object to parse
 * @returns {DynamicDrawOptions} - A complete options object, with default values where not specified
 */
declare function DynamicDrawParseOptions(options?: DynamicDrawOptions): DynamicDrawOptions;
/**
 * Applies a set of dynamic drawing options to a canvas rendering context. This sets the canvas up with the relevant font size, color, etc.
 * ready for drawing text
 * @param {CanvasRenderingContext2D} ctx - The rendering context to draw the text to
 * @param {DynamicDrawOptions} options - The drawing options to apply
 * @returns {void} - Nothing
 */
declare function DynamicDrawApplyOptions(ctx: CanvasRenderingContext2D, { fontSize, fontFamily, textAlign, textBaseline, color, strokeColor, strokeWidth }: DynamicDrawOptions): void;
/**
 * DynamicDraw.js
 * --------------
 * This file contains common utilities for dynamically drawing text onto assets.
 *
 * An options hash that can be used to customize dynamically drawn text. No options need be specified, and some options are only applicable
 * to certain drawing functions.
 * @typedef DynamicDrawOptions
 * @type {object}
 * @property {number} [fontSize] - The target font size. Note that if space is constrained, the actual drawn font size will be reduced
 * automatically to fit. Defaults to 30px.
 * @property {string} [fontFamily] - The desired font family to draw text in. This can be a single font name, or a full CSS font stack
 * (e.g. "'Helvetica', 'Arial', sans-serif"). Defaults to the player's chosen global font.
 * @property {CanvasTextAlign} [textAlign] - The text alignment to use. Can be any valid
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align text alignment}. Not applicable to the {@link DynamicDrawTextArc}
 * function. Defaults to "center".
 * @property {CanvasTextBaseline} [textBaseline] - The text baseline to use. Can be any valid
 * {@link https://developer.mozilla.org/en-us/docs/Web/CSS/vertical-align vertical alignment}. Defaults to "middle".
 * @property {string} [color] - The color that the text should be drawn in. Can be any valid CSS color string. Defaults to "#000".
 * @property {string} [strokeColor] - The stroke color that should be used for the text. Can be any valid CSS color
 * string. Defaults to the same value as the `color` property.
 * @property {number} [strokeWidth] - The stroke width that should be used when stroking the text. Only used if a `strokeColor` is defined. Defaults to 1.
 * @property {DynamicDrawTextEffect} [effect] - A dynamic text effect to apply. No effects are applied by default.
 * @property {number} [width] - The maximum width of the drawn text. Not applicable to the {@link DynamicDrawTextFromTo} function, as
 * constraints are defined by the endpoints. When defined for the {@link DynamicDrawTextArc} function, it defines the maximum width of the
 * text perpendicular to the radius line on which the text is centered. Unlimited by default.
 * @property {boolean} [contain] - Whether or not the text should be fully contained in the box defined by the from/to coordinates. Only
 * applicable to the {@link DynamicDrawTextFromTo} function. Defaults to true.
 * @property {number} [angle] - The angle at which the text should be drawn, relative to the center of the circle. Angles are measured
 * clockwise in radians starting at the vertical 12 o'clock position. For example 0 corresponds to 12 o'clock, PI/2 corresponds to
 * 3 o'clock, PI corresponds to 6 o'clock, and 3PI/2 corresponds to 9 o'clock. Only applicable to the {@link DynamicDrawTextArc} function.
 * Defaults to 0.
 * @property {number} [radius] - The radius in pixels of the circle whose arc the text should be drawn along. A smaller radius will result
 * in a greater text curvature and vice versa. Only applicable to the {@link DynamicDrawTextArc} function. Defaults to 450px.
 * @property {number} [maxAngle] - The maximum angle that the text should be drawn along. This effectively determines the maximum length of
 * the arc along which the text will be drawn. Only applicable to the {@link DynamicDrawTextArc} function. Defaults to PI (a semicircle).
 * @property {DynamicDrawTextDirection} [direction] - The direction the text should be drawn in along the circular arc. Only applicable to
 * the {@link DynamicDrawTextArc} function. Defaults to {@link DynamicDrawTextDirection.CLOCKWISE};
 * @property {DynamicDrawTextCurve} [textCurve] - The direction of the curve of the text. This determines whether the center of the text
 * curves upwards ({@link DynamicDrawTextCurve.SMILEY}) or downwards ({@link DynamicDrawTextCurve.FROWNY}). Only applicable to the
 * {@link DynamicDrawTextArc} function. Defaults to {@link DynamicDrawTextCurve.FROWNY}.
 *
 * A drawing callback, used to add drawing effects to dynamic text.
 * @callback DynamicDrawTextEffectFunction
 * @param {string} text - The text to draw
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {number} x - The x coordinate at which the text should be drawn
 * @param {number} y - The y coordinate at which the text should be drawn
 * @param {DynamicDrawOptions} [options] - Additional drawing options
 *
 * A definition object that wraps the drawing functions that define a dynamic text effect
 * @typedef DynamicDrawTextEffectDefinition
 * @type {object}
 * @property {DynamicDrawTextEffectFunction} [before] - A drawing callback that is called before the dynamic text is drawn
 * @property {DynamicDrawTextEffectFunction} [after] - A drawing callback that is called after the dynamic text is drawn
 *
 * @see {@link DynamicDrawText} - for drawing basic horizontal text.
 * @see {@link DynamicDrawTextFromTo} - for drawing text in a straight line between any given two coordinates.
 * @see {@link DynamicDrawTextArc} - for drawing text in a circular arc.
 */
/**
 * A common regex that can be used to check whether a given string is permitted for dynamic drawing (the character limitations are primarily
 * to restrict the use of control characters and unicode characters that would cause odd behavior).
 * @type {RegExp}
 */
declare const DynamicDrawTextRegex: RegExp;
/**
 * A regex pattern that can be attached to HTML input elements to check for validity - matches the DynamicDrawTextRegex
 * @type {string}
 */
declare const DynamicDrawTextInputPattern: string;
/**
 * An array of valid printable characters that are permitted for dynamic drawing (used internally for text measurement purposes)
 * @type {string[]}
 */
declare const DynamicDrawValidTextCharacters: string[];
/**
 * A padding multiplier for text when drawn in an arc. The extra padding helps ensure that the bottoms of characters don't collide
 * @type {number}
 */
declare const DynamicDrawTextArcPaddingRatio: number;
/**
 * Cache for font measurements. These are used to make text which is drawn in an arc look more natural by respecting the widths of
 * characters in various fonts.
 * @type {Record.<string, {
 *     width: number,
 *     weights: Record.<string, number>
 * }>}
 */
declare const DynamicDrawFontMeasurements: Record<string, {
    width: number;
    weights: Record<string, number>;
}>;
/**
 * An enum encapsulating the directions that circular text can be drawn in (clockwise and anticlockwise)
 */
type DynamicDrawTextDirection = number;
declare namespace DynamicDrawTextDirection {
    let CLOCKWISE: number;
    let ANTICLOCKWISE: number;
}
/**
 * An enum encapsulating the possible curve directions of circular text. Can be "SMILEY" (bottom of text on the outer arc) or "FROWNY"
 * (bottom of text on the inner arc).
 */
type DynamicDrawTextCurve = number;
declare namespace DynamicDrawTextCurve {
    let SMILEY: number;
    let FROWNY: number;
}
/**
 * An enum encapsulating the available drawing effects that can be applied to dynamic text.
 * @type {{ BURN: "burn" }}
 */
declare const DynamicDrawTextEffect: {
    BURN: "burn";
};
/**
 * The default options that are used for dynamic text drawing.
 * @type {DynamicDrawOptions}
 */
declare const DynamicDrawTextDefaultOptions: DynamicDrawOptions;
/**
 * Dynamic text effect definitions. The definitions define the drawing effects that can be applied to dynamically drawn text.
 * @type {Record.<DynamicDrawTextEffect, DynamicDrawTextEffectDefinition>}
 */
declare const DynamicDrawTextEffects: Record<DynamicDrawTextEffect, DynamicDrawTextEffectDefinition>;
/**
 * DynamicDraw.js
 * --------------
 * This file contains common utilities for dynamically drawing text onto assets.
 *
 * An options hash that can be used to customize dynamically drawn text. No options need be specified, and some options are only applicable
 * to certain drawing functions.
 */
type DynamicDrawOptions = {
    /**
     * - The target font size. Note that if space is constrained, the actual drawn font size will be reduced
     * automatically to fit. Defaults to 30px.
     */
    fontSize?: number;
    /**
     * - The desired font family to draw text in. This can be a single font name, or a full CSS font stack
     * (e.g. "'Helvetica', 'Arial', sans-serif"). Defaults to the player's chosen global font.
     */
    fontFamily?: string;
    /**
     * - The text alignment to use. Can be any valid
     * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align text alignment}. Not applicable to the {@link DynamicDrawTextArc }function. Defaults to "center".
     */
    textAlign?: CanvasTextAlign;
    /**
     * - The text baseline to use. Can be any valid
     * {@link https://developer.mozilla.org/en-us/docs/Web/CSS/vertical-align vertical alignment}. Defaults to "middle".
     */
    textBaseline?: CanvasTextBaseline;
    /**
     * - The color that the text should be drawn in. Can be any valid CSS color string. Defaults to "#000".
     */
    color?: string;
    /**
     * - The stroke color that should be used for the text. Can be any valid CSS color
     * string. Defaults to the same value as the `color` property.
     */
    strokeColor?: string;
    /**
     * - The stroke width that should be used when stroking the text. Only used if a `strokeColor` is defined. Defaults to 1.
     */
    strokeWidth?: number;
    /**
     * - A dynamic text effect to apply. No effects are applied by default.
     */
    effect?: DynamicDrawTextEffect;
    /**
     * - The maximum width of the drawn text. Not applicable to the {@link DynamicDrawTextFromTo } function, as
     * constraints are defined by the endpoints. When defined for the {@link DynamicDrawTextArc } function, it defines the maximum width of the
     * text perpendicular to the radius line on which the text is centered. Unlimited by default.
     */
    width?: number;
    /**
     * - Whether or not the text should be fully contained in the box defined by the from/to coordinates. Only
     * applicable to the {@link DynamicDrawTextFromTo } function. Defaults to true.
     */
    contain?: boolean;
    /**
     * - The angle at which the text should be drawn, relative to the center of the circle. Angles are measured
     * clockwise in radians starting at the vertical 12 o'clock position. For example 0 corresponds to 12 o'clock, PI/2 corresponds to
     * 3 o'clock, PI corresponds to 6 o'clock, and 3PI/2 corresponds to 9 o'clock. Only applicable to the {@link DynamicDrawTextArc } function.
     * Defaults to 0.
     */
    angle?: number;
    /**
     * - The radius in pixels of the circle whose arc the text should be drawn along. A smaller radius will result
     * in a greater text curvature and vice versa. Only applicable to the {@link DynamicDrawTextArc } function. Defaults to 450px.
     */
    radius?: number;
    /**
     * - The maximum angle that the text should be drawn along. This effectively determines the maximum length of
     * the arc along which the text will be drawn. Only applicable to the {@link DynamicDrawTextArc } function. Defaults to PI (a semicircle).
     */
    maxAngle?: number;
    /**
     * - The direction the text should be drawn in along the circular arc. Only applicable to
     * the {@link DynamicDrawTextArc } function. Defaults to {@link DynamicDrawTextDirection.CLOCKWISE };
     */
    direction?: DynamicDrawTextDirection;
    /**
     * - The direction of the curve of the text. This determines whether the center of the text
     * curves upwards ({@link DynamicDrawTextCurve.SMILEY }) or downwards ({@link DynamicDrawTextCurve.FROWNY }). Only applicable to the
     * {@link DynamicDrawTextArc } function. Defaults to {@link DynamicDrawTextCurve.FROWNY }.
     *
     * A drawing callback, used to add drawing effects to dynamic text.
     */
    textCurve?: DynamicDrawTextCurve;
};
/**
 * DynamicDraw.js
 * --------------
 * This file contains common utilities for dynamically drawing text onto assets.
 *
 * An options hash that can be used to customize dynamically drawn text. No options need be specified, and some options are only applicable
 * to certain drawing functions.
 */
type DynamicDrawTextEffectFunction = (text: string, ctx: CanvasRenderingContext2D, x: number, y: number, options?: DynamicDrawOptions) => any;
/**
 * DynamicDraw.js
 * --------------
 * This file contains common utilities for dynamically drawing text onto assets.
 *
 * An options hash that can be used to customize dynamically drawn text. No options need be specified, and some options are only applicable
 * to certain drawing functions.
 */
type DynamicDrawTextEffectDefinition = {
    /**
     * - A drawing callback that is called before the dynamic text is drawn
     */
    before?: DynamicDrawTextEffectFunction;
    /**
     * - A drawing callback that is called after the dynamic text is drawn
     */
    after?: DynamicDrawTextEffectFunction;
};
