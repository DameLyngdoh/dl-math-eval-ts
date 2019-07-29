import { DMETokenType } from './dMETokenType.enum';

/**
 * Class for representing a general token. 
 */
export class DMEToken {
    /**
     * Indicates the type of token. See TokenType enum.
     */
    private _type : DMETokenType;
    
    /**
     * Contains the value of the token. For number tokens, the value is the numerical value. for other tokens, it is the character itself.
     */
    private _value : any;

    constructor() {
      this._type = DMETokenType.Operand;
      this._value = null;
    }

    get type() : DMETokenType {
      return this._type;
    }
    get value() : any {
      return this._value;
    }

    set type( type : DMETokenType ) {
      this._type = type;
    }
    set value( value : any ) {
      this._value = value;
    }

    /**
     * Instantiates a token with the specified type and value.
     * @param type The type for the token from DMETokenType
     * @param value The value of the token.
     * @returns Returns a token object.
     * @see DMETokenType
     */
    public static getInstance( type : DMETokenType, value : any ) : DMEToken {
      let token : DMEToken = new DMEToken();
      token.type = type; token.value = value;
      return token;
    }
}