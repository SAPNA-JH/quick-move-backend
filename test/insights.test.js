import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInsightData } from '../src/insights.js';

const cases = [{
  id: 'QM-test', tasks: [
    { id: 'h-1', category: 'Housing', status: 'Done', dueDate: '2026-08-20', owner: 'Aarav' },
    { id: 'h-2', category: 'Housing', status: 'Blocked', dueDate: '2026-08-25', owner: 'Aarav' },
    { id: 'm-1', category: 'Move', status: 'In progress', dueDate: '2026-09-02', owner: 'Maya' },
    { id: 'u-1', category: 'Utilities', status: 'Not started', dueDate: '2026-09-10' }
  ]
}];

test('health score exposes its raw inputs and penalises blocked and overdue work', () => {
  const data = buildInsightData(cases, [{ responseHours: 2 }, { responseHours: 6 }]);
  const housing = data.workflowHealth.find((workflow) => workflow.workflow === 'Housing');
  assert.equal(housing.metrics.blocked, 1);
  assert.equal(housing.metrics.overdue, 1);
  assert.ok(housing.score < 100);
  assert.match(data.calculation.formula, /blocked penalty/i);
});

test('health score marks unassigned due-soon work as a visible penalty', () => {
  const data = buildInsightData(cases, []);
  const moving = data.workflowHealth.find((workflow) => workflow.workflow === 'Moving');
  assert.equal(moving.metrics.dueSoon, 1);
  assert.equal(moving.metrics.unassigned, 0);
  const utilities = data.workflowHealth.find((workflow) => workflow.workflow === 'Utilities');
  assert.equal(utilities.metrics.unassigned, 1);
  assert.ok(utilities.penalties.unassigned > 0);
});
