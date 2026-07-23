import wat2wasm from 'wat2wasm';

const REG_MAP = { ACC: "$ACC", VAL: "$VAL", CNT: "$CNT", TMP: "$TMP", PTR: "$PTR" };

async function compileEther(codeText) {
  const lines = codeText.split("\n");
  const constants = {};
  const instructions = [];

  // Passe 1 : Nettoyage et récupération des CONST
  for (let line of lines) {
    line = line.split(";")[0].trim();
    if (!line) continue;

    if (line.startsWith("CONST ")) {
      const parts = line.replace("CONST ", "").split("=");
      if (parts.length === 2) {
        constants[parts[0].trim()] = parseInt(parts[1].trim(), 10) || 0;
      }
      continue;
    }

    if (line.startsWith("EXTERN ")) continue;

    // Traitement des labels (ex: "boucle:")
    if (line.endsWith(":")) {
      const labelName = line.slice(0, -1).trim();
      instructions.push({ opcode: "LABEL", arg1: labelName });
      continue;
    }

    const parts = line.replace(",", " ").split(/\s+/);
    let opcode = parts[0].toUpperCase();
    let arg1 = parts[1] || null;
    let arg2 = parts[2] || null;

    // Remplacement des constantes
    if (arg1 && constants[arg1] !== undefined) arg1 = String(constants[arg1]);
    if (arg2 && constants[arg2] !== undefined) arg2 = String(constants[arg2]);

    instructions.push({ opcode, arg1, arg2 });
  }

  // Passe 2 : Génération du texte WAT (WebAssembly Text)
  let wat = `(module
  ;; Import de la fonction d'affichage JS (ex: console.log)
  (import "env" "print" (func $print (param i32)))

  (func $main (export "main")
    ;; Déclaration de tes registres comme variables locales Wasm
    (local $ACC i32)
    (local $VAL i32)
    (local $CNT i32)
    (local $TMP i32)
    (local $PTR i32)

`;

  for (const inst of instructions) {
    const { opcode, arg1, arg2 } = inst;

    switch (opcode) {
      case "LABEL":
        // En Wasm, les boucles/sauts se gèrent très bien avec des blocs
        wat += `    ;; Label : ${arg1}\n`;
        wat += `    block $${arg1}_block\n`;
        wat += `    loop $${arg1}\n`;
        break;

      case "MOV":
        if (REG_MAP[arg1]) {
          if (REG_MAP[arg2]) {
            wat += `    local.get ${REG_MAP[arg2]}\n`;
          } else {
            wat += `    i32.const ${parseInt(arg2, 10) || 0}\n`;
          }
          wat += `    local.set ${REG_MAP[arg1]}\n`;
        }
        break;

      case "ADD":
        if (REG_MAP[arg1]) {
          wat += `    local.get ${REG_MAP[arg1]}\n`;
          if (REG_MAP[arg2]) {
            wat += `    local.get ${REG_MAP[arg2]}\n`;
          } else {
            wat += `    i32.const ${parseInt(arg2, 10) || 0}\n`;
          }
          wat += `    i32.add\n`;
          wat += `    local.set ${REG_MAP[arg1]}\n`;
        }
        break;

      case "SUB":
        if (REG_MAP[arg1]) {
          wat += `    local.get ${REG_MAP[arg1]}\n`;
          if (REG_MAP[arg2]) {
            wat += `    local.get ${REG_MAP[arg2]}\n`;
          } else {
            wat += `    i32.const ${parseInt(arg2, 10) || 0}\n`;
          }
          wat += `    i32.sub\n`;
          wat += `    local.set ${REG_MAP[arg1]}\n`;
        }
        break;

      case "INC":
        if (REG_MAP[arg1]) {
          wat += `    local.get ${REG_MAP[arg1]}\n    i32.const 1\n    i32.add\n    local.set ${REG_MAP[arg1]}\n`;
        }
        break;

      case "DEC":
        if (REG_MAP[arg1]) {
          wat += `    local.get ${REG_MAP[arg1]}\n    i32.const 1\n    i32.sub\n    local.set ${REG_MAP[arg1]}\n`;
        }
        break;

      case "JMP":
        wat += `    br $${arg1}\n`;
        break;

      case "PRINT":
        if (REG_MAP[arg1]) {
          wat += `    local.get ${REG_MAP[arg1]}\n`;
        } else {
          wat += `    i32.const ${parseInt(arg1, 10) || 0}\n`;
        }
        wat += `    call $print\n`;
        break;
    }
  }

  wat += `  )\n)`;

  // Passe 3 : Conversion directe en binaire WASM avec wat2wasm
  const result = await wat2wasm(wat);

  if (!result.buffer) {
    throw new Error("❌ Erreur de compilation WAT vers WASM : " + result.log);
  }

  return {
    watText: wat,
    bytecodeBinary: new Uint8Array(result.buffer)
  };
}

export { compileEther };