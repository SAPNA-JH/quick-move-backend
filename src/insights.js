const workflowDefinitions = [
  { key: 'Housing', workflow: 'Housing', team: 'Property partners + Ops' },
  { key: 'Move', workflow: 'Moving', team: 'Moving partners + Ops' },
  { key: 'Utilities', workflow: 'Utilities', team: 'Utility providers + Ops' },
  { key: 'Paperwork', workflow: 'Paperwork', team: 'Customer + Ops' },
  { key: 'Support', workflow: 'Post-move support', team: 'Customer support + Ops' }
];

const referenceDate = new Date('2026-08-31T12:00:00.000Z');
const daysBetween = (date) => Math.ceil((new Date(`${date}T12:00:00.000Z`) - referenceDate) / 86400000);
const percentage = (value, total) => total ? Math.round((value / total) * 100) : 0;

function calculateWorkflowHealth(definition, cases) {
  const tasks = cases.flatMap((item) => item.tasks.map((task) => ({ ...task, caseId: item.id }))).filter((task) => task.category === definition.key);
  const total = tasks.length;
  const complete = tasks.filter((task) => task.status === 'Done').length;
  const blocked = tasks.filter((task) => task.status === 'Blocked').length;
  const overdue = tasks.filter((task) => task.status !== 'Done' && daysBetween(task.dueDate) < 0).length;
  const dueSoon = tasks.filter((task) => task.status !== 'Done' && daysBetween(task.dueDate) >= 0 && daysBetween(task.dueDate) <= 3).length;
  const unassigned = tasks.filter((task) => !task.owner).length;

  // The score does not reward closing tasks; it penalises conditions that make a customer outcome unreliable.
  const penalties = {
    blocked: Math.round((blocked / Math.max(total, 1)) * 45),
    overdue: Math.round((overdue / Math.max(total, 1)) * 30),
    dueSoon: Math.round((dueSoon / Math.max(total, 1)) * 15),
    unassigned: Math.round((unassigned / Math.max(total, 1)) * 10)
  };
  const score = total ? Math.max(0, Math.min(100, 100 - penalties.blocked - penalties.overdue - penalties.dueSoon - penalties.unassigned)) : null;
  const status = !total ? 'No data' : score >= 85 ? 'Healthy' : score >= 70 ? 'Watch' : 'At risk';
  const biggestPenalty = Object.entries(penalties).sort(([, a], [, b]) => b - a)[0];
  const reason = !total ? 'No active or recent tasks have been recorded for this workflow yet.' : biggestPenalty?.[1]
    ? `${biggestPenalty[0] === 'dueSoon' ? 'Upcoming incomplete work' : `${biggestPenalty[0][0].toUpperCase()}${biggestPenalty[0].slice(1)} work`} is lowering this score by ${biggestPenalty[1]} points.`
    : 'No blocked, overdue, due-soon, or unassigned tasks are lowering this score.';

  return {
    ...definition,
    score,
    status,
    metrics: { total, complete, blocked, overdue, dueSoon, unassigned },
    penalties,
    issue: reason
  };
}

export function buildInsightData(cases, partners) {
  const workflowHealth = workflowDefinitions.map((definition) => calculateWorkflowHealth(definition, cases));
  const allTasks = cases.flatMap((item) => item.tasks);
  const incomplete = allTasks.filter((task) => task.status !== 'Done');
  const overdue = incomplete.filter((task) => daysBetween(task.dueDate) < 0).length;
  const onTimeRate = Math.round(((allTasks.length - overdue) / Math.max(allTasks.length, 1)) * 100);
  const blocked = allTasks.filter((task) => task.status === 'Blocked').length;
  const slaMet = partners.length ? Math.round((partners.filter((partner) => partner.responseHours <= 4).length / partners.length) * 100) : 0;
  const atRisk = workflowHealth.filter((workflow) => ['Watch', 'At risk'].includes(workflow.status)).sort((a, b) => a.score - b.score);

  return {
    calculation: {
      referenceDate: '31 Aug 2026 (demo date)',
      formula: 'Health score = 100 − blocked penalty − overdue penalty − due-soon penalty − unassigned penalty',
      weights: [
        { label: 'Blocked', weight: '45 × blocked-task rate', meaning: 'Work cannot progress without an external response or decision.' },
        { label: 'Overdue', weight: '30 × overdue-task rate', meaning: 'The target date has passed and the task is not complete.' },
        { label: 'Due soon', weight: '15 × incomplete 0–3 day rate', meaning: 'Unfinished work is close enough to move day to require attention.' },
        { label: 'Unassigned', weight: '10 × unassigned-task rate', meaning: 'No individual is accountable for the next action.' }
      ]
    },
    headline: [
      { label: 'Workflow reliability', value: `${onTimeRate}%`, delta: `${overdue} overdue task${overdue === 1 ? '' : 's'}`, direction: overdue ? 'down' : 'up', detail: 'Tasks not overdue on the demo date' },
      { label: 'Open blockers', value: String(blocked), delta: blocked ? 'Needs ownership' : 'No current blockers', direction: blocked ? 'down' : 'up', detail: 'Tasks explicitly waiting on another dependency' },
      { label: 'Partner response SLA met', value: `${slaMet}%`, delta: `${partners.filter((partner) => partner.responseHours > 4).length} partner${partners.filter((partner) => partner.responseHours > 4).length === 1 ? '' : 's'} above 4h`, direction: slaMet >= 80 ? 'up' : 'down', detail: 'Based on declared average first-response time' }
    ],
    workflowHealth,
    riskSignals: (atRisk.length ? atRisk : workflowHealth.filter((workflow) => workflow.score !== null).slice().sort((a, b) => a.score - b.score)).slice(0, 3).map((workflow) => ({
      title: `${workflow.workflow} is ${workflow.status.toLowerCase()} at ${workflow.score}/100`,
      detail: workflow.issue,
      owner: workflow.team,
      action: 'Open workflow detail'
    })),
    trend: [74, 77, 75, 80, 78, 83, onTimeRate]
  };
}
