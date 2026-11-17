// Shared by the map performance and parity specs: puts the playground player in a 40x40 map room and sets the view.
import type { Bc } from "./fixtures";

export interface MapRoomOptions {
    /** Perception range (zoom): the view is 2 * range + 1 tiles tall. */
    range: number;
    /** Map width in px (BC R134 and later; ignored by clients without the resizable split). */
    split?: number;
    lighting: boolean;
    /** Where the player stands. */
    pos?: { X: number; Y: number };
    /** The light quality setting; "full" if not given. */
    quality?: "full" | "half";
    /** Switch on the opt-in faster map drawing (the DrawImageEx shortcut). */
    fastDraw?: boolean;
    /** Turn off light animation, so a frame can be compared with another run's. */
    freezeLights?: boolean;
}

/**
 * A 40x40 map: oak floor, a wall border, wall runs with gaps every 8 tiles (rooms and corridors), lampposts (static lights)
 * every 5 tiles in the open, a candelabra (a flickering light) and a closed door.
 */
export async function enterMapRoom(bc: Bc, opts: MapRoomOptions): Promise<string> {
    return bc.run(async (o) => {
        const w = window as any;
        const W = 40, H = 40;
        const ch = (n: number) => String.fromCharCode(n);
        const floor = ch(100), wall = ch(1000), blank = ch(100), lamp = ch(2090), candelabra = ch(3030), door = ch(4011);
        let tiles = "", objects = "";
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
            const run = (y % 8 === 0 && x % 8 !== 4) || (x % 8 === 0 && y % 8 !== 4);
            const isDoor = x === 12 && y === 16;
            tiles += (border || run || isDoor) ? wall : floor;
            let object = blank;
            if (isDoor) object = door;
            else if (!border && !run && x % 5 === 2 && y % 5 === 2) object = lamp;
            else if (x === 22 && y === 22) object = candelabra;
            objects += object;
        }
        w.ChatRoomMapViewPerceptionRange = o.range;
        w.ChatRoomMapViewPerceptionRangeMax = Math.max(o.range, 7);
        const map = w.LSCG.getModule("MapModule");
        map.settings.enhancedLighting = o.lighting;
        map.settings.disableLightAnimation = !!o.freezeLights;
        map.settings.perfLightQuality = o.quality ?? "full";
        map.settings.perfDrawImageFastPath = !!o.fastDraw;

        w.Playground.receive("ChatRoomSync", {
            SourceMemberNumber: w.Player.MemberNumber, Name: "Map room", Description: "", Admin: [w.Player.MemberNumber], Whitelist: [], Ban: [],
            Background: "MainHall", Limit: 10, Game: "", Visibility: ["All"], Access: ["All"], BlockCategory: [], Language: "EN", Space: "",
            MapData: { Type: "Always", Tiles: tiles, Objects: objects },
            // The entry must carry the account's OnlineID, or BC does not recognise it as the player and treats it as another
            // character standing on the player's tile, which makes collision handling shove the player around every frame.
            Character: [{
                ID: w.Player.OnlineID, Name: w.Player.Name, MemberNumber: w.Player.MemberNumber,
                Appearance: w.ServerAppearanceBundle(w.Player.Appearance), ActivePose: [], ItemPermission: 1, WhiteList: [], BlackList: [],
            }],
        });
        await w.Playground.until(() => w.CurrentScreen === "ChatRoom" && !!w.ChatRoomData?.MapData && w.ChatRoomMapViewIsActive?.(), 30000);
        if (typeof w.ChatRoomMapViewSetSplitPosition === "function" && o.split) w.ChatRoomMapViewSetSplitPosition(o.split);

        // BC gives the player a random spawn tile a little after the room opens, and would overwrite a position set before that.
        await w.Playground.until(() => w.Player.MapData?.Pos, 10000);
        await new Promise(r => setTimeout(r, 1500));
        const target = o.pos ?? { X: 20, Y: 20 };
        w.Player.MapData.Pos.X = target.X;
        w.Player.MapData.Pos.Y = target.Y;
        // What BC does when the player finishes a step (ChatRoomMapViewMovementProcess): LSCG's lighting follows the player through it.
        w.ChatRoomMapViewUpdatePlayerFlag?.();
        w.MapManager?.Map?.updatePlayerPerception?.();
        await new Promise(r => setTimeout(r, 1500)); // let assets load and lighting parse
        const pos = w.Player.MapData.Pos;
        if (pos.X !== target.X || pos.Y !== target.Y) throw new Error(`player was moved to ${pos.X},${pos.Y} after being placed at ${target.X},${target.Y}`);
        return JSON.stringify({ player: pos, entries: w.ChatRoomCharacter.map((c: any) => [c.MemberNumber, c.MapData?.Pos, c === w.Player]) });
    }, opts);
}
