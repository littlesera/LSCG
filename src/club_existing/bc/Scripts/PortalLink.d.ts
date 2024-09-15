declare function PortalLinkRecieverLoadHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkRecieverDrawHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkRecieverClickHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkRecieverExitHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkTransmitterLoadHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkTransmitterDrawHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkTransmitterClickHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
declare function PortalLinkTransmitterExitHook(data: ExtendedItemData<any>, originalFunction: () => void): void;
/**
 * Draw the sync code UI depending on the mode.
 * Reciever has Random and Copy to clipboard buttons, transmitter has
 * Copy from clipboard and link status label.
 *
 * @param {boolean} reciever - Whether it's in reciever or transmitter mode
 */
declare function PortalLinkSyncCodeInputDraw(reciever: boolean): void;
declare function PortalLinkSyncCodeInputClick(reciever: any): void;
/**
 * Input listener for changes to the sync code field
 * @param {Character} C - The character wearing the item
 * @param {Item} Item - The item being changed
 * @param {boolean} reciever - Whether the called is a reciever or not
 */
declare function PortalLinkCodeChanged(C: Character, Item: Item, reciever: boolean): void;
/**
 * Get the transmitter sync code from a character
 * @param {Character} C
 */
declare function PortalLinkGetTransmitterCode(C: Character): string;
/**
 * Get the list of all items that match a given sync code in the chatroom.
 * @param {string} linkCode
 * @returns {[Character, Item][]}
 */
declare function PortalLinkGetItemsWithCode(linkCode: string): [Character, Item][];
/**
 * Checks the transmitter's link status with its reciever.
 * @param {Character} C - The character wearing the transmitter
 * @param {boolean} newLink - Whether it's a new link being setup
 */
declare function PortalLinkTransmitterCheckLinkStatus(C: Character, newLink?: boolean): void;
/**
 * Gathers the list of available functions for a given asset.
 * @param {Item} item
 */
declare function PortalLinkGetFunctions(item: Item): PortalLinkFunction[];
/**
 * Broadcast an hidden ProcessLink message to the chatroom
 * @param {Character} target
 * @param {Item} item
 * @param {PortalLinkFunction} func
 */
declare function PortalLinkPublishMessage(target: Character, item: Item, func: PortalLinkFunction): void;
/**
 *
 * @param {Character} sender
 * @param {Item} item
 */
declare function PortalLinkCycleChastityModule(sender: Character, item: Item): void;
/**
 * The handler for processing the hidden PortalLink messages
 * @param {Character} sender
 * @param {ServerChatRoomMessage} data
 */
declare function PortalLinkProcessMessage(sender: Character, data: ServerChatRoomMessage): void;
/**
 * This file contains everything needed to add remote-style functions
 * (a.k.a PortalLink compatibility) to an asset, both as a transmitter
 * or a reciever item.
 * For transmitters, you'll need to call the following {@link ExtendedItemScriptHookCallbacks}
 * callbacks:
 * - {@link PortalLinkTransmitterInit}
 * - {@link PortalLinkTransmitterLoad}
 * - {@link PortalLinkTransmitterDraw}
 * - {@link PortalLinkTransmitterExit}
 *
 * Recievers have their own set of matching functions:
 * - {@link PortalLinkRecieverInit}
 * - {@link PortalLinkRecieverLoad}
 * - {@link PortalLinkRecieverDraw}
 * - {@link PortalLinkRecieverExit}
 *
 * That should be enough to give your asset the basic "sync code" UI handling,
 * a reciever will only be detected if it supports at least one function (see below).
 *
 * ## PortalLink functions
 *
 * They are handled by a set of attributes, which the reciever needs to add to its
 * {@link AssetDefinition.Attribute} to declare it supports it. The transmitter will
 * detect those (via {@link PortalLinkGetFunctions}) and use them in its UI.
 *
 * Currently supported PortalLink functions (and their required attributes) are:
 *
 * - `PortalLinkFunctionLock` and `PortalLinkFunctionUnlock`:
 * Those two functions are supported when the `PortalLinkLockable` attribute exists
 * on the reciever, and enable remote-locking.
 *
 * - `PortalLinkFunctionCycleChastity`:
 * Enabled when the `PortalLinkChastity${string}` attribute exists the reciever, and
 * allows the reciever's chastity state to be cycled;
 *
 * @note Right now only modular items are supported, and `${string}` in the attribute
 * is used to look up the module name ({@link ModularItemModuleConfig.Name}) to cycle
 * on the reciever.
 *
 * - `PortalLinkFunctionActivity${ActivityName}`;
 * Enabled when the `PortalLinkActivity${ActivityName}` attribute exists on the reciever,
 * and allows the transmitter to perform the activity named `${ActivityName}` through
 * the transmitter. By default activities will happen on the group the reciever is in,
 * but you can use the `PortalLinkTarget${AssetGroupItemName}` to change the target.
 *
 * Since attributes are customizable at both the asset and option/module-level, you can
 * get pretty involved combinations working. See the PortalPanties and how cycling the
 * chastity changes the activity target for a good example.
 *
 * ## Low-level details
 *
 * The low-level protocol "exchange" itself is done in the following way:
 * function discovery is made with {@link PortalLinkGetFunctions}, {@link PortalLinkPublishMessage} is
 * called when a button is clicked from the transmitter UI on the senders' side, and its counterpart
 * {@link PortalLinkProcessMessage} is called when a PortalLink message is recieved on the target's side.
 * If you want to add more functions, those are the main three you should look at.
 */
/** Max length of sync codes */
declare const PortalLinkCodeLength: 8;
/** Regex string for what consitutes a valid sync code */
declare const PortalLinkCodeText: "[0-9a-f]{8}";
/** Same thing but in regex form for quick .test and .match */
declare const PortalLinkCodeRegex: RegExp;
/** The DOM ID for the sync code field */
declare const PortalLinkCodeInputID: "PortalLinkCode";
/**
 * Parameters for the button grid
 * @type {CommonGenerateGridParameters}
 */
declare const PortalLinkFunctionGrid: CommonGenerateGridParameters;
/** @type {PortalLinkStatus} */
declare let PortalLinkTransmitterStatus: PortalLinkStatus;
/** @type {number | null} */
declare let PortalLinkTransmitterLastLinkCheck: number | null;
/** @type {RectTuple} */
declare const PortalLinkRandomCodeButton: RectTuple;
/** @type {RectTuple} */
declare const PortalLinkCopyCodeButton: RectTuple;
/** @type {RectTuple} */
declare const PortalLinkPasteCodeButton: RectTuple;
/** @type {Record<PortalLinkStatus, string>} */
declare const PortalLinkStatusColors: Record<PortalLinkStatus, string>;
