"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dMETokenType_enum_1 = require("./dMETokenType.enum");
/**
 * Class for representing a general token.
 */
var DMEToken = /** @class */ (function () {
    function DMEToken() {
        this._type = dMETokenType_enum_1.DMETokenType.Operand;
        this._value = null;
    }
    Object.defineProperty(DMEToken.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DMEToken.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Instantiates a token with the specified type and value.
     * @param type The type for the token from DMETokenType
     * @param value The value of the token.
     * @returns Returns a token object.
     * @see DMETokenType
     */
    DMEToken.getInstance = function (type, value) {
        var token = new DMEToken();
        token.type = type;
        token.value = value;
        return token;
    };
    return DMEToken;
}());
exports.DMEToken = DMEToken;
