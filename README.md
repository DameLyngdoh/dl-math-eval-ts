# TypeScript's Math Evaluator
This is a library for parsing and evaluating string arithmetic expressions.

## Installation
### Using NPM
```sh
npm i dl-math-eval-ts
```

### Using GitHub Repository
Clone or download the repository and add the import references accordingly in your TypeScript source code.
```sh
git clone https://github.com/DameLyngdoh/dl-math-eval-ts.git
```

### Build
To build the source and generate the corresponding JS source code:
```sh
git clone https://github.com/DameLyngdoh/dl-math-eval-ts.git
cd dl-math-eval-ts.git
tsc
```

Note: You must have TypeScript compiler installed in your system to use `tsc`. Refer to [this page](https://www.npmjs.com/package/typescript) for more information.


## Usage
To use the library, simply use the appropriate imports in the source code.
For example, if you wish to evaluate an expression then:
```typescript
import { DLMathEval } from './node-modules/dl-math-eval-ts';

let exp : string = 'your expression';
let ref : any = {}; // your references and methods definitions
let result : number = DLMathEval.evaluateExpression( exp, ref );
```
This is an example of a scenario where you have used `npm` to install the library.
There are several other static methods in `DLMathEval` that you may find useful so I encourage you to explore the documentation to discover these methods.

However to get a better understanding of the terms and conventions followed in the methods and classes, then reading the description below will help.

## Description
Here are the descriptions and elaborations of a few terms which are used in this project:

### Token
A **token** is an independent element in an expression. It can be a number, an operator or a function call. A token in this library is represented by a class named `DMEToken`. The class has two fields: 

|Field|Type|Description|
|-|-|-|
|`type`|`TokenType`|type of token|
|`value`|`any`|value of the token|

The value that must `value` must hold depends on the `type` of the token.

|TokenType|Value Type|
|-|-|
|CloseParenthesis|`')'`|
|OpenParenthesis|`'('`|
|Operand|number|
|Operator|`'-'` or `'+'` or `'*'` or `'/'`|
|Reference|`DMEReferenceToken` object|

The `tokenize` method on passing a valid expression will provide an array containing the tokens in order corresponding to the expression.

### Reference Token
A reference token is one that represents an entity that requires a look-up in a JSON object. For example the token:
```typescript
f1.f2.f3(2,1)
```
is a function call and takes two arguments. The function must be declared in the second parameter of the `evaluateExpression` method. For the above example the parameter can be the following object:
```typescript
let ref : any = {
	"f1": {
    	"f2": {
        	"f3": function( params : number[] ) : number {
            	return params[1] * params[2];
            }
        }
    }
};
```
The function takes an array argument where the numbers which are to be passed as arguments are contained in the order of declaration of the function in the `params` array.
The reference need not necessarily be a function but it can also be a number or an expression that results to a number. For example the below expression is still valid:
```typescript
let ref : any = {
	"f1": {
    	"f2": {
        	"f3": function( params : number[] ) : number {
            	return params[1] * params[2];
            },
            "f4": function() : number {
            	return 101;
            }
        },
        "notAFunction": 5+1
    }
};

let expression : string = 'f1.f2.f3(4,5) + f1.f2.f4 * f1.notAFunction';
```
Parsing `expression` will yield three `DMEReferenceToken` objects which in this scenario are valid.
The `DMEReferenceToken` class has three fields:

|Field|Type|Description|
|-|-|-|
|`referenceName`|`string[]`|complete name of the reference, which is delimited on `.` character|
|`type`|`ReferenceTokenType`|type of token, can be `Function` or `Constant`|
|`params`|`DMEToken[][]`|parameters to be passed to the function|

The `params` field is an array of expression where the expression is expressed as an array of tokens. A reference token can take any valid expression as a parameter and the expression may include references also. Before evaluation of a reference, all its parameters are evaluated first and then the resulting numerical results are passed to the function (you can see this as a depth-first evaluation).

A `Constant` type is one which does not have the syntax of a function call. `f1.notAFunction` or `f1.f2.f4` are both `Constant` types. Intuitively, a `Function` has the syntax of a function call, example `f1.f2.f3(2,3)`.

#### Math Library
If there are any references which are of the form `Math.cos(2)` or references which require the common `Math` library, on evaluation of the reference, if it is not found in the look-up object then the reference will be looked up in the `Math`library as well. That is of course **if the look-up in the reference object fails**. Even for the methods in `Math` library, the parameters are evaluated first before being passed to the method, so the expression 

`Math.cos( 2 + f1.notAFunction )`

is still valid.

### Regular Expressions
The regular expressions used in this project can be found in `regexContainer.ts` file in the `RegexContainer` class.

|Regex|Name|Description|
|-|-|-|
|`/^[)]$/`|ClosingParenthesis|Close parenthesis or `)`|
|`/^[0-9]$/`|Digit|All digits from 0 to 9|
|`/^[(]$/`|OpeningParenthesis|Open parenthesis or `(`|
|`/^[-+*/]$/`|Operator|The common arithmetic operators of addition, subtraction, multiplication and division.|
|`/^([a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+)*)$/`|ReferenceName|A reference name is of the form `name.name.name.name`, where `.` is the separator and name can be a string of uppercase or lowercase characters, digits, `$` or `_`. A reference name must start with any one of these characters and must have at least one of these characters.|
|`/^[a-zA-Z0-9$_.]$/`|ReferenceNameCharacters|The characters that are valid in a reference name.|
|`/^[a-zA-Z$]$/`|ReferenceNameInitial|The valid starting characters of a reference name.|

### Transition Check
Since the project requires parsing a string, so intuitively there will be a requirement of a **transition table**. The transition, in this case, performs check on whether a character following or succeeding a token forms a valid expression. The `TransitionCheck` method, in `transitionCheck.ts`, is an implementation of this concept. The parameters of the method are:
|Parameter|Type|Description|
|-|-|-|
|`currentToken`|`DMEToken`|The token that was generated in the current iteration.|
|`next`|`string`|The character following the `currentToken` in the expression.|

This method returns `true` when the transition from the token to the character is valid or `false` if invalid. The method uses regular expression which will are self-explanatory.

## Algorithm
The algorithm used for evaluating the expression can be found in [this page](https://algorithms.tutorialhorizon.com/evaluation-of-infix-expressions/). The algorithm evaluates infix expression using two stacks, one for operands and one for operators.
The method `evaluateNativeExpression` implements the algorithm.

**Native Expression** - A native expression is one where there are only operands, operators and parenthesis in the expression. In other words, there are no reference tokens in the expression.

## Documentation
Please refer to `doc/index.html` for the complete documentation and API reference. The documentation for this project was generated using [Compodoc](https://compodoc.app/).

## Demo

```typescript
// Expression string
let exp : string = "a + (1+1.1)/2+$f.$r.w_t_($f.x(2),3) + (-2) + Math.cos(90)";

// Reference object
let ref : any = {
    "$f": {
        "$r": {
            "w_t_": function( params : number[] ) : number {
                return params[0] + params[1];
            }
        },
        "x": function( params : number[] ) : number {
            return params[0] * params[0];
        },
        "a": 2
    },
    "a": 1
};

// Getting the array of tokens
let tokens = DLMathEval.tokenize(exp);

// Evaluating the expression
let result = DLMathEval.evaluateExpression(exp, ref);
```
