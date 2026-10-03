// Per-file setupFiles entry for the "bc" Vitest project. Loads the real BC client
// scripts (downloaded once by test/setup/bc-global-setup.ts's globalSetup) into
// this test file's own jsdom realm, then creates a real `Player` via BC's own
// `CharacterCreate` so booted LSCG modules have a real character to work with.
import { inject } from "vitest";
import { loadRealBc, evalInBcRealm } from "../harness/bc-loader";

const dir = inject("bcClientDir");
const gameVersion = inject("bcGameVersion");
loadRealBc(dir, gameVersion);

evalInBcRealm(`
	globalThis.Player = CharacterCreate("Female3DCG", CharacterType.PLAYER, 1);
	Player.Name = "Player";
	Player.MemberNumber = 1;
	Player.LSCG = {};
`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ChatRoomCharacter = [];
