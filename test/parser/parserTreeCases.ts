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
            'b.func(a + b // c)\n'
    },
    { // 1
        input: 'a = a**6'
    },
    { // 2
        input: 'a = a//6'
    }
];

export { cases };
