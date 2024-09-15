/**
 * Converts a hex color string to a RGB color
 * @param {string} color - Hex color to conver
 * @returns {RGBColor} - RGB color
 */
declare function DrawHexToRGB(color: string): RGBColor;
/**
 * Converts a RGB color to a hex color string
 * @param {readonly number[]} color - RGB color to conver
 * @returns {string} - Hex color string
 */
declare function DrawRGBToHex(color: readonly number[]): string;
/**
 * Loads the canvas to draw on with its style and event listeners.
 * @returns {void} - Nothing
 */
declare function DrawLoad(): void;
/**
 * Returns the image file from cache or build it from the source
 * @param {string} Source - URL of the image
 * @returns {HTMLImageElement} - Image file
 */
declare function DrawGetImage(Source: string): HTMLImageElement;
/**
 * Reloads all character canvas once all images are loaded
 * @returns {void} - Nothing
 */
declare function DrawGetImageOnLoad(): void;
/**
 * Attempts to redownload an image if it previously failed to load
 * @param {HTMLImageElement & { errorcount?: number }} Img - Image tag that failed to load
 * @param {boolean} IsAsset - Whether or not the image is part of an asset
 * @returns {void} - Nothing
 */
declare function DrawGetImageOnError(Img: HTMLImageElement & {
    errorcount?: number;
}, IsAsset: boolean): void;
/**
 * Draws the glow under the arousal meter under the screen
 * @param {number} X - Position of the meter on the X axis
 * @param {number} Y - Position of the meter on the Y axis
 * @param {number} Zoom - Zoom factor
 * @param {number} Level - Current vibration level on a scale of 0 to 4. Must be INTEGER
 * @param {boolean} Animated - Whether or not animations should be played
 * @param {boolean} Orgasm - Whether or not the meter is in recover from orgasm mode
 * @returns {void} - Nothing
 */
declare function DrawArousalGlow(X: number, Y: number, Zoom: number, Level: number, Animated: boolean, AnimFactor: any, Orgasm: boolean): void;
/**
 * Draws the arousal meter on screen
 * @param {number} X - Position of the meter on the X axis
 * @param {number} Y - Position of the meter on the Y axis
 * @param {number} Zoom - Zoom factor
 * @param {number} Progress - Current progress of the arousal meter
 * @param {boolean} Automatic - Wheter or not the arousal is in automatic mode
 * @param {boolean} Orgasm - Whether or not the meter is in recover from orgasm mode
 * @returns {void} - Nothing
 */
declare function DrawArousalThermometer(X: number, Y: number, Zoom: number, Progress: number, Automatic: boolean, Orgasm: boolean): void;
/**
 * Draw the arousal meter next to the player if it is allowed by the character and visible for the player
 * @param {Character} C - Character for which to potentially draw the arousal meter
 * @param {number} X - Position of the meter on the X axis
 * @param {number} Y - Position of the meter on the Y axis
 * @param {number} Zoom - Zoom factor
 * @returns {void} - Nothing
 */
declare function DrawArousalMeter(C: Character, X: number, Y: number, Zoom: number): void;
/**
 * Refreshes the character if not all images are loaded and draw the character canvas on the main game screen
 * @param {Character} C - Character to draw
 * @param {number} X - Position of the character on the X axis
 * @param {number} Y - Position of the character on the Y axis
 * @param {number} Zoom - Zoom factor
 * @param {boolean} [IsHeightResizeAllowed=true] - Whether or not the settings allow for the height modifier to be applied
 * @param {CanvasRenderingContext2D} [DrawCanvas] - The canvas to draw to; If undefined `MainCanvas` is used
 * @returns {void} - Nothing
 */
