import { OutfitSettings } from "Settings/Models/base";
import { OutfitSaveResult, OutfitStorageStrategy } from "Settings/OutfitCollection/IOutfitCollection";
import { OutfitCollection } from "Settings/OutfitCollection/outfitCollection";
import { GuiOutfits } from "Settings/outfits";
import { Subscreen } from "Settings/setting_definitions";
import { BaseModule } from "base";
import { Outfits } from "modules";
import { OpenApplyOutfitDialog } from "Settings/applyOutfitDialog";
import { ModuleCategory } from "Settings/setting_definitions";
import { ICONS, LSCG_SendLocal, WearOutfit, hookFunction, isOutfitEditorCharacter, removeAllHooksByModule, settingsSave } from "utils";
import { OutfitOption } from "Settings/Models/magic";
import { StripLevel } from "Settings/Models/cursed-item";

export class OutfitCollectionModule extends BaseModule {
    data: OutfitCollection;

    constructor() {
        super();
        this.data = new OutfitCollection();
    }

    load() {
        this.data.LoadOutfits();

        // A button at the free left end of the Appearance editor's toolbar row: BC's menu is right-aligned and its header text
        // runs right up to the menu, so there is no room beside the menu's own buttons
        const buttonShown = () => this.Enabled && CharacterAppearanceMode === "" && !DialogFocusItem && !Layering.IsActive() && !!CharacterAppearanceSelection?.IsPlayer() && !isOutfitEditorCharacter(CharacterAppearanceSelection);
        const buttonX = () => 20;
        hookFunction("AppearanceRun", 10, (args, next) => {
            next(args);
            if (buttonShown()) DrawButton(buttonX(), 25, 90, 90, "", "White", ICONS.BOUND_GIRL, "Apply LSCG Outfit");
        }, ModuleCategory.Outfits);
        hookFunction("AppearanceClick", 10, (args, next) => {
            if (buttonShown() && MouseXIn(buttonX(), 90) && MouseYIn(25, 90)) return OpenApplyOutfitDialog();
            return next(args);
        }, ModuleCategory.Outfits);
    }

    unload() {
        removeAllHooksByModule(ModuleCategory.Outfits);
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
			Tag: "apply-outfit",
			Description: "[key?] : Wear an outfit from the collection. Without a key, opens a dialog to preview and choose one.",
			Action: (args) => {
				if (!this.Enabled)
					return;
				const key = args?.trim();
				if (!key) return OpenApplyOutfitDialog();
				const outfit = Outfits().GetOutfit(key);
				if (!outfit) return LSCG_SendLocal(`Outfit ${key} not found.`);
				WearOutfit(Player, Outfits().GetOutfitBundle(key), OutfitOption.both, StripLevel.NONE);
				CharacterRefresh(Player, CurrentScreen !== "Appearance");
				LSCG_SendLocal(`Wearing outfit ${outfit.key}.`);
			},
		}, {
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