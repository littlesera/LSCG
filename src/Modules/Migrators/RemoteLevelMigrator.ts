import { BaseMigrator } from "./BaseMigrator";
import { DEFAULT_REMOTE_LEVEL } from "../remoteAccess";
import type { RemoteAccessLevel } from "utils";

/** Hypno, collar and magic used to let in whoever item permission allowed, or only the members on a list the wearer typed in.
 *  They now take an access level, like speech analysis, plus a list of allowed member ids that gets in whatever the level says.
 *  Someone who named members keeps exactly that: their list moves to the new field and the level is the most closed one, so only
 *  those members and the owner get in. Everyone else gets the level that matches their own BC interaction permission, so who gets
 *  in doesn't change. Anything unknown ends up owner only. */
const LEVEL_BY_ALLOWED_INTERACTIONS: RemoteAccessLevel[] = ["Public", "PublicExceptBlacklist", "Dominants", "Whitelist", "Lovers", "Owner"];

export class RemoteLevelMigrator extends BaseMigrator {
    get Version(): string {
        return "0.9.13";
    }

    Migrate(fromVersion: string): boolean {
        const permission: number | undefined = Player.AllowedInteractions;
        const fromPermission = LEVEL_BY_ALLOWED_INTERACTIONS[permission ?? -1] ?? DEFAULT_REMOTE_LEVEL;
        // Where each module kept its list. Hypno's and the collar's also still mean something else (who may trigger the hypnosis,
        // who may use the collar), so they are copied, not moved; magic's already is the new field.
        const lists = { HypnoModule: "overrideMemberIds", CollarModule: "allowedMembers", MagicModule: "remoteMemberIds" } as const;
        for (const [module, listKey] of Object.entries(lists) as [keyof typeof lists, string][]) {
            const s = Player.LSCG?.[module] as unknown as Record<string, unknown> | undefined;
            if (!s) continue;
            const list = typeof s[listKey] === "string" ? (s[listKey] as string).trim() : "";
            s.remoteMemberIds = list;
            s.remoteLevel = list !== "" ? DEFAULT_REMOTE_LEVEL : fromPermission;
        }
        // Existing saves keep the settings they have: only new installs start out on the global defaults.
        for (const module of ["HypnoModule", "CollarModule", "MagicModule", "SpeechAnalysisModule"] as const) {
            const s = Player.LSCG?.[module] as unknown as Record<string, unknown> | undefined;
            if (s) s.useGlobalRemote = false;
        }
        return true;
    }
}
