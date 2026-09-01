const allowedDocumentTypes = ['Rental agreement', 'Identity proof', 'Address proof', 'Move-in form', 'Other'];
const allowedChangeTypes = ['Move date', 'Destination address', 'Housing requirement'];

const now = () => 'Just now';
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const customerTaskStatus = (status) => ({
  Done: 'Complete',
  Blocked: 'Needs attention',
  'In progress': 'In progress',
  'Not started': 'Upcoming'
}[status] || 'Upcoming');

const customerActivity = (entry) => ({
  id: entry.id,
  time: entry.time,
  type: entry.type === 'risk' ? 'attention' : entry.type,
  text: entry.customerVisible ? entry.text : 'QuickMove updated your relocation plan.'
});

function ensureCollections(item) {
  item.customerRequests ||= [];
  item.documents ||= [];
}

function assertOpen(item) {
  if (item.status === 'Completed') return 'This relocation is already closed. Please contact support if you need help after moving.';
  return null;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function customerCase(item) {
  ensureCollections(item);
  const tasks = item.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    category: task.category,
    dueDate: task.dueDate,
    status: customerTaskStatus(task.status),
    actionRequired: task.status === 'Blocked' && ['Rental agreement verified', 'Society move-in requirements collected'].includes(task.title),
    actionHint: task.status === 'Blocked' ? 'QuickMove is coordinating this. Share an update if you can help unblock it.' : null
  }));
  const firstOpenTask = tasks.find((task) => task.status !== 'Complete');
  const openRequests = item.customerRequests.filter((request) => ['Open', 'In review'].includes(request.status));

  return {
    id: item.id,
    customer: item.customer,
    fromCity: item.fromCity,
    city: item.city,
    moveDate: item.moveDate,
    status: item.status === 'Completed' ? 'Complete' : openRequests.length || tasks.some((task) => task.status === 'Needs attention') ? 'Needs attention' : 'On track',
    nextAction: firstOpenTask ? { title: firstOpenTask.title, dueDate: firstOpenTask.dueDate, status: firstOpenTask.status } : null,
    tasks,
    requests: item.customerRequests.map(({ id: requestId, type, detail, status, submittedAt }) => ({ id: requestId, type, detail, status, submittedAt })),
    documents: item.documents.map(({ id: documentId, type, name, submittedAt, status }) => ({ id: documentId, type, name, submittedAt, status })),
    activity: item.activity.slice(0, 6).map(customerActivity)
  };
}

export function addCustomerMessage(item, text) {
  const closedError = assertOpen(item);
  if (closedError) return { error: closedError };
  if (!text?.trim() || text.trim().length < 3) return { error: 'Please enter at least 3 characters so your coordinator has enough context.' };
  if (text.trim().length > 1000) return { error: 'Please keep an update under 1,000 characters.' };
  item.activity.unshift({ id: id('customer-message'), time: now(), actor: item.customer, type: 'update', customerVisible: true, text: text.trim() });
  return { data: customerCase(item) };
}

export function addCustomerDocument(item, { type, name }) {
  const closedError = assertOpen(item);
  if (closedError) return { error: closedError };
  if (!allowedDocumentTypes.includes(type)) return { error: 'Choose a valid document type.' };
  if (!name?.trim() || name.trim().length > 120) return { error: 'Provide a document name between 1 and 120 characters.' };
  ensureCollections(item);
  item.documents.unshift({ id: id('document'), type, name: name.trim(), submittedAt: now(), status: 'Received for review' });
  item.activity.unshift({ id: id('customer-document'), time: now(), actor: item.customer, type: 'update', customerVisible: true, text: `${type} details shared for review.` });
  return { data: customerCase(item) };
}

export function addChangeRequest(item, { type, detail, requestedDate }) {
  const closedError = assertOpen(item);
  if (closedError) return { error: closedError };
  if (!allowedChangeTypes.includes(type)) return { error: 'Choose a valid change type.' };
  if (!detail?.trim() || detail.trim().length < 5 || detail.trim().length > 500) return { error: 'Explain the change in 5 to 500 characters.' };
  if (type === 'Move date' && !validDate(requestedDate)) return { error: 'Enter a valid requested move date.' };
  ensureCollections(item);
  if (item.customerRequests.some((request) => request.type === type && ['Open', 'In review'].includes(request.status))) {
    return { error: `There is already an open ${type.toLowerCase()} request. Your coordinator will review it before another request is created.` };
  }
  const request = { id: id('change'), type, detail: detail.trim(), requestedDate: requestedDate || null, status: 'Open', submittedAt: now() };
  item.customerRequests.unshift(request);
  item.activity.unshift({ id: id('customer-change'), time: now(), actor: item.customer, type: 'risk', customerVisible: true, text: `Change request received: ${type}. QuickMove will review the downstream impact before confirming.` });
  return { data: customerCase(item), request };
}

export function updateCustomerRequest(item, requestId, status) {
  const allowed = ['Open', 'In review', 'Resolved', 'Declined'];
  if (!allowed.includes(status)) return { error: 'Invalid request status.' };
  ensureCollections(item);
  const request = item.customerRequests.find((entry) => entry.id === requestId);
  if (!request) return { error: 'Customer request not found.' };
  request.status = status;
  item.activity.unshift({ id: id('ops-request'), time: now(), actor: 'Ops coordinator', type: status === 'Resolved' ? 'complete' : 'update', customerVisible: true, text: `Your ${request.type.toLowerCase()} request is now ${status.toLowerCase()}.` });
  return { data: customerCase(item), request };
}

export const customerRequestTypes = { documents: allowedDocumentTypes, changes: allowedChangeTypes };
