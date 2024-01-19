/**
 * Setup WebGL rendering
 *
 * This will create a drawing canvas and try to initialize it for GL rendering.
 * In case of failure, or if the fallback is required, it will disable GL
 * rendering entirely, switching back to the normal canvas-based rendering
 * (see Drawing.js).
 *
 * @param {Event} _evt - Unused DOM event
 * @param {boolean} [force2d] - Whether to force a fallback to 2d mode
 * @returns {void} - Nothing
 */
declare function GLDrawLoad(_evt: Event, force2d?: boolean): void;
/**
 * Loads the graphical options from localSstorage.
 * @returns {WebGLContextAttributes} - WebGL context attributes based on saved settings
 */
declare function GLDrawGetOptions(): WebGLContextAttributes;
/**
 * Saves the graphical options in localStorage.
 * @param {WebGLContextAttributes} options - WebGL context attributes based on saved settings
 */
declare function GLDrawSetOptions(options: WebGLContextAttributes): void;
/**
 * Handler for WebGL context lost events
 * @param {WebGLContextEvent} event
 * @returns {void} - Nothing
 */
declare function GLDrawOnContextLost(event: WebGLContextEvent): void;
/**
 * Disables GLDraw rendering, and cleans up any resources.
 * @returns {void} - Nothing
 */
declare function GLDrawRevertToCanvas2D(): void;
/**
 * Handler for WebGL context restored events
 * @returns {void} - Nothing
 */
declare function GLDrawOnContextRestored(): void;
/**
 * Resets the GLDraw renderer
 *
 * This function removes the current canvas, removes cached textures from the
 * image cache, and reloads a fresh canvas unless prevented.
 * @param {boolean} force2d
 * @returns {void} - Nothing
 */
declare function GLDrawResetCanvas(force2d?: boolean): void;
/**
 * Rebuilds the canvas for any characters that are currently on screen.
 * @returns {void} - Nothing
 */
declare function GLDrawRebuildCharacters(): void;
/**
 * Makes all programs and shaders on the GL context
 * @param {WebGL2RenderingContext} gl - The WebGL context of the canvas
 * @returns {void} - Nothing
 */
declare function GLDrawMakeGLProgram(gl: WebGL2RenderingContext): void;
/**
 * Creates a shader for the current WebGL context from a given source
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {string} source - Source of the shader to create
 * @param {GLenum} type - The type of the shader to create
 * @returns {WebGLShader} - The created WebGL shader
 */
declare function GLDrawCreateShader(gl: WebGL2RenderingContext, source: string, type: GLenum): WebGLShader;
/**
 * Creates the WebGL program from the vertex and fragment shaders
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {WebGLShader} vertexShader - The vertex shader to create the program with
 * @param {WebGLShader} fragmentShader - The fragment shader to create the program with
 * @returns {WebGLProgram} - The created WebGL program
 */
declare function GLDrawCreateProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
/**
 * Draws an image from a given url to a WebGLRenderingContext
 * @param {string} url - URL of the image to render
 * @param {WebGL2RenderingContext} gl - The context we're drawing with
 * @param {number} dstX - Position of the image on the X axis
 * @param {number} dstY - Position of the image on the Y axis
 * @param {DrawOptions} options - Drawing options
 * @param {number} [offsetX=0] - Additional offset to add to the X axis (for blinking)
 * @returns {void} - Nothing
 */
declare function GLDrawImage(url: string, gl: WebGL2RenderingContext, dstX: number, dstY: number, options: DrawOptions, offsetX?: number): void;
/**
 * Chooses right program using input parameters
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {string} color - Color of the image to draw
 * @param {boolean} fullAlpha - Whether or not the full alpha should be rendered
 * @param {GlobalCompositeOperation} blendingMode - blending mode for drawing the image
 * @returns {WebGLProgram} - The chosen WebGL program
 */
declare function GLChooseProgram(gl: WebGL2RenderingContext, color: string, fullAlpha: boolean, blendingMode: GlobalCompositeOperation): WebGLProgram;
/**
 * Draws a canvas on the WebGL canvas
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {HTMLImageElement | HTMLCanvasElement} Img - Canvas to get the data of
 * @param {number} X - Position of the image on the X axis
 * @param {number} Y - Position of the image on the Y axis
 * @param {number} blinkOffset - Offset for the blink canvas
 * @param {readonly RectTuple[]} alphaMasks - A list of alpha masks to apply to the asset
 */
