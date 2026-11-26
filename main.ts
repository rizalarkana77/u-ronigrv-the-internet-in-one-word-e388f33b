// The Internet in One Word — entry program.
// Writes the single chosen word to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback "out"), with no trailing newline, then verifies it.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function chosenWord(): string {
  return "Slop";
}

function validateWord(word: string): void {
  if (word.length === 0) {
    throw new Error("word must not be empty");
  }
  if (word.trim() !== word) {
    throw new Error("word must not have leading or trailing whitespace");
  }
  // The brief demands exactly one word: no internal whitespace at all.
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word with no whitespace");
  }
  if (!/^[A-Za-z]+$/.test(word)) {
    throw new Error("entry must be plain letters only");
  }
  if (word.length > 32) {
    throw new Error("word exceeds the 32-character sanity cap");
  }
}

function main(): void {
  const word = chosenWord();
  validateWord(word);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, word, "utf8");

  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== word) {
    throw new Error(`read-back mismatch: expected ${JSON.stringify(word)}, got ${JSON.stringify(readBack)}`);
  }

  const sha256 = createHash("sha256").update(readBack, "utf8").digest("hex");
  console.log(`wrote ${outPath}: ${JSON.stringify(readBack)} sha256=${sha256}`);
}

main();
