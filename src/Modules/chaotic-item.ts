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

class PropertyChangeResult {
    propertyChanged: boolean
    newValueStr: string | undefined

    constructor(propertyChanged: boolean, newValueStr: string | undefined) {
        this.propertyChanged = propertyChanged
        this.newValueStr = newValueStr
    }

    // Helper methods

    static changed(newValueStr: string) {
        return new PropertyChangeResult(true, newValueStr);
    }

    static changedHidden() {
        return PropertyChangeResult.changed('<hidden>');
    }

    static unchanged() {
        return new PropertyChangeResult(false, undefined);
    }
}

type PropertyChangeRequest = {
    originalProperties: ItemProperties
    newProperties: ItemProperties
    itemData: TypedItemData | ModularItemData | VibratingItemData
    propertyName: string
}

type ChangeLogic = 'random' | 'evolving';

/*
***** A class to change item's properties (i.e. other options not identified in data's options) *****
*/
class PropertyMutator {
    // return a list of properties applicable to this item
    static geEditablePropertyInBaseline(baselineProperty: PropertiesNoArray.Item | null | undefined): string[] {
        if (!baselineProperty) {
            return [];
        }
        // editableProperty are others options that are not part of an extended item's options such as checkbox / voice command trigger word
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

    // Change specific properties that are part of the options of an item
    // This is based on itemData.baselineProperty that provide us all special properties of an item
    changeEditableProperty(item: Item, itemData: TypedItemData | ModularItemData | VibratingItemData, logic: ChangeLogic): boolean {
        let newProperty: ItemProperties | undefined = CommonCloneDeep(item.Property);
        if (!item.Property || !newProperty) {
            console.warn("changeEditableProperty: item.Property or newProperty is undefined !");
            return false;
        }

        // Get all the item's property that we can modify
        // EditableProperty is our handcrafted list of specific properties that we can modify
        let existingProperty: string[] = PropertyMutator.geEditablePropertyInBaseline(itemData.baselineProperty);
        if (existingProperty.length <= 0) {
            return false;
        }

        let selectedProperty: string | undefined = undefined;
        let customPropertyName: string | undefined = undefined;
        let propertyChangeResult: PropertyChangeResult | undefined = undefined;
        if (existingProperty.length > 0) {
            //console.log("changeEditableProperty: existingProperty: ", existingProperty);
            if (logic === 'random') {
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

                const request: PropertyChangeRequest = {
                    originalProperties: item.Property,
                    newProperties: newProperty,
                    itemData: itemData,
                    propertyName: selectedProperty,
                }

                // boolean properties
                if (PropertyMutator.BOOLEAN_PROPERTIES.has(selectedProperty)) {
                    propertyChangeResult = this.randomizeBooleanProperty(request);
                }
                // 0 | 1 | 2 | 3 properties
                else if (PropertyMutator.NUMERIC_PROPERTIES.has(selectedProperty)) {
                    propertyChangeResult = this.randomizeNumericProperty(request);
                }
                else if (PropertyMutator.TRIGGER_VALUES_PROPERTIES.has(selectedProperty)) {
                    propertyChangeResult = this.randomizeTriggerValuesProperty(request);
                    customPropertyName = "voice trigger words";
                }
            } else if (logic === "evolving") {
                // Find the next property to set
                for (let property of existingProperty) {
                    selectedProperty = property;
                    const request: PropertyChangeRequest = {
                        originalProperties: item.Property,
                        newProperties: newProperty,
                        itemData: itemData,
                        propertyName: selectedProperty,
                    }

                    // boolean properties
                    if (PropertyMutator.BOOLEAN_PROPERTIES.has(selectedProperty)) {
                        propertyChangeResult = this.evolveBooleanProperty(request);
                    }  // 0 | 1 | 2 | 3 properties
                    else if (PropertyMutator.NUMERIC_PROPERTIES.has(selectedProperty)) {
                        propertyChangeResult = this.evolveNumericProperty(request);
                    } else if (PropertyMutator.TRIGGER_VALUES_PROPERTIES.has(selectedProperty)) {
                        propertyChangeResult = this.evolveTriggerValuesProperty(request);
                        customPropertyName = "voice trigger words";
                    }

                    if (propertyChangeResult?.propertyChanged) {
                        break;
                    }
                }
            }
        }
        else {
            console.warn("changeEditableProperty: existingProperty is empty: ", existingProperty);
        }

        if (propertyChangeResult?.propertyChanged) {
            // Update item
            ExtendedItemSetProperty(Player, item, item.Property, newProperty, true, true);
            let itemName = (item?.Craft?.Name ?? item.Asset.Name);
            // Idk why but this AssetTextGet almost always fail to retrieve the correct text.
            // And because the string to retrieve the asset's text don't follow any logics, we probably cannot do better
            let propertyName = AssetTextGet(item.Asset.Name + selectedProperty) ?? selectedProperty;
            if (propertyName.includes("MISSING")) {
                propertyName = customPropertyName ?? selectedProperty ?? "unknown property";
            }
            SendAction(`%NAME%'s ${itemName} changed the ${propertyName} settings by itself to ${propertyChangeResult?.newValueStr}`);
            return true;
        }
        return false;
    }

    // [false, true]
    private randomizeBooleanProperty(request: PropertyChangeRequest): PropertyChangeResult {
        const newValue = !(request.propertyName in request.originalProperties
            && this.getItemPropertyValueFromObject(request.originalProperties, request.propertyName));
        this.setItemPropertyValue(request.newProperties, request.propertyName, newValue);
        return PropertyChangeResult.changed(newValue.toString());
    }

    private evolveBooleanProperty(request: PropertyChangeRequest): PropertyChangeResult {
        if (request.propertyName in request.originalProperties
            && this.getItemPropertyValueFromObject(request.originalProperties, request.propertyName)) {
            return PropertyChangeResult.unchanged();
        }

        this.setItemPropertyValue(request.newProperties, request.propertyName, true);
        return PropertyChangeResult.changed("true");
    }

    // [0, 1, 2, 3]
    private randomizeNumericProperty(request: PropertyChangeRequest): PropertyChangeResult {
        const maxRandom = 4;
        const randNumber = Math.floor(Math.random() * maxRandom);
        this.setItemPropertyValue(request.newProperties, request.propertyName, randNumber);
        // Special case when enabling the speech features (only used for the Futuristic Training belt afaik)
        // In that case we just make sure the default word list is included in the item's properties
        if (request.propertyName == "PunishProhibitedSpeech" && request.itemData.baselineProperty?.PunishProhibitedSpeechWords) {
            this.setItemPropertyValue(
                request.newProperties,
                "PunishProhibitedSpeechWords",
                request.itemData.baselineProperty.PunishProhibitedSpeechWords
            );
        } else if (request.propertyName == "PunishRequiredSpeech" && request.itemData.baselineProperty?.PunishRequiredSpeechWord) {
            this.setItemPropertyValue(request.newProperties, "PunishRequiredSpeechWord", request.itemData.baselineProperty.PunishRequiredSpeechWord);
        }
        return PropertyChangeResult.changed(randNumber.toString());
    }

    private evolveNumericProperty(request: PropertyChangeRequest): PropertyChangeResult {
        const currentNumber = this.getNumericPropertyFromObject(request.originalProperties, request.propertyName);
        if (currentNumber !== undefined && currentNumber < 3) {
            const newValue = currentNumber + 1;
            this.setItemPropertyValue(request.newProperties, request.propertyName, newValue);
            // Special case
            if (request.propertyName === "PunishProhibitedSpeech" && request.itemData.baselineProperty?.PunishProhibitedSpeechWords) {
                this.setItemPropertyValue(request.newProperties, "PunishProhibitedSpeechWords", request.itemData.baselineProperty.PunishProhibitedSpeechWords);
            }
            else if (request.propertyName === "PunishRequiredSpeech" && request.itemData.baselineProperty?.PunishRequiredSpeechWord) {
                this.setItemPropertyValue(request.newProperties, "PunishRequiredSpeechWord", request.itemData.baselineProperty.PunishRequiredSpeechWord);
            }
            return PropertyChangeResult.changed(newValue.toString());
        }
        return PropertyChangeResult.unchanged();
    }

    // [""]
    private randomizeTriggerValuesProperty(request: PropertyChangeRequest): PropertyChangeResult {
        if (!request.itemData.baselineProperty?.TriggerValues) {
            return PropertyChangeResult.unchanged();
        }
        const newTriggerValues = this.randomizeTriggerValues(request.itemData.baselineProperty.TriggerValues);
        this.setItemPropertyValue(request.newProperties, "TriggerValues", newTriggerValues ?? request.itemData.baselineProperty.TriggerValues);
        return PropertyChangeResult.changedHidden();
    }

    private evolveTriggerValuesProperty(request: PropertyChangeRequest): PropertyChangeResult {
        if (!request.itemData.baselineProperty?.TriggerValues) {
            return PropertyChangeResult.unchanged();
        }

        const newTriggerValues = this.randomizeTriggerValues(request.itemData.baselineProperty.TriggerValues);
        this.setItemPropertyValue(request.newProperties, "TriggerValues", newTriggerValues ?? request.itemData.baselineProperty.TriggerValues);
        return PropertyChangeResult.changedHidden();
    }

    // Workaround to bypass TS custom type
    private getItemPropertyValueFromObject(obj: PropertiesNoArray | ItemProperties, property: string) {
        if (property in obj) {
            return obj[property as keyof typeof obj];
        }
        return undefined;
    }

    private getNumericPropertyFromObject(obj: PropertiesNoArray | ItemProperties, property: string): number | undefined {
        const value = this.getItemPropertyValueFromObject(obj, property);
        if (typeof value === "number") {
            return value;
        }
        return undefined;
    }

    // Workaround to bypass TS custom type
    private setItemPropertyValue(obj: ItemProperties, property: string, value: any) {
        obj[property as keyof typeof obj] = value;
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
            "punishment",
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

    private static BOOLEAN_PROPERTIES = new Set(["PunishActivity", "PunishOrgasm", "PunishStandup", "PunishStruggle", "PunishStruggleOther"]);
    private static NUMERIC_PROPERTIES = new Set(["AutoPunish", "PunishSpeech", "PunishProhibitedSpeech", "PunishRequiredSpeech"]);
    private static TRIGGER_VALUES_PROPERTIES = new Set(["TriggerValues"]);
}

export class ChaoticItemModule extends BaseModule {
    private mutator = new PropertyMutator();

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

        // Default filter: no slow nor quick keywords
        let itemCheckPredicate = (itemStr: string) =>
            !quickKeywords.some(k => isPhraseInString(itemStr, k)) &&
            !slowKeywords.some(k => isPhraseInString(itemStr, k));

        if (filter === "quick") {
            itemCheckPredicate = (itemStr: string) => quickKeywords.some(k => isPhraseInString(itemStr, k));
        } else if (filter === "slow") {
            itemCheckPredicate = (itemStr: string) => slowKeywords.some(k => isPhraseInString(itemStr, k));
        }

        for (let item of chaoticItems) {
            if (itemCheckPredicate(GetItemNameAndDescriptionConcat(item) ?? "")) {
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
        let logic: ChangeLogic = "random";
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

    shapeShiftTypedItem(item: Item, logic: ChangeLogic): boolean {
        // Mostly copied from TypedItemSetRandomOption implementation
        const typedData = TypedItemDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeshiftTypedItem: typedData: ", typedData);

        // Handle special properties if any
        this.mutator.changeEditableProperty(item, typedData, logic);

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

    shapeShiftModularItem(item: Item, logic: ChangeLogic): boolean {
        let ret = false;
        const modularData = ModularItemDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeShiftModularItem: modularData: ", modularData);

        // Handle special properties that can be changed
        let isItemHaveEditableProperty = false;
        if (PropertyMutator.geEditablePropertyInBaseline(modularData.baselineProperty).length > 0) {
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
                if (this.mutator.changeEditableProperty(item, modularData, logic)) {
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


    changeModuleOption(item: Item, modularData: ModularItemData, modularModule: ModularItemModule, moduleIndex: number, logic: ChangeLogic): boolean {
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

    shapeShiftVibratorItem(item: Item, logic: ChangeLogic): boolean {
        const vibratorData = VibratorModeDataLookup[`${item.Asset.Group.Name}${item.Asset.Name}`];
        //console.log("shapeShiftVibratorItem: VIBRATING: vibratorData: ", vibratorData);

        // Handle additional properties if any
        this.mutator.changeEditableProperty(item, vibratorData, logic);

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
                // We're already using the last option, Nothing to do.
                return true;
            }
        } else {
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
    ***** Helper functions *****
    */

    getNextOptionFromOptionsList<T extends TypedItemOption | ModularItemOption>(currentOption: T, availableOptions: T[]): T | undefined {
        const lastAvailableOptionIndex = availableOptions.length - 1;
        const currentOptionIndex = availableOptions.findIndex((option) => option.Name === currentOption.Name);

        if (currentOptionIndex >= lastAvailableOptionIndex) {
            // If we are already using the last option we have nothing to do
            return undefined;
        }

        if (currentOptionIndex <= 0) {
            // If we haven't found our current used option, just use the last one directly then
            return availableOptions[availableOptions.length - 1];
        }

        // We found the current option used, we will then select the next one
        return availableOptions[currentOptionIndex + 1];
    }
}
