// Stands in for socket.io in the BC playground (scripts/bc-playground.mjs): BC's `io(ServerURL)` gets a fake socket
// that is always connected, records everything the client sends, and lets the page push server events.
//   Playground.sent              [event, ...args] for every ServerSocket.emit, oldest first
//   Playground.receive(ev, data) delivers a server event, as if the server sent it
//   Playground.reply[ev] = fn    answers a client event: fn(...args) returns [replyEvent, data] or undefined
(() => {
    const handlers = {};
    const once = {};
    const Playground = window.Playground = window.Playground ?? {};
    Playground.sent = [];
    Playground.reply = Playground.reply ?? {};
    Playground.receive = (event, data) => {
        (handlers[event] ?? []).forEach(fn => fn(data));
        const fns = once[event] ?? [];
        delete once[event];
        fns.forEach(fn => fn(data));
    };

    window.io = function io() {
        const socket = {
            connected: true,
            id: "playground",
            on(event, fn) { (handlers[event] ??= []).push(fn); return socket; },
            once(event, fn) { (once[event] ??= []).push(fn); return socket; },
            emit(event, ...args) {
                Playground.sent.push([event, ...args]);
                const answer = Playground.reply[event]?.(...args);
                if (answer) setTimeout(() => Playground.receive(answer[0], answer[1]), 0);
                return socket;
            },
            disconnect() { return socket; },
            io: { on() {} },
        };
        setTimeout(() => {
            Playground.receive("connect");
            Playground.receive("ServerInfo", { OnlinePlayers: 1, Time: Date.now() });
        }, 0);
        return socket;
    };
})();
