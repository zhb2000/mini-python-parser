/** 仿 Python 的各种实用函数 */
import { throwErr } from './enhance';
import * as itertools from './pylike-itertools';

function list(): [];
function list<T>(iterable: Iterable<T>): T[];
function list<T>(iterable?: Iterable<T>): T[] {
    const _iterable = iterable ?? [];
    return [..._iterable];
}

function* map<T1, T2>(func: (x: T1) => T2, iterable: Iterable<T1>): Iterable<T2> {
    for (const x of iterable) {
        yield func(x);
    }
}

function* filter<T>(func: (x: T) => boolean, iterable: Iterable<T>): Iterable<T> {
    for (const x of iterable) {
        if (func(x)) {
            yield x;
        }
    }
}

function enumerate<T>(iterable: Iterable<T>): Iterable<[number, T]>;
function enumerate<T>(iterable: Iterable<T>, start: number): Iterable<[number, T]>;
function* enumerate<T>(iterable: Iterable<T>, start?: number): Iterable<[number, T]> {
    let i = start ?? 0;
    for (const x of iterable) {
        yield [i, x];
        i++;
    }
}

function range(stop: number): Iterable<number>;
function range(start: number, stop: number): Iterable<number>;
function range(start: number, stop: number, step: number): Iterable<number>;
function* range(a: number, b?: number, c?: number): Iterable<number> {
    let start, stop, step;
    if (b == null && c == null) { //range(stop)
        start = 0;
        stop = a;
        step = 1;
    } else { //range(start, stop[, step])
        start = a;
        stop = b ?? throwErr(Error, 'stop should be non null');
        step = c ?? 1;
    }
    if (step >= 0) {
        for (let i = start; i < stop; i += step) {
            yield i;
        }
    } else {
        for (let i = start; i > stop; i += step) {
            yield i;
        }
    }
}

function sum(iterable: Iterable<number>): number;
function sum(iterable: Iterable<number>, start: number): number;
function sum(iterable: Iterable<number>, start?: number): number {
    const _start = start ?? 0;
    let ans = 0;
    for (const [i, x] of enumerate(iterable)) {
        if (i >= _start) {
            ans += x;
        }
    }
    return ans;
}

function all(iterable: Iterable<boolean>): boolean {
    for (const element of iterable) {
        if (!element) {
            return false;
        }
    }
    return true;
}

function any(iterable: Iterable<boolean>): boolean {
    for (const element of iterable) {
        if (element) {
            return true;
        }
    }
    return false;
}

export {
    list,
    map,
    filter,
    enumerate,
    range,
    sum,
    all,
    any,
    itertools
};
