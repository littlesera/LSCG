declare function KinkyDungeonItemDrop(x: any, y: any, dropTable: any, summoned: any): false | {
    x: any;
    y: any;
    name: any;
    amount: any;
};
declare function KinkyDungeonDropItem(Item: any, Origin: any, AllowOrigin: any, noMsg: any, allowEnemies: any): boolean;
declare function KinkyDungeonItemEvent(Item: any): boolean;
declare function KinkyDungeonItemCheck(x: any, y: any, Index: any): void;
declare function KinkyDungeonDrawItems(canvasOffsetX: any, canvasOffsetY: any, CamX: any, CamY: any): void;
declare function KinkyDungeonDrawHeart(): void;
declare function KinkyDungeonHandleHeart(): boolean;
declare let KinkyDungeonGroundItems: any[];
