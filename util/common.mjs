export function pipe(x, ...fs) {
    let res = x;
    for (const f of fs) {
        res = f(res);
    }
    return res;
}

export function isIterator(xs) {
    // By convention, an iterator returns itself when calling `Symbol.iterator`.
    return xs[Symbol.iterator]() === xs;
}

// https://stackoverflow.com/a/46416353/870615
export function tee(it) {
    // If `it` is not an iterator, i.e. can be traversed more than once, 
    // we just return it unmodified.
    if (!isIterator(it)) return [it, it];

    const source = it[Symbol.iterator]();
    const buffers = [[], []];
    const DONE = Symbol('done');

    const next = i => {
        if (buffers[i].length) return buffers[i].shift();
        const x = source.next();
        if (x.done) return DONE;
        buffers[1 - i].push(x.value);
        return x.value;
    };

    return buffers.map(function* (_, i) {
        while (true) {
            const x = next(i);
            if (x === DONE) break;
            yield x;
        }
    });
}

// TODO: more performant impl?
export function teeN(it, n = 2) {
    const res = [];
    let orig = it, copy;
    for (let i = 0; i < n - 1; i++) {
        [orig, copy] = tee(orig);
        res.push(copy);
    }
    res.push(orig);
    return res;
}