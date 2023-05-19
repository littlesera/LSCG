/**
 * @returns {string}
 * Delegate to KDProcessInputs */
declare function KDProcessInput(type: any, data: any): string;
/**
 *
 * @param {string} type
 * @param {any} data
 * @returns {string}
 */
declare function KDSendInput(type: string, data: any, frame: any, noUpdate: any): string;
/**
 * Handles inputs once per frame
 * @returns {string}
 */
declare function KDProcessInputs(ReturnResult: any): string;
/**
 * @type {{type: string, data: any}[]}
 */
declare let KinkyDungeonInputQueue: {
    type: string;
    data: any;
}[];
