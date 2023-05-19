/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
declare function KDWallVert(x: number, y: number, noReplace?: string): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
declare function KDWallVertAbove(x: number, y: number, noReplace?: string): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string} [noReplace]
 * @returns {boolean}
 */
declare function KDWallVertBoth(x: number, y: number, noReplace?: string): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
declare function KDWallHorizTunnel(x: number, y: number): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
declare function KDWallVertTunnel(x: number, y: number): boolean;
declare function KinkyDungeonGetSprite(code: any, x: any, y: any, Fog: any, noReplace: any): string;
declare function KinkyDungeonGetSpriteOverlay(code: any, x: any, y: any, Fog: any, noReplace: any): any;
declare function KinkyDungeonDrawGame(): void;
/**
 * Draws arousal screen filter
 * @param {number} y1 - Y to draw filter at.
 * @param {number} h - Height of filter
 * @param {number} Width - Width of filter
 * @param {number} ArousalOverride - Override to the existing arousal value
 * @returns {void} - Nothing.
 */
declare function KDDrawArousalScreenFilter(y1: number, h: number, Width: number, ArousalOverride: number, Color?: string, AlphaBonus?: number): void;
declare function KDCanAttack(): boolean;
declare function KinkyDungeonSendFloater(Entity: any, Amount: any, Color: any, Time: any, LocationOverride: any, suff?: string): void;
declare function KinkyDungeonDrawFloaters(CamX: any, CamY: any): void;
/**
 * Easing function makes things smooth
 * @param {number} value
 * @returns {number}
 */
declare function KDEase(value: number): number;
declare function KinkyDungeonDrawMessages(NoLog: any): void;
declare function KDhexToRGB(h: any): {
    r: string;
    g: string;
    b: string;
};
declare function KinkyDungeonUpdateVisualPosition(Entity: any, amount: any): number;
/**
 * Sets the target location based on MOUSE location
 */
declare function KinkyDungeonSetTargetLocation(): void;
/**
 * Sets the move direction based on MOUSE location
 */
declare function KinkyDungeonSetMoveDirection(): void;
/**
 * Draws a box component
 * @param {number} Left - Position of the component from the left of the canvas
 * @param {number} Top - Position of the component from the top of the canvas
 * @param {number} Width - Width of the component
 * @param {number} Height - Height of the component
 * @param {string} Color - Color of the component
 * @param {boolean} [NoBorder] - Color of the component
 * @param {number} [Alpha] - Transparency of the box
 * @param {number} [zIndex] - z Index
 *  @returns {void} - Nothing
 */
declare function DrawBoxKD(Left: number, Top: number, Width: number, Height: number, Color: string, NoBorder?: boolean, Alpha?: number, zIndex?: number): void;
/**
 *
 * @param {*} Text
 * @param {*} X
 * @param {*} Y
 * @param {*} Width
 * @param {*} Color
 * @param {*} [BackColor]
 * @param {*} [FontSize]
 * @param {*} [Align]
 * @param {*} [zIndex]
 * @param {*} [alpha]
 * @param {*} [border]
 */
declare function DrawTextFitKD(Text: any, X: any, Y: any, Width: any, Color: any, BackColor?: any, FontSize?: any, Align?: any, zIndex?: any, alpha?: any, border?: any): void;
/**
 *
 * @param {*} Text
 * @param {*} X
 * @param {*} Y
 * @param {*} Color
 * @param {*} [BackColor]
 * @param {*} [FontSize]
 * @param {*} [Align]
 * @param {*} [zIndex]
 * @param {*} [alpha]
 */
declare function DrawTextKD(Text: any, X: any, Y: any, Color: any, BackColor?: any, FontSize?: any, Align?: any, zIndex?: any, alpha?: any, border?: any): void;
/**
 *
 * @param {{Text: string, X: number, Y: number, Width?: number, Color: string, BackColor: string, FontSize?: number, align?: string, zIndex?: number, alpha?: number, border?: number}} Params
 * @returns {boolean} - If it worked
 */
declare function DrawTextVisKD(Container: any, Map: any, id: any, Params: {
    Text: string;
    X: number;
    Y: number;
    Width?: number;
    Color: string;
    BackColor: string;
    FontSize?: number;
    align?: string;
    zIndex?: number;
    alpha?: number;
    border?: number;
}): boolean;
/**
 * Draws a basic rectangle filled with a given color
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
declare function DrawRectKD(Container: any, Map: Map<string, any>, id: any, Params: {
    Left: number;
    Top: number;
    Width: number;
    Height: number;
    Color: string;
    LineWidth: number;
    zIndex: number;
    alpha?: number;
}): boolean;
/**
 * Draws a basic rectangle filled with a given color
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {{Left: number, Top: number, Width: number, Height: number, Color: string, LineWidth?: number, zIndex: number, alpha?: number}} Params - rect parameters
 * @returns {boolean} - If it worked
 */
