import test from 'node:test';
import assert from 'node:assert/strict';
import { insightData, partners, playbooks } from '../src/data.js';

test('each city playbook contains a complete relocation sequence', () => {
  for (const tasks of Object.values(playbooks)) {
    assert.ok(tasks.length >= 10);
    assert.ok(tasks.some(([title]) => title.includes('Rental agreement')));
    assert.ok(tasks.some(([, , category]) => category === 'Utilities'));
  }
});

test('partner and insight seed data support the remaining product views', () => {
  assert.ok(partners.length >= 5);
  assert.ok(insightData.workflowHealth.length >= 5);
  assert.equal(insightData.trend.length, 7);
});
