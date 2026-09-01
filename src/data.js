const today = new Date('2026-08-31T09:00:00.000Z');

const dateFromToday = (offset) => {
  const date = new Date(today);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const playbooks = {
  Bengaluru: [
    ['Housing brief confirmed', -20, 'Housing'],
    ['Property shortlist shared', -17, 'Housing'],
    ['Viewing slots confirmed', -14, 'Housing'],
    ['Rental agreement verified', -7, 'Housing'],
    ['Mover quote approved', -10, 'Move'],
    ['Move-day vendor confirmation', -2, 'Move'],
    ['Electricity transfer request filed', -6, 'Utilities'],
    ['Internet installation booked', -5, 'Utilities'],
    ['Address-change document pack sent', 2, 'Paperwork'],
    ['Post-move check-in', 5, 'Support']
  ],
  Pune: [
    ['Housing brief confirmed', -18, 'Housing'],
    ['Property shortlist shared', -15, 'Housing'],
    ['Society move-in requirements collected', -9, 'Move'],
    ['Rental agreement verified', -7, 'Housing'],
    ['Mover quote approved', -9, 'Move'],
    ['Move-day vendor confirmation', -2, 'Move'],
    ['Electricity transfer request filed', -5, 'Utilities'],
    ['Gas connection request filed', -5, 'Utilities'],
    ['Address-change document pack sent', 2, 'Paperwork'],
    ['Post-move check-in', 5, 'Support']
  ]
};

export const team = ['Aarav Mehta', 'Diya Sharma', 'Kabir Singh', 'Maya Nair', 'Rohan Iyer'];

export const partners = [
  { id: 'PT-01', name: 'NestKey Homes', category: 'Property', cities: ['Bengaluru', 'Pune'], contact: 'Ritika Shah', score: 4.8, status: 'Preferred', responseHours: 1.6, completedMoves: 46, issueRate: 2, note: 'Strong inventory depth for family moves and pet-friendly homes.' },
  { id: 'PT-02', name: 'SwiftShift Logistics', category: 'Moving', cities: ['Bengaluru', 'Pune'], contact: 'Arjun Bhat', score: 4.6, status: 'Preferred', responseHours: 2.3, completedMoves: 71, issueRate: 4, note: 'Best on-time pickup rate; confirm society vehicle restrictions early.' },
  { id: 'PT-03', name: 'UrbanConnect Internet', category: 'Utilities', cities: ['Bengaluru'], contact: 'Service desk', score: 3.9, status: 'Watch', responseHours: 9.5, completedMoves: 38, issueRate: 13, note: 'Appointment reschedules increase near month-end.' },
  { id: 'PT-04', name: 'Pune Move Masters', category: 'Moving', cities: ['Pune'], contact: 'Sonal Kulkarni', score: 4.3, status: 'Active', responseHours: 3.8, completedMoves: 29, issueRate: 6, note: 'Reliable for compact moves; limited weekend capacity.' },
  { id: 'PT-05', name: 'Civic Utilities Desk', category: 'Utilities', cities: ['Pune'], contact: 'Rahul Deshmukh', score: 4.2, status: 'Active', responseHours: 4.1, completedMoves: 32, issueRate: 5, note: 'Good gas and electricity paperwork turnaround.' },
  { id: 'PT-06', name: 'KeyStone Lettings', category: 'Property', cities: ['Bengaluru'], contact: 'Meera Iyer', score: 4.1, status: 'Active', responseHours: 5.2, completedMoves: 24, issueRate: 7, note: 'Good for corporate 1BHK inventory near IT corridors.' }
];

export const insightData = {
  headline: [
    { label: 'On-time milestone rate', value: '84%', delta: '+6.2%', direction: 'up', detail: 'vs. previous 30 days' },
    { label: 'Average time to resolve blocker', value: '7.4h', delta: '-1.8h', direction: 'up', detail: 'vs. previous 30 days' },
    { label: 'Partner response SLA met', value: '91%', delta: '+2.0%', direction: 'up', detail: 'within a 4-hour target' }
  ],
  workflowHealth: [
    { workflow: 'Intake & planning', score: 92, volume: 41, status: 'Healthy', issue: 'Two customer briefs are missing final budget confirmation.' },
    { workflow: 'Housing', score: 81, volume: 37, status: 'Watch', issue: 'Rental-agreement signatures are the most frequent dependency.' },
    { workflow: 'Moving', score: 88, volume: 35, status: 'Healthy', issue: 'Society access requirements are being captured earlier.' },
    { workflow: 'Utilities', score: 68, volume: 31, status: 'At risk', issue: 'Bengaluru internet appointments are slipping near move dates.' },
    { workflow: 'Paperwork', score: 76, volume: 22, status: 'Watch', issue: 'Proof-of-address rejections require institution-specific guidance.' },
    { workflow: 'Post-move support', score: 90, volume: 18, status: 'Healthy', issue: 'Most issues are resolved during the first follow-up.' }
  ],
  riskSignals: [
    { title: 'Internet appointment capacity is the top operational risk', detail: '4 active Bengaluru cases have installation dates after their move date or remote-work start date.', owner: 'Rohan Iyer', action: 'Review affected cases' },
    { title: 'Unsigned rental agreements are delaying downstream steps', detail: '3 cases have utilities or paperwork tasks waiting on a completed agreement.', owner: 'Diya Sharma', action: 'Escalate agreements' },
    { title: 'Weekend mover capacity is tightening in Pune', detail: 'Two upcoming moves still need vendor confirmation for the same Saturday.', owner: 'Kabir Singh', action: 'Check capacity' }
  ],
  trend: [74, 77, 75, 80, 78, 83, 84]
};

export const cases = [
  {
    id: 'QM-2048', customer: 'Ananya Rao', city: 'Bengaluru', fromCity: 'Mumbai', moveDate: dateFromToday(4),
    status: 'At risk', owner: 'Diya Sharma', risk: 'high', budget: '₹78,000', phone: '+91 98••• 4201',
    summary: 'Move is confirmed; rental agreement is pending landlord signature and blocks electricity transfer.',
    tags: ['Family move', 'Pet'],
    tasks: [
      { id: 't-1', title: 'Property shortlist shared', category: 'Housing', dueDate: dateFromToday(-5), status: 'Done', owner: 'Diya Sharma' },
      { id: 't-2', title: 'Rental agreement verified', category: 'Housing', dueDate: dateFromToday(-1), status: 'Blocked', owner: 'Diya Sharma', blocker: 'Landlord signature pending' },
      { id: 't-3', title: 'Mover quote approved', category: 'Move', dueDate: dateFromToday(-2), status: 'Done', owner: 'Kabir Singh' },
      { id: 't-4', title: 'Electricity transfer request filed', category: 'Utilities', dueDate: dateFromToday(-1), status: 'Not started', owner: 'Rohan Iyer', dependency: 'Rental agreement verified' },
      { id: 't-5', title: 'Move-day vendor confirmation', category: 'Move', dueDate: dateFromToday(2), status: 'In progress', owner: 'Kabir Singh' }
    ],
    activity: [
      { id: 'a-1', time: 'Today, 09:10', actor: 'Diya Sharma', type: 'update', text: 'Landlord has reviewed the agreement; signature promised by 16:00.' },
      { id: 'a-2', time: 'Yesterday, 17:42', actor: 'System', type: 'risk', text: 'Rental agreement is overdue and blocks a utility milestone.' },
      { id: 'a-3', time: 'Yesterday, 11:20', actor: 'Kabir Singh', type: 'complete', text: 'Mover quote approved with SwiftShift Logistics.' }
    ]
  },
  {
    id: 'QM-2051', customer: 'Vikram Patel', city: 'Pune', fromCity: 'Bengaluru', moveDate: dateFromToday(12),
    status: 'On track', owner: 'Aarav Mehta', risk: 'low', budget: '₹52,000', phone: '+91 99••• 1187',
    summary: 'Corporate transfer. Housing and mover selection are complete; society requirements are being collected.',
    tags: ['Corporate', '1BHK'],
    tasks: [
      { id: 't-6', title: 'Housing brief confirmed', category: 'Housing', dueDate: dateFromToday(-7), status: 'Done', owner: 'Aarav Mehta' },
      { id: 't-7', title: 'Rental agreement verified', category: 'Housing', dueDate: dateFromToday(5), status: 'In progress', owner: 'Aarav Mehta' },
      { id: 't-8', title: 'Society move-in requirements collected', category: 'Move', dueDate: dateFromToday(3), status: 'In progress', owner: 'Maya Nair' },
      { id: 't-9', title: 'Mover quote approved', category: 'Move', dueDate: dateFromToday(2), status: 'Done', owner: 'Kabir Singh' }
    ],
    activity: [
      { id: 'a-4', time: 'Today, 10:05', actor: 'Maya Nair', type: 'update', text: 'Society office has requested a signed move-in form and vehicle details.' },
      { id: 'a-5', time: 'Aug 29, 15:30', actor: 'Aarav Mehta', type: 'complete', text: 'Two shortlisted apartments shared with the customer.' }
    ]
  },
  {
    id: 'QM-2053', customer: 'Neha Kapoor', city: 'Bengaluru', fromCity: 'Delhi', moveDate: dateFromToday(1),
    status: 'Needs attention', owner: 'Rohan Iyer', risk: 'medium', budget: '₹64,000', phone: '+91 97••• 6654',
    summary: 'Internet installation was rescheduled. Customer needs a workable connection for a remote-work start date.',
    tags: ['Remote worker', 'Urgent'],
    tasks: [
      { id: 't-10', title: 'Rental agreement verified', category: 'Housing', dueDate: dateFromToday(-7), status: 'Done', owner: 'Rohan Iyer' },
      { id: 't-11', title: 'Move-day vendor confirmation', category: 'Move', dueDate: dateFromToday(0), status: 'Done', owner: 'Kabir Singh' },
      { id: 't-12', title: 'Internet installation booked', category: 'Utilities', dueDate: dateFromToday(-1), status: 'Blocked', owner: 'Rohan Iyer', blocker: 'Provider appointment rescheduled to Sep 3' },
      { id: 't-13', title: 'Temporary hotspot arranged', category: 'Utilities', dueDate: dateFromToday(0), status: 'In progress', owner: 'Rohan Iyer' }
    ],
    activity: [
      { id: 'a-6', time: 'Today, 08:30', actor: 'System', type: 'risk', text: 'Utility appointment falls after the customer’s stated remote-work start date.' },
      { id: 'a-7', time: 'Yesterday, 18:12', actor: 'Rohan Iyer', type: 'update', text: 'Requested temporary hotspot option from provider.' }
    ]
  },
  {
    id: 'QM-2055', customer: 'Sameer Khan', city: 'Pune', fromCity: 'Hyderabad', moveDate: dateFromToday(24),
    status: 'Planning', owner: 'Maya Nair', risk: 'low', budget: '₹45,000', phone: '+91 96••• 3792',
    summary: 'New relocation intake. Customer has provided preferred neighbourhoods and a move budget.',
    tags: ['Solo move', '2BHK'],
    tasks: [
      { id: 't-14', title: 'Housing brief confirmed', category: 'Housing', dueDate: dateFromToday(3), status: 'In progress', owner: 'Maya Nair' },
      { id: 't-15', title: 'Property shortlist shared', category: 'Housing', dueDate: dateFromToday(6), status: 'Not started', owner: 'Maya Nair' }
    ],
    activity: [
      { id: 'a-8', time: 'Today, 11:25', actor: 'Maya Nair', type: 'create', text: 'Relocation case created from intake form.' }
    ]
  }
];

export const getCase = (id) => cases.find((item) => item.id === id);
