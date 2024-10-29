/**
 *  MIT License

    Copyright (c) Microsoft Corporation. All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
 */

// Type definitions for lz-string 1.3
// Project: https://github.com/pieroxy/lz-string, http://pieroxy.net/blog/pages/lz-string/index.html
// Definitions by: Roman Nikitin <https://github.com/M0ns1gn0r>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/** LZ-based compression algorithm for JavaScript */
declare namespace LZString {
    /**
     * Compresses input string producing an instance of an "invalid" UTF-16 string.
     * Such string could be stored in localStorage only on webkit
     * browsers (tested on Android, Chrome, Safari).
     *
     * @param uncompressed A string which should be compressed.
     */
    export function compress(uncompressed: string): string;

    /**
     * Decompresses "invalid" input string created by the method compress().
     *
     * @param compressed A string obtained from a call to compress().
     */
    export function decompress(compressed: string): null | string;

    /**
     * Compresses input string producing an instance of a "valid" UTF-16 string,
     * in the sense that all browsers can store them safely.
     *
     * @param uncompressed A string which should be compressed.
     */
    export function compressToUTF16(uncompressed: string): string;

    /**
     * Decompresses "valid" input string created by the method compressToUTF16().
     *
     * @param compressed A string obtained from a call to compressToUTF16().
     */
    export function decompressFromUTF16(compressed: string): null | string;

    /**
     * Compresses input string producing an instance of a ASCII UTF-16 string,
     * which represents the original string encoded in Base64.
     * The result can be safely transported outside the browser with a
     * guarantee that none of the characters produced need to be URL-encoded.
     *
     * @param uncompressed A string which should be compressed.
     */
    export function compressToBase64(uncompressed: string): string;

    /**
     * Decompresses ASCII UTF-16 input string created by the method compressToBase64().
     *
     * @param compressed A string obtained from a call to compressToBase64().
     */
    export function decompressFromBase64(compressed: string): null | string;

    /**
     * produces ASCII strings representing the original string encoded in Base64 with a few
     * tweaks to make these URI safe. Hence, you can send them to the server without thinking
     * about URL encoding them. This saves bandwidth and CPU
     *
     * @param uncompressed A string which should be compressed.
     */
    export function compressToEncodedURIComponent(uncompressed: string): string;

    /**
     * Decompresses "valid" input string created by the method compressToEncodedURIComponent().
     *
     * @param compressed A string obtained from a call to compressToEncodedURIComponent().
     */
    export function decompressFromEncodedURIComponent(compressed: string): null | string;

    /**
     * produces an uint8Array
     *
     * @param uncompressed A string which should be compressed.
     */
    export function compressToUint8Array(uncompressed: string): Uint8Array;

    /**
     * Decompresses "valid" array created by the method compressToUint8Array().
     *
     * @param compressed A string obtained from a call to compressToUint8Array().
     */
    export function decompressFromUint8Array(compressed: Uint8Array): null | string;
}
