import { supabase } from './supabaseClient.js';
import './main.js';

const form = document.getElementById('quote-form');
const statusEl = document.getElementById('form-status');
const modalWrapper = document.getElementById('quote-modal');
const summaryEl = document.getElementById('quote-summary');
const offerEl = document.getElementById('quote-offer');
const closeButtons = modalWrapper?.querySelectorAll('[data-close-modal]');

const pricingMap = new Map();

const storageMultipliers = {
  '64': 1,
  '128': 1.08,
  '256': 1.16,
  '512': 1.25,
  '1024': 1.35,
};

function setStatus(message, variant = 'success') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `alert alert-${variant}`;
}

async function loadPricing() {
  const { data, error } = await supabase.from('quality_pricing').select('rating, amount');
  if (error) {
    console.error('Unable to fetch pricing', error);
    setStatus('Could not load pricing data. Default pricing will be used.', 'error');
    pricingMap.set(4, 460);
    pricingMap.set(3, 380);
    pricingMap.set(2, 240);
    pricingMap.set(1, 60);
    return;
  }

  data.forEach((row) => {
    pricingMap.set(Number(row.rating), Number(row.amount));
  });
}

function computeIntegrityRating(values) {
  if (values.activation === 'locked' || values.powersOn === 'no') {
    return 1;
  }

  let deductions = 0;

  if (values.powersOn === 'sometimes') deductions += 1.5;

  const screenDeduction = {
    pristine: 0,
    light: 0.5,
    heavy: 1.5,
    cracked: 3,
  }[values.screen] ?? 0;

  const bodyDeduction = {
    immaculate: 0,
    scuffed: 0.75,
    dented: 1.5,
    damaged: 3,
  }[values.body] ?? 0;

  const batteryDeduction = {
    optimal: 0,
    good: 0.5,
    degraded: 1,
    critical: 2,
  }[values.battery] ?? 0;

  const activationDeduction = {
    clear: 0,
    unknown: 1,
    locked: 3,
  }[values.activation] ?? 0;

  deductions += screenDeduction + bodyDeduction + batteryDeduction + activationDeduction;

  let rating = Math.round(4 - deductions);
  rating = Math.max(1, Math.min(4, rating));
  return rating;
}

function calculateOffer(rating, storage) {
  const base = pricingMap.get(rating);
  if (!base) return null;
  const multiplier = storageMultipliers[storage] ?? 1;
  const offer = Math.round(base * multiplier);
  return offer;
}

function showModal() {
  if (!modalWrapper) return;
  modalWrapper.hidden = false;
}

function hideModal() {
  if (!modalWrapper) return;
  modalWrapper.hidden = true;
}

closeButtons?.forEach((btn) => btn.addEventListener('click', hideModal));
modalWrapper?.addEventListener('click', (event) => {
  const target = event.target;
  if (target === modalWrapper || target.classList.contains('modal-backdrop')) {
    hideModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideModal();
});

async function submitQuote(event) {
  event.preventDefault();
  setStatus('Generating your Integrity Index rating...', 'success');

  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  if (!pricingMap.size) {
    await loadPricing();
  }

  const requiredFields = ['ownerName', 'email', 'phoneModel', 'storage', 'powersOn', 'screen', 'battery', 'body', 'activation'];
  const missing = requiredFields.filter((key) => !values[key]);

  if (missing.length > 0) {
    setStatus('Please complete all required fields before submitting.', 'error');
    return;
  }

  const rating = computeIntegrityRating(values);
  const offer = calculateOffer(rating, values.storage);

  summaryEl.textContent = `${values.ownerName}, your ${values.phoneModel} earned an Integrity Index rating of ${rating} out of 4.`;
  if (offer) {
    offerEl.innerHTML = `<p class="alert alert-success">Concierge offer: <strong>$${offer.toLocaleString()}</strong></p>`;
  } else {
    offerEl.innerHTML = `<p class="alert alert-error">We could not find pricing for Integrity rating ${rating}. An expert will follow up shortly.</p>`;
  }

  try {
    const { error } = await supabase.from('phone_quotes').insert([
      {
        owner_name: values.ownerName,
        email: values.email,
        phone_model: values.phoneModel,
        storage: values.storage,
        rating,
        offer,
        notes: values.notes ?? null,
        diagnostic_payload: values,
      },
    ]);

    if (error) {
      console.warn('Could not store quote submission', error);
    }
  } catch (error) {
    console.error('Unexpected error storing quote', error);
  }

  showModal();
  setStatus('Integrity Index generated. Check the summary above!', 'success');
  form.reset();
}

if (form) {
  form.addEventListener('submit', submitQuote);
  loadPricing();
}
