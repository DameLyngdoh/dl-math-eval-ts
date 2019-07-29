"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dMEToken_1 = require("./dMEToken");
var processingResult_1 = require("./processingResult");
var dMETokenType_enum_1 = require("./dMETokenType.enum");
var dMEReferenceToken_1 = require("./dMEReferenceToken");
var reference_token_type_enum_1 = require("./reference-token-type.enum");
var subTokenizerResult_1 = require("./subTokenizerResult");
var regexContainer_1 = require("./regexContainer");
var transitionCheck_1 = require("./transitionCheck");
var dl_stack_ts_1 = require("dl-stack-ts");
/**
 * Mathematical expression evaluator class.
 */
var DLMathEval = /** @class */ (function () {
    function DLMathEval() {
    }
    /**
     * Evaluates a binomial (of tokens) of the form A operator B, where A is the first operand and B is the second operand.
     * @param A The first operand token of the expression.
     * @param B The second operand token of the expression
     * @param operator The operator between the operands.
     * @returns Returns a numerical result of the expression.
     */
    DLMathEval.evaluateBinomial = function (A, B, operator) {
        // A must be a number
        if (A == undefined || A == null || A.type != dMETokenType_enum_1.DMETokenType.Operand) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined A operand. Token value is " + A.value);
        }
        // B must be a number
        if (B == undefined || B == null || B.type != dMETokenType_enum_1.DMETokenType.Operand) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined B operand. Token value is " + B.value);
        }
        // operator must be a number
        if (operator == undefined || operator == null || operator.type != dMETokenType_enum_1.DMETokenType.Operator) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined operator. Token value is " + operator.value);
        }
        var result = 0, a, b;
        try {
            a = A.value;
            b = B.value;
            result = this.evaluateNativeBinomial(a, b, operator.value);
        }
        catch (err) {
            throw err;
        }
        return result;
    };
    /**
     * Evaluates a string mathematical expression using a lookup object for references within the expression.
     * @param exp The string expression to be evaluated.
     * @param references The lookup object.
     * @returns Returns the numerical result of the evaluation.
     */
    DLMathEval.evaluateExpression = function (exp, references) {
        if (exp == undefined || exp == null) {
            throw new Error('Null of undefined expression.');
        }
        try {
            var tokens = DLMathEval.tokenize(exp);
            tokens = DLMathEval.evaluateReferenceTokens(tokens, references);
            tokens = DLMathEval.evaluateUnaryOperations(tokens);
            return DLMathEval.evaluateNativeExpression(tokens);
        }
        catch (ex) {
            throw ex;
        }
    };
    /**
     * Evaluates a binomial (of numbers) of the form A operator B, where A is the first operand and B is the second operand.
     * @param A The first operand of the expression.
     * @param B The second operand of the expression
     * @param operator The operator between the operands.
     * @returns Returns a numerical result of the expression.
     * @throws Divides by zero exception.
     */
    DLMathEval.evaluateNativeBinomial = function (A, B, operator) {
        // Checking operator
        if (operator == undefined || operator == null) {
            throw new Error("Cannot evaluate native binomial. Operator is undefiend or null.");
        }
        if (!regexContainer_1.RegexContainer.Operator.test(operator)) {
            throw new Error("Cannot evaluate native binomial. Unrecognized operator " + operator);
        }
        var result = 0;
        switch (operator) {
            case '+':
                result = A + B;
                break;
            case '-':
                result = A - B;
                break;
            case '*':
                result = A * B;
                break;
            case '/':
                // Divides by 0 exception
                if (B == 0) {
                    throw new Error("Cannot evaluate native binomial. Divides by 0 exception.");
                }
                result = A / B;
                break;
        }
        return result;
    };
    /**
     * Evaluates a native expression or an expression that does not have any unary operations or reference tokens.
     * @param exp The array of tokens of the expression.
     * @returns Returns the evaluated value.
     * @throws <i>Unrecognized native token</i> when a reference token is found.
     * @throws <i>Opening parenthesis not found</i> when a closing parenthesis is encountered but its matching opening parenthesis is not found.
     * @throws <i>Multiple operands left in stack</i> when the expression is invalid and final value is not obtained.
     */
    DLMathEval.evaluateNativeExpression = function (exp) {
        // Validating that each token is in its native form
        for (var _i = 0, exp_1 = exp; _i < exp_1.length; _i++) {
            var t = exp_1[_i];
            switch (t.type) {
                case dMETokenType_enum_1.DMETokenType.Operand:
                case dMETokenType_enum_1.DMETokenType.Operator:
                case dMETokenType_enum_1.DMETokenType.OpenParenthesis:
                case dMETokenType_enum_1.DMETokenType.CloseParenthesis:
                    break;
                default:
                    throw new Error("Unrecognized native token.");
            }
        }
        // Initializing stacks
        var operandStack = new dl_stack_ts_1.Stack();
        var operatorStack = new dl_stack_ts_1.Stack();
        // Iterating through the expression
        for (var _a = 0, exp_2 = exp; _a < exp_2.length; _a++) {
            var token = exp_2[_a];
            switch (token.type) {
                case dMETokenType_enum_1.DMETokenType.Operand:
                    operandStack.push(token);
                    break;
                case dMETokenType_enum_1.DMETokenType.OpenParenthesis:
                    operatorStack.push(token);
                    break;
                case dMETokenType_enum_1.DMETokenType.CloseParenthesis:
                    // No opening parenthesis found
                    if (operatorStack.isEmpty()) {
                        throw new Error("Opening parenthesis not found.");
                    }
                    for (var operator = operatorStack.pop(); operator.type != dMETokenType_enum_1.DMETokenType.OpenParenthesis; operator = operatorStack.pop()) {
                        this.stackEvaluate(operandStack, operator);
                        // No opening parenthesis found
                        if (operatorStack.isEmpty()) {
                            throw new Error("Opening parenthesis not found.");
                        }
                    }
                    break;
                case dMETokenType_enum_1.DMETokenType.Operator:
                    if (operatorStack.isEmpty()) {
                        operatorStack.push(token);
                        break;
                    }
                    var topPrecedence = this.getOperatorPrecedence(operatorStack.top().value);
                    var opPrecedence = this.getOperatorPrecedence(token.value);
                    if (opPrecedence >= topPrecedence) {
                        operatorStack.push(token);
                    }
                    else {
                        for (var operator = void 0; opPrecedence < topPrecedence;) {
                            operator = operatorStack.pop();
                            this.stackEvaluate(operandStack, operator);
                            if (operatorStack.isEmpty()) {
                                break;
                            }
                            topPrecedence = this.getOperatorPrecedence(operatorStack.top().value);
                        }
                        operatorStack.push(token);
                    }
                    break;
            }
        }
        // Iterating over remaining operators in operator stack
        while (!operatorStack.isEmpty()) {
            this.stackEvaluate(operandStack, operatorStack.pop());
        }
        // Too many operands in operand stack
        if (operandStack.length != 1) {
            throw new Error("Multiple operands left in stack.");
        }
        return operandStack.top().value;
    };
    /**
     * Evaluates a reference token and returns the numerical result.
     * @param token The ReferenceToken to be evaluated.
     * @param references The lookup object.
     * @returns Returns a number which is the evaluation of the reference.
     * @throws <i>Reference not found</i> exception when the reference is not found in the lookup.
     * @throws <i>Reference does not evaluate to a number</i> exception when the reference does not produce a number.
     * @throws <i>Reference not a function</i> exception when the reference is not specified as a function but is not a function in the lookup object.
     */
    DLMathEval.evaluateReference = function (token, references) {
        if (references == null || references == undefined) {
            throw new Error('Null or undefined lookup references.');
        }
        var result = 0;
        var params = new Array();
        var isMathLib = false;
        // Searching for the method/constant in references
        var currentRoot = references;
        for (var i = 0; i < token.referenceName.length; i++) {
            currentRoot = currentRoot[token.referenceName[i]];
            if (currentRoot == undefined) {
                // Special case for Math libraray
                if (token.referenceName.length == 2 && token.referenceName[0] == 'Math') {
                    currentRoot = Math;
                    if (currentRoot[token.referenceName[1]] == undefined) {
                        throw new Error('Reference ' + token.referenceName + ' not found.');
                    }
                    currentRoot = currentRoot[token.referenceName[1]];
                    isMathLib = true;
                }
                else {
                    throw new Error('Reference ' + token.referenceName + ' not found.');
                }
            }
        }
        // If reference is a constant
        if (token.type == reference_token_type_enum_1.ReferenceTokenType.Constant) {
            if (isMathLib) {
                return currentRoot;
            }
            if (typeof currentRoot == 'function') {
                if (typeof currentRoot() != "number") {
                    throw new Error('Reference:' + token.referenceName + ' does not evaluate to a number.');
                }
                result = currentRoot();
            }
            else if (typeof currentRoot == "number") {
                result = currentRoot;
            }
            else {
                throw new Error('Reference:' + token.referenceName + ' does not evaluate to a number.');
            }
        }
        else if (token.type == reference_token_type_enum_1.ReferenceTokenType.Function) {
            // Type checking the reference within the object
            if (typeof currentRoot != 'function') {
                throw new Error('Reference:' + token.referenceName + ' is not a function.');
            }
            // Evaluating all reference tokens within the params
            for (var i = 0; i < token.params.length; i++) {
                for (var j = 0; j < token.params[i].length; j++) {
                    // Replacing all reference tokens with the evaluated value
                    if (token.params[i][j].type == dMETokenType_enum_1.DMETokenType.Reference) {
                        token.params[i][j] = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.Operand, DLMathEval.evaluateReference(token.params[i][j].value, references));
                    }
                }
                params.push(DLMathEval.evaluateNativeExpression(token.params[i]));
            }
            if (isMathLib) {
                if (currentRoot.length != params.length) {
                    throw new Error('Incompatible number of arguments for ' + token.referenceName[1] + ' method in Math library.');
                }
                result = currentRoot.length == 2 ? currentRoot(params[0], params[1]) : currentRoot(params[0]);
            }
            else {
                // Calling the function
                result = currentRoot(params);
            }
        }
        return result;
    };
    /**
     * Evaluates all reference tokens within the expression and replaces them with a new operand token which is the result.
     * @param exp The tokenized expression, which is the array of tokens.
     * @param references The references to be used (JSON object) for the lookup.
     * @returns Returns a new array of tokens with the replaced reference tokens.
     */
    DLMathEval.evaluateReferenceTokens = function (exp, references) {
        var newExp = new Array();
        for (var _i = 0, exp_3 = exp; _i < exp_3.length; _i++) {
            var token = exp_3[_i];
            if (token.type == dMETokenType_enum_1.DMETokenType.Reference) {
                try {
                    var newToken = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.Operand, DLMathEval.evaluateReference(token.value, references));
                    newExp.push(newToken);
                }
                catch (ex) {
                    throw ex;
                }
            }
            else {
                newExp.push(token);
            }
        }
        return newExp;
    };
    /**
     * Evaluates sub-expression of the form (N) or (-N) to N, where N is a number. For (-N), the token result will be -1 * N.value
     * @param exp The ordered array of tokens of the expression.
     * @returns Returns a new expression which does not contain any sub-expression of the form (N) or (-N).
     */
    DLMathEval.evaluateUnaryOperations = function (exp) {
        var re = [];
        for (var i = 0; i < exp.length; i++) {
            if (exp[i].type == dMETokenType_enum_1.DMETokenType.OpenParenthesis && i <= exp.length - 4) {
                if (exp[i + 1].type == dMETokenType_enum_1.DMETokenType.Operator && exp[i + 1].value == '-' && exp[i + 2].type == dMETokenType_enum_1.DMETokenType.Operand && exp[i + 3].type == dMETokenType_enum_1.DMETokenType.CloseParenthesis) {
                    var temp = new dMEToken_1.DMEToken();
                    temp.type = dMETokenType_enum_1.DMETokenType.Operand;
                    temp.value = (-1) * exp[i + 2].value;
                    re.push(temp);
                    i += 3;
                    continue;
                }
                else {
                    re.push(exp[i]);
                }
            }
            else if (exp[i].type == dMETokenType_enum_1.DMETokenType.OpenParenthesis && i <= exp.length - 3) {
                if (exp[i + 1].type == dMETokenType_enum_1.DMETokenType.Operand && exp[i + 2].type == dMETokenType_enum_1.DMETokenType.CloseParenthesis) {
                    re.push(exp[i + 1]);
                    i += 3;
                    continue;
                }
            }
            else {
                re.push(exp[i]);
            }
        }
        return re;
    };
    /**
     * Gets a numerical value which indicates the precedence of an operator with respect to other operators.
     * @param operator The operator to get the precedence value.
     * @returns Returns the numerical value of the precedence of the operator.
     * @throws <i>Unrecognized operator</i> exception when the character operator is unrecognized..
     */
    DLMathEval.getOperatorPrecedence = function (operator) {
        switch (operator) {
            case '+':
                return 1;
            case '-':
                return 0;
            case '*':
                return 2;
            case '/':
                return 3;
            case '(':
                return -1;
            case ')':
                return 1000;
            default:
                // Unrecognized operator
                throw new Error('Unrecognized operator.');
        }
    };
    /**
     * Parses contiguous groups of digits within the expression and generates the equivalent float number.
     * @param index The starting index of the sequence of digits.
     * @param chars The array of characters of the expression.
     * @returns Returns a new ProcessingResult object with the index and the resultant number token.
     * @throws <i>Decimal point without succeeding digit(s)</i> exception when a decimal point does not have a digit character following it.
     */
    DLMathEval.processNumberTokens = function (index, chars) {
        var tempString = "";
        // Parsing non-fractional part
        for (; index < chars.length && regexContainer_1.RegexContainer.Digit.test(chars[index]); index++) {
            tempString += chars[index];
        }
        // Checking if next character is decimal point
        if (index < chars.length - 1 && chars[index] == ".") {
            tempString += ".";
            index++;
            if (regexContainer_1.RegexContainer.Digit.test(chars[index])) {
                for (; index < chars.length && regexContainer_1.RegexContainer.Digit.test(chars[index]); index++) {
                    tempString += chars[index];
                }
            }
            else {
                // No digits found after decimal point 
                throw new Error();
            }
        }
        else if (index == chars.length - 1 && chars[index] == ".") {
            // No digits found after decimal point 
            throw new Error('Invalid number token. Decimal point without succeeding digit(s).');
        }
        // Parsing from string to float
        var value = 0;
        try {
            value = parseFloat(tempString);
        }
        catch (err) {
            throw err;
        }
        // Token for the number
        var token = new dMEToken_1.DMEToken();
        token.type = dMETokenType_enum_1.DMETokenType.Operand;
        token.value = value;
        var result = new processingResult_1.ProcessingResult();
        result.index = --index;
        result.token = token;
        return result;
    };
    /**
     * Extrapolates a ReferenceToken from an expression from the index specified.
     * @param index The index which has the first match for a ReferenceToken within the expression.
     * @param chars The array of characters of the expression.
     * @returns Returns a ProcessingResult object which contains the end index of the reference token as well as the token itself.
     * @throws <i>Index out of range</i> if the index is out of range of the array length.
     * @throws <i>Null or undefined expression</i> if the expression is null of undefined.
     * @throws <i>Invalid reference name</i> if the reference name does not comply with the specified convention.
     * @throws <i>Open parenthesis does not have have closed match</i> if an opening parenthesis does not have a closing parenthesis when end of expression is reached.
     * @throws <i>Mismatching parenthesis found</i> if there exists unequal number of open/close parenthesis.
     * @throws <i>Encountered comma without paramter succeeding it</i> if there no expression is found after a comma is encountered.
     */
    DLMathEval.processReferenceTokens = function (index, chars) {
        // Index valid check
        if (index < 0 || index > chars.length) {
            throw new Error('Index out of range.');
        }
        // Null check for expression
        if (chars == undefined || chars == null) {
            throw new Error('Null or undefined expression string array.');
        }
        // Obtaining reference name
        var referenceName = "";
        var result = new processingResult_1.ProcessingResult();
        var params = new Array();
        for (; index < chars.length && regexContainer_1.RegexContainer.ReferenceNameCharacters.test(chars[index]); index++) {
            referenceName += chars[index];
        }
        // Validating reference name
        if (!regexContainer_1.RegexContainer.ReferenceName.test(referenceName)) {
            throw new Error('Invalid reference name.');
        }
        // validating if next character is open parenthesis
        // if not then it is a constant
        if (chars[index] != '(') {
            result.index = index;
            result.token = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.Reference, dMEReferenceToken_1.DMEReferenceToken.getInstance(referenceName, [], reference_token_type_enum_1.ReferenceTokenType.Constant));
            return result;
        }
        index++;
        // Checking if end of string is reached
        if (index >= chars.length) {
            // End of expression reached without closing parenthesis
            throw new Error('Open parenthesis does not have have closed match at ' + index);
        }
        var pairCount = 1;
        var startIndex = index;
        for (; index < chars.length && pairCount > 0; index++) {
            if (chars[index] == '(') {
                pairCount++;
            }
            else if (chars[index] == ')') {
                pairCount--;
            }
        }
        index--;
        // Mismatching parenthesis found
        if (index >= chars.length && pairCount != 0) {
            throw new Error('Mismatching parenthesis found.');
        }
        // Obtaining the params
        try {
            var isComma = false;
            for (; startIndex < index; startIndex++) {
                isComma = chars[startIndex] == ',';
                if (isComma) {
                    continue;
                }
                var currentParam = DLMathEval.subTokenizer(startIndex, index, chars, ',');
                params.push(currentParam.tokens);
                startIndex = currentParam.index;
            }
            // Check if last character was comma
            if (isComma) {
                throw new Error('Encountered comma without paramter succeeding it at ' + startIndex);
            }
        }
        catch (ex) {
            throw ex;
        }
        result.index = index;
        result.token = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.Reference, dMEReferenceToken_1.DMEReferenceToken.getInstance(referenceName, params, reference_token_type_enum_1.ReferenceTokenType.Function));
        return result;
    };
    /**
     * Pops two operands from the stack and performs the arithmetic operation as specified by the operator and pushes the result back to the stack.
     * @param operandStack The stack which contains the operand.
     * @param operator The operator token.
     * @throws <i>Not enough operands in operand stack</i>
     */
    DLMathEval.stackEvaluate = function (operandStack, operator) {
        // Not enough operands
        if (operandStack.length < 2) {
            throw new Error("Not enough operands in operand stack.");
        }
        var B = operandStack.pop();
        var A = operandStack.pop();
        var result = new dMEToken_1.DMEToken();
        result.type = dMETokenType_enum_1.DMETokenType.Operand;
        result.value = this.evaluateBinomial(A, B, operator);
        operandStack.push(result);
    };
    /**
     * Tokenizes a sub-string of the expression from the start index to the end index or till the terminating character is reached, which ever is earlier.
     * @param startIndex The starting index, inclusive, of the expression.
     * @param endIndex The end index, exclusive, of the expression.
     * @param chars The array of characters of the expression.
     * @param terminatingChar The terminating character to stop tokenization.
     * @returns Returns a SubTokenizerResult.
     * @throws <i>Unrecognized character</i> exception if one of the character does not form part of a valid expression.
     * @throws <i>Transition check failed</i> exception if a sequence of any two characters within the expression renders it invalid.
     */
    DLMathEval.subTokenizer = function (startIndex, endIndex, chars, terminatingChar) {
        if (terminatingChar === void 0) { terminatingChar = ''; }
        var result = new subTokenizerResult_1.SubTokenizerResult();
        var tokens = new Array();
        try {
            while (startIndex < endIndex) {
                // Ignoring spaces
                if (chars[startIndex] == ' ') {
                    startIndex++;
                    continue;
                }
                var token = new dMEToken_1.DMEToken();
                // If character is a digit
                if (regexContainer_1.RegexContainer.Digit.test(chars[startIndex])) {
                    var processingResult = DLMathEval.processNumberTokens(startIndex, chars);
                    token = processingResult.token;
                    startIndex = processingResult.index;
                }
                else if (regexContainer_1.RegexContainer.ReferenceNameInitial.test(chars[startIndex])) {
                    var processingResult = DLMathEval.processReferenceTokens(startIndex, chars);
                    token = processingResult.token;
                    startIndex = processingResult.index;
                }
                else if (regexContainer_1.RegexContainer.Operator.test(chars[startIndex])) {
                    token = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.Operator, chars[startIndex]);
                }
                else if (regexContainer_1.RegexContainer.ClosingParenthesis.test(chars[startIndex])) {
                    token = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.CloseParenthesis, chars[startIndex]);
                }
                else if (regexContainer_1.RegexContainer.OpeningParenthesis.test(chars[startIndex])) {
                    token = dMEToken_1.DMEToken.getInstance(dMETokenType_enum_1.DMETokenType.OpenParenthesis, chars[startIndex]);
                }
                else {
                    // Unrecognized character
                    throw new Error('Unrecognized character at ' + startIndex);
                }
                // Appending generated token to expression array
                tokens.push(token);
                startIndex++;
                if (startIndex < endIndex && chars[startIndex] != ' ') {
                    // Checking for terminating character
                    if (terminatingChar != '' && chars[startIndex] == terminatingChar) {
                        break;
                    }
                    try {
                        // Performing transition check
                        if (!transitionCheck_1.TransitionCheck(token, chars[startIndex])) {
                            throw new Error('Transition check failed at ' + chars[startIndex] + " " + token.type.toString());
                        }
                    }
                    catch (ex) {
                        throw ex;
                    }
                }
            }
        }
        catch (ex) {
            throw ex;
        }
        result.index = --startIndex;
        result.tokens = tokens;
        return result;
    };
    /**
     * Splits (or tokenizes) the string expression into tokens.
     * @param exp The expression to be tokenized
     * @returns Returns an array of tokens.
     * @throws <i>Undefined or null expression string</i>
     */
    DLMathEval.tokenize = function (exp) {
        // If expression string is null or undefined
        if (exp == undefined || exp == null) {
            throw new Error('Undefined or null expression string.');
        }
        try {
            var parsingResult = DLMathEval.subTokenizer(0, exp.length, exp.split(''), '');
            return parsingResult.tokens;
        }
        catch (err) {
            throw err;
        }
    };
    return DLMathEval;
}());
exports.DLMathEval = DLMathEval;