declare function FillRectKD(Container: any, Map: Map<string, any>, id: any, Params: {
    Left: number;
    Top: number;
    Width: number;
    Height: number;
    Color: string;
    LineWidth?: number;
    zIndex: number;
    alpha?: number;
}): boolean;
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
 * @param {boolean} [NoBorder] - Disables the button border and only draws the image and selection halo
 * @param {string} [FillColor] - Color of the background
 * @param {number} [FontSize] - Color of the background
 * @param {boolean} [ShiftText] - Shift text to make room for the button
 * @param {boolean} [Stretch] - Stretch the image to fit
 * @param {number} [zIndex] - Stretch the image to fit
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @param {number} [options.zIndex] - zIndex
 * @returns {void} - Nothing
 */
declare function DrawButtonVis(Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, HoveringText?: string, Disabled?: boolean, NoBorder?: boolean, FillColor?: string, FontSize?: number, ShiftText?: boolean, Stretch?: boolean, zIndex?: number, options?: {
    noTextBG?: boolean;
    alpha?: number;
    zIndex?: number;
}): void;
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
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @param {number} [options.zIndex] - zIndex
 * @returns {void} - Nothing
 */
declare function DrawCheckboxVis(Left: number, Top: number, Width: number, Height: number, Text: string, IsChecked: boolean, Disabled?: boolean, TextColor?: string, CheckImage?: string, options?: {
    noTextBG?: boolean;
    alpha?: number;
    zIndex?: number;
}): void;
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
 * @param {boolean} [NoBorder] - Disables the hovering options if set to true
 * @param {object} [options] - Additional options
 * @param {boolean} [options.noTextBG] - Dont show text backgrounds
 * @param {number} [options.alpha]
 * @returns {void} - Nothing
 */
declare function DrawBackNextButtonVis(Left: number, Top: number, Width: number, Height: number, Label: string, Color: string, Image?: string, BackText?: () => string, NextText?: () => string, Disabled?: boolean, ArrowWidth?: number, NoBorder?: boolean, options?: {
    noTextBG?: boolean;
    alpha?: number;
}): void;
/**
 *
 * @param {number} CamX
 * @param {number} CamY
 * @param {number} CamX_offset
 * @param {number} CamY_offset
 * @param {boolean} [Debug]
 * @returns {any}
 */
declare function KDDrawMap(CamX: number, CamY: number, CamX_offset: number, CamY_offset: number, Debug?: boolean): any;
/**
 *
 * @param {any} Container
 * @param {Map<string, any>} Map
 * @param {string} Image
 * @param {number} Left
 * @param {number} Top
 * @param {number} Width
 * @param {number} Height
 * @param {number} [Rotation]
 * @param {any} [options]
 * @param {boolean} [Centered]
 * @returns {boolean}
 */
declare function KDDraw(Container: any, Map: Map<string, any>, id: any, Image: string, Left: number, Top: number, Width: number, Height: number, Rotation?: number, options?: any, Centered?: boolean): boolean;
/**
 * Returns a PIXI.Texture, or null if there isnt one
 * @param {string} Image
 * @returns {any}
 */
declare function KDTex(Image: string): any;
/**
 *
 * @param {string} str
 * @returns
 */
declare function string2hex(str: string): any;
declare function GetAdjacentList(list: any, index: any, width: any): {
    left: any;
    right: any;
};
declare function KDUpdateVision(): void;
declare function KDDrawTileTooltip(maptile: any, x: any, y: any, offset: any): any;
/**
 *
 * @param {effectTile} tile
 * @param {any[]} TooltipList
 * @param {string} color
 * @param {string} [extra]
 * @param {string} [descColor]
 * @param {string} [extraColor]
 */
declare function KDETileTooltipSimple(tile: effectTile, TooltipList: any[], color: string, extra?: string, descColor?: string, extraColor?: string): void;
declare function KDDrawEffectTileTooltip(tile: any, x: any, y: any, offset: any): any;
declare function KDDrawTooltip(TooltipList: any, offset: any): any;
declare let KDRecentRepIndex: number;
declare let ShowBoringness: boolean;
declare let KDWallReplacers: string;
declare let KinkyDungeonSuppressSprint: boolean;
declare let KDReturnButtonXX: number;
declare let pixiview: HTMLElement;
declare let pixirenderer: any;
declare let pixirendererKD: any;
declare let kdgamefog: any;
declare let kdgameboard: any;
declare let kdui: any;
declare let kdcanvas: any;
declare let KDTextWhite: string;
declare let KDTextGray3: string;
declare let KDTextTan: string;
declare let KDTextGray2: string;
declare let KDTextGray1: string;
declare let KDTextGray0: string;
/**
 * @type {Map<string, boolean>}
 */
