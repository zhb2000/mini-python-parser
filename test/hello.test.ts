import { hello } from '../src/hello';

test('hello test1', () => {
    // console.log('tt1');
    const s = 's is here';
    expect(hello(s)).toBe('hello s is here');
});

test('hello test2', () => {
    // console.log('tt2');
    const s = '123';
    expect(hello(s)).toEqual('hello 123');
});
