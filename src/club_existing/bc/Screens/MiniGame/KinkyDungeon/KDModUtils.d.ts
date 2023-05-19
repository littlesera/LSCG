declare function addTextKey(Name: any, Text: any): void;
/**
 * Creates a restraint using a set of reasonable defaults and adds it to the list of restraints.
 *
 * @param {KDRestraintProps} props
 * A list of restraint props to be applied.  At minimum, the "name", "Group" and "Asset" props should be provided.
 *
 * @param {string} [displayName]
 * The name displayed to the user for the restraint.
 *
 * @param {string} [flavorText]
 * Text that describes the "look and feel" of the restraint.
 *
 * @param {string} [functionText]
 * Text that describes how the restraint operates.
 * @returns The created restraint.
 */
declare function KinkyDungeonCreateRestraint(props: KDRestraintProps, displayName?: string, flavorText?: string, functionText?: string): any;
/**
 * This function adds cursed variants to the restraint list
 * @param {restraint} Restraint - The restraint to have extra variants added onto
 * @param {string[]} Variants - Names of the cursed variants to apply. Must be from KDCursedVars
 */
declare function KinkyDungeonAddCursedVariants(Restraint: restraint, Variants: string[]): void;
/**
 * Gets a list of curses applied to the item
 * @param {string} Restraint
 * @param {boolean} [includeOrig] - includes thje original item
 * @param {number} [minLevel] - for gating curse severity
 * @param {number} [maxLevel] - for gating curse severity
 * @returns {string[]}
 */
declare function KinkyDungeonGetCurses(Restraint: string, includeOrig?: boolean, minLevel?: number, maxLevel?: number): string[];
/**
 * Creates a restraint using an existing restraint as a base and adds it to the list of restraints.
 *
 * @param {string} clonedName
 * The name of the restraint to be cloned.
 *
 * @param {string} newName
 * The name of the newly created restraint.
 *
 * @param {object} props
 * A list of restraint props to be applied.  Anything that isn't supplied with be identical to the base object.
 *
 * @returns The created restraint.
 */
declare function KinkyDungeonCloneRestraint(clonedName: string, newName: string, props: object): any;
/**
 * Registers text for a named restraint.
 *
 * @param {string} name
 * The name of the restraint used by the system.
 *
 * @param {string} displayName
 * The name displayed to the user for the restraint.
 *
 * @param {string} flavorText
 * Text that describes the "look and feel" of the restraint.
 *
 * @param {string} functionText
 * Text that describes how the restraint operates.
 */
declare function KinkyDungeonAddRestraintText(name: string, displayName: string, flavorText: string, functionText: string): void;
/**
 * Registers text for a named restraint.
 *
 * @param {string} restraint - The name of the restraint used by the system.
 * @param {string} newRestraint - The name of the new restraint used by the system.
 *
 */
declare function KinkyDungeonDupeRestraintText(restraint: string, newRestraint: string): void;
declare function cloneDeep(obj: any): any;
declare namespace defaultRestraint {
    const inventory: boolean;
    const power: number;
    const weight: number;
    const minLevel: number;
    const allFloors: boolean;
    namespace escapeChance {
        const Struggle: number;
        const Cut: number;
        const Remove: number;
    }
    const events: any[];
    const enemyTags: any[];
    const playerTags: any[];
    const shrine: any[];
}
/**
 * @type {Record<string, Record<string, number>>}
 */
declare let KDCursedVariantsCreated: Record<string, Record<string, number>>;
