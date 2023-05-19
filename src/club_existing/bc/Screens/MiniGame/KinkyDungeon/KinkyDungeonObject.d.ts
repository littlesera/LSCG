declare function KinkyDungeonDrawGhost(): void;
declare function KinkyDungeonDrawAngel(): void;
declare function KinkyDungeonGhostMessage(): void;
declare function KinkyDungeonAngelMessage(): void;
declare function KinkyDungeonFoodMessage(): void;
declare function KinkyDungeonMakeGhostDecision(): void;
declare function KinkyDungeonDrawCharger(): void;
declare function KinkyDungeonDrawTablet(): void;
declare function KinkyDungeonDrawFood(): void;
declare function KinkyDungeonHandleCharger(): boolean;
/**
 * @type {Record<string,() => void>}
 */
declare let KDObjectMessages: Record<string, () => void>;
/**
 * @type {Record<string,() => boolean>}
 */
declare let KDObjectHandle: Record<string, () => boolean>;
/**
 * @type {Record<string,() => void>}
 */
declare let KDObjectDraw: Record<string, () => void>;
declare let KDChargerLight: number;
declare let KDChargerColor: number;
declare let KDLeylineLightColor: number;
declare let KDLeylineLight: number;
