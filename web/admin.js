(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const modal = $("#modal");
  const showModal = () => modal.classList.add("show");
  const hideModal = () => modal.classList.remove("show");

  // Auth
  const email = $("#email");
  const password = $("#password");
  const signin = $("#signin");
  const signup = $("#signup");
  const signout = $("#signout");
  const status = $("#authStatus");

  async function refreshAuthUI() {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      status.textContent = `Signed in as ${user.email}`;
      signout.classList.remove("hidden");
    } else {
      status.textContent = "Not signed in.";
      signout.classList.add("hidden");
    }
  }

  signin.addEventListener("click", async () => {
    const { error } = await sb.auth.signInWithPassword({ email: email.value, password: password.value });
    if (error) { alert(error.message); }
    await refreshAuthUI();
    loadPrices();
  });

  signup.addEventListener("click", async () => {
    const { error } = await sb.auth.signUp({ email: email.value, password: password.value });
    if (error) { alert(error.message); }
    else alert("Account created. Add your email to admin_emails to get write access.");
    await refreshAuthUI();
  });

  signout.addEventListener("click", async () => {
    await sb.auth.signOut();
    await refreshAuthUI();
  });

  // Modal fields
  const m = {
    model_id: $("#m_model_id"),
    brand: $("#m_brand"),
    model_name: $("#m_model_name"),
    storage: $("#m_storage"),
    carrier: $("#m_carrier"),
    q1: $("#m_q1"),
    q2: $("#m_q2"),
    q3: $("#m_q3"),
    q4: $("#m_q4"),
  };
  $("#addModelBtn").addEventListener("click", () => {
    $("#modalTitle").textContent = "Add Model";
    Object.values(m).forEach(el => el.value = "");
    showModal();
  });
  $("#modalCancel").addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

  $("#modalSave").addEventListener("click", async () => {
    const model = {
      model_id: m.model_id.value.trim(),
      brand: m.brand.value.trim(),
      model_name: m.model_name.value.trim(),
      storage_gb: Number(m.storage.value),
      carrier: m.carrier.value.trim()
    };
    const prices = {
      q1_price: Number(m.q1.value || 0),
      q2_price: Number(m.q2.value || 0),
      q3_price: Number(m.q3.value || 0),
      q4_price: Number(m.q4.value || 0)
    };
    if (!model.model_id || !model.brand || !model.model_name || !model.storage_gb || !model.carrier) {
      return alert("Please complete all fields.");
    }

    // Upsert model
    let { error: em } = await sb.from("phone_models").upsert(model);
    if (em) return alert(em.message);

    // Upsert price
    const row = { model_id: model.model_id, ...prices };
    let { error: ep } = await sb.from("buyback_prices").upsert(row);
    if (ep) return alert(ep.message);

    hideModal();
    await loadPrices();
  });

  async function loadPrices() {
    const { data, error } = await sb.from("phone_models")
      .select("model_id,brand,model_name,storage_gb,carrier,buyback_prices(q1_price,q2_price,q3_price,q4_price)")
      .order("brand").order("model_name").order("storage_gb");
    if (error) { console.error(error); return; }

    const tbody = $("#pricesBody");
    tbody.innerHTML = "";
    (data || []).forEach(row => {
      const p = row.buyback_prices?.[0] || { q1_price:0,q2_price:0,q3_price:0,q4_price:0 };
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-2 pr-4"><code>${row.model_id}</code></td>
        <td class="py-2 pr-4">${row.brand}</td>
        <td class="py-2 pr-4">${row.model_name}</td>
        <td class="py-2 pr-4">${row.storage_gb} GB</td>
        <td class="py-2 pr-4">${row.carrier}</td>
        <td class="py-2 pr-4"><input class="input w-24" type="number" value="${p.q1_price}"></td>
        <td class="py-2 pr-4"><input class="input w-24" type="number" value="${p.q2_price}"></td>
        <td class="py-2 pr-4"><input class="input w-24" type="number" value="${p.q3_price}"></td>
        <td class="py-2 pr-4"><input class="input w-24" type="number" value="${p.q4_price}"></td>
        <td class="py-2 pr-4"><button class="btn btn-primary">Save</button></td>
      `;
      const inputs = tr.querySelectorAll("input");
      const saveBtn = tr.querySelector("button");
      saveBtn.addEventListener("click", async () => {
        const payload = {
          model_id: row.model_id,
          q1_price: Number(inputs[0].value||0),
          q2_price: Number(inputs[1].value||0),
          q3_price: Number(inputs[2].value||0),
          q4_price: Number(inputs[3].value||0),
        };
        const { error } = await sb.from("buyback_prices").upsert(payload);
        if (error) alert(error.message);
        else alert("Saved.");
      });
      tbody.appendChild(tr);
    });
  }

  // Initial
  refreshAuthUI();
  loadPrices();
})();