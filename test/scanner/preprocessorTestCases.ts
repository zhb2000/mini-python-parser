const cases = [
    {
        input:
            'if True:\n' +
            '    aaa\n' +
            '    bbb\n' +
            '    if True:\n' +
            '        ccc\n' +
            '        ddd\n' +
            '    while True:\n' +
            '        aaa\n',
        expected:
            'if True: NewLine ' +
            'IndentInc ' +
            'aaa NewLine ' +
            'bbb NewLine ' +
            'if True: NewLine ' +
            'IndentInc ' +
            'ccc NewLine ' +
            'ddd NewLine ' +
            'IndentDec ' +
            'while True: NewLine ' +
            'IndentInc ' +
            'aaa NewLine ' +
            'IndentDec ' +
            'IndentDec'
    },
    {
        input:
            'def fn():\n' +
            '    aaa\n' +
            '    if True:\n' +
            '        aaa\n' +
            '\n' +
            '\n' +
            'a = fn()\n' +
            'if a > 0:\n' +
            '    if b > 0:\n' +
            '        aaa\n' +
            '        bbb\n' +
            '    aaa\n' +
            'bbb\n',
        expected:
            'def fn(): NewLine ' +
            'IndentInc ' +
            'aaa NewLine ' +
            'if True: NewLine ' +
            'IndentInc ' +
            'aaa NewLine ' +
            'IndentDec ' +
            'IndentDec ' +
            'a = fn() NewLine ' +
            'if a > 0: NewLine ' +
            'IndentInc ' +
            'if b > 0: NewLine ' +
            'IndentInc ' +
            'aaa NewLine ' +
            'bbb NewLine ' +
            'IndentDec ' +
            'aaa NewLine ' +
            'IndentDec ' +
            'bbb NewLine'
    },
    {
        input:
            'if b > 0:\n' +
            '    a = fn("abcde")  # comment\n' +
            '    # comment\n' +
            '        # comment\n' +
            '    b = b << a\n',
        expected:
            'if b > 0: NewLine ' +
            'IndentInc ' +
            'a = fn("abcde")  # comment NewLine ' +
            'b = b << a NewLine ' +
            'IndentDec'
    }
];

export { cases };
