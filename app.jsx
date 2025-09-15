// Aydin's Dad — Smartphone Marketplace (GitHub Pages build)
// Single-file React app with hash routing, brand filters, product detail pages,
// financing calculator (down payment + monthly), trade-in form, and interlinking.
// Uses Tailwind via CDN and React UMD + Babel Standalone for JSX in the browser.

const { useEffect, useMemo, useState } = React;

// -------------------- Data --------------------
const BRANDS = ["Apple", "Samsung", "Google"];

const PHONES = [
  {
    id: "iphone-15-pro",
    brand: "Apple",
    name: "iPhone 15 Pro",
    basePrice: 1099,
    images: [
      "https://images.unsplash.com/photo-1603899124169-65f04f3e3a36?q=80&w=1600&auto=format&fit=crop",
    ],
    colors: ["Natural", "Blue", "Black"],
    storage: [
      { label: "128 GB", add: 0 },
      { label: "256 GB", add: 120 },
      { label: "512 GB", add: 320 },
    ],
    specs: {
      display: "6.1\" OLED 120Hz",
      chipset: "A17 Pro",
      camera: "48MP main, 12MP ultra-wide, 12MP tele",
      battery: "~3200 mAh",
      connectivity: "5G, Wi‑Fi 6E, BT 5.3, USB‑C",
    },
    apr: 9.99,
  },
  {
    id: "galaxy-s24-ultra",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    basePrice: 1199,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1600&auto=format&fit=crop",
    ],
    colors: ["Titanium Gray", "Titanium Violet", "Titanium Black"],
    storage: [
      { label: "256 GB", add: 0 },
      { label: "512 GB", add: 180 },
      { label: "1 TB", add: 380 },
    ],
    specs: {
      display: "6.8\" AMOLED 120Hz",
      chipset: "Snapdragon 8 Gen 3",
      camera: "200MP main, 10MP periscope, 12MP ultra-wide",
      battery: "5000 mAh",
      connectivity: "5G, Wi‑Fi 7, BT 5.3, USB‑C",
    },
    apr: 8.99,
  },
  {
    id: "pixel-9-pro",
    brand: "Google",
    name: "Pixel 9 Pro",
    basePrice: 999,
    images: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1600&auto=format&fit=crop",
    ],
    colors: ["Porcelain", "Obsidian", "Hazel"],
    storage: [
      { label: "128 GB", add: 0 },
      { label: "256 GB", add: 100 },
      { label: "512 GB", add: 300 },
    ],
    specs: {
      display: "6.7\" OLED 120Hz",
      chipset: "Google Tensor G4",
      camera: "50MP main, 48MP tele, 48MP ultra-wide",
      battery: "5050 mAh",
      connectivity: "5G, Wi‑Fi 7, BT 5.3, USB‑C",
    },
    apr: 7.99,
  },
];

// -------------------- Helpers --------------------
const routes = [
  "/",
  "/phones",
  "/sell",
  "/pricing",
  "/faq",
  "/about",
  "/contact",
];

