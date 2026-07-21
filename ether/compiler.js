function compileAndRunEther(codeSource) {
  console.clear();
  console.log("⚡ [Ether v0.2] Analyse du script...");

  const registres = { EAX: 0, EBX: 0, ECX: 0, EDX: 0 };
  const memory = new Int32Array(1024);

  const lignes = codeSource.split('\n');
  
  lignes.forEach(ligne => {
    const clean = ligne.split(';')[0].trim();
    if (!clean) return;

    const parts = clean.replace(',', '').split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (cmd) {
      case 'MOV':
        const valMov = isNaN(arg2) ? registres[arg2] : parseInt(arg2);
        registres[arg1] = valMov;
        console.log(` -> MOV ${arg1} = ${valMov}`);
        break;

      case 'ADD':
        const valAdd = isNaN(arg2) ? registres[arg2] : parseInt(arg2);
        registres[arg1] += valAdd;
        console.log(` -> ADD ${arg1} += ${valAdd} (Total: ${registres[arg1]})`);
        break;

      case 'SUB':
        const valSub = isNaN(arg2) ? registres[arg2] : parseInt(arg2);
        registres[arg1] -= valSub;
        console.log(` -> SUB ${arg1} -= ${valSub} (Total: ${registres[arg1]})`);
        break;

      case 'MUL':
        const valMul = isNaN(arg2) ? registres[arg2] : parseInt(arg2);
        registres[arg1] *= valMul;
        console.log(` -> MUL ${arg1} *= ${valMul} (Total: ${registres[arg1]})`);
        break;

      case 'STORE':
        const addrStore = parseInt(arg1.replace('[', '').replace(']', ''));
        const valStore = registres[arg2];
        memory[addrStore] = valStore;
        console.log(` 💾 STORE RAM[${addrStore}] = ${valStore}`);
        break;

      case 'LOAD':
        const addrLoad = parseInt(arg2.replace('[', '').replace(']', ''));
        registres[arg1] = memory[addrLoad];
        console.log(` 📥 LOAD ${arg1} depuis RAM[${addrLoad}] (Valeur: ${registres[arg1]})`);
        break;
    }
  });

  const resultatFinal = registres['EAX'];

  function encodeLEB128(value) {
    const bytes = [];
    do {
      let byte = value & 0x7f;
      value >>= 7;
      if (value !== 0) byte |= 0x80;
      bytes.push(byte);
    } while (value !== 0);
    return bytes;
  }

  const encodedVal = encodeLEB128(resultatFinal);

  const codeBody = [0x41, ...encodedVal, 0x0b];
  const funcBody = [0x00, ...codeBody];
  
  const bytesWasm = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,
    0x03, 0x02, 0x01, 0x00,
    0x07, 0x0a, 0x01, 0x06, 0x72, 0x75, 0x6e, 0x45, 0x74, 0x68, 0x00, 0x00,
    0x0a, funcBody.length + 2, 0x01, funcBody.length, ...funcBody
  ]);

  WebAssembly.instantiate(bytesWasm.buffer).then(wasmModule => {
    const res = wasmModule.instance.exports.runEth();
    console.log("%c✅ EXECUTION REUSSIE !", "color: #00ff00; font-weight: bold;");
    alert(`🎉 Script Ether v0.2 exécuté !\n\nRésultat final dans EAX : ${res}`);
  }).catch(err => {
    console.error("❌ Erreur Wasm :", err);
  });
}