// flags: --harmony (or --harmony-set-methods) --allow-natives-syntax --shell

let a = new Set();
let b = new Set();

Object.defineProperty(b, 'size', {
    get: () => {
        a.clear(); // allocate new table for `a`
        return 0; // `b.size` must be a number
    }
});

let u = a.union(b);