declare function GLDraw2DCanvas(gl: WebGL2RenderingContext, Img: HTMLImageElement | HTMLCanvasElement, X: number, Y: number, blinkOffset: number, alphaMasks: readonly RectTuple[]): void;
/**
 * Sets texture info from image data
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {HTMLImageElement} Img - Image to get the data of
 * @param {WebGLTextureData} textureInfo - Texture information
 * @returns {void} - Nothing
 */
declare function GLDrawBingImageToTextureInfo(gl: WebGLRenderingContext, Img: HTMLImageElement, textureInfo: WebGLTextureData): void;
/**
 * Loads image texture data
 * @param {WebGL2RenderingContext} gl - WebGL context
 * @param {string} url - URL of the image
 * @returns {WebGLTextureData} - The texture info of a given image
 */
declare function GLDrawLoadImage(gl: WebGL2RenderingContext, url: string): WebGLTextureData;
/**
 * Loads alpha mask data
 * @param {WebGL2RenderingContext} gl - The WebGL context
 * @param {number} texWidth - The width of the texture to mask
 * @param {number} texHeight - The height of the texture to mask
 * @param {number} offsetX - The X offset at which the texture is to be drawn on the target canvas
 * @param {number} offsetY - The Y offset at which the texture is to be drawn on the target canvas
 * @param {readonly RectTuple[]} alphaMasks - A list of alpha masks to apply to the asset
 * @return {WebGLTexture} - The WebGL texture corresponding to the mask
 */
declare function GLDrawLoadMask(gl: WebGL2RenderingContext, texWidth: number, texHeight: number, offsetX: number, offsetY: number, alphaMasks: readonly RectTuple[]): WebGLTexture;
/**
 * Clears a rectangle on WebGLRenderingContext
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} x - Position of the image on the X axis
 * @param {number} y - Position of the image on the Y axis
 * @param {number} width - Width of the rectangle to clear
 * @param {number} height - Height of the rectangle to clear
 * @param {number} blinkOffset - Offset in case of a blink draw
 * @returns {void} - Nothing
 */
declare function GLDrawClearRect(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number, blinkOffset: number): void;
/**
 * Converts a hex color to a RGBA color
 * @param {string} color - Hex color code to convert to RGBA
 * @param {number} alpha - The alpha value to use for the resulting RGBA
 * @return {number[]} - Converted color code
 */
declare function GLDrawHexToRGBA(color: string, alpha?: number): number[];
/**
 * Creates the given character canvas with WebGL
 * @param {Character} C - Character to build the canvas for
 * @returns {void} - Nothing
 */
declare function GLDrawAppearanceBuild(C: Character): void;
/** @type {Map<string, HTMLImageElement>} */
declare var GLDrawImageCache: Map<string, HTMLImageElement>;
declare var GLDrawCacheLoadedImages: number;
declare var GLDrawCacheTotalImages: number;
/** @type {"webgl2"|"webgl"|"No WebGL"} */
declare var GLVersion: "webgl2" | "webgl" | "No WebGL";
/** @type {HTMLCanvasElement} */
declare var GLDrawCanvas: HTMLCanvasElement;
/**
 * How many seconds to wait before forcefully resetting the canvas after a
 * context loss
 */
declare const GLDrawContextResetSeconds: 10;
/**
 * The cooldown in seconds after resetting the canvas. If another context loss
 * happens in this cooldown, we'll revert to canvas2d rendering
 */
declare const GLDrawRevertToDraw2DSeconds: 50;
/** @type {ReturnType<typeof setTimeout>} */
declare let GLDrawContextLostTimeout: ReturnType<typeof setTimeout>;
declare let GLDrawRecoveryMode: boolean;
/** @type {ReturnType<typeof setTimeout>} */
declare let GLDrawCrashTimeout: ReturnType<typeof setTimeout>;
declare var GLDrawAlphaThreshold: number;
declare var GLDrawHalfAlphaLow: number;
declare var GLDrawHalfAlphaHigh: number;
/**
 * Source used for the Vertex Shader
 * @constant
 * @type {string}
 */
declare var GLDrawVertexShaderSource: string;
/**
 * Source used for the Fragment Shader
 * @constant
 * @type {string}
 */
declare var GLDrawFragmentShaderSource: string;
/**
 * Source used for the Texture Mask Fragment Shader
 * @constant
 * @type {string}
 */
declare var GLDrawFragmentShaderSourceTexMask: string;
/**
 * Source used for the Full Alpha Shader
 * @constant
 * @type {string}
 */
declare var GLDrawFragmentShaderSourceFullAlpha: string;
/**
 * Source used for the Half Alpha Shader
 * @constant
 * @type {string}
 */
declare var GLDrawFragmentShaderSourceHalfAlpha: string;
