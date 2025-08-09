
'use client';

export interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * A basic implementation of a diff algorithm based on Longest Common Subsequence (LCS).
 * It computes the differences between two strings.
 *
 * @param original - The original string.
 * @param modified - The modified string.
 * @returns An array of DiffPart objects representing the changes.
 */
export function computeDiff(original: string, modified: string): DiffPart[] {
  const n = original.length;
  const m = modified.length;
  const lcsMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  // Build the LCS matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (original[i - 1] === modified[j - 1]) {
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
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      // Unchanged part
      diff.unshift({ type: 'unchanged', value: original[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
      // Added part
      diff.unshift({ type: 'added', value: modified[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || lcsMatrix[i][j - 1] < lcsMatrix[i - 1][j])) {
      // Removed part
      diff.unshift({ type: 'removed', value: original[i - 1] });
      i--;
    }
  }

  // Merge consecutive parts of the same type
  const mergedDiff: DiffPart[] = [];
  if (diff.length > 0) {
    mergedDiff.push({ ...diff[0] });
    for (let k = 1; k < diff.length; k++) {
      const lastPart = mergedDiff[mergedDiff.length - 1];
      if (diff[k].type === lastPart.type) {
        lastPart.value += diff[k].value;
      } else {
        mergedDiff.push({ ...diff[k] });
      }
    }
  }

  return mergedDiff;
}
