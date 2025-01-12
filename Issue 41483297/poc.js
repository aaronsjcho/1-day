// flags: --harmony (or --harmony-set-methods) --shell

let a = new Set();
let b = new Set();

b.keys = () => {
    a.clear(); // allocate new table of `a`
    return b[Symbol.iterator](); // `b.keys()` must return set iterator
}

let s = a.symmetricDifference(b);
