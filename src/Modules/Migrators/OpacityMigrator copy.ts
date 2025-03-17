import { StateConfig } from "Settings/Models/states";
import { BaseMigrator } from "./BaseMigrator";

export class SuggestionSettingMigrator extends BaseMigrator {
    get Version(): string {
        return "0.6.0";
    }
    Migrate(fromVersion: string): boolean {
        Player.LSCG.HypnoModule.suggestionRequireHypnotizer = Player.LSCG.HypnoModule.limitRemoteAccessToHypnotizer;
        Player.LSCG.HypnoModule.randomTrigger = !Player.LSCG.HypnoModule.overrideWords
        return true;
    }
}