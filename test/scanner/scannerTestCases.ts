const cases = [
    { // 0
        input:
            'def fn():\n' +
            '    a=123.5\n' +
            '    if True:\n' +
            '        a = "abcd"\n' +
            '\n' +
            '\n' +
            'a = fn()\n' +
            'if a >= 0:\n' +
            '    if b < 0:\n' +
            '        a = fn("abcde")  # comment\n' +
            '        # comment\n' +
            '            # comment\n' +
            '        b = b << a\n' +
            '    a = a | b\n' +
            'b.func(a + b // c)\n',
        expected: [
            { type: 'DefToken', value: 'def' },
            { type: 'IdentifierToken', value: 'fn' },
            { type: 'LeftParenthesesToken', value: '(' },
            { type: 'RightParenthesesToken', value: ')' },
            { type: 'ColonToken', value: ':' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentIncToken', value: '' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'FloatToken', value: '123.5' },
            { type: 'NewLineToken', value: '' },
            { type: 'IfToken', value: 'if' },
            { type: 'TrueToken', value: 'True' },
            { type: 'ColonToken', value: ':' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentIncToken', value: '' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'StringToken', value: '"abcd"' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentDecToken', value: '' },
            { type: 'IndentDecToken', value: '' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'fn' },
            { type: 'LeftParenthesesToken', value: '(' },
            { type: 'RightParenthesesToken', value: ')' },
            { type: 'NewLineToken', value: '' },
            { type: 'IfToken', value: 'if' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'GeqToken', value: '>=' },
            { type: 'IntToken', value: '0' },
            { type: 'ColonToken', value: ':' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentIncToken', value: '' },
            { type: 'IfToken', value: 'if' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'LessToken', value: '<' },
            { type: 'IntToken', value: '0' },
            { type: 'ColonToken', value: ':' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentIncToken', value: '' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'fn' },
            { type: 'LeftParenthesesToken', value: '(' },
            { type: 'StringToken', value: '"abcde"' },
            { type: 'RightParenthesesToken', value: ')' },
            { type: 'NewLineToken', value: '' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'ShiftLeftToken', value: '<<' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentDecToken', value: '' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'BitOrToken', value: '|' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'NewLineToken', value: '' },
            { type: 'IndentDecToken', value: '' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'DotToken', value: '.' },
            { type: 'IdentifierToken', value: 'func' },
            { type: 'LeftParenthesesToken', value: '(' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'PlusToken', value: '+' },
            { type: 'IdentifierToken', value: 'b' },
            { type: 'DivIntToken', value: '//' },
            { type: 'IdentifierToken', value: 'c' },
            { type: 'RightParenthesesToken', value: ')' },
            { type: 'NewLineToken', value: '' }
        ]
    },
    { // 1
        input: 'a = a**6',
        expected: [
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'PowToken', value: '**' },
            { type: 'IntToken', value: '6' },
            { type: 'NewLineToken', value: '' }
        ]
    },
    { // 2
        input: 'a = a//6',
        expected: [
            { type: 'IdentifierToken', value: 'a' },
            { type: 'AssignToken', value: '=' },
            { type: 'IdentifierToken', value: 'a' },
            { type: 'DivIntToken', value: '//' },
            { type: 'IntToken', value: '6' },
            { type: 'NewLineToken', value: '' }
        ]
    },
    { // 3
        input: String.raw`"a\n'b\"c\'d"`,
        expected: [
            { type: 'StringToken', value: String.raw`"a\n'b\"c\'d"` },
            { type: 'NewLineToken', value: '' }
        ]
    },
    { // 4
        input: '    \n\t   \n \n',
        expected: []
    }
];

export { cases };
