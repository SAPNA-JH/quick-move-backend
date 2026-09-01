import { partners, playbooks, team } from './data.js';

const ownerFor = (category, index) => ({
  Housing: 'Diya Sharma',
  Move: index % 2 ? 'Maya Nair' : 'Kabir Singh',
  Utilities: 'Rohan Iyer',
  Paperwork: 'Aarav Mehta',
  Support: 'Maya Nair'
}[category] || team[0]);

const dateAtOffset = (moveDate, offset) => {
  const date = new Date(`${moveDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const categoryForTitle = (title) => {
  if (title.includes('Housing') || title.includes('Property') || title.includes('Viewing') || title.includes('Rental')) return 'Housing';
  if (title.includes('Mover') || title.includes('Move-day') || title.includes('Society')) return 'Move';
  if (title.includes('Electricity') || title.includes('Internet') || title.includes('Gas')) return 'Utilities';
  if (title.includes('Address')) return 'Paperwork';
  return 'Support';
};

const groupStages = (tasks) => [
  { key: 'intake', title: 'Intake & plan', detail: 'Confirm the customer brief, route, budget, and the city-specific checklist.', taskIds: tasks.filter((task) => task.title === 'Housing brief confirmed').map((task) => task.id) },
  { key: 'housing', title: 'Find & secure a home', detail: 'Share homes, coordinate viewings, and verify the rental agreement.', taskIds: tasks.filter((task) => task.category === 'Housing' && task.title !== 'Housing brief confirmed').map((task) => task.id) },
  { key: 'move', title: 'Book the move', detail: 'Select movers, capture society constraints, and confirm move-day access.', taskIds: tasks.filter((task) => task.category === 'Move').map((task) => task.id) },
  { key: 'utilities', title: 'Set up utilities', detail: 'File required transfers and book services at the verified new address.', taskIds: tasks.filter((task) => task.category === 'Utilities').map((task) => task.id) },
  { key: 'paperwork', title: 'Change the address', detail: 'Send the document pack once an acceptable proof of address is available.', taskIds: tasks.filter((task) => task.category === 'Paperwork').map((task) => task.id) },
  { key: 'support', title: 'Settle in & close', detail: 'Run post-move check-in, resolve open issues, and close the case.', taskIds: tasks.filter((task) => task.category === 'Support').map((task) => task.id) }
];

function selectedPartners(city) {
  return ['Property', 'Moving', 'Utilities'].map((category) => partners.filter((partner) => partner.category === category && partner.cities.includes(city)).sort((a, b) => b.score - a.score)[0]).filter(Boolean).map((partner) => ({ id: partner.id, name: partner.name, category: partner.category, score: partner.score }));
}

export function createSimulation(input, existingCases) {
  const id = `QM-${2056 + existingCases.length}`;
  const taskSeed = playbooks[input.city];
  const tasks = taskSeed.map(([title, relativeDay, category], index) => ({
    id: `${id.toLowerCase()}-task-${index + 1}`,
    title,
    category,
    dueDate: dateAtOffset(input.moveDate, relativeDay),
    status: 'Not started',
    owner: ownerFor(category, index),
    dependency: index ? taskSeed[index - 1][0] : undefined
  }));
  const stages = groupStages(tasks);
  const selected = selectedPartners(input.city);
  const primaryOwner = input.owner || 'Aarav Mehta';
  return {
    id,
    customer: input.customer.trim(),
    city: input.city,
    fromCity: input.fromCity.trim(),
    moveDate: input.moveDate,
    status: 'Planning',
    owner: primaryOwner,
    risk: 'low',
    budget: `₹${Number(input.budget || 55000).toLocaleString('en-IN')}`,
    phone: input.phone?.trim() || '+91 98••• 0000',
    summary: `Simulation ready. ${input.customer.trim()} is relocating from ${input.fromCity.trim()} to ${input.city} with a ${input.homeType || '1BHK'} move.`,
    tags: [input.moveType || 'Personal move', input.homeType || '1BHK'],
    tasks,
    partners: selected,
    simulation: { currentStage: 0, completed: false, stages },
    activity: [
      { id: `${id.toLowerCase()}-activity-1`, time: 'Just now', actor: primaryOwner, type: 'create', text: `Simulation case created. ${input.city} playbook and ${selected.length} preferred partners assigned.` },
      { id: `${id.toLowerCase()}-activity-2`, time: 'Just now', actor: 'System', type: 'update', text: `Journey begins with ${stages[0].title.toLowerCase()}.` }
    ]
  };
}

export function advanceSimulation(caseItem) {
  if (!caseItem.simulation || caseItem.simulation.completed) return caseItem;
  const stage = caseItem.simulation.stages[caseItem.simulation.currentStage];
  caseItem.tasks.forEach((task) => {
    if (stage.taskIds.includes(task.id)) task.status = 'Done';
  });
  caseItem.activity.unshift({ id: `${caseItem.id.toLowerCase()}-activity-${Date.now()}`, time: 'Just now', actor: 'Simulation engine', type: 'complete', text: `${stage.title} completed. ${stage.detail}` });
  const nextStage = caseItem.simulation.currentStage + 1;
  if (nextStage >= caseItem.simulation.stages.length) {
    caseItem.simulation.completed = true;
    caseItem.status = 'Completed';
    caseItem.risk = 'low';
    caseItem.summary = 'Relocation completed. Post-move check-in is complete and no open operational issues remain.';
    caseItem.activity.unshift({ id: `${caseItem.id.toLowerCase()}-closed-${Date.now()}`, time: 'Just now', actor: 'System', type: 'complete', text: 'Relocation journey completed and case closed.' });
  } else {
    caseItem.simulation.currentStage = nextStage;
    caseItem.status = nextStage >= 3 ? 'On track' : 'Planning';
    const next = caseItem.simulation.stages[nextStage];
    caseItem.activity.unshift({ id: `${caseItem.id.toLowerCase()}-next-${Date.now()}`, time: 'Just now', actor: 'System', type: 'update', text: `Next stage: ${next.title}.` });
  }
  return caseItem;
}

export function validateSimulationInput(input) {
  if (!input?.customer?.trim()) return 'Customer name is required.';
  if (!input?.fromCity?.trim()) return 'Origin city is required.';
  if (!playbooks[input.city]) return 'Choose an available destination city.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.moveDate || '')) return 'A valid move date is required.';
  return null;
}