declare let kdSpritesDrawn: Map<string, boolean>;
/**
 * @type {Map<string, any>}
 */
declare let kdpixisprites: Map<string, any>;
/**
 * @type {Map<string, any>}
 */
declare let kdprimitiveparams: Map<string, any>;
/**
  * @type {Map<string, any>}
  */
declare let kdpixitex: Map<string, any>;
declare let KDChainablePillar: string;
declare let KDSprites: {
    "1": (x: any, y: any, Fog: any, noReplace: any) => "WallVert" | "Wall";
    "2": (x: any, y: any, Fog: any, noReplace: any) => string;
    "3": (x: any, y: any, Fog: any, noReplace: any) => "Doodad" | "MimicBlock";
    b: (x: any, y: any, Fog: any, noReplace: any) => "Bars" | "BarsVertCont" | "BarsVert";
    X: (x: any, y: any, Fog: any, noReplace: any) => string;
    "4": (x: any, y: any, Fog: any, noReplace: any) => "WallVert" | "Wall";
    L: (x: any, y: any, Fog: any, noReplace: any) => any;
    F: (x: any, y: any, Fog: any, noReplace: any) => string;
    "?": (x: any, y: any, Fog: any, noReplace: any) => string;
    "/": (x: any, y: any, Fog: any, noReplace: any) => string;
    ",": (x: any, y: any, Fog: any, noReplace: any) => "WallVert" | "Wall";
    D: (x: any, y: any, Fog: any, noReplace: any) => any;
    d: (x: any, y: any, Fog: any, noReplace: any) => any;
    a: (x: any, y: any, Fog: any, noReplace: any) => string;
    A: (x: any, y: any, Fog: any, noReplace: any) => "Shrine" | "ShrineC" | "ShrineEmpty";
    H: (x: any, y: any, Fog: any, noReplace: any) => string;
    s: (x: any, y: any, Fog: any, noReplace: any) => string;
    S: (x: any, y: any, Fog: any, noReplace: any) => string;
    g: (x: any, y: any, Fog: any, noReplace: any) => "GrateHoriz" | "Grate" | "GrateVert";
    r: (x: any, y: any, Fog: any, noReplace: any) => string;
    t: (x: any, y: any, Fog: any, noReplace: any) => string;
    T: (x: any, y: any, Fog: any, noReplace: any) => "Trap" | "Floor";
    Y: (x: any, y: any, Fog: any, noReplace: any) => string;
    R: (x: any, y: any, Fog: any, noReplace: any) => string;
    m: (x: any, y: any, Fog: any, noReplace: any) => string;
    M: (x: any, y: any, Fog: any, noReplace: any) => string;
    O: (x: any, y: any, Fog: any, noReplace: any) => string;
    P: (x: any, y: any, Fog: any, noReplace: any) => string;
    p: (x: any, y: any, Fog: any, noReplace: any) => string;
    o: (x: any, y: any, Fog: any, noReplace: any) => string;
    w: (x: any, y: any, Fog: any, noReplace: any) => string;
    "]": (x: any, y: any, Fog: any, noReplace: any) => string;
    "[": (x: any, y: any, Fog: any, noReplace: any) => string;
    "=": (x: any, y: any, Fog: any, noReplace: any) => string;
    "+": (x: any, y: any, Fog: any, noReplace: any) => string;
    "-": (x: any, y: any, Fog: any, noReplace: any) => string;
    l: (x: any, y: any, Fog: any, noReplace: any) => string;
};
declare let KDOverlays: {
    "-": (x: any, y: any, Fog: any, noReplace: any) => string;
    l: (x: any, y: any, Fog: any, noReplace: any) => string;
    "+": (x: any, y: any, Fog: any, noReplace: any) => string;
    "=": (x: any, y: any, Fog: any, noReplace: any) => string;
    Y: (x: any, y: any, Fog: any, noReplace: any) => string;
    "/": (x: any, y: any, Fog: any, noReplace: any) => string;
    R: (x: any, y: any, Fog: any, noReplace: any) => string;
    $: (x: any, y: any, Fog: any, noReplace: any) => string;
    m: (x: any, y: any, Fog: any, noReplace: any) => string;
    M: (x: any, y: any, Fog: any, noReplace: any) => string;
    "[": (x: any, y: any, Fog: any, noReplace: any) => string;
    "]": (x: any, y: any, Fog: any, noReplace: any) => string;
    w: (x: any, y: any, Fog: any, noReplace: any) => "" | "Water";
    O: (x: any, y: any, Fog: any, noReplace: any) => string;
    P: (x: any, y: any, Fog: any, noReplace: any) => string;
    ",": (x: any, y: any, Fog: any, noReplace: any) => string;
    "?": (x: any, y: any, Fog: any, noReplace: any) => string;
    B: (x: any, y: any, Fog: any, noReplace: any) => string;
};
declare namespace KDSpecialChests {
    const silver: string;
    const shadow: string;
}
/**
 * @type {Record<string, number>}
 */
