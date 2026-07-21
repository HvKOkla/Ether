

# Ether Language (v0.2)

**Ether** is a low-level programming language inspired by **Intel / x86** assembly syntax, designed to compile directly to **WebAssembly (Wasm)**.

## Current Features (v0.2)

* **Direct Intel Syntax:** Support for `MOV`, `ADD`, `SUB`, and `MUL` instructions.
* **Virtual Registers:** Management of `EAX`, `EBX`, `ECX`, and `EDX`.
* **Memory Management:** Direct RAM access operations (`STORE`, `LOAD`).
* **Embedded Compiler:** LEB128 binary generation and native Wasm execution in the browser.

## Code Example (.eth)

```assembly
;; Order calculation and RAM storage
MOV EAX, 50        ; Unit price = 50
MUL EAX, 3         ; x 3 items = 150
SUB EAX, 20        ; Discount = 130

STORE [0], EAX     ; Save to RAM at address 0
LOAD ECX, [0]      ; Read address 0 into ECX
ADD ECX, 10        ; ECX = 140
MOV EAX, ECX       ; Final result in EAX

```

## 🚀 How to test?

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Click on **"Run .eth script"** and open the developer console (`F12`) to see the magic happen!
