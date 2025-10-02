(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const views = {
    home: $("#view-home"),
    how: $("#view-how"),
    faq: $("#view-faq"),
    contact: $("#view-contact"),
    offer: $("#view-offer"),
  };

  // Mobile menu
  $("#mobileMenuBtn").addEventListener("click", () => {
    $("#mobileMenu").classList.toggle("hidden");
  });

  // Footer year
  $("#year").textContent = new Date().getFullYear();

  // Simple hash router
  function showView(v) {
    Object.values(views).forEach(el => el.classList.add("hidden"));
    v.classList.remove("hidden");
    $("#mobileMenu").classList.add("hidden");
  }

  function route() {
    const hash = location.hash || "#/";
    switch (true) {
      case hash.startsWith("#/how-it-works"):
        showView(views.how); break;
      case hash.startsWith("#/faq"):
        showView(views.faq); break;
      case hash.startsWith("#/contact"):
        showView(views.contact); break;
      case hash.startsWith("#/get-offer"):
        showView(views.offer); break;
      default:
        showView(views.home); break;
    }
  }
  window.addEventListener("hashchange", route);
  route();

  // Modal helpers
  const modal = $("#modal");
  $("#modalClose").addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });
  function openModal(title, body) {
    $("#modalTitle").textContent = title;
    $("#modalBody").textContent = body;
    modal.classList.add("show");
  }

  // -------- Quote flow ----------
  const stepper = $("#stepper");
  const flow = $("#flow");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const estimateEl = $("#estimate");
  const estimateMeta = $("#estimateMeta");

  const state = {
    step: 0,
    brand: null,
    model_name: null,
    storage_gb: null,
    carrier: null,
    condition: { screen: null, battery: null, body: null, water: null, powers_on: null },
    quality: null,
    model_id: null,
    prices: null,
  };

  const steps = [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "storage", label: "Storage" },
    { key: "carrier", label: "Carrier" },
    { key: "condition", label: "Condition" },
    { key: "review", label: "Review" },
  ];

  function renderStepper() {
    stepper.innerHTML = steps.map((s, i) => {
      const active = i === state.step ? "bg-blue-600 text-white" : "bg-gray-200";
      return `<div class="px-3 py-1 rounded-full ${active}">${i+1}. ${s.label}</div>`;
    }).join("");
  }

  async function fetchModelsByBrand(brand) {
    const { data, error } = await sb.from("phone_models")
      .select("*")
      .eq("brand", brand)
      .order("model_name");
    if (error) { console.error(error); openModal("Error", error.message); return []; }
    return data;
  }

  async function fetchStorages(brand, model_name) {
    const { data, error } = await sb.from("phone_models")
      .select("*")
      .eq("brand", brand)
      .eq("model_name", model_name)
      .order("storage_gb");
    if (error) { console.error(error); openModal("Error", error.message); return []; }
    return data;
  }

  async function fetchCarriers(brand, model_name, storage_gb) {
    const { data, error } = await sb.from("phone_models")
      .select("*")
      .eq("brand", brand)
      .eq("model_name", model_name)
      .eq("storage_gb", storage_gb)
      .order("carrier");
    if (error) { console.error(error); openModal("Error", error.message); return []; }
    return data;
  }

  async function fetchPrices(model_id) {
    const { data, error } = await sb.from("buyback_prices")
      .select("*")
      .eq("model_id", model_id)
      .maybeSingle();
    if (error) { console.error(error); openModal("Error", error.message); return null; }
    return data;
  }

  function computeQuality() {
    // Simple scoring → map to 1..4
    let score = 0;
    // screen: 'cracked','scratched','good','like-new'
    const screen = state.condition.screen;
    score += screen === "cracked" ? 0 : screen === "scratched" ? 1 : screen === "good" ? 2 : 3;
    // battery: 'poor','ok','good','excellent'
    const battery = state.condition.battery;
    score += battery === "poor" ? 0 : battery === "ok" ? 1 : battery === "good" ? 2 : 3;
    // body: 'dented','scuffed','clean','mint'
    const body = state.condition.body;
    score += body === "dented" ? 0 : body === "scuffed" ? 1 : body === "clean" ? 2 : 3;
    // water: 'yes','no'
    score += state.condition.water === "yes" ? 0 : 2;
    // powers_on: 'no','yes'
    score += state.condition.powers_on === "no" ? 0 : 2;

    // score range: min 0 .. max 13
    // Map to 1..4
    let q = 1;
    if (score >= 11) q = 4;
    else if (score >= 8) q = 3;
    else if (score >= 4) q = 2;
    else q = 1;
    state.quality = q;
    return q;
  }

  function getEstimateFromPrices() {
    if (!state.prices || !state.quality) return 0;
    const q = state.quality;
    const v = q === 1 ? state.prices.q1_price
          : q === 2 ? state.prices.q2_price
          : q === 3 ? state.prices.q3_price
          : state.prices.q4_price;
    return Number(v || 0);
  }

  function updateEstimateUI() {
    const q = state.quality;
    const est = getEstimateFromPrices();
    estimateEl.textContent = `$${est.toFixed(0)}`;
    if (q) {
      estimateMeta.textContent = `Quality tier: Q${q}. Model ID: ${state.model_id || "-"}.`;
    } else {
      estimateMeta.textContent = `Complete the steps to see your offer.`;
    }
  }

  function ensureNextEnabled(ok) {
    nextBtn.disabled = !ok;
    nextBtn.classList.toggle("opacity-50", !ok);
    nextBtn.classList.toggle("cursor-not-allowed", !ok);
  }

  function renderStep() {
    renderStepper();
    updateEstimateUI();
    prevBtn.classList.toggle("invisible", state.step === 0);
    nextBtn.textContent = state.step === steps.length - 1 ? "Get Offer" : "Next";

    flow.innerHTML = "";
    const c = document.createElement("div");
    c.className = "space-y-4";

    if (state.step === 0) {
      c.innerHTML = `
        <label class="block">
          <span class="font-semibold">Choose your brand</span>
          <select id="brand" class="input mt-1">
            <option value="">Select</option>
            <option>Apple</option>
            <option>Samsung</option>
            <option>Google</option>
          </select>
        </label>`;
      flow.appendChild(c);
      const brandSel = $("#brand");
      brandSel.value = state.brand || "";
      brandSel.addEventListener("change", async () => {
        state.brand = brandSel.value || null;
        ensureNextEnabled(!!state.brand);
      });
      ensureNextEnabled(!!state.brand);
    }

    if (state.step === 1) {
      if (!state.brand) { state.step = 0; return renderStep(); }
      c.innerHTML = `<div><span class="font-semibold">Select your ${state.brand} model</span>
        <div id="models" class="grid md:grid-cols-2 gap-2 mt-2"></div></div>`;
      flow.appendChild(c);
      ensureNextEnabled(false);
      fetchModelsByBrand(state.brand).then(models => {
        const el = $("#models");
        if (!models.length) {
          el.innerHTML = `<div class="text-gray-600">No models found for ${state.brand}. Ask support to add your model.</div>`;
        } else {
          el.innerHTML = models.map(m => `
            <button data-model="${m.model_name}" class="btn btn-ghost justify-start">${m.model_name}</button>
          `).join("");
          el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
            state.model_name = b.dataset.model;
            ensureNextEnabled(true);
            el.querySelectorAll("button").forEach(x=>x.classList.remove("bg-blue-50"));
            b.classList.add("bg-blue-50");
          }));
          if (state.model_name) {
            const pre = Array.from(el.querySelectorAll("button")).find(x => x.dataset.model === state.model_name);
            pre?.classList.add("bg-blue-50");
            ensureNextEnabled(true);
          }
        }
      });
    }

    if (state.step === 2) {
      if (!state.model_name) { state.step = 1; return renderStep(); }
      c.innerHTML = `<div><span class="font-semibold">Storage</span>
        <div id="storages" class="flex gap-2 mt-2"></div></div>`;
      flow.appendChild(c);
      ensureNextEnabled(false);
      fetchStorages(state.brand, state.model_name).then(rows => {
        const el = $("#storages");
        const uniq = [...new Map(rows.map(r => [r.storage_gb, r])).values()].sort((a,b)=>a.storage_gb-b.storage_gb);
        el.innerHTML = uniq.map(r => `<button class="btn btn-ghost" data-storage="${r.storage_gb}">${r.storage_gb} GB</button>`).join("");
        el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
          state.storage_gb = Number(b.dataset.storage);
          ensureNextEnabled(true);
          el.querySelectorAll("button").forEach(x=>x.classList.remove("bg-blue-50"));
          b.classList.add("bg-blue-50");
        }));
        if (state.storage_gb) {
          const pre = Array.from(el.querySelectorAll("button")).find(x => Number(x.dataset.storage) === state.storage_gb);
          pre?.classList.add("bg-blue-50");
          ensureNextEnabled(true);
        }
      });
    }

    if (state.step === 3) {
      if (!state.storage_gb) { state.step = 2; return renderStep(); }
      c.innerHTML = `<div><span class="font-semibold">Carrier</span>
        <div id="carriers" class="flex gap-2 mt-2"></div></div>`;
      flow.appendChild(c);
      ensureNextEnabled(false);
      fetchCarriers(state.brand, state.model_name, state.storage_gb).then(rows => {
        const el = $("#carriers");
        el.innerHTML = rows.map(r => `<button class="btn btn-ghost" data-id="${r.model_id}" data-carrier="${r.carrier}">${r.carrier}</button>`).join("");
        el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
          state.carrier = b.dataset.carrier;
          state.model_id = b.dataset.id;
          ensureNextEnabled(true);
          el.querySelectorAll("button").forEach(x=>x.classList.remove("bg-blue-50"));
          b.classList.add("bg-blue-50");
        }));
        if (state.model_id) {
          const pre = Array.from(el.querySelectorAll("button")).find(x => x.dataset.id === state.model_id);
          pre?.classList.add("bg-blue-50");
          ensureNextEnabled(true);
        }
      });
    }

    if (state.step === 4) {
      if (!state.model_id) { state.step = 3; return renderStep(); }
      c.innerHTML = `
        <div class="grid md:grid-cols-2 gap-3">
          <label class="block">
            <span class="font-semibold">Screen condition</span>
            <select id="screen" class="input mt-1">
              <option value="">Select</option>
              <option value="cracked">Cracked</option>
              <option value="scratched">Scratched</option>
              <option value="good">Good</option>
              <option value="like-new">Like new</option>
            </select>
          </label>
          <label class="block">
            <span class="font-semibold">Battery health</span>
            <select id="battery" class="input mt-1">
              <option value="">Select</option>
              <option value="poor">Poor</option>
              <option value="ok">OK</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </label>
          <label class="block">
            <span class="font-semibold">Body condition</span>
            <select id="body" class="input mt-1">
              <option value="">Select</option>
              <option value="dented">Dented / bent</option>
              <option value="scuffed">Scuffed / worn</option>
              <option value="clean">Clean</option>
              <option value="mint">Mint</option>
            </select>
          </label>
          <label class="block">
            <span class="font-semibold">Water damage?</span>
            <select id="water" class="input mt-1">
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label class="block">
            <span class="font-semibold">Powers on?</span>
            <select id="power" class="input mt-1">
              <option value="">Select</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
        </div>
      `;
      flow.appendChild(c);
      const ids = ["screen","battery","body","water","power"];
      ids.forEach(id => {
        const el = $("#"+id);
        if (id==="power") el.value = state.condition.powers_on || "";
        else el.value = state.condition[id] || "";
        el.addEventListener("change", () => {
          if (id==="power") state.condition.powers_on = el.value || null;
          else state.condition[id] = el.value || null;
          const all = state.condition.screen && state.condition.battery && state.condition.body && state.condition.water && state.condition.powers_on;
          if (all) {
            computeQuality();
            // fetch prices if needed
            if (!state.prices) fetchPrices(state.model_id).then(p => { state.prices = p; updateEstimateUI(); });
            else updateEstimateUI();
          }
          ensureNextEnabled(all);
        });
      });
      const all = state.condition.screen && state.condition.battery && state.condition.body && state.condition.water && state.condition.powers_on;
      ensureNextEnabled(all);
    }

    if (state.step === 5) {
      const q = state.quality;
      const est = getEstimateFromPrices();
      c.innerHTML = `
        <div class="card bg-blue-50">
          <div class="font-semibold mb-1">Review</div>
          <div class="text-sm text-gray-700">Brand: ${state.brand} • Model: ${state.model_name} • ${state.storage_gb} GB • ${state.carrier}</div>
          <div class="text-sm text-gray-700">Quality: Q${q}</div>
          <div class="text-xl font-bold mt-2">Estimated offer: $${est.toFixed(0)}</div>
        </div>
        <p class="text-gray-600">Click "Get Offer" to save your quote. We'll email shipping details after you accept.</p>
      `;
      flow.appendChild(c);
      ensureNextEnabled(true);
    }
  }

  prevBtn.addEventListener("click", () => {
    if (state.step > 0) { state.step--; renderStep(); }
  });
  nextBtn.addEventListener("click", async () => {
    if (state.step < steps.length - 1) {
      state.step++; renderStep();
      // preload prices when carrier selected
      if (state.step === 4 && state.model_id && !state.prices) {
        state.prices = await fetchPrices(state.model_id);
        updateEstimateUI();
      }
    } else {
      // Save quote
      if (!state.quality) return openModal("Missing info","Please complete device condition first.");
      const estimate = getEstimateFromPrices();
      const { error } = await sb.from("quotes").insert({
        brand: state.brand,
        model_name: state.model_name,
        storage_gb: state.storage_gb,
        carrier: state.carrier,
        quality: state.quality,
        estimate
      });
      if (error) return openModal("Error saving quote", error.message);
      openModal("Quote saved", "We've saved your estimate. Check your email for next steps.");
      location.hash = "#/";
    }
  });

  renderStep();
})();