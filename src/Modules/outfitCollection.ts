import { OutfitSettings } from "Settings/Models/base";
import { OutfitSaveResult, OutfitStorageStrategy } from "Settings/OutfitCollection/IOutfitCollection";
import { OutfitCollection } from "Settings/OutfitCollection/outfitCollection";
import { GuiOutfits } from "Settings/outfits";
import { Subscreen } from "Settings/setting_definitions";
import { BaseModule } from "base";
import { Outfits } from "modules";
import { LSCG_SendLocal, settingsSave } from "utils";

export class OutfitCollectionModule extends BaseModule {
    data: OutfitCollection;

    constructor() {
        super();
        this.data = new OutfitCollection();
    }

    load() {
        this.data.LoadOutfits();
    }

    get defaultSettings() {
        return <OutfitSettings>{
            enabled: true,
            strategy: OutfitStorageStrategy.SERVER,
        };
    }

    get settings(): OutfitSettings {
        return super.settings as OutfitSettings;
	}

    get settingsScreen(): Subscreen | null {
        return GuiOutfits;
    }

    /** Renames an outfit along with everything that refers to it by name: outfits that inherit it, cursed items,
     *  speech-analysis reactions, spells and the spirit form. False (and nothing changes) if the collection refuses,
     *  e.g. because another outfit already has the new name. */
    RenameOutfit(oldName: string, newName: string, save: boolean = true): boolean {
        if (!this.data.RenameOutfit(oldName, newName, save)) return false;
        const old = oldName.toLocaleLowerCase();
        const matches = (key: string | undefined) => key?.toLocaleLowerCase() === old;
        const L = Player.LSCG;
        for (const item of L.CursedItemModule?.CursedItems ?? [])
            if (matches(item.OutfitKey)) item.OutfitKey = newName;
        for (const rule of L.SpeechAnalysisModule?.reactions ?? [])
            if (matches(rule.outfitKey)) rule.outfitKey = newName;
        const magic = L.MagicModule;
        if (magic) {
            if (matches(magic.spiritFormOutfitKey)) magic.spiritFormOutfitKey = newName;
            for (const spell of magic.knownSpells ?? []) {
                if (spell.Outfit && matches(spell.Outfit.Key)) spell.Outfit.Key = newName;
                if (spell.Polymorph && matches(spell.Polymorph.Key)) spell.Polymorph.Key = newName;
            }
        }
        if (save) settingsSave();
        return true;
    }

    get commands(): ICommand[] {
		// Empty
		return [{
			Tag: "list-outfits",
			Description: ": List all available outfit keys",
			Action: () => {
				if (!this.Enabled)
					return;

				const keys = Outfits().GetOutfitKeys().map(key => `<li>${key}</li>`).join("");
                LSCG_SendLocal(`Your current outfit keys are: <ul style="margin: 0;list-style-type: circle;">${keys}</ul>`, false);
			},
		}, {
			Tag: "add-outfit",
			Description: "[key] [code] : Add new outfit to collection.",
			Action: (args, msg, parsed) => {
				if (!this.Enabled)
					return;
                const key = parsed[0];
                const code = parsed[1];

                if (!key || !code) {
                    LSCG_SendLocal("Invalid outfit arguments.");
                    return;
                }

                if (Outfits().GetOutfit(key)) {
                    LSCG_SendLocal(`Outfit key ${key} already exists.`);
                    return;
                }
                const result = Outfits().SetOutfitCode(key, code);
                if (result == OutfitSaveResult.SUCCESS)
                    LSCG_SendLocal(`Outfit ${key} saved.`);
                else if (result == OutfitSaveResult.SPACE_LOW)
                    LSCG_SendLocal(`Not enough space to save outfit ${key}.`);
                else if (result == OutfitSaveResult.NAME_EXISTS)
                    LSCG_SendLocal(`Outfit key ${key} already exists.`);
                    
			},
		}, {
			Tag: "remove-outfit",
			Description: "[key] : Remove outfit from collection.",
			Action: (args, msg, parsed) => {
				if (!this.Enabled)
					return;
                const key = parsed[0]?.toLocaleLowerCase();

                if (!key) {
                    LSCG_SendLocal("Invalid outfit arguments.");
                    return;
                }

                const keys = Outfits().GetOutfitKeys().map(k => k.toLocaleLowerCase());
                if (keys.indexOf(key) == -1) {
                    LSCG_SendLocal(`Outfit ${key} not found.`);
                } else {
                    Outfits().RemoveOutfit(key);
                    LSCG_SendLocal(`Outfit ${key} removed.`);
                }
			},
		}, {
			Tag: "clear-outfits",
			Description: " : Removes all outfits from collection.",
			Action: (args, msg, parsed) => {
				if (!this.Enabled)
					return;
                Outfits().Clear();
			},
		}];
	}
}