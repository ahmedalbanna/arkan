
'use client';

export interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * A word-level diff implementation based on Longest Common Subsequence (LCS).
 * It computes the differences between two strings on a word-by-word basis.
 *
 * @param original - The original string.
 * @param modified - The modified string.
 * @returns An array of DiffPart objects representing the changes.
 */
export function computeDiff(original: string, modified: string): DiffPart[] {
  // Split strings into words, but keep whitespace as separate elements
  const originalWords = original.split(/(\s+)/).filter(Boolean);
  const modifiedWords = modified.split(/(\s+)/).filter(Boolean);

  const n = originalWords.length;
  const m = modifiedWords.length;
  const lcsMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  // Build the LCS matrix based on words
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (originalWords[i - 1] === modifiedWords[j - 1]) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  // Backtrack from the bottom-right of the matrix to build the diff
  const diff: DiffPart[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalWords[i - 1] === modifiedWords[j - 1]) {
      // Unchanged part
      diff.unshift({ type: 'unchanged', value: originalWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
      // Added part
      diff.unshift({ type: 'added', value: modifiedWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || lcsMatrix[i][j - 1] < lcsMatrix[i - 1][j])) {
      // Removed part
      diff.unshift({ type: 'removed', value: originalWords[i - 1] });
      i--;
    }
  }

  // No need to merge parts for word-level diff as each element is a distinct word or space
  return diff;
}