function useHashRoute() {
  const [path, setPath] = useState(() => window.location.hash.replace("#", "") || "/");
  useEffect(() => {
    function onHashChange() {
      const p = window.location.hash.replace("#", "") || "/";
      setPath(p);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return [path, (to) => (window.location.hash = to)];
}

function cx(...classes) { return classes.filter(Boolean).join(" "); }
function currency(n) { return n.toLocaleString(undefined, { style: "currency", currency: "USD" }); }

// Financing calc: given price, apr%, term months, downPayment
function calcMonthly({ price, aprPct, termMonths, down }) {
  const P = Math.max(price - down, 0);
  const r = (aprPct / 100) / 12;
  if (P <= 0) return 0;
  if (r === 0) return P / termMonths;
  return (P * r) / (1 - Math.pow(1 + r, -termMonths));
}

// -------------------- UI Bits --------------------
const Badge = ({children}) => (
  <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{children}</span>
);

const Container = ({children, className=""}) => (
  <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
);

const Section = ({id, kicker, title, subtitle, children}) => (
  <section id={id} className="py-16 sm:py-20">
    <Container>
      {kicker && <div className="mb-3"><Badge>{kicker}</Badge></div>}
      {title && (
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-3 max-w-2xl text-slate-600">{subtitle}</p>
      )}
      <div className="mt-8">{children}</div>
    </Container>
  </section>
);

const Card = ({children, className=""}) => (
  <div className={cx("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}>{children}</div>
);

const Input = (props) => (
  <input {...props} className={cx("w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500", props.className)} />
);

const Select = (props) => (
  <select {...props} className={cx("w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500", props.className)} />
);

const Textarea = (props) => (
  <textarea {...props} className={cx("w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500", props.className)} />
);

const Button = ({children, variant="primary", className="", ...rest}) => {
  const styles = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white",
    secondary: "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-teal-700 hover:bg-teal-50"
  };
  return (
    <button {...rest} className={cx("inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition", styles[variant], className)}>
      {children}
    </button>
  );
};

const Check = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
);

// -------------------- Layout --------------------
function Nav({path, openDemo}) {
  const items = [
    {label: "Home", to: "/"},
    {label: "Phones", to: "/phones"},
    {label: "Sell Your Phone", to: "/sell"},
    {label: "Pricing", to: "/pricing"},
    {label: "FAQ", to: "/faq"},
    {label: "About", to: "/about"},
    {label: "Contact", to: "/contact"},
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>{ setMenuOpen(false); }, [path]);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white font-bold">AD</div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">Aydin's Dad</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {items.map((it) => (
            <a key={it.to} href={`#${it.to}`} className={cx("text-sm font-medium", path===it.to?"text-teal-700":"text-slate-700 hover:text-slate-900")}>{it.label}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={()=>location.hash = "#/sell"}>Trade‑in</Button>
          <Button onClick={openDemo}>Financing Help</Button>
        </div>
        <button className="md:hidden rounded-xl border border-slate-300 p-2" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open Menu">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5"><path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </Container>
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <Container className="py-4">
            <div className="grid gap-2">
              {items.map((it) => (
                <a key={it.to} href={`#${it.to}`} className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50">{it.label}</a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button className="w-full" variant="secondary" onClick={()=>location.hash = "#/sell"}>Trade‑in</Button>
                <Button className="w-full" onClick={openDemo}>Financing Help</Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <Container className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white font-bold">AD</div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Aydin's Dad</span>
          </div>
          <p className="text-sm text-slate-600">Buy and sell smartphones with transparent financing. Fair prices, fast payouts.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Shop</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><a href="#/phones" className="hover:text-slate-900">All Phones</a></li>
            <li><a href="#/pricing" className="hover:text-slate-900">Financing</a></li>
            <li><a href="#/sell" className="hover:text-slate-900">Sell Your Phone</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Company</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><a href="#/about" className="hover:text-slate-900">About</a></li>
            <li><a href="#/faq" className="hover:text-slate-900">FAQ</a></li>
            <li><a href="#/contact" className="hover:text-slate-900">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Stay in the loop</h4>
          <form onSubmit={(e)=>{e.preventDefault(); alert("Thanks! We'll be in touch.");}} className="flex gap-2">
            <Input type="email" required placeholder="you@example.com" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </Container>
      <Container className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Aydin's Dad. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#/terms" onClick={(e)=>e.preventDefault()} className="hover:text-slate-700">Terms</a>
          <a href="#/privacy" onClick={(e)=>e.preventDefault()} className="hover:text-slate-700">Privacy</a>
        </div>
      </Container>
    </footer>
  );
}

// -------------------- Homepage --------------------
function Hero({openDemo}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white">
      <Container className="py-16 sm:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Badge>Marketplace</Badge>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">Buy & sell phones with <span className="text-teal-700">Aydin's Dad</span>.</h1>
            <p className="mt-4 text-slate-600">Shop certified devices or trade‑in yours for a fast payout. Financing shows your down payment and monthly cost upfront—no surprises.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={()=>location.hash = "#/phones"}>Shop Phones</Button>
              <Button variant="secondary" onClick={()=>location.hash = "#/sell"}>Sell Your Phone</Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Check/>Certified & tested</div>
              <div className="flex items-center gap-2"><Check/>30‑day returns</div>
              <div className="flex items-center gap-2"><Check/>Transparent financing</div>
            </div>
          </div>
          <div>
            <div className="relative">
              <img alt="Phones" className="w-full rounded-3xl border border-slate-200 shadow-lg" src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1600&auto=format&fit=crop"/>
              <div className="absolute -bottom-6 -left-6 hidden rotate-2 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur sm:block">
                <div className="text-xs font-medium text-slate-700">From $29/mo</div>
              </div>
              <div className="absolute -top-6 -right-6 hidden -rotate-2 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur sm:block">
                <div className="text-xs font-medium text-slate-700">As low as 10% down</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function Home() {
  return (
    <main>
      <Hero />
      <Section id="features" kicker="Why us" title="Simple. Fair. Clear." subtitle="We keep pricing and financing easy to understand.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {t:"Clear financing", d:"See down payment and monthly cost on every phone page."},
            {t:"Quality checks", d:"Multi‑point inspection, data wipe, and battery health verified."},
            {t:"Fast payouts", d:"Selling to us? Get paid by ACH once your device passes inspection."},
            {t:"Warranty", d:"30‑day return window and optional extended coverage."},
            {t:"Custom builds", d:"Pick storage and color—prices update instantly."},
            {t:"Secure checkout", d:"Stripe‑ready front end (connect your own backend)."},
          ].map((f, i)=> (
            <Card key={i}>
              <div className="text-lg font-semibold text-slate-900">{f.t}</div>
              <p className="mt-2 text-sm text-slate-600">{f.d}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section id="cta" kicker="Hot right now" title="Top picks">
        <PhoneGrid initialBrand="Apple" />
      </Section>
    </main>
  );
}

// -------------------- Financing Widget --------------------
function FinancingWidget({ price, aprPct, defaultDownPct=20, defaultTerm=24, compact=false }) {
  const [downPct, setDownPct] = useState(defaultDownPct);
  const [term, setTerm] = useState(defaultTerm);
  const down = Math.round(price * (downPct/100));
  const monthly = calcMonthly({ price, aprPct, termMonths: term, down });
  return (
    <div className={cx(compact?"text-sm":"")}> 
      <div className="flex items-center gap-3">
        <div className="font-medium text-slate-900">{currency(monthly)}/mo</div>
        <div className="text-slate-500">with {currency(down)} down</div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <label className="block text-xs font-semibold text-slate-700">Down payment ({downPct}%)</label>
          <input type="range" min={0} max={80} step={5} value={downPct} onChange={(e)=>setDownPct(Number(e.target.value))} className="w-full"/>
          <div className="mt-1 text-xs text-slate-600">{currency(down)} down</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <label className="block text-xs font-semibold text-slate-700">Term</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[12,24,36].map(m=> (
              <button key={m} onClick={()=>setTerm(m)} className={cx("rounded-lg px-2 py-1 text-xs border", term===m?"border-teal-600 bg-teal-50 text-teal-700":"border-slate-300 hover:bg-slate-50")}>{m} mo</button>
            ))}
          </div>
          <div className="mt-1 text-xs text-slate-600">APR {aprPct}%</div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Phones List & Filters --------------------
function PhoneGrid({ initialBrand }) {
  const [brand, setBrand] = useState(initialBrand || "All");
  const brands = ["All", ...BRANDS];
  const list = PHONES.filter(p => brand === "All" || p.brand === brand);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {brands.map(b => (
          <button key={b} onClick={()=>setBrand(b)} className={cx("rounded-xl border px-3 py-1 text-sm", brand===b?"border-teal-600 bg-teal-50 text-teal-700":"border-slate-300 hover:bg-slate-50")}>{b}</button>
        ))}
        <a href="#/phones" className="ml-auto text-sm text-teal-700 hover:underline">Browse all →</a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(p => (
          <Card key={p.id}>
            <a href={`#/phone/${p.id}`} className="block">
              <img src={p.images[0]} alt={p.name} className="h-48 w-full rounded-xl object-cover"/>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <div className="text-sm text-slate-500">{p.brand}</div>
                  <div className="text-lg font-semibold text-slate-900">{p.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-900 font-semibold">{currency(p.basePrice)}</div>
                  <div className="text-xs text-slate-500">from <EstMonthly price={p.basePrice} aprPct={p.apr} /></div>
                </div>
              </div>
            </a>
            <div className="mt-4">
              <FinancingWidget price={p.basePrice} aprPct={p.apr} compact />
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={()=>location.hash = `#/phone/${p.id}`}>View</Button>
              <Button variant="secondary" onClick={()=>alert("Added to cart (demo)")}>Add to cart</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EstMonthly({ price, aprPct }) {
  const down = Math.round(price * 0.2);
  const m = calcMonthly({ price, aprPct, termMonths: 24, down });
  return <span>{currency(m)}/mo</span>;
}

function PhonesPage() {
  return (
    <main>
      <Section title="All phones" subtitle="Filter by brand and explore financing for each device.">
        <PhoneGrid />
      </Section>
    </main>
  );
}

// -------------------- Product Detail --------------------
function PhoneDetail({ id }) {
  const phone = PHONES.find(p => p.id === id);
  const [color, setColor] = useState(phone?.colors[0]);
  const [storage, setStorage] = useState(phone?.storage[0]?.label);
  const add = phone?.storage.find(s => s.label === storage)?.add || 0;
  const price = (phone?.basePrice || 0) + add;

  if (!phone) return (
    <main>
      <Section title="Not found"><p className="text-slate-600">That phone doesn't exist. <a className="text-teal-700 underline" href="#/phones">Back to phones</a>.</p></Section>
    </main>
  );

  return (
    <main>
      <Section title={phone.name} subtitle={`${phone.brand} • Financing shown below • Choose your build`}>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <img src={phone.images[0]} alt={phone.name} className="w-full rounded-3xl border border-slate-200 object-cover"/>
          </div>
          <div>
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-slate-900">{currency(price)}</div>
                <div className="text-sm text-slate-500">APR {phone.apr}%</div>
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-800">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {phone.colors.map(c => (
                      <button key={c} onClick={()=>setColor(c)} className={cx("rounded-xl border px-3 py-2 text-sm", color===c?"border-teal-600 bg-teal-50 text-teal-700":"border-slate-300 hover:bg-slate-50")}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-800">Storage</label>
                  <div className="flex flex-wrap gap-2">
                    {phone.storage.map(s => (
                      <button key={s.label} onClick={()=>setStorage(s.label)} className={cx("rounded-xl border px-3 py-2 text-sm", storage===s.label?"border-teal-600 bg-teal-50 text-teal-700":"border-slate-300 hover:bg-slate-50")}>{s.label} {s.add?`(+${currency(s.add)})`:""}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <FinancingWidget price={price} aprPct={phone.apr} />
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={()=>alert("Added to cart (demo)")}>Add to cart</Button>
                <Button variant="secondary" onClick={()=>alert("Checkout not wired (demo)")}>Buy now</Button>
              </div>
              <div className="mt-4 text-xs text-slate-500">Representative example. Taxes, shipping, and credit approval not included.</div>
            </Card>
            <Card className="mt-6">
              <div className="text-sm font-semibold text-slate-900">Key specs</div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li><span className="font-medium">Display:</span> {phone.specs.display}</li>
                <li><span className="font-medium">Chipset:</span> {phone.specs.chipset}</li>
                <li><span className="font-medium">Cameras:</span> {phone.specs.camera}</li>
                <li><span className="font-medium">Battery:</span> {phone.specs.battery}</li>
                <li><span className="font-medium">Connectivity:</span> {phone.specs.connectivity}</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}

// -------------------- Sell/Trade-in --------------------
function SellPage() {
  return (
    <main>
      <Section title="Sell your phone" subtitle="Tell us about your device and get a quick quote. We pay after inspection.">
        <Card>
          <form onSubmit={(e)=>{e.preventDefault(); alert("Thanks! We'll email your quote shortly.");}} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Brand</label>
              <Select required defaultValue=""><option value="" disabled>Choose brand</option>{BRANDS.map(b=>(<option key={b}>{b}</option>))}</Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Model</label>
              <Input required placeholder="e.g., iPhone 14 Pro"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Storage</label>
              <Input required placeholder="e.g., 256 GB"/>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Condition</label>
              <Select required defaultValue=""><option value="" disabled>Choose condition</option><option>Like New</option><option>Good</option><option>Fair</option><option>Needs Repair</option></Select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">Notes (optional)</label>
              <Textarea rows={4} placeholder="Tell us about any scratches, battery replacements, etc."/>
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-800">Your name</label>
              <Input required placeholder="Jane Doe"/>
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-800">Email</label>
              <Input required type="email" placeholder="you@example.com"/>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Get quote</Button></div>
          </form>
        </Card>
      </Section>
    </main>
  );
}

// -------------------- Generic Pages --------------------
function Pricing() {
  return (
    <main>
      <Section title="Financing overview" subtitle="Representative terms shown on each product page. Connect your own lender for production.">
        <Card>
          <ul className="grid gap-3 text-sm text-slate-700">
            <li className="flex items-start gap-2"><Check/><span>APR ranges set per device (e.g., 7.99%–9.99%).</span></li>
            <li className="flex items-start gap-2"><Check/><span>Terms: 12, 24, or 36 months.</span></li>
            <li className="flex items-start gap-2"><Check/><span>Down payment: adjustable 0–80%.</span></li>
            <li className="flex items-start gap-2"><Check/><span>Taxes/fees not included. Credit approval required.</span></li>
          </ul>
        </Card>
      </Section>
    </main>
  );
}

function FAQ() {
  const faqs = [
    {q:"How do you calculate the monthly payment?", a:"We use a standard amortization formula based on price minus down payment, APR, and term length."},
    {q:"Can I pay off early?", a:"Yes—most lenders allow early payoff; terms may vary."},
    {q:"Are devices unlocked?", a:"Unless specified otherwise, devices are fully unlocked and tested."},
    {q:"How fast is trade‑in payment?", a:"Typically within 2 business days after inspection passes."},
  ];
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
      {faqs.map((f, i)=> (
        <details key={i} className="group p-6 open:bg-teal-50/40">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-sm font-medium text-slate-900">{f.q}</span>
            <span className="text-slate-500 group-open:rotate-180 transition">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-slate-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function About() {
  return (
    <main>
      <Section title="About Aydin's Dad" subtitle="A friendly smartphone marketplace built for clarity and speed.">
        <Card>
          <p className="text-sm text-slate-700">We help people upgrade without the guesswork: straightforward pricing, clear financing, and quality devices. This is a demo-ready front end—connect your payment and lending providers to go live.</p>
        </Card>
      </Section>
    </main>
  );
}

function Contact() {
  return (
    <main>
      <Section title="Contact us" subtitle="We usually reply within one business day.">
        <Card>
          <form onSubmit={(e)=>{e.preventDefault(); alert("Message sent! We'll get back to you soon.");}} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1"><label className="mb-1 block text-sm font-medium text-slate-800">Name</label><Input required placeholder="Jane Doe"/></div>
            <div className="sm:col-span-1"><label className="mb-1 block text-sm font-medium text-slate-800">Email</label><Input required type="email" placeholder="you@example.com"/></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-800">Message</label><Textarea required rows={5} placeholder="How can we help?"/></div>
            <div className="sm:col-span-2"><Button type="submit">Send message</Button></div>
          </form>
        </Card>
      </Section>
    </main>
  );
}

// -------------------- App + Router --------------------
function App() {
  const [path] = useHashRoute();

  // dynamic product path: /phone/:id
  let detailMatch = null;
  if (path.startsWith("/phone/")) {
    detailMatch = path.split("/phone/")[1];
  }

  const Page = useMemo(()=>{
    if (detailMatch) return <PhoneDetail id={detailMatch} />;
    switch(path){
      case "/": return <Home/>;
      case "/phones": return <PhonesPage/>;
      case "/sell": return <SellPage/>;
      case "/pricing": return <Pricing/>;
      case "/faq": return <main><Section title="FAQ"><FAQ/></Section></main>;
      case "/about": return <About/>;
      case "/contact": return <Contact/>;
      default: return <Home/>;
    }
  }, [path, detailMatch]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav path={path} openDemo={()=>alert("For production, connect your lender SDK or a custom API.")} />
      {Page}
      <Footer/>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="rounded-2xl border border-teal-200 bg-white/90 p-2 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <Button onClick={()=>location.hash = "#/phones"}>Shop Phones</Button>
            <Button variant="secondary" onClick={()=>location.hash = "#/sell"}>Trade‑in</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
