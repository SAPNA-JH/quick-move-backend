import test from 'node:test';
import assert from 'node:assert/strict';
import { addChangeRequest, addCustomerDocument, addCustomerMessage, customerCase, updateCustomerRequest } from '../src/customer.js';

function sampleCase() {
  return {
    id: 'QM-test', customer: 'Priya Sen', city: 'Bengaluru', fromCity: 'Mumbai', moveDate: '2026-10-12', status: 'On track',
    tasks: [
      { id: 'task-1', title: 'Rental agreement verified', category: 'Housing', dueDate: '2026-10-05', status: 'Blocked', blocker: 'Internal partner note' },
      { id: 'task-2', title: 'Mover quote approved', category: 'Move', dueDate: '2026-10-07', status: 'Done' }
    ],
    activity: [{ id: 'activity-1', time: 'Today', actor: 'System', type: 'risk', text: 'Internal-only note' }]
  };
}

test('customer case redacts internal task blockers and translates task statuses', () => {
  const result = customerCase(sampleCase());
  assert.equal(result.tasks[0].status, 'Needs attention');
  assert.equal(result.tasks[0].blocker, undefined);
  assert.equal(result.activity[0].text, 'QuickMove updated your relocation plan.');
});

test('customer messages and document metadata are stored in memory', () => {
  const item = sampleCase();
  assert.equal(addCustomerMessage(item, 'I can share the signed agreement this afternoon.').error, undefined);
  assert.equal(addCustomerDocument(item, { type: 'Rental agreement', name: 'signed-agreement.pdf' }).error, undefined);
  const result = customerCase(item);
  assert.equal(result.documents.length, 1);
  assert.equal(result.documents[0].status, 'Received for review');
});

test('duplicate open change requests are rejected and Ops can resolve the first request', () => {
  const item = sampleCase();
  const first = addChangeRequest(item, { type: 'Move date', requestedDate: '2026-10-14', detail: 'My employer moved the joining date by two days.' });
  assert.equal(first.error, undefined);
  assert.match(addChangeRequest(item, { type: 'Move date', requestedDate: '2026-10-15', detail: 'I need one more day to prepare for the move.' }).error, /already an open/i);
  assert.equal(updateCustomerRequest(item, first.request.id, 'Resolved').error, undefined);
  assert.equal(item.customerRequests[0].status, 'Resolved');
});

test('closed cases reject new customer actions', () => {
  const item = sampleCase(); item.status = 'Completed';
  assert.match(addCustomerMessage(item, 'I need help').error, /already closed/i);
});
