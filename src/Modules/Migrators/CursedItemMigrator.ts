import { BaseMigrator } from "./BaseMigrator";

export class CursedItemMigrator extends BaseMigrator {
    get Version(): string {
        return "0.7.2";
    }
    
    Migrate(fromVersion: string): boolean {
        if (fromVersion == "0.7.1" && !!(<any>Player.LSCG).SpreadingOutfitModule) {
            Player.LSCG.CursedItemModule = (<any>Player.LSCG).SpreadingOutfitModule;
            delete (<any>Player.LSCG).SpreadingOutfitModule;
            return true;
        } else return false;
    }
}