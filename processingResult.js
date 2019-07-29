"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dMEToken_1 = require("./dMEToken");
/**
 * Class that represents the result of the parsing a numerical or reference token. The ending index of the number or the reference alongwith the token that was parsed from the expression are contained as fields.
 */
var ProcessingResult = /** @class */ (function () {
    function ProcessingResult() {
        this._index = -1;
        this._token = new dMEToken_1.DMEToken();
    }
    Object.defineProperty(ProcessingResult.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (index) {
            // Validating index
            if (index < 0) {
                throw new Error();
            }
            this._index = index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProcessingResult.prototype, "token", {
        get: function () {
            return this._token;
        },
        set: function (token) {
            this._token = token;
        },
        enumerable: true,
        configurable: true
    });
    return ProcessingResult;
}());
exports.ProcessingResult = ProcessingResult;
