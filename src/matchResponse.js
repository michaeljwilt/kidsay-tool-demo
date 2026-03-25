// src/matchResponse.js

export default function matchResponse(input, responses) {
  const q = input.toLowerCase();
  let bestScore = 0;
  let bestResponse = null;

  for (const response of responses) {
    let score = 0;
    let matchCount = 0;

    for (const [term, weight] of Object.entries(response.keywords)) {
      if (q.includes(term.toLowerCase())) {
        score += weight;
        matchCount++;
      }
    }

    // Bonus for multi-keyword matches (3+)
    if (matchCount >= 3) {
      score *= 1.5;
    }

    // First match wins ties (> not >=)
    if (score > bestScore) {
      bestScore = score;
      bestResponse = response;
    }
  }

  return bestResponse;
}
