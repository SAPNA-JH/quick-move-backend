import test from 'node:test';
import assert from 'node:assert/strict';
import { createPartnerInvite, getPublicPartnerInvite, submitPartnerInvite } from '../src/partnerOnboarding.js';

const cities = ['Bengaluru', 'Pune'];
const validSubmission = {
  name: 'MoveWell Services', contactName: 'Kiran Rao', email: 'kiran@movewell.example', phone: '+91 98765 43210',
  cities: ['Bengaluru', 'Pune'], weeklyCapacity: 24, responseHours: 2, pricingModel: 'Quote after assessment',
  notes: 'Available for weekday moves.', accepted: true
};

test('creates a shareable partner invitation and exposes only its public context', () => {
  const invitations = [];
  const result = createPartnerInvite({ category: 'Moving', city: 'Bengaluru', email: 'owner@movewell.example' }, cities, invitations);
  assert.equal(result.invite.status, 'Open');
  assert.equal(getPublicPartnerInvite(result.invite.token, invitations).invite.category, 'Moving');
});

test('submitting a partner invite creates a pending-review partner exactly once', () => {
  const invitations = []; const partners = [];
  const invite = createPartnerInvite({ category: 'Moving', city: 'Bengaluru' }, cities, invitations).invite;
  const result = submitPartnerInvite(invite.token, validSubmission, invitations, partners, cities);
  assert.equal(result.partner.status, 'Pending review');
  assert.equal(partners[0].weeklyCapacity, 24);
  assert.match(submitPartnerInvite(invite.token, validSubmission, invitations, partners, cities).error, /already been submitted/i);
});

test('partner onboarding rejects an incomplete submission', () => {
  const invitations = []; const partners = [];
  const invite = createPartnerInvite({ category: 'Utilities', city: 'Pune' }, cities, invitations).invite;
  assert.match(submitPartnerInvite(invite.token, { ...validSubmission, accepted: false }, invitations, partners, cities).error, /confirm/i);
});
