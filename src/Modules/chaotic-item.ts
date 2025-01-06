import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetItemNameAndDescriptionConcat, isPhraseInString, removeAllHooksByModule, SendAction } from "../utils";
import { BaseSettingsModel } from "Settings/Models/base";

export const chaoticKeywords: string[] = [
	"chaotic",
	"living",
	"sentient",
	"changing",
];

export const evolvingKeywords: string[] = [
	"evolving",
	"evolve",
	"spreading",
	"spread",
];

// to reduce the default time of Chaotic/Evolving items
export const quickKeywords: string[] = [
	"quick",
	"quickly",
	"rapidly",
	"fast",
];

// to increase the default time of Chaotic/Evolving items
export const slowKeywords: string[] = [
	"slow",
	"slowly",
];

export const DEFAULT_TRIGGER_TIME_MS = 10 * 60 * 1000; // 10min
export const QUICK_TRIGGER_TIME_MS = 3 * 60 * 1000; // 3min
export const SLOW_TRIGGER_TIME_MS = 30 * 60 * 1000; // 30min

export class ChaoticItemModule extends BaseModule {
    defaultTriggerInterval: number = 0;
    quickTriggerInterval: number = 0;
    slowTriggerInterval: number = 0;

    get defaultSettings() {
        return <BaseSettingsModel>{
            enabled: true
        };
    }

