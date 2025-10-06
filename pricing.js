let supabaseClient;
async function client() {
  if (!supabaseClient) {
    supabaseClient = await getSupabaseClient();
  }
  return supabaseClient;
}

async function loadModels() {
  const supabase = await client();
  const modelsRes = await supabase
    .from('phone_models')
    .select('*')
    .eq('active', true)
    .order('brand')
    .order('display_name');
  if (modelsRes.error) {
    toast(modelsRes.error.message);
    return;
  }
  const pricesRes = await supabase.from('buyback_prices').select('*');
  if (pricesRes.error) {
    toast(pricesRes.error.message);
    return;
  }
  const select = document.getElementById('modelSelect');
  if (!select) return;
  select.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select your phone';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);
  (modelsRes.data || []).forEach(function (model) {
    const opt = document.createElement('option');
    opt.value = model.model_id;
    opt.textContent = model.brand + ' — ' + model.display_name;
    select.appendChild(opt);
  });
  window.__models = modelsRes.data || [];
  window.__prices = Object.fromEntries(
    (pricesRes.data || []).map(function (price) {
      return [price.model_id, price];
    })
  );
}

function calcIntegrity(answers) {
  let score = 0;
  switch (answers.screen) {
    case 'perfect':
      score += 3;
      break;
    case 'light':
      score += 2;
      break;
    case 'heavy':
      score += 1;
      break;
    case 'cracked':
      score += 0;
      break;
  }
  switch (answers.battery) {
    case 'great':
      score += 3;
      break;
    case 'good':
      score += 2;
      break;
    case 'ok':
      score += 1;
      break;
    case 'poor':
      score += 0;
      break;
  }
  switch (answers.water) {
    case 'no':
      score += 3;
      break;
    case 'maybe':
      score += 1;
      break;
    case 'yes':
      score += 0;
      break;
  }
  switch (answers.lock) {
    case 'unlocked':
      score += 2;
      break;
    case 'locked':
      score += 0;
      break;
  }
  switch (answers.storage) {
    case 'high':
      score += 2;
      break;
    case 'mid':
      score += 1;
      break;
    case 'low':
      score += 0;
      break;
  }
  let integrity = 1;
  if (score >= 11) integrity = 4;
  else if (score >= 8) integrity = 3;
  else if (score >= 4) integrity = 2;
  return { integrity: integrity, score: score };
}

function qualityPriceFor(modelId, integrity) {
  const priceRow = window.__prices ? window.__prices[modelId] : null;
  if (!priceRow) return 0;
  const map = { 1: 'q1_price', 2: 'q2_price', 3: 'q3_price', 4: 'q4_price' };
  return Number(priceRow[map[integrity]] || 0);
}

function answersFromInputs(inputs) {
  const answers = {};
  inputs.forEach(function (input) {
    answers[input.dataset.q] = input.value;
  });
  return answers;
}

document.addEventListener('DOMContentLoaded', async function () {
  await loadModels();
  const inputs = document.querySelectorAll('[data-q]');
  const calcBtn = document.getElementById('calcBtn');
  const saveQuoteBtn = document.getElementById('saveQuoteBtn');
  const modelSelect = document.getElementById('modelSelect');
  let last = null;

  function updateButtons() {
    if (calcBtn) {
      calcBtn.disabled = !modelSelect.value;
    }
    if (saveQuoteBtn) {
      saveQuoteBtn.disabled = !last || !last.price;
    }
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', updateButtons);
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', function () {
      if (!modelSelect.value) {
        toast('Select a phone to continue.');
        return;
      }
      const answers = answersFromInputs(inputs);
      const result = calcIntegrity(answers);
      const modelId = modelSelect.value;
      const price = qualityPriceFor(modelId, result.integrity);
      last = {
        model_id: modelId,
        answers: answers,
        integrity: result.integrity,
        score: result.score,
        price: price,
      };
      document.getElementById('integrityDisplay').textContent = result.integrity;
      document.getElementById('priceDisplay').textContent = price
        ? '$' + price.toFixed(2)
        : '—';
      updateButtons();
      if (!price) {
        toast('No pricing set for this quality yet.');
      }
    });
  }

  if (saveQuoteBtn) {
    saveQuoteBtn.addEventListener('click', async function () {
      if (!last) return;
      const supabase = await client();
      const insertion = await supabase.from('quotes').insert([
        {
          model_id: last.model_id,
          quality: last.integrity,
          score: last.score,
          est_price: last.price,
          answers: last.answers,
        },
      ]);
      toast(insertion.error ? insertion.error.message : 'Quote saved.');
    });
  }

  updateButtons();
});
