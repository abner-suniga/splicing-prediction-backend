// This could be improved by use Node.js streams
export function parseFastaFile(fastaString: string) {
  const sequences: Array<{ sequenceName: string; sequence: string }> = [];

  let currentSequenceName;
  let currentSequence = "";

  for (const line of fastaString.split("\n")) {
    // start of sequence
    if (line.startsWith(">")) {
      // end last sequence
      if (currentSequenceName) {
        sequences.push({
          sequenceName: currentSequenceName,
          sequence: currentSequence,
        });
      }

      currentSequenceName = line.slice(1);
      currentSequence = "";
    } else {
      currentSequence += line;
    }
  }

  // last sequence
  if (currentSequenceName) {
    sequences.push({
      sequenceName: currentSequenceName,
      sequence: currentSequence,
    });
  }

  return sequences;
}
