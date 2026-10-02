import { LSCGActivitiesApi, LSCGActivityDefinition, LSCGPrerequisiteDefinition } from "./types";
import { Registry } from "./registry";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import type { ActivityBundle } from "Modules/activities";

/** An activity an extension registered. The module builds fresh BC objects from it each time it is applied. */
export interface ExtensionActivity {
    /** "<extension id>.<name>"; BC sees "LSCG_" + this. */
    id: string;
    build(): ActivityBundle;
}

export interface ExtensionPrerequisite {
    id: string;
    check(acting: Character, acted: Character, group: AssetGroup): boolean;
}

/** Applied to BC's activity list by ActivityModule, which may load after extensions register. */
export const extensionActivities = new Registry<ExtensionActivity>("activity");
export const extensionPrerequisites = new Registry<ExtensionPrerequisite>("activity prerequisite");

const DEFAULT_PROGRESS = 70;

function requireText(owner: ErrorOwner, what: string, value: unknown): string {
    if (typeof value !== "string" || value.trim() === "")
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be a non-empty string.`);
    return value;
}

function progress(owner: ErrorOwner, what: string, value: number | undefined): number {
    if (value === undefined) return DEFAULT_PROGRESS;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be a non-negative number.`);
    return value;
}

/** Builds the `activities` member of an extension handle. */
export function createActivitiesApi(owner: ErrorOwner, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGActivitiesApi {
    const activities = new Map<string, () => void>();
    const prerequisites = new Map<string, () => void>();

    return {
        register(def: LSCGActivityDefinition): () => void {
            if (!def || typeof def !== "object")
                throw new Error(`LSCG[ext:${owner.id}]: an activity definition is required.`);
            const id = scopedId(requireText(owner, "an activity's name", def.name));
            if (!Array.isArray(def.targets) || def.targets.length === 0)
                throw new Error(`LSCG[ext:${owner.id}]: activity "${def.name}" needs at least one target.`);
            const targets = def.targets.map((t, i) => ({
                group: requireText(owner, `activity "${def.name}" target ${i + 1}'s group`, t?.group),
                action: requireText(owner, `activity "${def.name}" target ${i + 1}'s action`, t?.action),
                t,
            }));
            const maxProgress = progress(owner, "maxProgress", def.maxProgress);
            const maxProgressSelf = progress(owner, "maxProgressSelf", def.maxProgressSelf);

            const unregister = extensionActivities.register({
                id,
                build: () => ({
                    Activity: {
                        Name: id,
                        MaxProgress: maxProgress,
                        MaxProgressSelf: maxProgressSelf,
                        // Short names of this extension's own prerequisites become their namespaced ids.
                        // "ZoneAccessible" is always required: an extension can't reach a zone that restraints block.
                        Prerequisite: [...new Set([...(def.prerequisites ?? []).map(p => prerequisites.has(p) ? scopedId(p) : p), "ZoneAccessible"])],
                    },
                    Targets: targets.map(({ group, action, t }) => ({
                        Name: group,
                        // LSCG only registers a self target when it is allowed, so self-only has to imply it.
                        SelfAllowed: !!t.selfAllowed || !!t.selfOnly,
                        SelfOnly: !!t.selfOnly,
                        TargetLabel: t.label ?? def.name,
                        TargetSelfLabel: t.selfLabel,
                        TargetAction: action,
                        TargetSelfAction: t.selfAction,
                    })),
                    CustomImage: def.image,
                    CustomAction: typeof def.onSend === "function" ? {
                        Func: (target: Character | null, _data: unknown, meta: unknown) => {
                            const result = safeInvoke(owner, () => def.onSend!({ target: target?.MemberNumber ?? undefined, group: (meta as { GroupName?: string } | undefined)?.GroupName }));
                            // An error is not a veto: the activity still goes out.
                            return result === false ? false : undefined;
                        },
                    } : undefined,
                    CustomReaction: typeof def.onReceive === "function" ? {
                        Func: (sender: Character | null) => { safeInvoke(owner, () => def.onReceive!({ sender: sender?.MemberNumber })); },
                    } : undefined,
                } as unknown as ActivityBundle),
            });
            const remove = () => {
                if (activities.delete(def.name)) unregister();
            };
            activities.set(def.name, remove);
            track(remove);
            return remove;
        },

        unregister(name: string): boolean {
            const remove = activities.get(name);
            if (!remove) return false;
            remove();
            return true;
        },

        registerPrerequisite(def: LSCGPrerequisiteDefinition): () => void {
            if (!def || typeof def.check !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: a prerequisite needs a check(ctx) function.`);
            const name = requireText(owner, "a prerequisite's name", def.name);
            const id = scopedId(name);
            const unregister = extensionPrerequisites.register({
                id,
                // Not met if the check throws: better to hide an activity than offer one that shouldn't be possible.
                check: (acting, acted, group) => safeInvoke(owner, () => def.check({ acting, acted, group: group?.Name })) === true,
            });
            const remove = () => {
                if (prerequisites.delete(name)) unregister();
            };
            prerequisites.set(name, remove);
            track(remove);
            return remove;
        },
    };
}