declare function DrawCharacter(C: Character, X: number, Y: number, Zoom: number, IsHeightResizeAllowed?: boolean, DrawCanvas?: CanvasRenderingContext2D): void;
/**
 * Draws an asset group zone outline over the character
 * @param {Character} C - Character for which to draw the zone
 * @param {readonly RectTuple[]} Zone - Zone to be drawn
 * @param {number} Zoom - Height ratio of the character
 * @param {number} X - Position of the character on the X axis
 * @param {number} Y - Position of the character on the Y axis
 * @param {number} HeightRatio - The displayed height ratio of the character
 * @param {string} Color - Color of the zone outline
 * @param {number} [Thickness=3] - Thickness of the outline
 * @param {string} FillColor - If non-empty, the color to fill the rectangle with
 * @returns {void} - Nothing
 */
declare function DrawAssetGroupZone(C: Character, Zone: readonly RectTuple[], Zoom: number, X: number, Y: number, HeightRatio: number, Color: string, Thickness?: number, FillColor?: string): void;
/**
 * Return a semi-transparent copy of a canvas
 * @param {HTMLCanvasElement} Canvas - source
 * @param {number} [Alpha] - transparency between 0-1
 * @returns {HTMLCanvasElement} - result
 */
declare function DrawAlpha(Canvas: HTMLCanvasElement, Alpha?: number): HTMLCanvasElement;
/**
 * Clears a rectangle on a canvas
 * @param {CanvasRenderingContext2D} Canvas - The canvas on which to clear rect
 * @param {number} x - Position of the image on the X axis
 * @param {number} y - Position of the image on the Y axis
 * @param {number} width - Width of the rectangle to clear
 * @param {number} height - Height of the rectangle to clear
 * @returns {void} - Nothing
 */
