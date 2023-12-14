import { parseOutput } from "./model";

describe("model - parseOutput", () => {
  it("should return a parsed output", () => {
    const parsedOutput = parseOutput(
      "SequenceName1",
      MOCK_SEQUENCE,
      MOCK_MODEL_OUTPUT,
    );
    expect(parsedOutput).toStrictEqual([
      {
        sequenceName: "SequenceName1",
        position: 0,
        base: "A",
        hit: "ATGCT",
        score: 0.2885,
      },
      {
        sequenceName: "SequenceName1",
        position: 1,
        base: "T",
        hit: "ATGCTG",
        score: 0.0767,
      },
      {
        sequenceName: "SequenceName1",
        position: 2,
        base: "G",
        hit: "ATGCTGC",
        score: 0.2142,
      },
      {
        sequenceName: "SequenceName1",
        position: 3,
        base: "C",
        hit: "ATGCTGCA",
        score: 0.092,
      },
      {
        sequenceName: "SequenceName1",
        position: 4,
        base: "T",
        hit: "ATGCTGCAT",
        score: 0.074,
      },
      {
        sequenceName: "SequenceName1",
        position: 5,
        base: "G",
        hit: "TGCTGCATG",
        score: 0.0233,
      },
      {
        sequenceName: "SequenceName1",
        position: 6,
        base: "C",
        hit: "GCTGCATGT",
        score: 0.077,
      },
      {
        sequenceName: "SequenceName1",
        position: 7,
        base: "A",
        hit: "CTGCATGTG",
        score: 0.0757,
      },
      {
        sequenceName: "SequenceName1",
        position: 8,
        base: "T",
        hit: "TGCATGTGA",
        score: 0.0821,
      },
      {
        sequenceName: "SequenceName1",
        position: 9,
        base: "G",
        hit: "GCATGTGAC",
        score: 0.0388,
      },
      {
        sequenceName: "SequenceName1",
        position: 10,
        base: "T",
        hit: "CATGTGACT",
        score: 0.0532,
      },
      {
        sequenceName: "SequenceName1",
        position: 11,
        base: "G",
        hit: "ATGTGACTG",
        score: 0.0813,
      },
      {
        sequenceName: "SequenceName1",
        position: 12,
        base: "A",
        hit: "TGTGACTGC",
        score: 0.0675,
      },
      {
        sequenceName: "SequenceName1",
        position: 13,
        base: "C",
        hit: "GTGACTGCA",
        score: 0.0575,
      },
      {
        sequenceName: "SequenceName1",
        position: 14,
        base: "T",
        hit: "TGACTGCAG",
        score: 0.071,
      },
      {
        sequenceName: "SequenceName1",
        position: 15,
        base: "G",
        hit: "GACTGCAGC",
        score: 0.1527,
      },
      {
        sequenceName: "SequenceName1",
        position: 16,
        base: "C",
        hit: "ACTGCAGCT",
        score: 0.1647,
      },
      {
        sequenceName: "SequenceName1",
        position: 17,
        base: "A",
        hit: "CTGCAGCTA",
        score: 0.3419,
      },
      {
        sequenceName: "SequenceName1",
        position: 18,
        base: "G",
        hit: "TGCAGCTAT",
        score: 0.2385,
      },
      {
        sequenceName: "SequenceName1",
        position: 19,
        base: "C",
        hit: "GCAGCTATC",
        score: 0.4833,
      },
      {
        sequenceName: "SequenceName1",
        position: 20,
        base: "T",
        hit: "CAGCTATC",
        score: 0.5102,
      },
      {
        sequenceName: "SequenceName1",
        position: 21,
        base: "A",
        hit: "AGCTATC",
        score: 0.7461,
      },
      {
        sequenceName: "SequenceName1",
        position: 22,
        base: "T",
        hit: "GCTATC",
        score: 0.561,
      },
      {
        sequenceName: "SequenceName1",
        position: 23,
        base: "C",
        hit: "CTATC",
        score: 0.8222,
      },
    ]);
  });
});

const MOCK_SEQUENCE = "ATGCTGCATGTGACTGCAGCTATC";

const MOCK_MODEL_OUTPUT = `
0.7115,0.2885
0.9233,0.0767
0.7858,0.2142
0.9080,0.0920
0.9260,0.0740
0.9767,0.0233
0.9230,0.0770
0.9243,0.0757
0.9179,0.0821
0.9612,0.0388
0.9468,0.0532
0.9187,0.0813
0.9325,0.0675
0.9425,0.0575
0.9290,0.0710
0.8473,0.1527
0.8353,0.1647
0.6581,0.3419
0.7615,0.2385
0.5167,0.4833
0.4898,0.5102
0.2539,0.7461
0.4390,0.5610
0.1778,0.8222
`;
