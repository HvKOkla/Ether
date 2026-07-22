function compileEther(codeText) {
  const lines = codeText.split("\n");
  const labels = {};
  const instructions = [];

  
  for (let line of lines) {
    line = line.split(";")[0].trim();
    if (!line) continue;

    if (line.endsWith(":")) {
      const labelName = line.slice(0, -1).trim();
      labels[labelName] = instructions.length;
    } else {
      const parts = line.replace(",", " ").split(/\s+/);
      instructions.push({
        opcode: parts[0].toUpperCase(),
        arg1: parts[1] || null,
        arg2: parts[2] || null
      });
    }
  }

  return { instructions, labels };
}
