// Two players in the unit tier. Everything a world sends is plain data on the wire, so a cast is tested by capture-and-replay: let the caster's world
// do its part, take what it sent and pass it through JSON (nothing but data survives the real wire), reset the world as the target, feed it in, and
// let the target resolve it with its own rolls and timers. The target's replies (a leash beep, say) travel back the same way.
import { sent, receive } from "./room";
import { resetWorld, addToRoom, player } from "./world";
import { makeCharacter, type FixtureCharacter } from "./fixtures";

export interface Packets {
	hidden: LSCGMessageModel[];
	beeps: { target: number; message: LSCGMessageModel }[];
}

/** What the current world has sent so far that the other player would receive, as it would arrive: after a trip through JSON. */
export function outgoing(): Packets {
	return JSON.parse(JSON.stringify({ hidden: sent.hidden(), beeps: sent.beeps() })) as Packets;
}

/** Feeds a batch from `from` to the current world's player, the way the server would hand it on. */
export function deliver(from: FixtureCharacter, packets: Packets): void {
	for (const message of packets.hidden)
		receive.hidden(from, message);
	for (const { message } of packets.beeps)
		receive.beep(from, message);
}

export interface PlayerSetup {
	memberNumber: number;
	nickname: string;
	/** Their LSCG settings, by module, on top of Magic being on. Seen by the other player as what they have published. */
	lscg?: Record<string, Record<string, unknown>>;
	/** Anything else on the character (a wardrobe, item permissions, ...). */
	character?: Parameters<typeof resetWorld>[0];
}

/** Starts the world as this player: the other player in the room with the settings they would have published. Call `init` after it for the modules
 *  the test uses (states.init(), magic.init(), ...). */
export function becomePlayer(me: PlayerSetup, other: PlayerSetup): { me: FixtureCharacter; other: FixtureCharacter } {
	resetWorld({
		MemberNumber: me.memberNumber, Nickname: me.nickname, WhiteList: [], BlackList: [],
		LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false, handChokeEnabled: true }, ...(me.lscg ?? {}) },
		...(me.character ?? {}),
	});
	addToRoom(player());
	const there = addToRoom(makeCharacter({
		MemberNumber: other.memberNumber, Nickname: other.nickname,
		LSCG: {
			MagicModule: { enabled: true, knownEffects: undefined }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 },
			MiscModule: { handChokeEnabled: true },
			...(other.lscg ?? {}),
		},
	}));
	return { me: player(), other: there };
}
