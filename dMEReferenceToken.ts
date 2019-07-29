import { DMEToken } from "./dMEToken";
import { ReferenceTokenType } from "./reference-token-type.enum";

/**
 * Class representing a reference token which is either a function or constant from a lookup JSON.
 */
export class DMEReferenceToken {

    /**
     * Complete name of the reference (analogous to an absolute path in file-system)
     */
    private _referenceName : string[] = [];
    
    /**
     * Parameters to the reference which is array of tokenized expression.
     */
    private _params : Array<DMEToken[]> = [];
    
    /**
     * Reference type which is a Function or a Constant
     */
    private _type : ReferenceTokenType = ReferenceTokenType.Function;

    constructor() {}

    get referenceName() : string[] {
        return this._referenceName;
    }
    get params() : Array<DMEToken[]> {
        return this._params;
    }
    get type() : ReferenceTokenType {
        return this._type;
    }

    set referenceName( referenceName : string[] ) {
        this._referenceName = referenceName;
    }
    set params( params : Array<DMEToken[]> ) {
        this._params = params;
    }
    set type( type : ReferenceTokenType ) {
        this._type = type;
    }

    /**
     * Instantiates a ReferenceToken object with the specified fields.
     * @param referenceName The name (including path) of the reference.
     * @param params The parameters which the function will use (empty arry if constant).
     * @param type Type of ReferenceToken from ReferenceTokenType
     * @returns Returns a ReferenceToken object.
     * @see ReferenceTokenType
     */
    public static getInstance( referenceName : string, params : DMEToken[][], type : ReferenceTokenType ) : DMEReferenceToken {
        let referenceToken : DMEReferenceToken = new DMEReferenceToken();
        referenceToken.referenceName = referenceName.split('.');
        referenceToken.type = type;
        referenceToken.params = params;
        return referenceToken;
    }
}