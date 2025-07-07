import { StateConfig } from "Settings/Models/states";
import { BaseMigrator } from "./BaseMigrator";
import { getModule } from "modules";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { parseFromBase64, settingsSave } from "utils";
import { SemVer } from "semver";

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