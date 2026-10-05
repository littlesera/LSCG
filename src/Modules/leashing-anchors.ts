// Leashes are a line with two ends. One end is a *line source*: a worn item with the Leash effect, grabbed from the zone
// it sits in. The other end clasps to an *anchor*: a line source, or anything else that can take a clasp (a collar, a
// clitoris ring). Everything here is a function of what a character wears, so items added by other mods work as soon as
// they carry the Leash effect, or a rule below says they're an anchor.

/** The neck's three slots share their activities (BC mirrors them from ItemNeck), so they count as one zone. */
export const NeckGroups: string[] = ["ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints"];

/** Where the leash activities are offered: one entry per clickable zone that can hold a line source or an anchor. */
export const AnchorZones: string[] = ["ItemNeck", "ItemVulvaPiercings", "ItemPelvis", "ItemMouth", "ItemNose", "ItemArms"];

/** What the leash activities fall back to for items in slots with nothing to click on (a doll handle, a device). */
export const DefaultZone = "ItemNeck";

type AnchorRule = (item: Item) => boolean;

const anchorRules: AnchorRule[] = [
    // Anything on the neck slot is a collar, the same as BC's Collared prerequisite
    item => item.Asset.Group.Name === "ItemNeck",
    // Rings made to hold a leash, whether or not they are set to
    item => item.Asset.Group.Name === "ItemVulvaPiercings" && ["ClitRing", "CockRingLeash"].includes(item.Asset.Name),
];

/** Lets another mod say that its items take a clasp. Optionally adds the zone they're clicked in. Returns an undo. */
export function registerAnchorRule(rule: AnchorRule, zone?: string): () => void {
    anchorRules.push(rule);
    if (zone !== undefined && !AnchorZones.includes(zone))
        AnchorZones.push(zone);
    return () => {
        const ix = anchorRules.indexOf(rule);
        if (ix > -1)
            anchorRules.splice(ix, 1);
    };
}

export function IsLineSource(item: Item): boolean {
    return InventoryItemHasEffect(item, "Leash", true);
}

export function IsAnchor(item: Item): boolean {
    return IsLineSource(item) || anchorRules.some(rule => rule(item));
}

/** The zone an activity on this group is offered in. */
export function ZoneOf(group: string): string {
    if (NeckGroups.includes(group))
        return DefaultZone;
    return AnchorZones.includes(group) ? group : DefaultZone;
}

/** Worn items that can be grabbed as the line. */
export function LineSources(C: Character, zone?: string): Item[] {
    return C.Appearance.filter(item => IsLineSource(item) && (zone === undefined || ZoneOf(item.Asset.Group.Name) === zone));
}

/** Worn items that can take a clasp. */
export function Anchors(C: Character, zone?: string): Item[] {
    return C.Appearance.filter(item => IsAnchor(item) && (zone === undefined || ZoneOf(item.Asset.Group.Name) === zone));
}

/** The zones C has a line source in, then the anchors. */
export function LineZones(C: Character): string[] {
    return [...new Set(LineSources(C).map(item => ZoneOf(item.Asset.Group.Name)))];
}

export function AnchorZonesOn(C: Character): string[] {
    return [...new Set(Anchors(C).map(item => ZoneOf(item.Asset.Group.Name)))];
}

/** What to call C's anchor in a zone, from its first item. */
export function AnchorLabel(C: Character, zone: string): string {
    const item = Anchors(C, zone)[0];
    return (item?.Asset.Description ?? zone.replace(/^Item/, "")).toLowerCase();
}
