const positiveSignals = ['confirmed', 'approved', 'completed', 'done', 'signed'];
const blockerSignals = ['pending', 'delay', 'delayed', 'rescheduled', 'unable', 'blocked', 'not received', 'waiting'];
const urgencySignals = ['urgent', 'today', 'tomorrow', 'asap', 'immediately'];

export function analyzeUpdate(caseItem, message) {
  const normalized = message.toLowerCase();
  const matches = caseItem.tasks.filter((task) => normalized.includes(task.title.toLowerCase().split(' ')[0]));
  const blocked = blockerSignals.some((term) => normalized.includes(term));
  const urgent = urgencySignals.some((term) => normalized.includes(term));
  const positive = positiveSignals.some((term) => normalized.includes(term));
  const suggestions = [];

  if (blocked || urgent) {
    suggestions.push({ action: 'Escalate', reason: blocked ? 'The update contains a blocker signal.' : 'The update contains an urgency signal.', confidence: blocked ? 0.9 : 0.78 });
  }
  if (matches.length) {
    suggestions.push({ action: positive && !blocked ? 'Mark task complete' : 'Update linked task', taskId: matches[0].id, task: matches[0].title, reason: 'The message appears related to this task.', confidence: 0.76 });
  } else {
    suggestions.push({ action: 'Create follow-up task', reason: 'No existing task is an exact match; human review is required before adding work.', confidence: 0.62 });
  }
  if (normalized.includes('agreement') && !normalized.includes('signed')) {
    suggestions.push({ action: 'Request prerequisite', task: 'Rental agreement verified', reason: 'Utilities and address changes often depend on a verified agreement.', confidence: 0.82 });
  }

  return {
    summary: blocked ? 'Potential blocker detected. Review and confirm the escalation.' : positive ? 'Potential completion signal detected. Review before updating the case.' : 'Update captured. Review the suggested actions before applying them.',
    detectedSignals: [blocked && 'blocker', urgent && 'urgency', positive && 'completion'].filter(Boolean),
    suggestions,
    disclaimer: 'This is a deterministic local-demo analysis, not a live AI decision. No case data changes until an ops coordinator approves them.'
  };
}
