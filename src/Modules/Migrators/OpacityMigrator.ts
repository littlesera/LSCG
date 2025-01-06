import { StateConfig } from "Settings/Models/states";
import { BaseMigrator } from "./BaseMigrator";

export class OpacityMigrator extends BaseMigrator {
    get Version(): string {
        return "0.5.0";
    }
    Migrate(fromVersion: string): boolean {
        // Migrate LSCGOpacity to Opacity
        function migrateItem(item: Item | ServerItemBundle) {
            if (item?.Property?.LSCGOpacity !== undefined) {
                item.Property.Opacity = item.Property.LSCGOpacity;
                delete item.Property.LSCGOpacity;
            }
        }
        console.info("Migrating LSCGOpacity to vanilla Opacity.");
        // Migrate wardrobe
        Player.Wardrobe?.forEach(outfit => {
            outfit?.forEach(item => migrateItem(item))
        });
        // Migrate current appearance
        Player.Appearance?.forEach(item => migrateItem(item));
        
        return true;
    }
}