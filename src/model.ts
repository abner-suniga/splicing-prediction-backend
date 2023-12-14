export type ParsedOutput = {
  sequenceName: string;
  position: number;
  base: string;
  hit: string;
  score: number;
};

export function parseOutput(
  sequenceName: string,
  sequence: string,
  output: string,
  padSize: number = 4,
) {
  const parsedOutput: ParsedOutput[] = [];

  const lines = output.split("\n");
  let position = 0;

  for (const line of lines) {
    if (!line.includes(",")) {
      continue;
    }

    const [_, pos] = line.split(",");

    const hitStart = position - padSize < 0 ? 0 : position - padSize;
    const hitEnd =
      position + padSize > sequence.length - 1
        ? sequence.length - 1
        : position + padSize;

    parsedOutput.push({
      sequenceName: sequenceName,
      position,
      base: sequence[position],
      hit: sequence.slice(hitStart, hitEnd + 1),
      score: parseFloat(pos),
    });

    position++;
  }

  return parsedOutput;
}
