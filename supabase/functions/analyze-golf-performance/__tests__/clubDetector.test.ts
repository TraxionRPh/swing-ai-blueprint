
import { detectClubType } from '../utils/clubDetector.ts';

Deno.test("detectClubType - Driver detection", () => {
  const tests = [
    { input: "I have issues with my driver", expected: "driver" },
    { input: "My tee shots are going right", expected: "driver" },
    { input: "Having trouble off the tee", expected: "driver" },
    { input: "Slicing with driver", expected: "driver" },
    { input: "Random text without club", expected: null },
  ];

  for (const { input, expected } of tests) {
    const result = detectClubType(input);
    if (result !== expected) {
      throw new Error(`Failed: "${input}" - Expected ${expected}, got ${result}`);
    }
  }
});

Deno.test("detectClubType - Irons detection", () => {
  const tests = [
    { input: "My 7 iron is inconsistent", expected: "irons" },
    { input: "Having issues with my irons", expected: "irons" },
    { input: "Can't hit my 5 iron well", expected: "irons" },
    { input: "Chunking iron shots", expected: "irons" },
  ];

  for (const { input, expected } of tests) {
    const result = detectClubType(input);
    if (result !== expected) {
      throw new Error(`Failed: "${input}" - Expected ${expected}, got ${result}`);
    }
  }
});

Deno.test("detectClubType - Wedges detection", () => {
  const tests = [
    { input: "Sand wedge troubles", expected: "wedges" },
    { input: "Issues with pitch shots", expected: "wedges" },
    { input: "My wedge game needs work", expected: "wedges" },
  ];

  for (const { input, expected } of tests) {
    const result = detectClubType(input);
    if (result !== expected) {
      throw new Error(`Failed: "${input}" - Expected ${expected}, got ${result}`);
    }
  }
});

Deno.test("detectClubType - Putter detection", () => {
  const tests = [
    { input: "Three putting too much", expected: "putter" },
    { input: "Missing short putts", expected: "putter" },
    { input: "Struggling on the greens", expected: "putter" },
  ];

  for (const { input, expected } of tests) {
    const result = detectClubType(input);
    if (result !== expected) {
      throw new Error(`Failed: "${input}" - Expected ${expected}, got ${result}`);
    }
  }
});

