unction compileAndRunEther(codeSource) {
  console.clear();
  console.log("⚡ [Ether v0.2 Modular] Analyse du script...");

  const registres = { EAX: 0, EBX: 0, ECX: 0, EDX: 0 };
  const memory = new Int32Array(1024);

  
  const getValue = (arg) => (isNaN(arg) ? registres[arg] : parseInt(arg, 10));

  
  const parseAddress = (arg) => parseInt(arg.replace('[', '').replace(']', ''), 10);

  const instructions = {
    MOV: (arg1, arg2) => {
      const val = getValue(arg2);
      registres[arg1] = val;
      console.log(` -> MOV ${arg1} = ${val}`);
    },

    ADD: (arg1, arg2) => {
      const val = getValue(arg2);
      registres[arg1] += val;
      console.log(` -> ADD ${arg1} += ${val} (Total: ${registres[arg1]})`);
    },

    SUB: (arg1, arg2) => {
      const val = getValue(arg2);
      registres[arg1] -= val;
      console.log(` -> SUB ${arg1} -= ${val} (Total: ${registres[arg1]})`);
    },

    MUL: (arg1, arg2) => {
      const val = getValue(arg2);
      registres[arg1] *= val;
      console.log(` -> MUL ${arg1} *= ${val} (Total: ${registres[arg1]})`);
    },

    STORE: (arg1, arg2) => {
      const addr = parseAddress(arg1);
      const val = registres[arg2];
      memory[addr] = val;
      console.log(` 💾 STORE RAM[${addr}] = ${val}`);
    },

    LOAD: (arg1, arg2) => {
      const addr = parseAddress(arg2);
      registres[arg1] = memory[addr];
      console.log(` 📥 LOAD ${arg1} depuis RAM[${addr}] (Valeur: ${registres[arg1]})`);
    }
  };
