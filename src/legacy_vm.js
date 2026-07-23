const REG_NAMES = ["ACC", "VAL", "CNT", "TMP", "PTR"];

const OPCODES = {
  MOV_REG_IMM: 0x01,
  MOV_REG_REG: 0x02,
  ADD_REG_IMM: 0x03,
  ADD_REG_REG: 0x04,
  SUB_REG_IMM: 0x05,
  SUB_REG_REG: 0x06,
  MUL_REG_IMM: 0x07,
  MUL_REG_REG: 0x08,
  INC:         0x09,
  DEC:         0x0A,
  STORE_PTR:   0x0B,
  STORE_ADDR:  0x0C,
  LOAD_PTR:    0x0D,
  LOAD_ADDR:   0x0E,
  PUSH:        0x0F,
  POP:         0x10,
  CMP_REG_IMM: 0x11,
  CMP_REG_REG: 0x12,
  JMP:         0x13,
  JE:          0x14,
  JNE:         0x15,
  PRINT:       0x16,
  PRINT_CHAR:  0x17,
  CALL_SYS:    0x18,
  HALT:        0xFF
};

class EtherVM {
  constructor() {
    this.registers = new Int32Array(5);
    this.memory = new Int32Array(256);
    this.pc = 0;
    this.flagEqual = false;
    this.stack = [];
  }

  runBytecode(bytecode) {
    this.pc = 0;
    let steps = 0;
    const MAX_STEPS = 10000;

    while (this.pc < bytecode.length) {
      if (steps++ > MAX_STEPS) {
        console.error("⚠️ Erreur : Boucle infinie détectée !");
        break;
      }

      const opcode = bytecode[this.pc++];

      switch (opcode) {
        case OPCODES.MOV_REG_IMM: {
          const reg = bytecode[this.pc++];
          const val = bytecode[this.pc++];
          this.registers[reg] = val;
          break;
        }

        case OPCODES.MOV_REG_REG: {
          const dest = bytecode[this.pc++];
          const src = bytecode[this.pc++];
          this.registers[dest] = this.registers[src];
          break;
        }

        case OPCODES.ADD_REG_IMM: {
          const reg = bytecode[this.pc++];
          const val = bytecode[this.pc++];
          this.registers[reg] += val;
          break;
        }

        case OPCODES.ADD_REG_REG: {
          const dest = bytecode[this.pc++];
          const src = bytecode[this.pc++];
          this.registers[dest] += this.registers[src];
          break;
        }

        case OPCODES.SUB_REG_IMM: {
          const reg = bytecode[this.pc++];
          const val = bytecode[this.pc++];
          this.registers[reg] -= val;
          break;
        }

        case OPCODES.SUB_REG_REG: {
          const dest = bytecode[this.pc++];
          const src = bytecode[this.pc++];
          this.registers[dest] -= this.registers[src];
          break;
        }

        case OPCODES.INC: {
          const reg = bytecode[this.pc++];
          this.registers[reg]++;
          break;
        }

        case OPCODES.DEC: {
          const reg = bytecode[this.pc++];
          this.registers[reg]--;
          break;
        }

        case OPCODES.CMP_REG_IMM: {
          const reg = bytecode[this.pc++];
          const val = bytecode[this.pc++];
          this.flagEqual = (this.registers[reg] === val);
          break;
        }

        case OPCODES.CMP_REG_REG: {
          const reg1 = bytecode[this.pc++];
          const reg2 = bytecode[this.pc++];
          this.flagEqual = (this.registers[reg1] === this.registers[reg2]);
          break;
        }

        case OPCODES.JMP: {
          const targetAddr = bytecode[this.pc++];
          this.pc = targetAddr;
          break;
        }

        case OPCODES.JE: {
          const targetAddr = bytecode[this.pc++];
          this.pc++; // Padded byte
          if (this.flagEqual) this.pc = targetAddr;
          break;
        }

        case OPCODES.JNE: {
          const targetAddr = bytecode[this.pc++];
          this.pc++; // Padded byte
          if (!this.flagEqual) this.pc = targetAddr;
          break;
        }

        case OPCODES.STORE_PTR: {
          const srcReg = bytecode[this.pc++];
          const ptrAddr = this.registers[4];
          this.memory[ptrAddr] = this.registers[srcReg];
          break;
        }

        case OPCODES.STORE_ADDR: {
          const addr = bytecode[this.pc++];
          const srcReg = bytecode[this.pc++];
          this.memory[addr] = this.registers[srcReg];
          break;
        }

        case OPCODES.LOAD_PTR: {
          const destReg = bytecode[this.pc++];
          const ptrAddr = this.registers[4];
          this.registers[destReg] = this.memory[ptrAddr] || 0;
          break;
        }

        case OPCODES.LOAD_ADDR: {
          const destReg = bytecode[this.pc++];
          const addr = bytecode[this.pc++];
          this.registers[destReg] = this.memory[addr] || 0;
          break;
        }

        case OPCODES.PUSH: {
          const regOrVal = bytecode[this.pc++];
          const val = (regOrVal >= 0 && regOrVal < 5) ? this.registers[regOrVal] : regOrVal;
          this.stack.push(val);
          break;
        }

        case OPCODES.POP: {
          const reg = bytecode[this.pc++];
          this.registers[reg] = this.stack.pop() || 0;
          break;
        }

        case OPCODES.CALL_SYS: {
          const sysCallId = bytecode[this.pc++];
          console.log(`[sys::print] Appels système / Iteration = ${this.registers[0]}`);
          break;
        }

        case OPCODES.PRINT: {
          const regOrVal = bytecode[this.pc++];
          const val = (regOrVal >= 0 && regOrVal < 5) ? this.registers[regOrVal] : regOrVal;
          console.log(`[PRINT] ${val}`);
          break;
        }

        case OPCODES.PRINT_CHAR: {
          const regOrVal = bytecode[this.pc++];
          const val = (regOrVal >= 0 && regOrVal < 5) ? this.registers[regOrVal] : regOrVal;
          console.log(String.fromCharCode(val));
          break;
        }

        case OPCODES.HALT:
          return this.getRegistersObject();

        default:
          console.error(`Opcode inconnu: 0x${opcode.toString(16)} à l'adresse ${this.pc - 1}`);
          return this.getRegistersObject();
      }
    }

    return this.getRegistersObject();
  }

  getRegistersObject() {
    const res = {};
    REG_NAMES.forEach((name, i) => {
      res[name] = this.registers[i];
    });
    return {
      registers: res,
      ram: Array.from(this.memory.slice(0, 10))
    };
  }
}

export { EtherVM };