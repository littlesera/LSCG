# Remote access

How another player may read or change a wearer's LSCG settings. The rules live in one place,
[`src/Modules/remoteAccess.ts`](../src/Modules/remoteAccess.ts), and are checked twice: by the remote screens, to decide what to
offer, and again by the wearer's client on whatever arrives, since nothing makes a sender use the screens.

## The rule

For hypno, collar, magic and speech analysis, `canRemote()` allows a sender when:

1. LSCG is on for the wearer (`GlobalModule.enabled`), the module's settings exist, the wearer turned **remote access** on for
   that module, and the sender is not the wearer. Collar also needs breathplay on.
2. If the sender is the wearer's **owner**, that is enough.
3. Anyone else also needs all of:
   - the module itself **enabled**;
   - **item permission** (`ServerChatRoomGetAllowItem`), or being on the module's **member list** if the wearer filled one in
     (hypno `overrideMemberIds`, collar `allowedMembers` plus the collar's maker when limited to crafted, magic `remoteMemberIds`);
   - the module's own **narrowing**, if it has one (speech's access level: `Owner`, `Lovers`, `Whitelist`, `Friends`,
     `PublicExceptBlacklist`, `Public`);
   - the **trance** options: *requires trance* (the wearer must be hypnotized) and *only the hypnotizer* (and it must be the
     sender who hypnotized them).

Options a wearer never set fall back to `REMOTE_TRANCE_DEFAULTS`, which the models and the settings screens share:

| Module | Requires trance | Only the hypnotizer |
| --- | --- | --- |
| Hypno | on | off |
| Collar | off | off |
| Magic | off | off |
| Speech analysis | on (`remoteRequiresTrance`) | off |

## What a remote user may change

Each module has an allowlist (`HYPNO_REMOTE_KEYS`, `COLLAR_REMOTE_KEYS`, `MAGIC_REMOTE_KEYS`, and speech's
`sanitizeRemoteSpeechSettings`). Anything else in what they send is dropped: remote access itself, who may use it, stats, known
spells, the module's `enabled`. The lock (`locked`) is only writable when the wearer allowed it (`lockable`, or hypno's `allowLocked`).

Notes:

- The collar's own member list (`allowedMembers`) is on its allowlist, because that screen is where it is edited, and it is also
  the list that decides who gets in. Hypno's equivalent is writable only by the owner or when the wearer allows it.
- `lockedSpellEffects` (magic) is on the magic allowlist and **only** a remote user changes it. The wearer sees it, read-only.

## Hypno suggestions

Suggestions have their own feature flag and keep one extra rule. `HypnoModule.CanModifySuggestions` allows, with hypnosis on:

- the owner and the wearer's lovers, always;
- anyone else while the wearer is hypnotized, has *allowed suggestions*, item permission (or the override list) lets them, and,
  if *programming limited to hypnotizer* is on (the default), they are the one who hypnotized the wearer.

This is the one path that does not need *remote access* turned on. It is deliberate: suggestions are how a hypnotizer works, and
are switched on and off with their own setting.

## Adding a remote path

Anything that lets another player read or change a wearer's settings must be listed in `REMOTE_SETTINGS_COMMANDS` with the gate
that guards it. `test/modules/remote-access-gate.test.ts` fails for a settings-like command that isn't, and runs the whole rule
against every module.

| Command | Gate |
| --- | --- |
| `remote` | `canRemoteHypno`, `canRemoteCollar`, `canRemoteMagic` |
| `speech-settings-get`, `speech-settings-set` | `canRemoteSpeech` |
| `get-suggestions`, `set-suggestions` | `HypnoModule.CanModifySuggestions` |

## Locked spell effects

A remote user with magic access can lock spell effects the wearer may no longer cast. When the wearer casts a spell (from the menu,
by voice, by wild magic, on themselves or others), each locked effect fizzles on its step with a message only the caster sees and the rest of the spell
goes ahead; if every effect is locked the whole spell fizzles and nothing is sent. Only the caster's own client enforces this.
The list is private (not broadcast) and is separate from the wearer's own *blocked effects*, which stop spells landing on them.

## Differences from before

Earlier, each module had its own rules. The unification changed:

- Magic gives the owner the same bypass as hypno and collar.
- Speech analysis now also needs item permission and gains *only the hypnotizer*; the owner passes without trance.
- Collar gains the two trance options (both off, so nothing changes until a wearer turns them on).
- The collar's module `enabled` is no longer remotely settable.
- Remote settings are ignored while LSCG is off for the wearer.
- Suggestions: the hypno-module check now covers every sender (it used to guard only the owner and lovers), and *programming
  limited to hypnotizer* is enforced by the wearer's client, not only the sender's screen.
- The trance defaults shown on the settings screens now match what is enforced.