    load(): void {
        this.defaultTriggerInterval = setInterval(() => { this.checkForChaoticItem("default") }, DEFAULT_TRIGGER_TIME_MS);
        this.quickTriggerInterval = setInterval(() => { this.checkForChaoticItem("quick") }, QUICK_TRIGGER_TIME_MS);
        this.slowTriggerInterval = setInterval(() => { this.checkForChaoticItem("slow") }, SLOW_TRIGGER_TIME_MS);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.ChaoticItem);
        clearInterval(this.defaultTriggerInterval);
        clearInterval(this.quickTriggerInterval);
        clearInterval(this.slowTriggerInterval);
    }

    checkForChaoticItem(filter: "default" | "quick" | "slow") {
        if (!this.Enabled)
            return;

        let chaoticItems = Player.Appearance.filter(a => {
            let itemStr = GetItemNameAndDescriptionConcat(a) ?? "";
            return a.Asset.Group.Name != "ItemHandheld" && (chaoticKeywords.some(k => isPhraseInString(itemStr, k)) || evolvingKeywords.some(k => isPhraseInString(itemStr, k)));
        });

        // Filter the items that correspond to the correct trigger timer
        let filteredChaoticItems: Item[] = [];
        for (let item of chaoticItems) {
            let itemStr = GetItemNameAndDescriptionConcat(item) ?? "";
            if (filter != "slow" && quickKeywords.some(k => isPhraseInString(itemStr, k))) {
                if (filter == "quick") {
                    filteredChaoticItems.push(item);
                }
                // if filter == "default" we just skip it
                continue;
            }
            else if (filter != "quick" && slowKeywords.some(k => isPhraseInString(itemStr, k))) {
                if (filter == "slow") {
                    filteredChaoticItems.push(item);
                }
                // if filter == "default" we just skip it
                continue;
            }
            else if (filter == "default") {
                filteredChaoticItems.push(item);
            }
        }

        for (let item of filteredChaoticItems) {
			this.triggerChaoticItem(item);
        }
    }

    triggerChaoticItem(item: Item | undefined) {
        if (!item || !item.Asset.Archetype) {
            return;
        }

        // Change item's option based on the logic provided (random or evolving)
        // evolving logic will select a higher indexed option (or do nothing if nothing higher)
        let logic: "random" | "evolving" = "random";
        let itemStr = GetItemNameAndDescriptionConcat(item) ?? "";
        if (evolvingKeywords.some(k => isPhraseInString(itemStr, k)))
            logic = "evolving";

        let changed = false;
        switch (item.Asset.Archetype) {
            case ExtendedArchetype.TYPED:
                changed = changed || this.shapeShiftTypedItem(item, logic);
                break;
            case ExtendedArchetype.MODULAR:
                changed = changed || this.shapeShiftModularItem(item, logic);
                break;
            case ExtendedArchetype.VIBRATING:
                changed = changed || this.shapeShiftVibratorItem(item, logic);
                break;
            default:
                // Archetype does not yet support chaotic/evolving feature
                console.warn("triggerChaoticItem: Not supported Archetype: ", item.Asset.Archetype);
                break;
        }

        if (changed) {
            CharacterRefresh(Player, true);
            ChatRoomCharacterUpdate(Player);
        }
    }

    shapeShiftTypedItem(item: Item, logic: "random" | "evolving"): boolean {
        // Mostly copied from TypedItemSetRandomOption implementation
        const typedData = TypedItemDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeshiftTypedItem: typedData: ", typedData);

        // Handle special properties if any
        this.changeEditableProperty(item, typedData, logic);

        // Avoid limited options
        const typedAvailableOptions = typedData.options.filter(o => {
            //return (InventoryCheckLimitedPermission(Player, item, `${typedData.name}${o.Property.TypeRecord[typedData.name]}`));
            return (!InventoryBlockedOrLimited(Player, item, `${typedData.name}${o.Property.TypeRecord[typedData.name]}`));
        });
        if (typedAvailableOptions.length === 0) {
            return false;
        }
        //console.log("shapeshiftTypedItem: availableOptions: ", typedAvailableOptions);

        // Select next item option
        let typedPreviousOption = TypedItemFindPreviousOption(typedData, item);
        let typedNewOption = undefined;
        if (logic == "random") {
            typedNewOption = CommonRandomItemFromList(typedPreviousOption, typedAvailableOptions);
        }
        else if (logic == "evolving") {
            // Find the next option just after the current option
            typedNewOption = this.getNextOptionFromOptionsList(typedPreviousOption, typedAvailableOptions);
        }
        if (!typedNewOption) {
            return false;
        }

        // Update item
        ExtendedItemSetOption(typedData, Player, item, typedNewOption, typedPreviousOption, true);
        let itemName = (item?.Craft?.Name ?? item.Asset.Name);
        let optionName = AssetTextGet(typedData.dialogPrefix.option + typedNewOption.Name) ?? typedNewOption.Name;
        SendAction(`%NAME%'s ${itemName} shapeshifted by itself to ${optionName} shape`);
        return true;
    }


    /*
    **** Modular item's functions ****
    */

    shapeShiftModularItem(item: Item, logic: "random" | "evolving"): boolean {
        let ret = false;
        const modularData = ModularItemDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeShiftModularItem: modularData: ", modularData);

        // Handle special properties that can be changed
        let isItemHaveEditableProperty = false;
        if (this.geEditablePropertyInBaseline(modularData.baselineProperty).length > 0) {
            isItemHaveEditableProperty = true;
        }

        // slect random module
        let moduleIndexAlreadyUsed: number[] = [];
        let moduleLength = modularData.modules.length;
        if (isItemHaveEditableProperty) {
            // The last module index will be for EditableProperty
            moduleLength++;
        }
        // for modular item we want to change several module at once, depending on it's number of module
        let moduleToChange = Math.floor(moduleLength / 3) + 1;

        while (moduleToChange > 0 && moduleIndexAlreadyUsed.length < moduleLength) {
            let moduleIndex = Math.floor(Math.random() * moduleLength);
            // Force selecting a module not used before
            while (moduleIndexAlreadyUsed.includes(moduleIndex)) {
                moduleIndex = Math.floor(Math.random() * moduleLength);
            }
            if (isItemHaveEditableProperty && moduleIndex >= modularData.modules.length) {
                if (this.changeEditableProperty(item, modularData, logic)) {
                    // If returned true we correctly changed this module
                    moduleToChange--;
                    ret = true;
                }
            }
            else {
                let modularModule = modularData.modules[moduleIndex];
                if (!modularModule) {
                    console.warn("Couldn't find modularModule with modularData.modules.length=", modularData.modules.length, " moduleIndex=", moduleIndex);
                    return false;
                }
                if (this.changeModuleOption(item, modularData, modularModule, moduleIndex, logic)) {
                    // If returned true we correctly changed this module
                    moduleToChange--;
                    ret = true;
                }
            }
            // remember we already used this module
            moduleIndexAlreadyUsed.push(moduleIndex);
        }
        return ret;
    }

    
    changeModuleOption(item: Item, modularData: ModularItemData, modularModule: ModularItemModule, moduleIndex: number, logic: "random" | "evolving"): boolean {
        // get previous option
        let itemTypeRecord: TypeRecord | undefined | null = item.Property?.TypeRecord;
        if (!itemTypeRecord)
            itemTypeRecord = null;
        let modularCurrentModuleValues = ModularItemParseCurrent(modularData, itemTypeRecord/*DialogFocusItem.Property.TypeRecord*/);
        let modularPreviousOption = modularModule.Options[modularCurrentModuleValues[moduleIndex]];
        if (!modularPreviousOption) {
            console.warn("Couldn't find modularPreviousOption with modularCurrentModuleValues=", modularCurrentModuleValues, " and moduleIndex=", moduleIndex);
            return false;
        }

        // Avoid limited options
        const moduleAvailableOptions = modularModule.Options.filter(o => {
            //return (InventoryCheckLimitedPermission(Player, item, o.Name));
            return (!InventoryBlockedOrLimited(Player, item, o.Name));
        });
        if (moduleAvailableOptions.length === 0) {
            return false;
        }
        //console.log("changeModuleOption: availableOptions: ", moduleAvailableOptions);

        let modularNewOption = undefined;
        if (logic == 'random') {
            modularNewOption = modularPreviousOption;
            let i = 0; // Anti-infinite loop just in case
            while (modularNewOption.Name == modularPreviousOption.Name && i < 30) {
                // select a random option
                let maxRandom = moduleAvailableOptions.length;
                let optionIndex = Math.floor(Math.random() * maxRandom);
                modularNewOption = moduleAvailableOptions[optionIndex];
                if (!modularNewOption) {
                    console.warn("Couldn't find modularNewOption with moduleAvailableOptions.length=", moduleAvailableOptions.length, " optionIndex=", optionIndex);
                    return false;
                }
                i++;
            }
        }
        else if (logic == "evolving") {
            // Find the next option just after the current option
            modularNewOption = this.getNextOptionFromOptionsList(modularPreviousOption, moduleAvailableOptions)
        }
        //console.log("shapeShiftModularItem: modularNewOption: ", modularNewOption);
        if (!modularNewOption) {
            return false;
        }

        // set new option
        ExtendedItemSetOption(modularData, Player, item, modularNewOption, modularPreviousOption, true, true);
        let itemName = (item?.Craft?.Name ?? item.Asset.Name);
        let moduleName = AssetTextGet(modularData.dialogPrefix.module + modularNewOption.ModuleName) ?? modularNewOption.ModuleName;
        let optionName = AssetTextGet(modularData.dialogPrefix.option + modularNewOption.Name) ?? modularNewOption.Name;
        SendAction(`%NAME%'s ${itemName} changed the ${moduleName} settings by itself to ${optionName}`);
        return true;
    }


    /*
    **** Vibrator item's functions ****
    */

    shapeShiftVibratorItem(item: Item, logic: "random" | "evolving"): boolean {
        const vibratorData = VibratorModeDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeShiftVibratorItem: VIBRATING: vibratorData: ", vibratorData);

        // Handle additional properties if any
        this.changeEditableProperty(item, vibratorData, logic);

        // Avoid limited options
        const vibratorAvailableOptions = vibratorData.options.filter(o => {
            return (!InventoryBlockedOrLimited(Player, item, `${vibratorData.name}${o.Property.TypeRecord[vibratorData.name]}`));
        });
        if (vibratorAvailableOptions.length === 0) {
            return false;
        }
        //console.log("shapeShiftVibratorItem: availableOptions: ", vibratorAvailableOptions);

        // Select an option based on the logic
        let vibratorNewOption = undefined;
        let vibratorPrevOptionName = item.Property?.Mode;
        if (logic == "evolving" && vibratorPrevOptionName) {
            // find current/previous option index
            let previousOptionIndex = undefined;
            let i = 0;
            while (i < vibratorAvailableOptions.length) {
                let option = vibratorAvailableOptions[i];
                if (option.Name == vibratorPrevOptionName) {
                    previousOptionIndex = i;
                    break;
                }
                i++;
            }
            if (!previousOptionIndex) {
                console.warn("shapeShiftVibratorItem: Couldn't find previous option with vibratorPrevOptionName=" + vibratorPrevOptionName + " vibratorAvailableOptions: ", vibratorAvailableOptions);
                return false;
            }

            if (previousOptionIndex == (vibratorAvailableOptions.length - 1)) {
                // We already using the last option, Nothing to do.
                return true;
            }
        }
        else {
            // random logic
            let maxRandom = vibratorAvailableOptions.length;
            let vibratorOptionIndex = Math.floor(Math.random() * maxRandom);
            vibratorNewOption = vibratorAvailableOptions[vibratorOptionIndex].Name;
        }
        if (!vibratorNewOption) {
            return false;
        }

        // Update item
        //console.log("shapeShiftVibratorItem: VIBRATING: vibratorNewOption: ", vibratorNewOption);
        VibratorModeSetOptionByName(Player, item, vibratorNewOption);
        let itemName = (item?.Craft?.Name ?? item.Asset.Name);
        let optionName = AssetTextGet(vibratorData.dialogPrefix.option + vibratorNewOption) ?? vibratorNewOption;
        SendAction(`%NAME%'s ${itemName} changed settings by itself to ${optionName} mode`);
        return true;
    }


    /*
    ***** Functions to change item's properties (i.e. other options not indentified in data's options) *****
    */

    // Change specific properties that are part of the options of an item
    // This is based on itemData.baselineProperty that provide us all special proerties of an item
    changeEditableProperty(item: Item, itemData: TypedItemData | ModularItemData | VibratingItemData, logic: "random" | "evolving"): boolean {
        let newProperty: ItemProperties | undefined = CommonCloneDeep(item.Property);;
        let propertyChanged: boolean = false;
        if (!item.Property || !newProperty) {
            console.warn("changeEditableProperty: item.Property or newProperty is undefined !");
            return false;
        }

        // Get all the item's property that we can modify
        // EditableProperty is our handcrafted list of specific properties that we can modifiy
        let existingProperty: string[] = this.geEditablePropertyInBaseline(itemData.baselineProperty);
        if (existingProperty.length <= 0) {
            return false;
        }

        let selectedProperty: string | undefined = undefined;
        let newValuestr: any = undefined;
        if (existingProperty.length > 0) {
            //console.log("changeEditableProperty: existingProperty: ", existingProperty);
            if (logic == 'random') {
                let maxRandom = existingProperty.length;
                let propertyIndex = Math.floor(Math.random() * maxRandom);
                selectedProperty = existingProperty[propertyIndex];

                // References of the variable types of all editable properties
                //PunishActivity: [false, true],
                //PunishOrgasm: [false, true],
                //PunishStandup: [false, true],
                //PunishStruggle: [false, true],
                //PunishStruggleOther: [false, true],
                //AutoPunish: [0, 1, 2, 3],
                //PunishSpeech: [0, 1, 2, 3],
                //PunishProhibitedSpeech: [0, 1, 2, 3],
                //PunishRequiredSpeech: [0, 1, 2, 3],
                //TriggerValues: [""],
                //PunishProhibitedSpeechWords: [""],
                //PunishRequiredSpeechWord: [""]

                // boolean properties
                if (["PunishActivity", "PunishOrgasm", "PunishStandup", "PunishStruggle", "PunishStruggleOther"].includes(selectedProperty)) {
                    if (selectedProperty in item.Property && this.getItemPropertyValueFromObject(item.Property, selectedProperty)) {
                        newProperty = this.setItemPropertyValue(newProperty, selectedProperty, false);
                        newValuestr = "false";
                    }
                    else {
                        newProperty = this.setItemPropertyValue(newProperty, selectedProperty, true);
                        newValuestr = "true";
                    }
                    propertyChanged = true;
                }
                // 0 | 1 | 2 | 3 properties
                else if (["AutoPunish", "PunishSpeech", "PunishProhibitedSpeech", "PunishRequiredSpeech"].includes(selectedProperty)) {
                    let maxRandom = 4;
                    let randNumber = Math.floor(Math.random() * maxRandom);
                    newProperty = this.setItemPropertyValue(newProperty, selectedProperty, randNumber);
                    newValuestr = randNumber.toString();
                    // Special case when enabling the speech features (only used for the Futuristic Training belt afaik)
                    // In that case we just make sure the default word list is included in the item's properties
                    if (selectedProperty == "PunishProhibitedSpeech" &&  itemData.baselineProperty?.PunishProhibitedSpeechWords) {
                        newProperty = this.setItemPropertyValue(newProperty, "PunishProhibitedSpeechWords", itemData.baselineProperty.PunishProhibitedSpeechWords);
                    }
                    else if (selectedProperty == "PunishRequiredSpeech" &&  itemData.baselineProperty?.PunishRequiredSpeechWord) {
                        newProperty = this.setItemPropertyValue(newProperty, "PunishRequiredSpeechWord", itemData.baselineProperty.PunishRequiredSpeechWord);
                    }
                    propertyChanged = true;
                }
                else if (selectedProperty == "TriggerValues" &&  itemData.baselineProperty?.TriggerValues) {
                    let newTriggerValues = this.randomizeTriggerValues(itemData.baselineProperty.TriggerValues);
                    if (newTriggerValues) {
                        newProperty = this.setItemPropertyValue(newProperty, "TriggerValues", newTriggerValues);
                    }
                    else {
                        newProperty = this.setItemPropertyValue(newProperty, "TriggerValues", itemData.baselineProperty.TriggerValues);
                    }
                    newValuestr = "<hidden>";
                    selectedProperty = "voice trigger words";
                    propertyChanged = true;
                }
            }
            else if (logic == "evolving") {
                // Find the next property to set
                for (let property of existingProperty) {
                    selectedProperty = property;
                    // boolean properties
                    if (["PunishActivity", "PunishOrgasm", "PunishStandup", "PunishStruggle", "PunishStruggleOther"].includes(property)) {
                        if (property in item.Property && this.getItemPropertyValueFromObject(item.Property, property)) {
                            continue;
                        }
                        else {
                            newProperty = this.setItemPropertyValue(newProperty, property, true);
                            newValuestr = "true";
                            propertyChanged = true;
                            break;
                        }
                    }
                    // 0 | 1 | 2 | 3 properties
                    else if (["AutoPunish", "PunishSpeech", "PunishProhibitedSpeech", "PunishRequiredSpeech"].includes(property)) {
                        let currentNumber = this.getItemPropertyValueFromObject(item.Property, property);
                        if (currentNumber && typeof currentNumber == "number" && currentNumber < 3) {
                            newProperty = this.setItemPropertyValue(newProperty, property, currentNumber + 1);
                            newValuestr = (currentNumber+1).toString();
                            // Special case
                            if (property == "PunishProhibitedSpeech" &&  itemData.baselineProperty?.PunishProhibitedSpeechWords) {
                                newProperty = this.setItemPropertyValue(newProperty, "PunishProhibitedSpeechWords", itemData.baselineProperty.PunishProhibitedSpeechWords);
                            }
                            else if (property == "PunishRequiredSpeech" &&  itemData.baselineProperty?.PunishRequiredSpeechWord) {
                                newProperty = this.setItemPropertyValue(newProperty, "PunishRequiredSpeechWord", itemData.baselineProperty.PunishRequiredSpeechWord);
                            }
                            propertyChanged = true;
                            break;
                        }
                        else {
                            continue;
                        }
                    }
                    else if (property == "TriggerValues" &&  itemData.baselineProperty?.TriggerValues) {
                        let newTriggerValues = this.randomizeTriggerValues(itemData.baselineProperty.TriggerValues);
                        if (newTriggerValues) {
                            newProperty = this.setItemPropertyValue(newProperty, "TriggerValues", newTriggerValues);
                        }
                        else {
                            newProperty = this.setItemPropertyValue(newProperty, "TriggerValues", itemData.baselineProperty.TriggerValues);
                        }
                        newValuestr = "<hidden>";
                        selectedProperty = "voice trigger words";
                        propertyChanged = true;
                        break;
                    }
                }
            }
        }
        else {
            console.warn("changeEditableProperty: existingProperty is empty: ", existingProperty);
        }

        if (propertyChanged) {
            // Update item
            ExtendedItemSetProperty(Player, item, item.Property, newProperty, true, true);
            let itemName = (item?.Craft?.Name ?? item.Asset.Name);
            // Idk why but this AssetTextGet almost always fail to retreive the correct text.
            // And because the string to retreive the asset's text don't follow any logics, we probably cannot do better
            let propertyName = AssetTextGet(item.Asset.Name + selectedProperty) ?? selectedProperty;
            if (propertyName.includes("MISSING")) {
                propertyName = selectedProperty ?? "unknown property";
            }
            SendAction(`%NAME%'s ${itemName} changed the ${propertyName} settings by itself to ${newValuestr}`);
            return true;
        }
        return false;
    }

    // return a list of properties applicable to this item
    geEditablePropertyInBaseline(baselineProperty: PropertiesNoArray.Item | null | undefined): string[] {
        if (!baselineProperty) {
            return [];
        }
        // editableProperty are others options that are not part of an extended item's options such as chechbox / voice command trigger word
        let editableProperty = [
            "AutoPunish",
            "PunishActivity",
            "PunishOrgasm",
            "PunishSpeech",
            "PunishStandup",
            "PunishStruggle",
            "PunishStruggleOther",
            "TriggerValues",
            "PunishProhibitedSpeech",
            "PunishRequiredSpeech",
            "PunishProhibitedSpeechWords",
            "PunishRequiredSpeechWord"
        ]

        let existingProperty: string[] = [];
        if (baselineProperty) {
            for (let property of editableProperty) {
                if (property in baselineProperty) {
                    existingProperty.push(property);
                }
            }
        }
        return existingProperty;
    }

    // Workaround to bypass TS custom type
    getItemPropertyValueFromObject(obj: PropertiesNoArray | ItemProperties, property: string) {
        switch (property) {
            case "AutoPunish":
                return obj.AutoPunish;
            case "PunishActivity":
                return obj.PunishActivity;
            case "PunishOrgasm":
                return obj.PunishOrgasm;
            case "PunishSpeech":
                return obj.PunishSpeech;
            case "PunishStandup":
                return obj.PunishStandup;
            case "PunishStruggle":
                return obj.PunishStruggle;
            case "PunishStruggleOther":
                return obj.PunishStruggleOther;
            case "TriggerValues":
                return obj.TriggerValues;
            case "PunishProhibitedSpeech":
                return obj.PunishProhibitedSpeech;
            case "PunishRequiredSpeech":
                return obj.PunishRequiredSpeech;
            case "PunishProhibitedSpeechWords":
                return obj.PunishProhibitedSpeechWords;
            case "PunishRequiredSpeechWord":
                return obj.PunishRequiredSpeechWord;
            default:
                return undefined;
        };
    }

    // Workaround to bypass TS custom type
    setItemPropertyValue(obj: ItemProperties, property: string, value: any) {
        switch (property) {
            case "AutoPunish":
                obj.AutoPunish = value;
                break;
            case "PunishActivity":
                obj.PunishActivity = value;
                break;
            case "PunishOrgasm":
                obj.PunishOrgasm = value;
                break;
            case "PunishSpeech":
                obj.PunishSpeech = value;
                break;
            case "PunishStandup":
                obj.PunishStandup = value;
                break;
            case "PunishStruggle":
                obj.PunishStruggle = value;
                break;
            case "PunishStruggleOther":
                obj.PunishStruggleOther = value;
                break;
            case "TriggerValues":
                obj.TriggerValues = value;
                break;
            case "PunishProhibitedSpeech":
                obj.PunishProhibitedSpeech = value;
                break;
            case "PunishRequiredSpeech":
                obj.PunishRequiredSpeech = value;
                break;
            case "PunishProhibitedSpeechWords":
                obj.PunishProhibitedSpeechWords = value;
                break;
            case "PunishRequiredSpeechWord":
                obj.PunishRequiredSpeechWord = value;
                break;
        };
        return obj;
    }
    
    // Randomize the voice trigger values with our custom list of common word
    // baselineTriggerValues is a list of word separated by commas (type string)
    // baselineTriggerValues also provide us with the information of how much word is needed
    randomizeTriggerValues(baselineTriggerValues: string) {
        let nbWordTodo = baselineTriggerValues.split(",").length;
        let newTriggerValues = "";

        let commonWordList: string[] = [
            "Hi",
            "Goodbye",
            "Bye",
            "my",
            "please",
            "help",
            "helpless",
            "locked",
            "lock",
            "locked",
            "tied",
            "untie",
            "release",
            "released",
            "tease",
            "orgasm",
            "shock",
            "punish",
            "punishement",
            "cute",
            "cutie",
            "slut",
            "slave",
            "sub",
            "spank",
            "guess",
            "devious",
            "chaotic",
            "living",
            "sentient",
            "spreading",
            "spread",
            "restrain",
            "bondage",
            "bound",
            "butt",
            "ass",
            "vagina",
            "clit",
            "hand",
            "arm",
            "leg",
            "feet",
            "head",
            "mouth",
            "gag",
            "gagged",
            "Increase",
            "Decrease",
            "Inflate",
            "Deflate",
        ];
        commonWordList.push(Player.Name);
        if (Player.Nickname)
            commonWordList.push(Player.Nickname);

        while (nbWordTodo > 0 && commonWordList.length > 0) {
            let maxRandom = commonWordList.length;
            let wordIndex = Math.floor(Math.random() * maxRandom);

            if (newTriggerValues.length == 0) {
                newTriggerValues = commonWordList[wordIndex];
            }
            else {
                newTriggerValues += "," + commonWordList[wordIndex];
            }

            nbWordTodo--;
            // removed used word from list to avoid duplicate
            commonWordList.splice(wordIndex, 1);
        }

        //console.log("randomizeTriggerValues: newTriggerValues: ", newTriggerValues);
        return newTriggerValues;
    }

    /*
    ***** Helper functions *****
    */
    
    getNextOptionFromOptionsList<T extends TypedItemOption | ModularItemOption>(currentOption: T, availableOptions: T[]): T | undefined {
        let isNextOption = false;
        let newOption: T | undefined = undefined;
        for (let option of availableOptions) {
            if (isNextOption) {
                newOption = option;
                break;
            }

            if (option.Name == currentOption.Name) {
                // We found the current option used, we will then select the next one
                isNextOption = true;
                continue;
            }
        }
        if (!newOption) {
            if (isNextOption) {
                // If we are already using the last option we have nothing to do
                return undefined;
            }
            else {
                // If we didn't found our current used option, just use the last one directly then
                newOption = availableOptions[availableOptions.length - 1];
            }
        }
        return newOption;
    }
}