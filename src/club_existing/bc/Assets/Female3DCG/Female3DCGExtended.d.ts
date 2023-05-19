/**
 * Female3DCGExtended.js
 * ---------------------
 * This file contains definitions and configuration for extended items. Items which are marked as Extended in
 * `Female3DCG.js` and which have an extended item definition here will have their load/draw/click functions
 * _automatically_ created when assets are loaded, saving the need for an individual extended item script.
 *
 * Currently, modular and typed items are supported, and this is likely to expand in the future.
 */
/**
 * An enum encapsulating the available extended item archetypes
 * MODULAR - Indicates that this item is modular, with several independently configurable modules
 * @type {{MODULAR: "modular", TYPED: "typed", VIBRATING: "vibrating", VARIABLEHEIGHT: "variableheight", TEXT: "text"}}
 * @see {@link ModularItemConfig}
 * @see {@link TypedItemConfig}
 */
declare const ExtendedArchetype: {
    MODULAR: "modular";
    TYPED: "typed";
    VIBRATING: "vibrating";
    VARIABLEHEIGHT: "variableheight";
    TEXT: "text";
};
/**
 * An object containing all extended item configurations.
 * @type {ExtendedItemMainConfig}
 * @const
 */
declare var AssetFemale3DCGExtended: ExtendedItemMainConfig;
