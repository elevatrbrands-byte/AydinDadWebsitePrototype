import { supabase } from './supabaseClient.js';
import './main.js';

const form = document.getElementById('support-form');
const statusEl = document.getElementById('support-status');

function setStatus(message, variant = 'success') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `alert alert-${variant}`;
}

async function submitSupport(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  if (!values.supportName || !values.supportEmail || !values.supportSubject || !values.supportMessage) {
    setStatus('Please complete every field before sending your message.', 'error');
    return;
  }

  setStatus('Sending your concierge request...', 'success');

  try {
    const { error } = await supabase.from('support_requests').insert([
      {
        name: values.supportName,
        email: values.supportEmail,
        subject: values.supportSubject,
        message: values.supportMessage,
      },
    ]);

    if (error) {
      console.error('Support request failed to store', error);
      setStatus('We received your request, but logging to Supabase failed. A concierge will still respond shortly.', 'error');
      return;
    }

    setStatus('Request received! A concierge will reply shortly.', 'success');
    form.reset();
  } catch (error) {
    console.error('Unexpected support submission error', error);
    setStatus('We could not send your request. Please try again or email concierge@tkphones.com.', 'error');
  }
}

form?.addEventListener('submit', submitSupport);
