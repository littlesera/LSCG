/** Where the spell effects state publishes which of its effects are on a player (their ids only, nothing of how they are undone), in the state's
 *  extension settings. Not private, so another player's spell menu can offer them to lift. A leaf file, so both sides can use it without a cycle. */
export const ACTIVE_EFFECTS_KEY = "active-effects";
