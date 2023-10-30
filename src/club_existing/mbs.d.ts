/**
 * MBS: Maid's Bondage Scripts
 *
 * Copyright (C) 2023 Bananarama92
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see https://www.gnu.org/licenses/.
 */

/**
 * Uncomment the `ItemBundle` declaration below if, for one reason or another, you do not
 * have access to the builtin BC type annotations.
 * @note Use of the builtin `ItemBundle` BC type is *strongly* recommended
 */
// type ItemBundle = Record<string, any>;

/** An interface for exposing MBS wheel of fortune data */
interface WheelBundle {
    /** The (user-specified) name of the item set. */
    name: string;
    /** The index of the wheel of fortune item set */
    index: number;
    /** A list of the minified items associated with the item set */
    items: ItemBundle[];
}

/** Maid's Bondage Scripts: Various additions and utility scripts for BC. */
declare namespace mbs {
    /**
     * The (semantic) MBS version.
     * Guaranteed to match the `/^([0-9]+)\.([0-9]+)\.([0-9]+)(\S+)?$/` regex.
     */
    const MBS_VERSION: `${number}.${number}.${number}${string}`;
    /**
     * The version of the MBS API.
     *
     * * Changes or removals are accompanied by a `major` increment (and resetting `minor` back to 0)
     * * Additions are only accompanied by a `minor` increment
     */
    const API_VERSION: {
        /** The major API versions; increments are reserved for changes and removals */
        readonly major: number,
        /** The major API versions; increments are reserved for additions */
        readonly minor: number,
    };
    /**
     * Run the MBS test suit.
     * @returns Whether the test suite succeeded or not
     */
    function runTests(): boolean;
    /** Public MBS API for retrieving wheel outfit data. */
    namespace wheelOutfits {
        /**
         * Get a record mapping all (user-specified) outfit names to the actual outfit data.
         * @returns All MBS outfit data
         */
        function getAll(): Record<string, WheelBundle>;
        /**
         * Get a single wheel outfit by its name.
         * @param name The name of the wheel outfit
         * @returns The wheel outfit or `undefined` if it cannot be found
         */
        function getByName(name: string): undefined | WheelBundle;
        /**
         * Get a single wheel outfit by its index.
         * @param index The wheel outfit or `undefined` if it cannot be found
         * @returns The MBS outfit data or `undefined`
         */
        function getByIndex(index: number): undefined | WheelBundle;
        /** Return a list of all the players wheel outfit names. */
        function getNames(): string[];
        /** Return a list of all the players wheel outfit indices. */
        function getIndices(): number[];
    }
}