export interface Token {
    value: string;
    type: TokenType;
}

export enum TokenType {
    Number,
    Identifier,
    Equals,
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    BinaryOperator,
    Comma,
    Dot,
    Let,
    EOF,
    Const,
    Colon,
    SemiColon,
    String,
    Function
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Function
}

export function tokenize(input: string): Token[] {
    const tokens = new Array<Token>();
    const src = input.split('');

    while (src.length > 0) {
        if (isRedundant(src[0]))
            src.shift();
        else if (src[0] === '(')
            tokens.push(token(src.shift()!, TokenType.OpenParen));
        else if (src[0] === ')')
            tokens.push(token(src.shift()!, TokenType.CloseParen));
        else if (src[0] === '{')
            tokens.push(token(src.shift()!, TokenType.OpenBrace));
        else if (src[0] === '}')
            tokens.push(token(src.shift()!, TokenType.CloseBrace));
        else if (src[0] === '[')
            tokens.push(token(src.shift()!, TokenType.OpenBracket));
        else if (src[0] === ']')
            tokens.push(token(src.shift()!, TokenType.CloseBracket));
        else if (src[0] === ',')
            tokens.push(token(src.shift()!, TokenType.Comma));
        else if (src[0] === ':')
            tokens.push(token(src.shift()!, TokenType.Colon));
        else if (src[0] === ';')
            tokens.push(token(src.shift()!, TokenType.SemiColon));
        else if (src[0] === '.')
            tokens.push(token(src.shift()!, TokenType.Dot));
        else if (src[0] === '=')
            tokens.push(token(src.shift()!, TokenType.Equals));
        else if (src[0] === '+' || src[0] === '-' || src[0] === '*' || src[0] === '/' || src[0] === '%')
            tokens.push(token(src.shift()!, TokenType.BinaryOperator));
        else if (src[0] === '"') {
            src.shift();
            let value = '';
            while (src[0] !== '"') {
                value += src.shift()!;
            }
            src.shift();
            tokens.push(token(value, TokenType.String));
        } else if (src[0].match(/[0-9]*.[0-9]*/)) {
            let number = '';
            while (src.length > 0 && src[0].match(/[0-9]*.[0-9]*/))
                number += src.shift()!;
            tokens.push(token(number, TokenType.Number));
        } else if (src[0].match(/[a-zA-Z_]/)) {
            let identifier = '';
            while (src.length > 0 && src[0].match(/[a-zA-Z_]/))
                identifier += src.shift()!;
            if (KEYWORDS[identifier])
                tokens.push(token(identifier, KEYWORDS[identifier]));
            else
                tokens.push(token(identifier, TokenType.Identifier));
        } else {
            throw new Error(`Unexpected character: ${src[0]}`);
        }
    }
    tokens.push(token('', TokenType.EOF));
    return tokens;
}

const isRedundant = (char: string) => (char === '\n' || char === ' ' || char === '\t' || char === '\r');

const token = (value: string, type: TokenType): Token => {
    return {value, type};
};