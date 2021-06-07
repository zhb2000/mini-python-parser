import {
    enumerate,
    filter,
    map,
    list,
    range,
    sum
} from '../../src/utils/pylike';

test('enumerate test 1', () => {
    const arr = [0, 1, 2, 3, 4, 5];
    const result1 = [], result2 = [];
    for (const [i, x] of enumerate(arr, 1)) {
        result1.push([i, x]);
    }
    for (const [i, x] of arr.entries()) {
        result2.push([i + 1, x]);
    }
    expect(result1).toEqual(result2);
});

test('filter test 1', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6];
    const r1 = [...filter(x => x % 2 == 0, arr)];
    const r2 = arr.filter(x => x % 2 == 0);
    expect(r1).toEqual(r2);
});

test('map test 1', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6];
    const r1 = [...map(x => x * 2, arr)];
    const r2 = arr.map(x => x * 2);
    expect(r1).toEqual(r2);
});

test('list test 1', () => {
    expect(list()).toEqual([]);
});

test('list test 2', () => {
    const arr = list(function* () {
        for (let i = 0; i < 5; i++) {
            yield i;
        }
    }());
    expect(arr).toEqual([0, 1, 2, 3, 4]);
});

test('range test 1', () => {
    const result1 = [...range(1, 10, 2)];
    const result2 = [1, 3, 5, 7, 9];
    expect(result1).toEqual(result2);
});

test('range test 1', () => {
    const result1 = [...range(5, 0, -1)];
    const result2 = [5, 4, 3, 2, 1];
    expect(result1).toEqual(result2);
});

test('sum test 1', () => {
    const r = sum([0, 1, 2, 3]);
    expect(r).toEqual(6);
});

test('sum test 2', () => {
    const r = sum([0, 1, 2, 3], 2);
    expect(r).toEqual(5);
});
