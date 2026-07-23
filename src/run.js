import fs from 'fs';
import { compileEther } from './src/compiler.js';

async function start() {
  // 1. Lire le code source Ether
  const codeEther = fs.readFileSync('./examples/main.eth', 'utf-8');

  
  console.log("⚡ Compilation de main.eth...");
  const { bytecodeBinary } = await compileEther(codeEther);

  
  if (!fs.existsSync('./build')) fs.mkdirSync('./build');
  fs.writeFileSync('./build/main.wasm', bytecodeBinary);

  
  const wasmModule = await WebAssembly.instantiate(bytecodeBinary, {
    env: {
      print: (val) => console.log("👉 [Ether OUT]:", val)
    }
  });

  console.log("🚀 Exécution du programme...");
  wasmModule.instance.exports.main();
}

start();
