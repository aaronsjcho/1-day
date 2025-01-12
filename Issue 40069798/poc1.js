// flags: --harmony (or --harmony-set-methods)

let a = new Set();
let b = new Set();

Object.defineProperty(b, 'size', {
    get: () => {
        a.clear(); // allocate new table for `a`
        return 0; // `b.size` must be a number
    }
});

a.intersection(b);
// a.difference(b);
// a.symmetricDifference(b);
// a.isSubsetOf(b);
// a.isSupersetOf(b);
// a.isDisjointFrom(b);
