import { CheckboxRow, KitContext, SelectOption, SelectRow, TextRow } from "Dom/kit";
import {
    DEFAULT_REMOTE_LEVEL, REMOTE_TRANCE_DEFAULTS, remoteLevelOf, type RemoteModule,
} from "Modules/remoteAccess";
import { REMOTE_ACCESS_LEVELS, REMOTE_LEVEL_LABELS, type RemoteAccessLevel } from "utils";

const LEVEL_OPTIONS: SelectOption[] = REMOTE_ACCESS_LEVELS.map(level => ({ value: level, label: REMOTE_LEVEL_LABELS[level] }));

/** The settings every remote access section (and the global defaults) share. Speech analysis calls the trance option something else. */
interface RemoteAccessValues {
    remoteLevel?: RemoteAccessLevel;
    remoteMemberIds?: string;
    remoteAccessRequiredTrance?: boolean;
    remoteRequiresTrance?: boolean;
    limitRemoteAccessToHypnotizer?: boolean;
    useGlobalRemote?: boolean;
}

export interface RemoteAccessRowsOptions {
    /** The section these rows belong to. Leave it out for the global defaults themselves. */
    module?: RemoteModule;
    disabled: () => boolean;
    levelLabel?: string;
}

/**
 * The rows that say who may get in and when, shared by every section with remote access (and, for the first three, by the global
 * defaults) so they all offer the same: [use global defaults], the level, members let in whatever it says, requires trance, only
 * the hypnotizer. While a section uses the global defaults its level and member rows show the global values, locked; the trance
 * rows are always the section's own, since those are what a remote user adjusts. The wearer's owner always has access.
 */
export function remoteAccessRows(ctx: KitContext, s: RemoteAccessValues, opts: RemoteAccessRowsOptions): HTMLElement[] {
    const { module } = opts;
    const tranceKey = module === "SpeechAnalysisModule" ? "remoteRequiresTrance" : "remoteAccessRequiredTrance";
    const defaults = module ? REMOTE_TRANCE_DEFAULTS[module] : undefined;
    const useGlobal = () => !!module && !!s.useGlobalRemote;
    const global = () => (Player.LSCG?.GlobalModule ?? {}) as RemoteAccessValues;
    // What the who rows show: the global defaults while the section uses them, otherwise the section's own.
    const shown = () => useGlobal() ? global() : s;
    const whoLocked = () => opts.disabled() || useGlobal();
    const trance = () => typeof s[tranceKey] === "boolean" ? s[tranceKey] as boolean : !!defaults?.trance;

    return [
        ...(module ? [CheckboxRow(ctx, {
            label: "Use global defaults",
            description: "Take who can access and the allowed member ids from General > Remote Access. Turn it off to set them for this section alone. The trance rules below are always this section's own.",
            get: () => !!s.useGlobalRemote, set: v => s.useGlobalRemote = v, disabled: opts.disabled,
        })] : []),
        SelectRow(ctx, {
            label: opts.levelLabel ?? "Who can access", options: LEVEL_OPTIONS,
            description: "Same levels as BC's interaction permission, plus friends. Your owner always has access.",
            get: () => remoteLevelOf(shown() as Record<string, unknown>) ?? DEFAULT_REMOTE_LEVEL,
            set: v => s.remoteLevel = v as RemoteAccessLevel,
            disabled: whoLocked,
        }),
        TextRow(ctx, {
            label: "Allowed member ids", placeholder: "Member numbers, comma separated",
            description: "These members get in whatever the level says (the trance rules still apply).",
            get: () => shown().remoteMemberIds ?? "", set: v => s.remoteMemberIds = v, disabled: whoLocked,
        }),
        ...(module ? [
            CheckboxRow(ctx, {
                label: "Requires trance", description: "Remote access only works while you are hypnotized (your owner can always get in).",
                get: trance, set: v => s[tranceKey] = v, disabled: opts.disabled,
            }),
            CheckboxRow(ctx, {
                label: "Only the hypnotizer", description: "Only whoever hypnotized you gets remote access (your owner can always get in).",
                get: () => s.limitRemoteAccessToHypnotizer ?? defaults?.hypnotizerOnly ?? false, set: v => s.limitRemoteAccessToHypnotizer = v,
                disabled: () => opts.disabled() || !trance(),
            }),
        ] : []),
    ];
}
