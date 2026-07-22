class EtherVM {
  constructor() {
    this.registers = { ACC: 0, VAL: 0, CNT: 0, TMP: 0 };
    this.memory = new Int32Array(256);
    this.pc = 0;
    this.flagEqual = false;
  }

  getValue(arg) {
    if (!arg) return 0;
    const cleanArg = String(arg).trim();
    if (Object.prototype.hasOwnProperty.call(this.registers, cleanArg)) {
      return this.registers[cleanArg];
    }
    return parseInt(cleanArg, 10) || 0;
  }

  run(program) {
    const { instructions, labels } = program;
    this.pc = 0;
    let steps = 0;
    const MAX_STEPS = 10000;

    while (this.pc < instructions.length) {
      if (steps++ > MAX_STEPS) {
        console.error("⚠️ Erreur : Boucle infinie détectée !");
        break;
      }

      const current = instructions[this.pc];
      const opcode = current.opcode;
      const arg1 = current.arg1;
      const arg2 = current.arg2;

      switch (opcode) {
        case "MOV":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1] = this.getValue(arg2);
          }
          break;

        case "STORE":
          if (arg1) {
            const addrStr = arg1.replace("[", "").replace("]", "");
            const addr = parseInt(addrStr, 10) || 0;
            this.memory[addr] = this.getValue(arg2);
          }
          break;

        case "LOAD":
          if (arg2) {
            const addrStr = arg2.replace("[", "").replace("]", "");
            const addr = parseInt(addrStr, 10) || 0;
            if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
              this.registers[arg1] = this.memory[addr] || 0;
            }
          }
          break;

        case "ADD":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1] += this.getValue(arg2);
          }
          break;

        case "SUB":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1] -= this.getValue(arg2);
          }
          break;

        case "MUL":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1] *= this.getValue(arg2);
          }
          break;

        case "INC":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1]++;
          }
          break;

        case "DEC":
          if (Object.prototype.hasOwnProperty.call(this.registers, arg1)) {
            this.registers[arg1]--;
          }
          break;

        case "CMP":
          this.flagEqual = (this.getValue(arg1) === this.getValue(arg2));
          break;

        case "JMP":
          if (Object.prototype.hasOwnProperty.call(labels, arg1)) {
            this.pc = labels[arg1] - 1;
          }
          break;

        case "JE":
          if (this.flagEqual && Object.prototype.hasOwnProperty.call(labels, arg1)) {
            this.pc = labels[arg1] - 1;
          }
          break;

        case "JNE":
          if (!this.flagEqual && Object.prototype.hasOwnProperty.call(labels, arg1)) {
            this.pc = labels[arg1] - 1;
          }
          break;
      }

      this.pc++;
    }

    return {
      registers: Object.assign({}, this.registers),
      ram: Array.from(this.memory.slice(0, 5))
    };
  }
}
