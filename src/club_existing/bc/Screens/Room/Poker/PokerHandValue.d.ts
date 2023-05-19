/**
 * Sort the current hand from highest to lowest
 * @param {PokerHand} Hand
 */
declare function PokerHandValueSortHand(Hand: PokerHand): void;
/**
 * Validate if the current hand is a straight flush (value 9)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueStraightFlush(Hand: PokerHand): number;
/**
 * Validate if the current hand is a four of a kind (value 8)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueFourOfAKind(Hand: PokerHand): number;
/**
 * Validate if the current hand is a full house (value 7)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueFullHouse(Hand: PokerHand): number;
/**
 * Validate if the current hand is a flush (value 6)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueFlush(Hand: PokerHand): number;
/**
 * Validate if the current hand is a straight (value 5)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueStraight(Hand: PokerHand): number;
/**
 * Validate if the current hand is a three of a kind (value 4)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueThreeOfAKind(Hand: PokerHand): number;
/**
 * Validate if the current hand is a two pairs (value 3)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueTwoPairs(Hand: PokerHand): number;
/**
 * Validate if the current hand is a one pair (value 2)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueOnePair(Hand: PokerHand): number;
/**
 * Allocate the highest card value for the leading 5 cards (value 1)
 * @param {PokerHand} Hand
 */
declare function PokerHandValueHighestCards(Hand: PokerHand): number;
/**
 * Return a decimal to express the hand value
 * @param {number} C1
 * @param {number} C2
 * @param {PokerGameType} GameType
 * @param {PokerMode} CurrentMode
 * @param {number[]} TableCards
 */
declare function PokerHandValueCalcHandValue(C1: number, C2: number, GameType: PokerGameType, CurrentMode: PokerMode, TableCards: number[]): number;
/**
 * Return a text version of a decimal hand value
 * @param {number} Value
 * @returns {string}
 */
declare function PokerHandValueTextHandValue(Value: number): string;
