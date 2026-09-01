import { randomUUID } from 'node:crypto';

const categories = ['Property', 'Moving', 'Utilities'];
const pricingModels = ['Fixed package', 'Quote after assessment', 'Hourly / usage based'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicInvite = (invite) => ({ token: invite.token, category: invite.category, city: invite.city, status: invite.status, createdAt: invite.createdAt });

function validText(value, min, max) { return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max; }

export function createPartnerInvite(input, cities, invitations) {
  if (!categories.includes(input?.category)) return { error: 'Choose a valid service category.' };
  if (!cities.includes(input?.city)) return { error: 'Choose a valid primary city.' };
  if (input.email && !emailPattern.test(input.email.trim())) return { error: 'Enter a valid contact email or leave it blank.' };
  const invite = { token: randomUUID(), category: input.category, city: input.city, email: input.email?.trim() || null, status: 'Open', createdAt: 'Just now' };
  invitations.unshift(invite);
  return { invite: publicInvite(invite) };
}

export function getPublicPartnerInvite(token, invitations) {
  const invite = invitations.find((entry) => entry.token === token);
  if (!invite) return { error: 'This partner invitation is invalid or has expired.' };
  return { invite: publicInvite(invite) };
}

export function submitPartnerInvite(token, input, invitations, partners, cities) {
  const invite = invitations.find((entry) => entry.token === token);
  if (!invite) return { error: 'This partner invitation is invalid or has expired.' };
  if (invite.status !== 'Open') return { error: 'This invitation has already been submitted. Contact QuickMove if you need to correct the information.' };
  if (!validText(input?.name, 2, 100)) return { error: 'Company name must be between 2 and 100 characters.' };
  if (!validText(input?.contactName, 2, 100)) return { error: 'Primary contact name must be between 2 and 100 characters.' };
  if (!emailPattern.test(input?.email?.trim() || '')) return { error: 'Enter a valid business email.' };
  if (!validText(input?.phone, 7, 24)) return { error: 'Enter a valid phone number.' };
  if (!Array.isArray(input?.cities) || !input.cities.length || input.cities.some((city) => !cities.includes(city))) return { error: 'Choose at least one supported city.' };
  if (!Number.isFinite(Number(input?.weeklyCapacity)) || Number(input.weeklyCapacity) < 1 || Number(input.weeklyCapacity) > 1000) return { error: 'Weekly capacity must be between 1 and 1,000 jobs.' };
  if (!Number.isFinite(Number(input?.responseHours)) || Number(input.responseHours) < 0.25 || Number(input.responseHours) > 72) return { error: 'Average response time must be between 0.25 and 72 hours.' };
  if (!pricingModels.includes(input?.pricingModel)) return { error: 'Choose a valid pricing model.' };
  if (input.notes && !validText(input.notes, 1, 1000)) return { error: 'Notes must be under 1,000 characters.' };
  if (input.accepted !== true) return { error: 'Confirm that the information is accurate before submitting.' };
  if (partners.some((partner) => partner.name.toLowerCase() === input.name.trim().toLowerCase())) return { error: 'A partner with this company name already exists. Ask QuickMove to review the duplicate.' };

  const partner = {
    id: `PT-${String(partners.length + 1).padStart(2, '0')}`,
    name: input.name.trim(),
    category: invite.category,
    cities: input.cities,
    contact: input.contactName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    score: null,
    status: 'Pending review',
    responseHours: Number(input.responseHours),
    completedMoves: 0,
    issueRate: null,
    weeklyCapacity: Number(input.weeklyCapacity),
    pricingModel: input.pricingModel,
    note: input.notes?.trim() || 'Partner submitted their onboarding information for QuickMove review.'
  };
  partners.unshift(partner);
  invite.status = 'Submitted';
  invite.partnerId = partner.id;
  return { partner, invite: publicInvite(invite) };
}

export const partnerOnboardingMeta = { categories, pricingModels };
