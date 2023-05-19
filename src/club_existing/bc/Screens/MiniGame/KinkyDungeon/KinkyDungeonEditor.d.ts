declare function KDInitTileEditor(): void;
declare function KDGetTileIndexImg(index: any): {
    u: any;
    d: any;
    l: any;
    r: any;
};
declare function KDDrawTileEditor(): void;
declare function KDDrawEditorTagsUI(): void;
declare function KDDrawEditorUI(): void;
declare function KDTE_CustomUI(): void;
declare function KDTE_Clear(x: any, y: any, force?: boolean): void;
declare function KDHandleTileEditor(noSwap: any): void;
declare function KDTE_UpdateUI(Load: any): void;
declare function KDTESetIndexToTile(propTile: any): void;
declare function KDTE_CullIndex(tileKeys: any, brushKeys: any): void;
declare function KDTE_CloseUI(): void;
/**
 *
 * @param {number} w
 * @param {number} h
 * @param {string} chkpoint
 */
declare function KDTE_Create(w: number, h: number, chkpoint?: string): void;
declare function KDTE_LoadTile(name: any, loadedTile: any): void;
/**
 * @returns {KDMapTile}
 */
declare function KDTE_ExportTile(): KDMapTile;
declare function KDTE_SaveTile(tile: any): void;
/**
 * @returns {{indX1: number, indY1: number, dir1: string, indX2: number, indY2: number, dir2: string}[]}
 */
declare function KDTEGetInaccessible(): {
    indX1: number;
    indY1: number;
    dir1: string;
    indX2: number;
    indY2: number;
    dir2: string;
}[];
declare function KDObjFromMapArray(array: any): any;
declare function KDReloadAllEditorTiles(): void;
declare function KDTE_GetField(field: any): string | number | string[];
declare let KDMapTilesListEditor: any;
declare let KDEditorTileIndex: string;
declare let KDEditorTileFlex: string;
declare let KDEditorTileFlexSuper: string;
declare let KDEditorTileIndexQuery: string;
/**
 * @type {Record<string, string>}
 */
declare let KDEditorTileIndexStore: Record<string, string>;
/**
 * @type {Record<string, string>}
 */
declare let KDEditorTileFlexStore: Record<string, string>;
/**
 * @type {Record<string, string>}
 */
