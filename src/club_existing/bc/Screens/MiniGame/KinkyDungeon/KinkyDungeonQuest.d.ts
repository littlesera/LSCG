declare function KDQuestList(count: any, mods: any, RoomType: any, MapMod: any, data: any): any[];
declare function KDQuestTick(quests: any): void;
declare function KDRemoveQuest(quest: any): void;
declare function KDAddQuest(quest: any): void;
declare function KDHasQuest(quest: any): boolean;
declare let QuestCompleteWeight: number;
/**
 * @type {Record<string, any>}
 */
declare let KDQuests: Record<string, any>;
