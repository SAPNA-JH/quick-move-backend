import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeUpdate } from '../src/analyzer.js';

const fixture = { tasks: [{ id: 'task-1', title: 'Rental agreement verified' }] };

test('flags a blocker update for review', () => {
  const result = analyzeUpdate(fixture, 'The agreement signature is delayed and still pending today.');
  assert.equal(result.detectedSignals.includes('blocker'), true);
  assert.equal(result.suggestions[0].action, 'Escalate');
});

test('detects a potential completion signal', () => {
  const result = analyzeUpdate(fixture, 'The rental agreement is signed and approved.');
  assert.equal(result.detectedSignals.includes('completion'), true);
  assert.equal(result.suggestions.some((item) => item.action === 'Mark task complete'), true);
});