declare let KDEditorTileFlexSuperStore: Record<string, string>;
declare let KDEditorCurrentMapTileName: string;
declare let KDEditorCurrentMapTile: any;
declare namespace KDTileIndices {
    const udlr: boolean;
    const u: boolean;
    const d: boolean;
    const l: boolean;
    const r: boolean;
    const ud: boolean;
    const lr: boolean;
    const ul: boolean;
    const ur: boolean;
    const dl: boolean;
    const dr: boolean;
    const udl: boolean;
    const udr: boolean;
    const dlr: boolean;
    const ulr: boolean;
}
declare let KDEditorTileIndexHover: string;
declare let KDEditorTileNameIndex: number;
declare let KDEditorTileBrush: string;
declare let KDEditorTileBrushIndex: number;
declare let KDEditorTileBrushIndex2: number;
declare let KDTilePalette: {
    Clear: {
        type: string;
        tile: string;
    };
    Wall: {
        type: string;
        tile: string;
    };
    '----Spawns----': {
        type: string;
    };
    Spawn: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: any[];
        };
    };
    SpawnGuard: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: any[];
            AI: string;
        };
    };
    Prisoner: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    SpawnLooseGuard: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: any[];
            AI: string;
        };
    };
    SpawnMiniboss: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            AI: string;
        };
    };
    SpawnBoss: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            AI: string;
        };
    };
    '----SpecifcSpawns----': {
        type: string;
    };
    SpawnStatue: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            Label: string;
        };
    };
    SpawnObstacleDoor: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnSoulCrys: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnSoulCrysActive: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnChaosCrysRare: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
            Chance: number;
        };
    };
    SpawnChaosCrys: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnChaosCrysActive: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnMushroom: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: string[];
            tags: string[];
            Label: string;
        };
    };
    SpawnCustom: {
        type: string;
        tile: string;
        special: {
            Type: string;
            required: any[];
            Label: string;
        };
        customfields: {
            required: {
                type: string;
            };
            tags: {
                type: string;
            };
            Label: {
                type: string;
            };
            Chance: {
                type: string;
            };
            AI: {
                type: string;
            };
            force: {
                type: string;
            };
        };
    };
    '----Tiles----': {
        type: string;
    };
    Brick: {
        type: string;
        tile: string;
    };
    Doodad: {
        type: string;
        tile: string;
    };
    Grate: {
        type: string;
        tile: string;
    };
    Bars: {
        type: string;
        tile: string;
    };
    Bed: {
        type: string;
        tile: string;
    };
    Crack: {
        type: string;
        tile: string;
    };
    WallHook: {
        type: string;
        tile: string;
    };
    CeilingHook: {
        type: string;
        tile: string;
    };
    InactiveTablet: {
        type: string;
        tile: string;
    };
    BrokenShrine: {
        type: string;
        tile: string;
    };
    BrokenOrb: {
        type: string;
        tile: string;
    };
    BrokenCharger: {
        type: string;
        tile: string;
    };
    '----Doors----': {
        type: string;
    };
    Door: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    DoorAlways: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Priority: boolean;
            AlwaysClose: boolean;
        };
    };
    Door_RedLock: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Priority: boolean;
            AlwaysClose: boolean;
            Lock: string;
        };
    };
    Door_PurpleLock: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Priority: boolean;
            AlwaysClose: boolean;
            Lock: string;
        };
    };
    Door_BlueLock: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Priority: boolean;
            AlwaysClose: boolean;
            Lock: string;
        };
    };
    '----Useful----': {
        type: string;
    };
    Table: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    TableFood: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Food: string;
        };
    };
    Rubble: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    Sharp: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    SharpAlways: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Always: boolean;
        };
    };
    Torch: {
        type: string;
        effectTile: string;
    };
    PotentialTorch: {
        type: string;
        effectTile: string;
    };
    Barrel: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    BarrelAlways: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Always: boolean;
        };
    };
    Cage: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Furniture: string;
        };
        jail: {
            type: string;
            radius: number;
        };
    };
    DisplayStand: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Furniture: string;
        };
        jail: {
            type: string;
            radius: number;
        };
    };
    DisplayEgyptian: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Furniture: string;
        };
        jail: {
            type: string;
            radius: number;
        };
    };
    '----Chests----': {
        type: string;
    };
    Chest: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    ChestRed: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Lock: string;
        };
    };
    ChestBlue: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Lock: string;
        };
    };
    ChestOrShrine: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    HighPriorityChest: {
        type: string;
        tile: string;
        special: {
            Priority: boolean;
        };
    };
    SilverChest: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Loot: string;
            Priority: boolean;
        };
    };
    StorageChest: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Loot: string;
        };
    };
    ChestCustom: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Loot: string;
        };
        customfields: {
            Loot: {
                type: string;
            };
            Faction: {
                type: string;
            };
            NoTrap: {
                type: string;
            };
            lootTrap: {
                type: string;
            };
            Lock: {
                type: string;
            };
            Priority: {
                type: string;
            };
        };
    };
    GuardedChest: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Label: string;
        };
    };
    GuardedChestLocked: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Lock: string;
            Label: string;
        };
    };
    '----Shrines----': {
        type: string;
    };
    Shrine: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Name: string;
        };
    };
    HighPriorityShrine: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Name: string;
            Priority: boolean;
        };
    };
    '----Chargers----': {
        type: string;
    };
    Charger: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    UnlockedCharger: {
        type: string;
        tile: string;
        special: {
            Type: string;
            NoRemove: boolean;
        };
    };
    '----Hazards----': {
        type: string;
    };
    Trap: {
        type: string;
        tile: string;
        special: {
            Type: string;
            Always: boolean;
        };
    };
    PotentialTrap: {
        type: string;
        tile: string;
        special: {
            Type: string;
        };
    };
    '----Misc----': {
        type: string;
    };
    POI: {
        type: string;
    };
    OffLimits: {
        type: string;
    };
    Keyring: {
        type: string;
    };
};
declare let KDTE_State: string;
declare let KDEditorTileBrushIndexVisual: number;
declare let KDEditorTileBrushIndex2Visual: number;
declare let KDEditorTileNameIndexVisual: number;
declare let customfieldsElements: any[];
declare let KDTE_lastMouse: number;
declare let KDTEHoldDelay: number;
declare let KDTEmode: number;
declare let KDTE_Scale: number;
declare let KDTE_MAXDIM: number;
declare let KDTELoadConfirm: boolean;
declare namespace KDTE_Brush {
    function clear(brush: any, curr: any, noSwap: any): void;
    function tile(brush: any, curr: any, noSwap: any): void;
    function offlimits(brush: any, curr: any, noSwap: any): void;
    function Keyring(brush: any, curr: any, noSwap: any): void;
    function effect(brush: any, curr: any, noSwap: any): void;
    function POI(brush: any, curr: any, noSwap: any): void;
}
declare let KDTE_Inaccessible: boolean;
declare let KDTE_confirmreset: boolean;
declare let KDTE_confirmcommit: boolean;
