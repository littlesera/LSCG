import { BaseMigrator } from "./BaseMigrator";
import { getModule } from "modules";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { parseFromBase64 } from "utils";

export class OutfitMigrator extends BaseMigrator {
    get Version(): string {
        return "0.7.0";
    }
    
    Migrate(fromVersion: string): boolean {
        localStorage.setItem(`LSCG_${Player.MemberNumber}_Pre7Backup`, LZString.compressToBase64(JSON.stringify(Player.LSCG)));

        // Migrate Outfits from spells into OutfitCollection
        console.info("Migrating Outfits from spells into new OutfitCollection.");
        const outfitCollection = getModule<OutfitCollectionModule>("OutfitCollectionModule").data;
        Player.LSCG.MagicModule.knownSpells
            .filter(spell => !!spell.Outfit || !!spell.Polymorph)
            .forEach(spell => {
                const outfitCode = spell.Outfit?.Code ?? "";
                const polyCode = spell.Polymorph?.Code ?? "";
                const single = !!outfitCode || !!polyCode || outfitCode == polyCode;
                if (spell.Outfit) {
                    const legacyCode = parseFromBase64(outfitCode) as ItemBundle[];
                    const fitName = single ? spell.Name : `${spell.Name}_Outfit`;
                    if (legacyCode) {
                        outfitCollection.SetOutfitCode(fitName, outfitCode, undefined, false);
                    }
                    spell.Outfit.Key = fitName;
                    spell.Outfit.Code = "";
                }
                if (spell.Polymorph) {
                    const test = parseFromBase64(polyCode) as ItemBundle[];
                    const fitName = single ? spell.Name : `${spell.Name}_Polymorph`;
                    if (test) 
                        outfitCollection.SetOutfitCode(fitName, polyCode, undefined, false);
                    spell.Polymorph.Key = fitName;
                    spell.Polymorph.Code = "";
                }
            });
        outfitCollection.SaveOutfits();

        return true;
    }
}