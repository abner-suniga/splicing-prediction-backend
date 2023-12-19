export type FastaSequenceParsed = {
  sequenceName: string;
  sequence: string;
};

// This could be improved by use Node.js streams
export const parseFastaFile = (fastaString: string): FastaSequenceParsed[] => {
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
};
