window.supabaseUrl = 'https://befuoraecgrrorlfgfhm.supabase.co';
window.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnVvcmFlY2dycm9ybGZnZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODkwNjYsImV4cCI6MjA3NDI2NTA2Nn0.2iKmQhtTiS9DAniPE9mBy0100HzMtIkc49HBpaZow4s';

function toast(message) {
  var toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(function () {
    toastEl.classList.remove('show');
  }, 2600);
}

async function getSupabaseClient() {
  return waitForSupabase();
}

function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('open');
}

function wireModals() {
  var triggers = document.querySelectorAll('[data-modal-target]');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (ev) {
      ev.preventDefault();
      var id = trigger.getAttribute('data-modal-target');
      var modal = document.getElementById(id);
      if (modal) {
        modal.removeAttribute('aria-hidden');
        modal.classList.add('open');
      }
    });
  });

  document.addEventListener('click', function (ev) {
    var closeBtn = ev.target.closest('[data-modal-close]');
    if (closeBtn) {
      closeModal(closeBtn.closest('.modal'));
      return;
    }
    if (ev.target.classList.contains('modal')) {
      closeModal(ev.target);
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(function (modal) {
        closeModal(modal);
      });
    }
  });
}

async function refreshAuthNav() {
  var navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  try {
    var supabase = await getSupabaseClient();
    var result = await supabase.auth.getUser();
    var user = result.data ? result.data.user : null;
    if (user) {
      navAuth.textContent = 'Dashboard';
      navAuth.href = 'admin.html';
    } else {
      navAuth.textContent = 'Sign In';
      navAuth.href = 'login.html';
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  wireModals();
  refreshAuthNav();
});

window.toast = toast;
window.getSupabaseClient = getSupabaseClient;
