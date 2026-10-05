// Runs once per test file, before that file's own imports resolve. This is what
// makes it safe to `import "utils"` (or anything that transitively imports it) in
// a test: utils.ts registers the mod with bondage-club-mod-sdk at import time, and
// (via a circular import through MiniGames/minigames.ts) may touch "TextLoad" at
// import time too. Every global any *booted* LSCG module's load() might hook must
// also exist by the time boot() runs -- see test/harness/bc-lite.ts, which installs
// the full set and is called from test/harness/world.ts's boot()/resetWorld().
//
// Player is created here (not in world.ts) so it is a single stable object for the
// whole test file: hookFunction("Player.CanWalk", ...) installs the SDK's router
// directly onto whatever object `window.Player` is *at hook time*, so resetWorld()
// must mutate this same object's fields rather than reassign `globalThis.Player`.
import { installBcLite } from "../harness/bc-lite";
import { makeCharacter } from "../harness/fixtures";

installBcLite();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Player = makeCharacter({ flags: { isPlayer: true } });
