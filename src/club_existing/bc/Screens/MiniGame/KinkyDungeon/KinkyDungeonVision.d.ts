declare function KinkyDungeonCheckProjectileClearance(xx: any, yy: any, x2: any, y2: any): boolean;
declare function KinkyDungeonCheckPath(x1: any, y1: any, x2: any, y2: any, allowBars: any, blockEnemies: any, maxFails: any): boolean;
declare function KinkyDungeonResetFog(): void;
declare function KinkyDungeonMakeBrightnessMap(width: any, height: any, mapBrightness: any, Lights: any, delta: any): void;
/** Averages two hex colors according to weights w1 and w2
 * @param {number} color1
 * @param {number} color2
 * @param {number} w1 - Weight of color1
 * @param {number} w2 - Weight of color2
 * @returns {number}
 */
declare function KDAvgColor(color1: number, color2: number, w1: number, w2: number): number;
declare function KinkyDungeonMakeVisionMap(width: any, height: any, Viewports: any, Lights: any, delta: any, mapBrightness: any): void;
declare function KDDrawFog(CamX: any, CamY: any, CamX_offset: any, CamY_offset: any): void;
declare let KinkyDungeonSeeAll: boolean;
declare let KDVisionBlockers: Map<any, any>;
declare let KDLightBlockers: Map<any, any>;
declare let KDPlayerLight: number;
declare let KDMapBrightnessMult: number;
declare let KDFogTexture: any;
declare let KDLightCropValue: number;
