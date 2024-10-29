declare function PreferenceSubscreenScriptsLoad(): void;
declare function PreferenceSubscreenScriptsRun(): void;
declare function PreferenceScriptsDrawWarningScreen(): void;
declare function PreferenceSubscreenScriptsClick(): void;
declare function PreferenceSubscreenScriptsExit(): boolean;
declare function PreferenceSubscreenScriptsWarningClick(): void;
/** @type {ScriptPermissionProperty[]} */
declare const PreferenceScriptPermissionProperties: ScriptPermissionProperty[];
/** @type {null | "global" | "Hide" | "Block"} */
declare let PreferenceScriptHelp: null | "global" | "Hide" | "Block";
/** @type {null | ReturnType<typeof setTimeout>} */
declare let PreferenceScriptTimeoutHandle: null | ReturnType<typeof setTimeout>;
/** @type {null | number} */
declare let PreferenceScriptTimer: null | number;
declare let PreferenceScriptWarningAccepted: boolean;
declare const ScriptPermissionLevel: Readonly<{
    SELF: "Self";
    OWNER: "Owner";
    LOVERS: "Lovers";
    FRIENDS: "Friends";
    WHITELIST: "Whitelist";
    PUBLIC: "Public";
}>;
declare const ScriptPermissionBits: Readonly<{
    Self: 1;
    Owner: 2;
    Lovers: 4;
    Friends: 8;
    Whitelist: 16;
    Public: 32;
}>;
declare const maxScriptPermission: number;
