"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reference_token_type_enum_1 = require("./reference-token-type.enum");
/**
 * Class representing a reference token which is either a function or constant from a lookup JSON.
 */
var DMEReferenceToken = /** @class */ (function () {
    function DMEReferenceToken() {
        /**
         * Complete name of the reference (analogous to an absolute path in file-system)
         */
        this._referenceName = [];
        /**
         * Parameters to the reference which is array of tokenized expression.
         */
        this._params = [];
        /**
         * Reference type which is a Function or a Constant
         */
        this._type = reference_token_type_enum_1.ReferenceTokenType.Function;
    }
    Object.defineProperty(DMEReferenceToken.prototype, "referenceName", {
        get: function () {
            return this._referenceName;
        },
        set: function (referenceName) {
            this._referenceName = referenceName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DMEReferenceToken.prototype, "params", {
        get: function () {
            return this._params;
        },
        set: function (params) {
            this._params = params;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DMEReferenceToken.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Instantiates a ReferenceToken object with the specified fields.
     * @param referenceName The name (including path) of the reference.
     * @param params The parameters which the function will use (empty arry if constant).
     * @param type Type of ReferenceToken from ReferenceTokenType
     * @returns Returns a ReferenceToken object.
     * @see ReferenceTokenType
     */
    DMEReferenceToken.getInstance = function (referenceName, params, type) {
        var referenceToken = new DMEReferenceToken();
        referenceToken.referenceName = referenceName.split('.');
        referenceToken.type = type;
        referenceToken.params = params;
        return referenceToken;
    };
    return DMEReferenceToken;
}());
exports.DMEReferenceToken = DMEReferenceToken;
