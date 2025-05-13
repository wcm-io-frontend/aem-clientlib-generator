#!/usr/bin/env node
import dircompare from 'dir-compare';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultDir = path.join(__dirname, 'result');
const expectedDir = path.join(__dirname, 'expected-result');

const options = { compareContent: true, excludeFilter: '.DS_Store' };
const res = dircompare.compareSync(resultDir, expectedDir, options);

if (!res.same) {
  console.log('Differences found:');
  res.diffSet.filter(e => e.state !== 'equal').forEach(e => {
    const name1 = e.name1 ? e.name1 : '';
    const name2 = e.name2 ? e.name2 : '';
    const relPath = e.relativePath;
    if (e.type1 === 'missing') {
      console.log(`Only in expected-result: ${path.join(relPath, name2)}`);
    } else if (e.type2 === 'missing') {
      console.log(`Only in result: ${path.join(relPath, name1)}`);
    } else {
      console.log(`Diff: ${path.join(relPath, name1)}`);
    }
  });
  process.exit(1);
} else {
  console.log('All files match.');
}