declare function DrawClearRect(Canvas: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;
/**
 * Clears alpha masks on a canvas
 * @param {CanvasRenderingContext2D} Canvas - The canvas on which to clear rect
 * @param {number} X - X offset of where the masking should be done
 * @param {number} Y - Y offset of where the masking should be done
 * @param {readonly RectTuple[]} AlphaMasks - An array of alpha masks to apply
 */
declare function DrawClearAlphaMasks(Canvas: CanvasRenderingContext2D, X: number, Y: number, AlphaMasks: readonly RectTuple[]): void;
/**
 * Draws a zoomed image from a source to a specific canvas
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of image or image itself
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} SX - The X coordinate where to start clipping
 * @param {number} SY - The Y coordinate where to start clipping
 * @param {number} SWidth - The width of the clipped image
 * @param {number} SHeight - The height of the clipped image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} Width - Width of the image
 * @param {number} Height - Height of the image
 * @param {boolean} [Invert] - Flips the image vertically
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawImageZoomCanvas(Source: string | HTMLImageElement | HTMLCanvasElement, Canvas: CanvasRenderingContext2D, SX: number, SY: number, SWidth: number, SHeight: number, X: number, Y: number, Width: number, Height: number, Invert?: boolean): boolean;
/**
 * Draws a resized image from a source to the main canvas
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of image or image itself
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} Width - Width of the image after being resized
 * @param {number} Height - Height of the image after being resized
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawImageResize(Source: string | HTMLImageElement | HTMLCanvasElement, X: number, Y: number, Width: number, Height: number): boolean;
/**
 * Draws a zoomed image from a source to a specific canvas
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of the image
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {DrawOptions} [Options] Options to use when drawing
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawImageCanvas(Source: string | HTMLImageElement | HTMLCanvasElement, Canvas: CanvasRenderingContext2D, X: number, Y: number, Options?: DrawOptions): boolean;
/**
 * Draws a canvas to a specific canvas
 * @param {HTMLImageElement | HTMLCanvasElement} Img - Canvas to draw
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {readonly RectTuple[]} AlphaMasks - A list of alpha masks to apply to the asset
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawCanvas(Img: HTMLImageElement | HTMLCanvasElement, Canvas: CanvasRenderingContext2D, X: number, Y: number, AlphaMasks: readonly RectTuple[]): boolean;
/**
 * Draws an image from a source on the main canvas
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of image or image itself
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {boolean} [Invert] - Flips the image vertically
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawImage(Source: string | HTMLImageElement | HTMLCanvasElement, X: number, Y: number, Invert?: boolean): boolean;
/**
 * Draws an image on canvas, applying all options
 * @param {string | HTMLImageElement | HTMLCanvasElement} Source - URL of image or image itself
 * @param {CanvasRenderingContext2D} Canvas - Canvas on which to draw the image
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {DrawOptions} [Options = {}] - any extra options
 * @returns {boolean} - whether the image was complete or not
 */
declare function DrawImageEx(Source: string | HTMLImageElement | HTMLCanvasElement, Canvas: CanvasRenderingContext2D, X: number, Y: number, Options?: DrawOptions): boolean;
/**
 * Wrapping text in fragments to support languages that do not separate between words using space.
 * This function can also break between a long English word if somehow needed in the script.
 * @param {string} text - The text to be fragmented.
 * @param {number} maxWidth - The max width the text will be filled in.
 * @returns {string[]} - A list of string that being fragmented.
 */
declare function fragmentText(text: string, maxWidth: number): string[];
/**
 * Reduces the font size progressively until the text fits the wrap size
 * @param {string} Text - Text that will be drawn
 * @param {number} Width - Width in which the text must fit
 * @param {number} MaxLine - Maximum of lines the word can wrap for
 * @returns {void} - Nothing
 */
declare function GetWrapTextSize(Text: string, Width: number, MaxLine: number): void;
/**
 * Draws a word wrapped text in a rectangle
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the rectangle on the X axis
 * @param {number} Y - Position of the rectangle on the Y axis
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} ForeColor - Foreground color
 * @param {string} [BackColor] - Background color
 * @param {number} [MaxLine] - Maximum of lines the word can wrap for
 * @param {number} LineSpacing - The number of pixels between each lines (default to 23)
 * @param {"Center" | "Top"} Alignment - How the text should be alligned w.r.t. the Y position when wrapped over multiple lines
 * @returns {void} - Nothing
 */
declare function DrawTextWrap(Text: string, X: number, Y: number, Width: number, Height: number, ForeColor: string, BackColor?: string, MaxLine?: number, LineSpacing?: number, Alignment?: "Center" | "Top"): void;
/**
 * Draws a text element on the canvas that will fit on the specified width
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the text on the X axis
 * @param {number} Y - Position of the text on the Y axis
 * @param {number} Width - Width in which the text has to fit
 * @param {string} Color - Color of the text
 * @param {string} [BackColor] - Color of the background
 * @returns {void} - Nothing
 */
declare function DrawTextFit(Text: string, X: number, Y: number, Width: number, Color: string, BackColor?: string): void;
/**
 * Draws a text element on the canvas
 * @param {string} Text - Text to draw
 * @param {number} X - Position of the text on the X axis
 * @param {number} Y - Position of the text on the Y axis
 * @param {string} Color - Color of the text
 * @param {string} [BackColor] - Color of the background
 * @returns {void} - Nothing
 */
declare function DrawText(Text: string, X: number, Y: number, Color: string, BackColor?: string): void;
/**
 * Draws a button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text to display in the button
 * @param {string} Color - Color of the component
 * @param {string} [Image] - URL of the image to draw inside the button, if applicable
 * @param {string} [HoveringText] - Text of the tooltip, if applicable
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @returns {void} - Nothing
 */
declare function DrawButton(Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean): void;
/**
 * Draws a checkbox component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Text - Label associated with the checkbox
 * @param {boolean} IsChecked - Whether or not the checkbox is checked
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {string} [TextColor] - Color of the text
 * @returns {void} - Nothing
 */
declare function DrawCheckbox(Left: number, Top: number, Width: number, Height: number, Text: string, IsChecked: boolean, Disabled?: boolean, TextColor?: string, CheckImage?: string): void;
/**
 * Draw a back & next button component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Label - Text inside the component
 * @param {string} Color - Color of the component
 * @param {string} [Image] - Image URL to draw in the component
 * @param {() => string} [BackText] - Text for the back button tooltip
 * @param {() => string} [NextText] - Text for the next button tooltip
 * @param {boolean} [Disabled] - Disables the hovering options if set to true
 * @param {number} [ArrowWidth] - How much of the button the previous/next sections cover. By default, half each.
 * @returns {void} - Nothing
 */
declare function DrawBackNextButton(Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, BackText?: () => string, NextText?: () => string, Disabled?: boolean, ArrowWidth?: number): void;
/**
 * Draw the hovering text tooltip
 * @param {number} Left - Position of the tooltip from the left of the canvas
 * @param {number} Top - Position of the tooltip from the top of the canvas
 * @param {number} Width - Width of the tooltip
 * @param {number} Height - Height of the tooltip
 * @param {string} HoveringText - Text to display in the tooltip
 * @returns {void} - Nothing
 */
declare function DrawButtonHover(Left: number, Top: number, Width: number, Height: number, HoveringText: string): void;
/**
 * Draws a basic empty rectangle with a colored outline
 * @param {number} Left - Position of the rectangle from the left of the canvas
 * @param {number} Top - Position of the rectangle from the top of the canvas
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} Color - Color of the rectangle outline
 * @param {number} [Thickness=3] - Thickness of the rectangle line
 * @returns {void} - Nothing
 */
declare function DrawEmptyRect(Left: number, Top: number, Width: number, Height: number, Color: string, Thickness?: number): void;
/**
 * Draws a basic rectangle filled with a given color
 * @param {number} Left - Position of the rectangle from the left of the canvas
 * @param {number} Top - Position of the rectangle from the top of the canvas
 * @param {number} Width - Width of the rectangle
 * @param {number} Height - Height of the rectangle
 * @param {string} Color - Color of the rectangle
 * @returns {void} - Nothing
 */
declare function DrawRect(Left: number, Top: number, Width: number, Height: number, Color: string): void;
/**
 * Draws a basic circle
 * @param {number} CenterX - Position of the center of the circle on the X axis
 * @param {number} CenterY - Position of the center of the circle on the Y axis
 * @param {number} Radius - Radius of the circle to draw
 * @param {number} LineWidth - Width of the line
 * @param {string} LineColor - Color of the circle's line
 * @param {string} [FillColor] - Color of the space inside the circle
 * @param {CanvasRenderingContext2D} [Canvas] - The canvas element to draw onto, defaults to MainCanvas
 * @returns {void} - Nothing
 */
declare function DrawCircle(CenterX: number, CenterY: number, Radius: number, LineWidth: number, LineColor: string, FillColor?: string, Canvas?: CanvasRenderingContext2D): void;
/**
 * Draws a progress bar with color
 * @param {number} x - Position of the bar on the X axis
 * @param {number} y - Position of the bar on the Y axis
 * @param {number} w - Width of the bar
 * @param {number} h - Height of the bar
 * @param {number} value - Current progress to display on the bar
 * @param {string} [foreground="#66FF66"] - Color of the first part of the bar
 * @param {string} [background="red"] - Color of the bar background
 * @returns {void} - Nothing
 */
declare function DrawProgressBar(x: number, y: number, w: number, h: number, value: number, foreground?: string, background?: string): void;
/**
 * Draws two lines, from one point to a second point then to a third point
 * @param {number} x0 - X co-ordinate of starting point
 * @param {number} y0 - Y co-ordinate of starting point
 * @param {number} x1 - X co-ordinate of mid point
 * @param {number} y1 - Y co-ordinate of mid point
 * @param {number} x2 - X co-ordinate of end point
 * @param {number} y2 - Y co-ordinate of end point
 * @param {number} lineWidth - The width of the lines
 * @param {string} color - The color of the lines
 * @returns {void} - Nothing
 */
declare function DrawLineCorner(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, lineWidth?: number, color?: string): void;
/**
 * Gets the player's custom background based on type
 * @returns {string} - Custom background if applicable, otherwise ""
 */
declare function DrawGetCustomBackground(): string;
/**
 * Perform a global screen flash effect when a blindfold gets removed
 * @param {number} intensity - The player's blind level before the removal
 * TODO: that should be merged with DrawScreenFlash somehow
 */
declare function DrawBlindFlash(intensity: number): void;
/**
 * Perform a global screen flash effect
 * @param {string} Color - The color to use
 * @param {number} Duration - How long should the flash effect be applied, in ms
 * @param {number} Intensity - How important is the effect visually
 */
declare function DrawFlashScreen(Color: string, Duration: number, Intensity: number): void;
/**
 * Gets the alpha of a screen flash. append to a color like "#111111" + DrawGetScreenFlash(FlashTime)
 * @param {number} FlashTime - Time remaining as part of the screen flash
 * @returns {string} - alpha of screen flash
 */
declare function DrawGetScreenFlashAlpha(FlashTime: number): string;
/**
 * Constantly looping draw process. Draws beeps, handles the screen size, handles the current blindfold state and draws the current screen.
 * @param {number} time - The current time for frame
 * @returns {void} - Nothing
 */
declare function DrawProcess(time: number): void;
/**
 * Handles drawing the screen flash effects
 * @returns {void}
 */
declare function DrawProcessScreenFlash(): void;
/**
 * Draws every element that is considered a "hover" element such has button tooltips.
 * @returns {void} - Nothing
 */
declare function DrawProcessHoverElements(): void;
/**
 *
 * @param {Item | DialogInventoryItem} itemOrDialogItem
 * @param {Character} char - The character using the item (used to calculate dynamic item descriptions/previews)
 * @param {number} X
 * @param {number} Y
 * @param {PreviewDrawOptions} [options]
 */
declare function DrawItemPreview(itemOrDialogItem: Item | DialogInventoryItem, char: Character, X: number, Y: number, options?: PreviewDrawOptions): void;
/**
 * Draws an asset's preview box
 * @param {number} X - Position of the preview box on the X axis
 * @param {number} Y - Position of the preview box on the Y axis
 * @param {Asset} A - The asset to draw the preview for
 * @param {PreviewDrawOptions} [Options] - Additional optional drawing options
 * @returns {void} - Nothing
 */
declare function DrawAssetPreview(X: number, Y: number, A: Asset, Options?: PreviewDrawOptions): void;
/**
 * Draws an item preview box for the provided image path
 * @param {number} X - Position of the preview box on the X axis
 * @param {number} Y - Position of the preview box on the Y axis
 * @param {string} Path - The path of the image to draw
 * @param {string} Description - The preview box description
 * @param {PreviewDrawOptions} [Options] - Additional optional drawing options
 * @returns {void} - Nothing
 */
declare function DrawPreviewBox(X: number, Y: number, Path: string, Description: string, Options?: PreviewDrawOptions): void;
/**
 * Draws a list of small icons over a preview box
 * @param {readonly InventoryIcon[]} icons - An array of icon names
 * @param {number} X - The X co-ordinate to start drawing from
 * @param {number} Y - The Y co-ordinate to start drawing from
 * @returns {void} - Nothing
 */
declare function DrawPreviewIcons(icons: readonly InventoryIcon[], X: number, Y: number): void;
/**
 * Draws an item preview box using the provided canvas
 * @param {number} X - Position of the preview box on the X axis
 * @param {number} Y - Position of the preview box on the Y axis
 * @param {HTMLCanvasElement} Canvas - The canvas element containing the image to draw
 * @param {string} Description - The preview box description
 * @param {PreviewDrawOptions} Options - Additional optional drawing options
 * @returns {void} - Nothing
 */
declare function DrawCanvasPreview(X: number, Y: number, Canvas: HTMLCanvasElement, Description: string, Options: PreviewDrawOptions): void;
/**
 * Returns a rectangular subsection of a canvas
 * @param {HTMLCanvasElement} Canvas - The source canvas to take a section of
 * @param {number} Left - The starting X co-ordinate of the section
 * @param {number} Top - The starting Y co-ordinate of the section
 * @param {number} Width - The width of the section to take
 * @param {number} Height - The height of the section to take
 * @returns {HTMLCanvasElement} - The new canvas containing the section
 */
declare function DrawCanvasSegment(Canvas: HTMLCanvasElement, Left: number, Top: number, Width: number, Height: number): HTMLCanvasElement;
/**
 * Returns a rectangular subsection of the character image
 * @param {Character} C - The character to copy part of
 * @param {number} Left - The starting X co-ordinate of the section
 * @param {number} Top - The starting Y co-ordinate of the section
 * @param {number} Width - The width of the section to take
 * @param {number} Height - The height of the section to take
 * @returns {HTMLCanvasElement} - The new canvas containing the section
 */
declare function DrawCharacterSegment(C: Character, Left: number, Top: number, Width: number, Height: number): HTMLCanvasElement;
/**
 * Draws a source canvas or image onto a canvas, with a shear transformation (such that the width of the top and
 * bottom are different). If the `topToBottomRatio` is greater than 1, then the bottom edge of the image will be
 * smaller in the original image. If it's less than 1, then the top edge will be smaller than in the original (like the
 * Star Wars title text transform).
 *
 * @param {HTMLCanvasElement | HTMLImageElement} image - The source image
 * @param {HTMLCanvasElement} targetCanvas - The target canvas to draw the transformed image onto
 * @param {number} topToBottomRatio - The ratio between the desired length of the top edge and the bottom edge of the
 * final image.
 * @param {number} [x] - The x-position on the target canvas that the final image should be drawn at
 * @param {number} [y] - The y-position on the target canvas that the final image should be drawn at
 */
declare function DrawImageTrapezify(image: HTMLCanvasElement | HTMLImageElement, targetCanvas: HTMLCanvasElement, topToBottomRatio: number, x?: number, y?: number): void;
/**
 * The main game canvas where everything will be drawn
 * @type {CanvasRenderingContext2D}
 */
declare let MainCanvas: CanvasRenderingContext2D;
/**
 * Temporary GPU-based canvas
 * @type {CanvasRenderingContext2D}
 */
declare let TempCanvas: CanvasRenderingContext2D;
/**
 * Temporary CPU-based canvas (for colorization)
 * @type {CanvasRenderingContext2D}
 */
declare let ColorCanvas: CanvasRenderingContext2D;
declare var DialogLeaveDueToItem: boolean;
declare var BlindFlash: boolean;
declare var DrawingBlindFlashTimer: number;
/** @type {Map<string, HTMLImageElement>} */
declare const DrawCacheImage: Map<string, HTMLImageElement>;
declare let DrawCacheLoadedImages: number;
declare let DrawCacheTotalImages: number;
declare var DrawLastDarkFactor: number;
/**
 * A list of the characters that are drawn every frame
 * @type {Character[]}
 */
declare var DrawLastCharacters: Character[];
/**
 * A list of elements to draw at the end of the drawing process.
 * Mostly used for hovering button labels.
 * @type {Function[]}
 */
declare var DrawHoverElements: Function[];
/**
 * The last canvas position in format `[left, top, width, height]`
 * @type {RectTuple}
 */
declare var DrawCanvasPosition: RectTuple;
/**
 * Gets the text size needed to fit inside a given width according to the current font.
 * This function is memoized because <code>MainCanvas.measureText(Text)</code> is a major resource hog.
 * @param {string} Text - Text to draw
 * @param {number} Width - Width in which the text has to fit
 * @returns {[string, number]} - Text to draw and its font size
 */
declare const DrawingGetTextSize: MemoizedFunction<(Text: string, Width: number) => [text: string, size: number]>;
declare var DrawScreenFlashTime: number;
declare var DrawScreenFlashColor: any;
declare var DrawScreenFlashStrength: number;
/** The default width of item previews */
declare const DrawAssetPreviewDefaultWidth: 225;
/** The default height of item previews */
declare const DrawAssetPreviewDefaultHeight: 275;
