import { StateConfig } from "Settings/Models/states";
import { BaseMigrator } from "./BaseMigrator";
import { getModule } from "modules";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { parseFromBase64, settingsSave } from "utils";

export class OutfitMigrator extends BaseMigrator {
    get Version(): string {
        return "0.7.0";
    }
    
    Migrate(fromVersion: string): boolean {
        localStorage.setItem(`LSCG_${Player.MemberNumber}_Pre7Backup`, LZString.compressToBase64(JSON.stringify(Player.LSCG)));

        // Migrate Outfits from spells into OutfitCollection
        console.info("Migrating Outfits from spells into new OutfitCollection.");
        let outfitCollection = getModule<OutfitCollectionModule>("OutfitCollectionModule").data
        Player.LSCG.MagicModule.knownSpells
            .filter(spell => !!spell.Outfit || !!spell.Polymorph)
            .forEach(spell => {
                let outfitCode = spell.Outfit?.Code ?? "";
                let polyCode = spell.Polymorph?.Code ?? "";
                let single = !!outfitCode || !!polyCode || outfitCode == polyCode;
                if (!!spell.Outfit) {
                    let legacyCode = parseFromBase64(outfitCode) as ItemBundle[];
                    let fitName = single ? spell.Name : `${spell.Name}_Outfit`;
                    if (!!legacyCode) {
                        outfitCollection.SetOutfitCode(fitName, outfitCode, undefined, false);
                    }
                    spell.Outfit.Key = fitName;
                    spell.Outfit.Code = "";
                }
                if (!!spell.Polymorph) {
                    let test = parseFromBase64(polyCode) as ItemBundle[];
                    let fitName = single ? spell.Name : `${spell.Name}_Polymorph`;
                    if (!!test) 
                        outfitCollection.SetOutfitCode(fitName, polyCode, undefined, false);
                    spell.Polymorph.Key = fitName;
                    spell.Polymorph.Code = "";
                }
            });
        outfitCollection.SaveOutfits();

        return true;
    }
}