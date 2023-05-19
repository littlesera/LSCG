declare function KinkyDungeonHandleStepOffTraps(x: any, y: any, moveX: any, moveY: any): void;
declare function KinkyDungeonHandleTraps(x: any, y: any, Moved: any): void;
declare function KDTrigPanic(): void;
/**
 *
 * @returns {{ Name: string; Enemy?: string; Spell?: string; Level: number; Power: number; Weight: number; strict?: true;}[]}
 */
declare function KinkyDungeonGetGoddessTrapTypes(): {
    Name: string;
    Enemy?: string;
    Spell?: string;
    Level: number;
    Power: number;
    Weight: number;
    strict?: true;
}[];
declare function KinkyDungeonGetTrap(trapTypes: any, Level: any, tags: any): {
    Name: any;
    Restraint: any;
    Enemy: any;
    Spell: any;
    Power: any;
};
declare function KDSmokePuff(x: any, y: any, radius: any, density: any, nomsg: any): void;
declare function KDSteamPuff(x: any, y: any, radius: any, density: any, nomsg: any): void;
declare let KinkyDungeonTrapMoved: boolean;
