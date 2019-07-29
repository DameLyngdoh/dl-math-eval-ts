"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An class representing the result of sub-tokenizing operation.
 */
var SubTokenizerResult = /** @class */ (function () {
    function SubTokenizerResult() {
        this._index = -1;
        this._tokens = [];
    }
    Object.defineProperty(SubTokenizerResult.prototype, "tokens", {
        get: function () {
            return this._tokens;
        },
        set: function (tokens) {
            this._tokens = tokens;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubTokenizerResult.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (index) {
            this._index = index;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets an instance of the SubTokenizerResult object.
     * @param tokens The array of tokens generated.
     * @param index The ending index of the sub-string.
     * @returns Returns a SubTokenizerResult object.
     */
    SubTokenizerResult.getInstance = function (tokens, index) {
        var token = new SubTokenizerResult();
        token.tokens = tokens;
        token.index = index;
        return token;
    };
    return SubTokenizerResult;
}());
exports.SubTokenizerResult = SubTokenizerResult;
