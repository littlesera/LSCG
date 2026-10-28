# Remote access

How another player may read or change a wearer's LSCG settings. The rules live in one place,
[`src/Modules/remoteAccess.ts`](../src/Modules/remoteAccess.ts), and are checked twice: by the remote screens, to decide what to
offer, and again by the wearer's client on whatever arrives, since nothing makes a sender use the screens.

## The rule

For hypno, collar, magic and speech analysis, `remoteAccessDenial()` (and `canRemote*`, which is "no denial") allows a sender when:

1. LSCG is on for the wearer (`GlobalModule.enabled`), the module's settings exist, the wearer turned **remote access** on for
   that module, and the sender is not the wearer. Collar also needs breathplay on.
2. If the sender is the wearer's **owner**, that is enough.
3. Anyone else also needs all of:
   - the module itself **enabled**;
   - to be within the **access level** the wearer picked (below, for the section or from the global defaults), **or** on the **allowed member ids**
     (`remoteMemberIds`, a list of member numbers that gets in whatever the level says). BC's item permission plays no part. The
     collar's maker also gets in, past the level, when the collar is limited to its maker;
   - the **trance** options: *requires trance* (the wearer must be hypnotized) and *only the hypnotizer* (and it must be the
     sender who hypnotized them).

The remote screens show why a sender was turned away from the same function, so the message and the gate can't drift apart.

### Access levels

Every module offers the same dropdown (`remoteLevelRow`), from most open to most closed. They are BC's own interaction levels, plus friends:

| Level | Who gets in |
| --- | --- |
| `Public` | Everyone, no exceptions |
| `PublicExceptBlacklist` | Everyone except the wearer's blacklist |
| `Friends` | Friends, whitelist, lovers and owner (only the wearer's own client can check friends) |
| `Dominants` | Owner, lovers, whitelist and dominants: not blacklisted, and dominance reputation within 25 points of the wearer's, as BC does |
| `Whitelist` | Owner, lovers and whitelist |
| `Lovers` | Owner and lovers |
| `Owner` | Owner only. Also the floor for a missing or unknown level |

The allowed member ids are a per-module allow-list on top of the level, for the same screens (every module has the field, next to the
level dropdown). Listed members still need the module enabled and the trance rules; the owner needs nothing. The wearer sets both,
and a remote user can change neither.

### Global defaults

General has a **Remote Access** tab holding who may get in: the level and the allowed member ids. Each section (hypno, collar, magic, speech analysis) has a **Use global defaults** checkbox at the top of
its own Remote Access tab:

- **On:** the section's level and member id rows show the global values, locked, and the gate uses them in place of the section's own.
  Its own values are kept for when it is turned off again.
- **Off:** the section keeps its own level and ids.
- **Trance rules** (*requires trance*, *only the hypnotizer*) are always the section's own, on or off. They are what a remote user
  adjusts, so their edits always count and nothing needs warning about.
- Each section's own **Allow remote access** and **Lockable** stay its own, so remote access is always switched on deliberately,
  one section at a time. The owner still passes everything.
- New installs start with every section on the defaults, and the defaults start owner only. Saves from before
  the defaults existed are migrated to **off**, so nothing changes for them. A copy of a section from an older client has no flag
  and counts as off.
- A remote user can't change the level, the member ids or the flag itself: those stay the wearer's.

### Tabs

Every section that allows remote access keeps it on its own **Remote Access** tab: hypnosis (split from the old *Trance & remote* tab, whose
while-hypnotized settings are now the **Trance** tab), collar, magic and speech analysis, with the same rows from one builder
(`remoteAccessRows`). The tab for the global defaults is under General.

Options a wearer never set fall back to `REMOTE_TRANCE_DEFAULTS`, which the models and the settings screens share:

| Module | Requires trance | Only the hypnotizer |
| --- | --- | --- |
| Hypno | on | off |
| Collar | off | off |
| Magic | off | off |
| Speech analysis | on (`remoteRequiresTrance`) | off |

### Who counts as the hypnotizer

"Only the hypnotizer" compares the sender with whoever started the wearer's trance (`HypnoState.config.activatedBy`):

- trigger words, activities and spells record their sender;
- a drugged drink or injection records whoever gave it, and a worn hypno headset, visor or respirator records the crafter of the item;
- mind control builds up over doses, so the last one to add to it is who counts when it takes hold. The record clears when it does;
- a trance nobody can be named for has no hypnotizer: only the owner (and "anyone" levels with the option off) get in.

## What a remote user may change

Each module has an allowlist (`HYPNO_REMOTE_KEYS`, `COLLAR_REMOTE_KEYS`, `MAGIC_REMOTE_KEYS`, and speech's
`sanitizeRemoteSpeechSettings`). Anything else in what they send is dropped: remote access itself, who may use it, stats, known
spells, the module's `enabled`. The lock (`locked`) is only writable when the wearer allowed it (`lockable`, or hypno's `allowLocked`).

Notes:

- The collar's `allowedMembers` and hypno's `overrideMemberIds` are no longer what lets a sender into remote settings (that is `remoteMemberIds` now). They still
  say who may use the collar's buttons and who may trigger the hypnosis. Hypno's is writable remotely only by the owner or when
  the wearer allows it; the collar's is on its allowlist, since that screen is where it is edited.
- The access level (`remoteLevel`), the allowed member ids (`remoteMemberIds`), remote access, and the lock flags stay the wearer's.
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
The list is private (not broadcast). It is the **Lock** column of the magic Effects table, next to the wearer's own *Block* and *Allow self*
(which stop spells landing on them); only a remote user can change it, and the wearer sees it read-only.

## Differences from before

Earlier, each module had its own rules. The unification changed:

- Who gets in is one **access level** dropdown plus a list of **allowed member ids** on every module, replacing BC item permission
  and the old typed lists (hypno `overrideMemberIds`, collar `allowedMembers`, magic `remoteMemberIds`) as the remote-access check.
  `RemoteLevelMigrator` (0.9.13) converts saves on the secure side: a wearer who had named members keeps exactly those, with their
  list moved to the allowed member ids and the level set to `Owner`, so only those members and the owner get in. (Hypno's and the
  collar's lists are copied, since they also still say who may trigger the hypnosis and use the collar.) Everyone else gets the level
  matching their own BC interaction permission, so who could get in doesn't change. Anything unknown ends up owner only.
- Magic gives the owner the same bypass as hypno and collar.
- Speech analysis gains *only the hypnotizer*; the owner passes without trance. Its level dropdown gains `Dominants`, and its labels change.
- Collar gains the two trance options (both off, so nothing changes until a wearer turns them on).
- The collar's module `enabled` is no longer remotely settable.
- Remote settings are ignored while LSCG is off for the wearer.
- Suggestions: the hypno-module check now covers every sender (it used to guard only the owner and lovers), and *programming
  limited to hypnotizer* is enforced by the wearer's client, not only the sender's screen.
- The trance defaults shown on the settings screens now match what is enforced.
- Remote access has its own tab on every section, and General has global defaults sections can use (see above).
- Drug and item trances (drinks, injections, worn hypno headsets and respirators) now record a hypnotizer, so *only the hypnotizer*
  and "limited to hypnotizer" suggestions work for them.
