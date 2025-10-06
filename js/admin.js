import { supabase } from './supabaseClient.js';
import './main.js';

const authForm = document.getElementById('auth-form');
const authStatus = document.getElementById('auth-status');
const pricingSection = document.getElementById('pricing-section');
const pricingRows = document.getElementById('pricing-rows');
const pricingStatus = document.getElementById('pricing-status');
const savePricingButton = document.getElementById('save-pricing');
const sessionSummary = document.getElementById('session-summary');
const sessionEmail = document.getElementById('session-email');
const signOutButton = document.getElementById('sign-out');

function setStatus(element, message, variant = 'success') {
  if (!element) return;
  element.textContent = message;
  element.className = `alert alert-${variant}`;
}

function clearStatus(element) {
  if (!element) return;
  element.textContent = '';
  element.className = '';
}

function toggleDashboard(isAuthenticated, email = '') {
  if (isAuthenticated) {
    pricingSection.hidden = false;
    sessionSummary.hidden = false;
    sessionEmail.textContent = email;
    authForm.style.display = 'none';
  } else {
    pricingSection.hidden = true;
    sessionSummary.hidden = true;
    sessionEmail.textContent = '';
    authForm.style.display = 'grid';
    authForm.reset();
  }
}

async function signIn(event) {
  event.preventDefault();
  clearStatus(authStatus);

  const formData = new FormData(authForm);
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    setStatus(authStatus, 'Please provide both email and password.', 'error');
    return;
  }

  setStatus(authStatus, 'Signing you in securely...');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Auth error', error);
    setStatus(authStatus, error.message || 'Unable to sign in. Please try again.', 'error');
    return;
  }

  setStatus(authStatus, 'Signed in successfully. Loading dashboard...');
  await loadPricing();
}

async function loadPricing() {
  clearStatus(pricingStatus);
  const { data, error } = await supabase.from('quality_pricing').select('rating, amount, description').order('rating');
  if (error) {
    console.error('Failed to load pricing', error);
    setStatus(pricingStatus, 'Could not load pricing data.', 'error');
    return;
  }

  const descriptions = {
    4: 'Premier • flawless devices',
    3: 'Excellent • light wear',
    2: 'Fair • moderate wear',
    1: 'Unusable • activation locks or major faults',
  };

  pricingRows.innerHTML = '';
  const rows = data?.length ? data : [
    { rating: 4, amount: 460 },
    { rating: 3, amount: 360 },
    { rating: 2, amount: 220 },
    { rating: 1, amount: 80 },
  ];

  rows.forEach((row) => {
    const rating = Number(row.rating);
    const amount = Number(row.amount ?? 0);
    const description = row.description || descriptions[rating] || '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <th scope="row">${rating}</th>
      <td>${description}</td>
      <td>
        <input type="number" min="0" step="10" value="${amount}" data-rating="${rating}" aria-label="Amount for rating ${rating}" />
      </td>`;
    pricingRows.appendChild(tr);
  });
}

async function savePricing() {
  clearStatus(pricingStatus);
  const inputs = pricingRows.querySelectorAll('input[data-rating]');
  const updates = [];

  inputs.forEach((input) => {
    const rating = Number(input.dataset.rating);
    const amount = Number(input.value);
    if (!Number.isFinite(amount) || amount < 0) {
      input.focus();
      setStatus(pricingStatus, `Invalid amount entered for rating ${rating}.`, 'error');
      return;
    }
    updates.push({ rating, amount });
  });

  if (updates.length !== inputs.length) {
    return;
  }

  setStatus(pricingStatus, 'Saving pricing updates...');

  const { error } = await supabase.from('quality_pricing').upsert(updates, { onConflict: 'rating' });
  if (error) {
    console.error('Failed to save pricing', error);
    setStatus(pricingStatus, error.message || 'Could not update pricing.', 'error');
    return;
  }

  setStatus(pricingStatus, 'Pricing updated successfully.');
  await loadPricing();
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error', error);
    setStatus(authStatus, 'Unable to sign out. Please refresh.', 'error');
  }
}

async function initialize() {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    toggleDashboard(true, data.session.user.email || 'Admin user');
    await loadPricing();
  } else {
    toggleDashboard(false);
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    toggleDashboard(true, session.user.email || 'Admin user');
    loadPricing();
  } else {
    toggleDashboard(false);
  }
});

authForm?.addEventListener('submit', signIn);
savePricingButton?.addEventListener('click', savePricing);
signOutButton?.addEventListener('click', signOut);

initialize();
