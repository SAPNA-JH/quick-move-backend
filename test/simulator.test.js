import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSimulation, createSimulation, validateSimulationInput } from '../src/simulator.js';

const input = { customer: 'Priya Sen', fromCity: 'Mumbai', city: 'Bengaluru', moveDate: '2026-10-12', budget: 65000, moveType: 'Family move', homeType: '2BHK' };

test('creates a full city-specific relocation simulation', () => {
  const simulation = createSimulation(input, []);
  assert.equal(simulation.tasks.length, 10);
  assert.equal(simulation.simulation.stages.length, 6);
  assert.equal(simulation.partners.length, 3);
  assert.equal(simulation.tasks[0].status, 'Not started');
});

test('advancing all stages completes every task and closes the case', () => {
  const simulation = createSimulation(input, []);
  for (let index = 0; index < 6; index += 1) advanceSimulation(simulation);
  assert.equal(simulation.simulation.completed, true);
  assert.equal(simulation.status, 'Completed');
  assert.equal(simulation.tasks.every((task) => task.status === 'Done'), true);
});

test('validates required relocation simulation input', () => {
  assert.equal(validateSimulationInput({}), 'Customer name is required.');
  assert.equal(validateSimulationInput(input), null);
});