declare let KDLastKeyTime: Record<string, number>;
declare let KinkyDungeonFloaters: any[];
declare let KinkyDungeonLastFloaterTime: number;
declare let KDTimescale: number;
declare let KDBulletSpeed: number;
declare let KDEntitiesFloaterRegisty: Map<any, any>;
declare let KDFloaterSpacing: number;
declare let KinkyDungeonMessageToggle: boolean;
declare let KinkyDungeonMessageLog: any[];
declare let KDLogDist: number;
declare let KDMSGFontSize: number;
declare let KDLogHeight: number;
declare let KDMaxLog: number;
declare let KDLogTopPad: number;
declare let KDLogIndex: number;
declare let KDLogIndexInc: number;
declare let KDMsgWidth: number;
declare let KDMsgX: number;
declare let KDMsgFadeTime: number;
declare let KDMaxConsoleMsg: number;
declare let KDBoxThreshold: number;
declare let KDButtonColor: string;
declare let KDButtonColorIntense: string;
declare let KDBorderColor: string;
declare let KDFont: string;
declare let KDFontName: string;
declare let KDAllowText: boolean;
declare let KDTileTooltips: {
    '1': () => {
        color: string;
        text: string;
    };
    '0': () => {
        color: string;
        text: string;
    };
    '2': () => {
        color: string;
        text: string;
    };
    R: () => {
        color: string;
        text: string;
    };
    L: () => {
        color: string;
        text: string;
    };
    A: () => {
        color: string;
        text: string;
    };
    a: () => {
        color: string;
        text: string;
    };
    O: () => {
        color: string;
        text: string;
    };
    o: () => {
        color: string;
        text: string;
    };
    C: () => {
        color: string;
        text: string;
    };
    c: () => {
        color: string;
        text: string;
    };
    T: () => {
        color: string;
        text: string;
    };
    '4': () => {
        color: string;
        text: string;
    };
    X: () => {
        color: string;
        text: string;
    };
    '?': () => {
        color: string;
        text: string;
    };
    ',': () => {
        color: string;
        text: string;
    };
    S: () => {
        color: string;
        text: string;
    };
    s: () => {
        color: string;
        text: string;
    };
    H: () => {
        color: string;
        text: string;
    };
    G: () => {
        color: string;
        text: string;
    };
};
declare namespace KDEffectTileTooltips {
    function Runes(tile: any, x: any, y: any, TooltipList: any): void;
    function Inferno(tile: any, x: any, y: any, TooltipList: any): void;
    function Ember(tile: any, x: any, y: any, TooltipList: any): void;
    function Ice(tile: any, x: any, y: any, TooltipList: any): void;
    function Vines(tile: any, x: any, y: any, TooltipList: any): void;
    function Ropes(tile: any, x: any, y: any, TooltipList: any): void;
    function Chains(tile: any, x: any, y: any, TooltipList: any): void;
    function Belts(tile: any, x: any, y: any, TooltipList: any): void;
    function Fabric(tile: any, x: any, y: any, TooltipList: any): void;
    function FabricGreen(tile: any, x: any, y: any, TooltipList: any): void;
    function Slime(tile: any, x: any, y: any, TooltipList: any): void;
    function Latex(tile: any, x: any, y: any, TooltipList: any): void;
    function Steam(tile: any, x: any, y: any, TooltipList: any): void;
    function Smoke(tile: any, x: any, y: any, TooltipList: any): void;
    function Torch(tile: any, x: any, y: any, TooltipList: any): void;
    function TorchUnlit(tile: any, x: any, y: any, TooltipList: any): void;
    function Lantern(tile: any, x: any, y: any, TooltipList: any): void;
    function LanternUnlit(tile: any, x: any, y: any, TooltipList: any): void;
    function TorchOrb(tile: any, x: any, y: any, TooltipList: any): void;
    function Cracked(tile: any, x: any, y: any, TooltipList: any): void;
}
