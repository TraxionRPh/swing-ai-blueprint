
import { extractRelevantSearchTerms, getPrimaryOutcomeMetric } from '../utils/searchTermExtractor.ts';
import { PROBLEM_CATEGORIES } from '../types/categories.ts';

Deno.test("extractRelevantSearchTerms - Basic extraction", () => {
  const tests = [
    {
      input: "I'm topping my iron shots",
      category: PROBLEM_CATEGORIES[0], // Ball Striking
      expectedIncludes: ["topping", "iron", "ball"],
    },
    {
      input: "Slicing my driver badly",
      category: PROBLEM_CATEGORIES[1], // Driving Accuracy
      expectedIncludes: ["slice", "driver", "accuracy"],
    },
    {
      input: "Three putting too often",
      category: PROBLEM_CATEGORIES[4], // Putting
      expectedIncludes: ["putt", "green"],
    },
  ];

  for (const { input, category, expectedIncludes } of tests) {
    const terms = extractRelevantSearchTerms(input, category);
    for (const expected of expectedIncludes) {
      if (!terms.includes(expected)) {
        throw new Error(`Failed: "${input}" - Expected to include "${expected}" in terms: ${terms.join(', ')}`);
      }
    }
  }
});

Deno.test("getPrimaryOutcomeMetric - Basic metrics", () => {
  const tests = [
    {
      category: PROBLEM_CATEGORIES[0], // Ball Striking
      expected: "Greens in Regulation",
    },
    {
      category: PROBLEM_CATEGORIES[1], // Driving Accuracy
      expected: "Fairways Hit",
    },
    {
      category: PROBLEM_CATEGORIES[4], // Putting
      expected: "Putts per Round",
    },
  ];

  for (const { category, expected } of tests) {
    const result = getPrimaryOutcomeMetric(category);
    if (result !== expected) {
      throw new Error(`Failed: "${category.name}" - Expected ${expected}, got ${result}`);
    }
  }
});

