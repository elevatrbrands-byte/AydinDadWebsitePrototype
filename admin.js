let adminSupabase;
async function adminClient() {
  if (!adminSupabase) {
    adminSupabase = await getSupabaseClient();
  }
  return adminSupabase;
}

async function assertAdmin() {
  const supabase = await adminClient();
  const session = await supabase.auth.getUser();
  const user = session.data ? session.data.user : null;
  if (!user) {
    toast('Please sign in first.');
    location.href = 'login.html';
    return false;
  }
  const rpc = await supabase.rpc('is_admin');
  if (rpc.error) {
    toast(rpc.error.message);
    return false;
  }
  if (!rpc.data) {
    toast('You are not an admin.');
    return false;
  }
  return true;
}

async function refresh() {
  const supabase = await adminClient();
  const modelsTbody = document.getElementById('modelsTbody');
  const pricesTbody = document.getElementById('pricesTbody');
  const priceModelSelect = document.getElementById('p-model');
  if (!modelsTbody || !pricesTbody || !priceModelSelect) return;
  modelsTbody.innerHTML = '';
  pricesTbody.innerHTML = '';
  priceModelSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a model';
  placeholder.disabled = true;
  placeholder.selected = true;
  priceModelSelect.appendChild(placeholder);

  const models = await supabase
    .from('phone_models')
    .select('*')
    .order('brand')
    .order('display_name');
  if (models.error) {
    toast(models.error.message);
    return;
  }
  const prices = await supabase.from('buyback_prices').select('*');
  if (prices.error) {
    toast(prices.error.message);
    return;
  }
  (models.data || []).forEach(function (model) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' +
      model.display_name +
      '<br><span class="small">' +
      model.model_id +
      '</span></td><td>' +
      model.brand +
      '</td><td>' +
      (model.active ? 'Yes' : 'No') +
      '</td>';
    modelsTbody.appendChild(tr);
    const opt = document.createElement('option');
    opt.value = model.model_id;
    opt.textContent = model.display_name + ' (' + model.model_id + ')';
    priceModelSelect.appendChild(opt);
  });
  (prices.data || []).forEach(function (price) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' +
      price.model_id +
      '</td><td>$' +
      Number(price.q1_price || 0).toFixed(2) +
      '</td><td>$' +
      Number(price.q2_price || 0).toFixed(2) +
      '</td><td>$' +
      Number(price.q3_price || 0).toFixed(2) +
      '</td><td>$' +
      Number(price.q4_price || 0).toFixed(2) +
      '</td>';
    pricesTbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  if (!(await assertAdmin())) return;
  await refresh();
  const supabase = await adminClient();

  const addModelBtn = document.getElementById('addModelBtn');
  if (addModelBtn) {
    addModelBtn.addEventListener('click', async function () {
      const model = {
        model_id: document.getElementById('m-id').value.trim(),
        display_name: document.getElementById('m-name').value.trim(),
        brand: document.getElementById('m-brand').value.trim() || 'Generic',
        active: true,
      };
      if (!model.model_id || !model.display_name) {
        toast('Model id & name required.');
        return;
      }
      const upsert = await supabase.from('phone_models').upsert(model);
      toast(upsert.error ? upsert.error.message : 'Model saved.');
      await refresh();
    });
  }

  const savePriceBtn = document.getElementById('savePriceBtn');
  if (savePriceBtn) {
    savePriceBtn.addEventListener('click', async function () {
      const id = document.getElementById('p-model').value;
      if (!id) {
        toast('Select a model.');
        return;
      }
      const row = {
        model_id: id,
        q1_price: Number(document.getElementById('p-q1').value || 0),
        q2_price: Number(document.getElementById('p-q2').value || 0),
        q3_price: Number(document.getElementById('p-q3').value || 0),
        q4_price: Number(document.getElementById('p-q4').value || 0),
      };
      const upsert = await supabase.from('buyback_prices').upsert(row);
      toast(upsert.error ? upsert.error.message : 'Prices saved.');
      await refresh();
    });
  }
});
