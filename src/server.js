import cors from 'cors';
import express from 'express';
import { analyzeUpdate } from './analyzer.js';
import { addChangeRequest, addCustomerDocument, addCustomerMessage, customerCase, customerRequestTypes, updateCustomerRequest } from './customer.js';
import { createPartnerInvite, getPublicPartnerInvite, partnerOnboardingMeta, submitPartnerInvite } from './partnerOnboarding.js';
import { cases, getCase, partners, playbooks, team } from './data.js';
import { buildInsightData } from './insights.js';
import { advanceSimulation, createSimulation, validateSimulationInput } from './simulator.js';

const app = express();
const port = process.env.PORT || 3001;
const partnerInvitations = [];
app.use(cors());
app.use(express.json());

const caseSummary = (item) => ({
  ...item,
  taskCounts: {
    total: item.tasks.length,
    done: item.tasks.filter((task) => task.status === 'Done').length,
    blocked: item.tasks.filter((task) => task.status === 'Blocked').length
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mode: 'local-seeded-demo' }));
app.get('/api/meta', (_req, res) => res.json({ team, cities: Object.keys(playbooks) }));
app.get('/api/playbooks', (_req, res) => {
  const result = Object.entries(playbooks).map(([city, tasks]) => ({
    city,
    taskCount: tasks.length,
    tasks: tasks.map(([title, relativeDay, category], index) => ({
      id: `${city.toLowerCase()}-${index + 1}`,
      title,
      category,
      relativeDay,
      timing: relativeDay === 0 ? 'Move day' : relativeDay < 0 ? `${Math.abs(relativeDay)} days before move` : `${relativeDay} days after move`,
      dependency: index ? tasks[index - 1][0] : null
    }))
  }));
  res.json(result);
});
app.get('/api/partners', (req, res) => {
  const { city, category, status } = req.query;
  res.json(partners.filter((partner) => (!city || partner.cities.includes(city)) && (!category || partner.category === category) && (!status || partner.status === status)));
});
app.get('/api/partner-onboarding/meta', (_req, res) => res.json({ ...partnerOnboardingMeta, cities: Object.keys(playbooks) }));
app.post('/api/partner-invitations', (req, res) => {
  const result = createPartnerInvite(req.body || {}, Object.keys(playbooks), partnerInvitations);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result.invite);
});
app.get('/api/partner-onboarding/:token', (req, res) => {
  const result = getPublicPartnerInvite(req.params.token, partnerInvitations);
  if (result.error) return res.status(404).json({ error: result.error });
  return res.json(result.invite);
});
app.post('/api/partner-onboarding/:token', (req, res) => {
  const result = submitPartnerInvite(req.params.token, req.body || {}, partnerInvitations, partners, Object.keys(playbooks));
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json({ partner: result.partner, invite: result.invite });
});
app.get('/api/insights', (_req, res) => res.json(buildInsightData(cases, partners)));
app.get('/api/customer/cases', (_req, res) => res.json(cases.map(customerCase)));
app.get('/api/customer/meta', (_req, res) => res.json(customerRequestTypes));
app.get('/api/customer/cases/:id', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  return res.json(customerCase(item));
});
app.post('/api/customer/cases/:id/messages', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  const result = addCustomerMessage(item, req.body?.text);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result.data);
});
app.post('/api/customer/cases/:id/documents', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  const result = addCustomerDocument(item, req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result.data);
});
app.post('/api/customer/cases/:id/change-requests', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  const result = addChangeRequest(item, req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result.data);
});
app.post('/api/relocation-simulations', (req, res) => {
  const validationError = validateSimulationInput(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  const simulation = createSimulation(req.body, cases);
  cases.unshift(simulation);
  return res.status(201).json(caseSummary(simulation));
});
app.post('/api/cases/:id/advance-simulation', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  if (!item.simulation) return res.status(400).json({ error: 'This case is not a guided simulation.' });
  return res.json(caseSummary(advanceSimulation(item)));
});
app.get('/api/cases', (req, res) => {
  const { city, status, risk, owner, query, needsAttention, blocked, moveSoon } = req.query;
  const filtered = cases.filter((item) => {
    const haystack = `${item.id} ${item.customer} ${item.city} ${item.fromCity}`.toLowerCase();
    const daysToMove = Math.ceil((new Date(`${item.moveDate}T12:00:00`) - new Date('2026-08-31T12:00:00')) / 86400000);
    return (!city || item.city === city)
      && (!status || item.status === status)
      && (!risk || item.risk === risk)
      && (!owner || item.owner === owner)
      && (!needsAttention || item.risk !== 'low')
      && (!blocked || item.tasks.some((task) => task.status === 'Blocked'))
      && (!moveSoon || (daysToMove >= 0 && daysToMove < 7))
      && (!query || haystack.includes(query.toLowerCase()));
  }).map(caseSummary);
  res.json(filtered);
});
app.get('/api/cases/:id', (req, res) => {
  const item = getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  return res.json(caseSummary(item));
});
app.patch('/api/cases/:caseId/tasks/:taskId', (req, res) => {
  const item = getCase(req.params.caseId);
  const allowed = ['Not started', 'In progress', 'Blocked', 'Done'];
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  const task = item.tasks.find((entry) => entry.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  const { status, owner, blocker } = req.body;
  if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Invalid task status.' });
  if (status) task.status = status;
  if (owner) task.owner = owner;
  task.blocker = blocker || (status === 'Blocked' ? task.blocker : undefined);
  item.activity.unshift({ id: `a-${Date.now()}`, time: 'Just now', actor: 'Ops coordinator', type: status === 'Done' ? 'complete' : 'update', text: `${task.title}: ${task.status}${task.blocker ? ` — ${task.blocker}` : ''}` });
  res.json({ task, case: caseSummary(item) });
});
app.patch('/api/cases/:caseId/customer-requests/:requestId', (req, res) => {
  const item = getCase(req.params.caseId);
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  const result = updateCustomerRequest(item, req.params.requestId, req.body?.status);
  if (result.error) return res.status(400).json({ error: result.error });
  return res.json({ request: result.request, case: caseSummary(item) });
});
app.post('/api/cases/:id/analyze-update', (req, res) => {
  const item = getCase(req.params.id);
  const { message } = req.body;
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  if (!message || typeof message !== 'string' || message.trim().length < 8) return res.status(400).json({ error: 'Enter at least 8 characters to analyse an update.' });
  return res.json(analyzeUpdate(item, message.trim()));
});
app.post('/api/cases/:id/activity', (req, res) => {
  const item = getCase(req.params.id);
  const { text, type = 'update' } = req.body;
  if (!item) return res.status(404).json({ error: 'Relocation case not found.' });
  if (!text?.trim()) return res.status(400).json({ error: 'Activity text is required.' });
  item.activity.unshift({ id: `a-${Date.now()}`, time: 'Just now', actor: 'Ops coordinator', type, text: text.trim() });
  res.status(201).json(caseSummary(item));
});
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.listen(port, () => console.log(`QuickMove API running at http://localhost:${port}`));
