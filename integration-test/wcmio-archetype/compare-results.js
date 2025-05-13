#!/usr/bin/env node
import dircompare from 'dir-compare';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as diff from 'diff';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultDir = path.join(__dirname, 'result');
const expectedDir = path.join(__dirname, 'expected-result');

const options = { compareContent: true, excludeFilter: '.DS_Store' };
const res = dircompare.compareSync(resultDir, expectedDir, options);

if (!res.same) {
  console.error('Differences found:');
  for (const e of res.diffSet.filter(e => e.state !== 'equal')) {
    const name1 = e.name1 ? e.name1 : '';
    const name2 = e.name2 ? e.name2 : '';
    const relPath = e.relativePath;
    const file1 = path.join(resultDir, relPath, name1);
    const file2 = path.join(expectedDir, relPath, name2);
    if (e.type1 === 'missing') {
      console.error(`Only in expected-result: ${path.join(relPath, name2)}`);
    } else if (e.type2 === 'missing') {
      console.error(`Only in result: ${path.join(relPath, name1)}`);
    } else {
      console.error(`Diff: ${path.join(relPath, name1)}`);
      try {
        const a = fs.readFileSync(file1, 'utf8');
        const b = fs.readFileSync(file2, 'utf8');
        // Show unified diff
        const diffLines = diff.createPatch(name1, b, a, 'expected', 'result');
        console.error(diffLines);
      } catch (err) {
        console.error('  (Could not show file diff)', err.message);
      }
    }
  }
  process.exit(1);
} else {
  console.log('All files match.');
}

