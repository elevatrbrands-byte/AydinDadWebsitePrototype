import React, { useMemo, useState, useEffect } from 'react'
import { dal } from './lib/supabase.js'

const brandPalette = { primary:'#0046FF', accent:'#0CC0DF' }
const defaultMultipliers = { 1:0.2, 2:0.45, 3:0.7, 4:0.9 }
const defaultModels = [
  { id:'iph13-128', brand:'Apple', name:'iPhone 13 (128 GB)', base:320 },
  { id:'iph12-64', brand:'Apple', name:'iPhone 12 (64 GB)', base:180 },
  { id:'s21-128', brand:'Samsung', name:'Galaxy S21 (128 GB)', base:170 },
  { id:'px6-128', brand:'Google', name:'Pixel 6 (128 GB)', base:160 },
]

const cx = (...a) => a.filter(Boolean).join(' ')
const scoreIntegrity = (ans) => {
  let s = 4
  if (!ans.powersOn) s -= 3
  if (ans.screenCracks) s -= 1
  if (Number(ans.battery) < 80) s -= 1
  if (ans.waterDamage) s -= 2
  if (!ans.storageOK) s -= 1
  if (ans.carrierLocked) s -= 1
  return Math.max(1, Math.min(4, s))
}
const calcEstimate = (base, q, mults) => Math.round(Number(base) * Number(mults[q] ?? 0))

function useRouter(){ const [route,setRoute]=useState('/'); return { route, navigate:setRoute } }

function Shell({ children, route, navigate, onOpenContact }){
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl" style={{background:`linear-gradient(135deg, ${brandPalette.primary}, ${brandPalette.accent})`}}/>
            <div className="font-bold tracking-tight text-xl">TK Phones</div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink label="Home" to="/" current={route} navigate={navigate}/>
            <NavLink label="Sell your phone" to="/sell" current={route} navigate={navigate}/>
            <NavLink label="How it works" to="/how" current={route} navigate={navigate}/>
            <NavLink label="FAQs" to="/faqs" current={route} navigate={navigate}/>
            <button onClick={onOpenContact} className="rounded-lg px-3 py-2 hover:bg-slate-100">Contact</button>
            <button onClick={()=>navigate('/admin')} className="rounded-lg px-3 py-2 border border-slate-200 hover:bg-slate-50">Admin</button>
          </nav>
          <button className="md:hidden rounded-lg px-3 py-2 border" onClick={()=>navigate('/menu')}>Menu</button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 text-sm">
          <div>
            <div className="font-semibold mb-2">TK Phones</div>
            <p className="text-slate-600">Fast, fair offers for used phones. Get paid how you want—same day in many cases.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Links</div>
            <ul className="space-y-2">
              <li><a className="hover:underline" onClick={() => navigate('/')}>Home</a></li>
              <li><a className="hover:underline" onClick={() => navigate('/sell')}>Sell your phone</a></li>
              <li><a className="hover:underline" onClick={() => navigate('/how')}>How it works</a></li>
              <li><a className="hover:underline" onClick={() => navigate('/faqs')}>FAQs</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-slate-600">Have questions? Reach out—our team is here to help.</p>
            <div className="mt-3 flex gap-3">
              <button className="rounded-lg px-3 py-2 text-white" style={{backgroundColor: brandPalette.primary}} onClick={onOpenContact}>Message us</button>
              <button className="rounded-lg px-3 py-2 border border-slate-200" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>Back to top</button>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500 pb-8">© {new Date().getFullYear()} TK Phones — All rights reserved.</div>
      </footer>
    </div>
  )
}

function NavLink({ label, to, current, navigate }){
  const active = current === to
  return <button onClick={()=>navigate(to)} className={cx('rounded-lg px-3 py-2', active?'bg-slate-100':'hover:bg-slate-100')}>{label}</button>
}

function Home({ navigate, onOpenStart }){
  return (
    <section className="relative isolate">
      <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">Sell your phone in minutes with <span style={{color:brandPalette.primary}}>TK Phones</span></h1>
          <p className="mt-4 text-lg text-slate-600">Answer a few questions, get an instant estimate, schedule pickup or shipping, and get paid quickly.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onOpenStart} className="rounded-xl px-5 py-3 text-white font-semibold" style={{backgroundColor:brandPalette.primary}}>Get my offer</button>
            <button onClick={()=>navigate('/how')} className="rounded-xl px-5 py-3 border border-slate-200">How it works</button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 grid place-items-center">
            <div className="text-center">
              <div className="text-6xl">📱</div>
              <div className="mt-2 font-semibold">Trade-in that feels premium</div>
              <div className="text-slate-500 text-sm">Clean UI • Quick quote • Transparent pricing</div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-xl p-4 border w-64">
            <div className="text-xs text-slate-500">Recent offers</div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between"><span>iPhone 13</span><span className="font-semibold">$250</span></div>
              <div className="flex justify-between"><span>Galaxy S21</span><span className="font-semibold">$130</span></div>
              <div className="flex justify-between"><span>Pixel 6</span><span className="font-semibold">$120</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SellFlow({ models, multipliers, navigate, onComplete }){
  const [step,setStep]=useState(1)
  const [modelId,setModelId]=useState(models[0]?.id||'')
  const [answers,setAnswers]=useState({ powersOn:true, screenCracks:false, battery:85, waterDamage:false, storageOK:true, carrierLocked:false })
  const model = useMemo(()=>models.find(m=>m.id===modelId),[models,modelId])
  const integrity = useMemo(()=>scoreIntegrity(answers),[answers])
  const estimate = useMemo(()=>model?calcEstimate(model.base, integrity, multipliers):0,[model,multipliers,integrity])
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">{[1,2,3].map(i=> <div key={i} className={cx('h-2 w-full rounded-full', i<=step?'bg-slate-900':'bg-slate-200')} />)}</div>
      {step===1 && (
        <div className="rounded-2xl border p-6 bg-white">
          <div className="text-lg font-semibold mb-4">Choose your phone</div>
          <label className="text-sm text-slate-600">Model</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={modelId} onChange={e=>setModelId(e.target.value)}>
            {models.map(m=> <option key={m.id} value={m.id}>{m.name} — base ${m.base}</option>)}
          </select>
          <div className="mt-6 flex justify-between">
            <button className="rounded-lg px-4 py-2 border" onClick={()=>navigate('/')}>Back</button>
            <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} onClick={()=>setStep(2)}>Next</button>
          </div>
        </div>
      )}
      {step===2 && (
        <div className="rounded-2xl border p-6 bg-white">
          <div className="text-lg font-semibold mb-4">Answer a few questions</div>
          <div className="grid md:grid-cols-2 gap-4">
            <Toggle label="Does it power on?" value={answers.powersOn} onChange={v=>setAnswers(a=>({...a,powersOn:v}))}/>
            <Toggle label="Any screen cracks?" value={answers.screenCracks} onChange={v=>setAnswers(a=>({...a,screenCracks:v}))}/>
            <div>
              <label className="text-sm text-slate-600">Battery health (estimate %)</label>
              <input type="number" min={50} max={100} className="mt-1 w-full rounded-lg border px-3 py-2" value={answers.battery} onChange={e=>setAnswers(a=>({...a,battery:Number(e.target.value)}))}/>
            </div>
            <Toggle label="Any signs of water damage?" value={answers.waterDamage} onChange={v=>setAnswers(a=>({...a,waterDamage:v}))}/>
            <Toggle label="Storage and buttons all OK?" value={answers.storageOK} onChange={v=>setAnswers(a=>({...a,storageOK:v}))}/>
            <Toggle label="Carrier locked?" value={answers.carrierLocked} onChange={v=>setAnswers(a=>({...a,carrierLocked:v}))}/>
          </div>
          <div className="mt-6 rounded-xl border p-4 bg-slate-50">
            <div className="text-sm text-slate-600">Integrity rating (auto)</div>
            <div className="mt-1 text-2xl font-bold">{integrity} / 4</div>
          </div>
          <div className="mt-6 flex justify-between">
            <button className="rounded-lg px-4 py-2 border" onClick={()=>setStep(1)}>Back</button>
            <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} onClick={()=>setStep(3)}>See my offer</button>
          </div>
        </div>
      )}
      {step===3 && (
        <div className="rounded-2xl border p-6 bg-white">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <div className="text-sm text-slate-600">Model</div>
              <div className="font-semibold">{model?.name}</div>
              <div className="mt-4 text-sm text-slate-600">Integrity</div>
              <div className="text-xl font-bold">{integrity} / 4</div>
              <div className="mt-4 text-sm text-slate-600">Estimated payout</div>
              <div className="text-3xl font-extrabold tracking-tight">${estimate}</div>
            </div>
            <div className="rounded-2xl border p-4 bg-slate-50">
              <div className="font-semibold">Next steps</div>
              <ol className="list-decimal ml-5 mt-2 space-y-2 text-sm text-slate-700">
                <li>Schedule a pickup or request a free shipping kit.</li>
                <li>We verify condition upon receipt.</li>
                <li>Choose payout method (e‑transfer, PayPal, gift card, etc.).</li>
              </ol>
              <div className="mt-4 flex gap-3">
                <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} onClick={()=>onComplete?.({ modelId, integrity, estimate })}>Continue</button>
                <button className="rounded-lg px-4 py-2 border" onClick={()=>setStep(2)}>Edit answers</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Toggle({ label, value, onChange }){
  const cx2 = (...a)=>a.filter(Boolean).join(' ')
  return (
    <label className="flex items-center justify-between rounded-xl border p-3 bg-white">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={()=>onChange(!value)} className={cx2('relative inline-flex h-6 w-11 items-center rounded-full transition', value?'bg-slate-900':'bg-slate-300')}>
        <span className={cx2('inline-block h-5 w-5 transform rounded-full bg-white transition', value?'translate-x-5':'translate-x-1')} />
      </button>
    </label>
  )
}

function Admin({ navigate }){
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  const [multipliers,setMultipliers]=useState(defaultMultipliers)
  const [models,setModels]=useState(defaultModels)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [errorMsg,setErrorMsg]=useState('')
  const [newModel,setNewModel]=useState({ brand:'', name:'', base:'' })
  const [tests,setTests]=useState([])

  useEffect(()=>{
    let mounted=true
    const unsub = dal.onAuth?.((u)=>{ if(mounted) setUser(u) }) || (()=>{})
    ;(async()=>{
      try{
        const session = await dal.getSession()
        if(!mounted) return
        setUser(session.user)
        const [mp,md] = await Promise.all([dal.fetchMultipliers(), dal.fetchModels()])
        if(!mounted) return
        setMultipliers(mp); setModels(md)
      }catch(e){ setErrorMsg(String(e?.message||e)) }
      finally{ setLoading(false) }
    })()
    return ()=>{ mounted=false; unsub() }
  },[])

  async function handleSignIn(e){ e.preventDefault(); setErrorMsg(''); try{ const u=await dal.signInEmailPassword(email,password); setUser(u) } catch(e){ setErrorMsg(String(e?.message||e)) } }
  async function handleSignUp(e){ e.preventDefault(); setErrorMsg(''); try{ const u=await dal.signUpEmailPassword(email,password); setUser(u) } catch(e){ setErrorMsg(String(e?.message||e)) } }
  async function handleMagic(){ setErrorMsg(''); try{ await dal.signInMagicLink(email); setErrorMsg('Magic link sent. Check your email.') } catch(e){ setErrorMsg(String(e?.message||e)) } }
  async function handleSignOut(){ await dal.signOut(); setUser(null) }

  async function updateMultiplier(q,val){ try{ const next = await dal.upsertMultiplier(q, val); setMultipliers(next) } catch(e){ setErrorMsg(String(e?.message||e)) } }
  async function addModel(){ if(!newModel.brand||!newModel.name||!newModel.base) return; const id=newModel.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const item={ id, brand:newModel.brand, name:newModel.name, base:Number(newModel.base) }; try{ const next=await dal.upsertModel(item); setModels(next); setNewModel({brand:'',name:'',base:''}) } catch(e){ setErrorMsg(String(e?.message||e)) } }
  async function removeModel(id){ try{ const next=await dal.deleteModel(id); setModels(next) } catch(e){ setErrorMsg(String(e?.message||e)) } }

  function runTests(){
    const res=[]; const mp=multipliers; const base=100
    for(const q of [1,2,3,4]){ const got=calcEstimate(base,q,mp); const exp=Math.round(base*mp[q]); res.push({name:`estimate ${base} q${q}`, pass: got===exp, got, exp}) }
    const t1=scoreIntegrity({powersOn:true,screenCracks:false,battery:90,waterDamage:false,storageOK:true,carrierLocked:false}); res.push({name:'integrity all good=4',pass:t1===4,got:t1,exp:4})
    const t2=scoreIntegrity({powersOn:false,screenCracks:false,battery:90,waterDamage:false,storageOK:true,carrierLocked:false}); res.push({name:'integrity no power=1',pass:t2===1,got:t2,exp:1})
    const base2=333; const got2=calcEstimate(base2,4,mp); const exp2=Math.round(base2*mp[4]); res.push({name:'rounding check',pass:got2===exp2,got:got2,exp:exp2})
    setTests(res)
  }

  if(loading) return <section className="mx-auto max-w-md px-4 py-16"><div className="rounded-2xl border p-6">Loading…</div></section>
  if(!user) return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border p-6">
        <div className="text-lg font-semibold mb-4">Admin login (Supabase)</div>
        <form className="grid gap-3" onSubmit={handleSignIn}>
          <input className="rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="rounded-lg border px-3 py-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex gap-3 flex-wrap">
            <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} type="submit">Sign in</button>
            <button className="rounded-lg px-4 py-2 border" type="button" onClick={handleSignUp}>Sign up</button>
            <button className="rounded-lg px-4 py-2 border" type="button" onClick={handleMagic}>Magic link</button>
            <button className="rounded-lg px-4 py-2 border" type="button" onClick={()=>navigate('/')}>Back</button>
          </div>
        </form>
        <ul className="text-xs text-slate-500 mt-4 list-disc ml-5 space-y-1">
          <li>If email confirmations are enabled, confirm the link in your email before password sign‑in.</li>
          <li>Add this origin to Supabase Auth → Redirect URLs: <code>{window.location.origin}</code></li>
        </ul>
        {errorMsg && <p className="text-sm text-red-600 mt-3">{errorMsg}</p>}
      </div>
    </section>
  )

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h2>
        <button className="rounded-lg px-3 py-2 border" onClick={handleSignOut}>Sign out</button>
      </div>
      <p className="mt-2 text-slate-600">Edit multipliers & manage models. Changes save to Supabase and instantly affect customer estimates.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border p-6 bg-white">
          <div className="text-lg font-semibold mb-4">Quality multipliers (1–4)</div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(q=> (
              <div key={q} className="rounded-xl border p-4">
                <div className="text-sm text-slate-600">Quality {q}</div>
                <input type="number" step="0.01" min={0} max={2} className="mt-1 w-full rounded-lg border px-3 py-2" value={Number(multipliers[q]).toString()} onChange={e=>updateMultiplier(q, Number(e.target.value))}/>
                <div className="text-xs text-slate-500 mt-1">Multiplier × base price</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6 bg-white">
          <div className="text-lg font-semibold mb-4">Add a phone model</div>
          <div className="grid gap-3">
            <input className="rounded-lg border px-3 py-2" placeholder="Brand (e.g., Apple)" value={newModel.brand} onChange={e=>setNewModel({...newModel,brand:e.target.value})}/>
            <input className="rounded-lg border px-3 py-2" placeholder="Model name (e.g., iPhone 14 128GB)" value={newModel.name} onChange={e=>setNewModel({...newModel,name:e.target.value})}/>
            <input type="number" className="rounded-lg border px-3 py-2" placeholder="Base price (e.g., 350)" value={newModel.base} onChange={e=>setNewModel({...newModel,base:e.target.value})}/>
            <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} onClick={addModel}>Add model</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-6 bg-white mt-8">
        <div className="text-lg font-semibold mb-4">Diagnostics & tests</div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg px-4 py-2 text-white" style={{backgroundColor:brandPalette.primary}} onClick={runTests}>Run sanity tests</button>
          <span className="text-sm text-slate-500">Verifies pricing math and integrity scoring.</span>
        </div>
        {tests.length>0 && (
          <div className="mt-4 rounded-xl border divide-y">
            {tests.map((t,i)=> (
              <div key={i} className="p-3 text-sm flex justify-between">
                <div>{t.name}</div>
                <div className={t.pass? 'text-green-600':'text-red-600'}>{t.pass? 'PASS': `FAIL (got ${t.got}, expected ${t.exp})`}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6 bg-white mt-8">
        <div className="text-lg font-semibold mb-4">Current catalog</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Base</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m=> (
                <tr key={m.id} className="border-b last:border-none">
                  <td className="py-2 pr-4">{m.brand}</td>
                  <td className="py-2 pr-4">{m.name}</td>
                  <td className="py-2 pr-4">
                    <input type="number" className="w-28 rounded border px-2 py-1" value={m.base}
                      onChange={async e=>{ const val=Number(e.target.value); await dal.upsertModel({ ...m, base: val }); const fresh=await dal.fetchModels(); setModels(fresh) }} />
                  </td>
                  <td className="py-2 pr-4">
                    <button className="rounded px-3 py-1 border mr-2" onClick={()=>removeModel(m.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default function App(){
  const { route, navigate } = useRouter()
  const [contactOpen,setContactOpen]=useState(false)
  const [startOpen,setStartOpen]=useState(false)
  const [lastOffer,setLastOffer]=useState(null)
  const [multipliers,setMultipliers]=useState(defaultMultipliers)
  const [models,setModels]=useState(defaultModels)

  useEffect(()=>{ let mounted=true; (async()=>{ const [mp,md]=await Promise.all([dal.fetchMultipliers(), dal.fetchModels()]); if(!mounted) return; setMultipliers(mp); setModels(md) })(); return ()=>{ mounted=false } },[])

  return (
    <Shell route={route} navigate={navigate} onOpenContact={()=>setContactOpen(true)}>
      {route==='/' && <Home navigate={navigate} onOpenStart={()=>{ setStartOpen(true); navigate('/sell') }} />}
      {route==='/sell' && <SellFlow models={models} multipliers={multipliers} navigate={navigate} onComplete={(o)=>{ setLastOffer(o); setContactOpen(true) }} />}
      {route==='/admin' && <Admin navigate={navigate} />}
      {route==='/how' && <div className="mx-auto max-w-6xl px-4 py-16">How it works content…</div>}
      {route==='/faqs' && <div className="mx-auto max-w-6xl px-4 py-16">FAQs…</div>}
      {route==='/menu' && <div className="px-4 py-8">Menu…</div>}
    </Shell>
  )
}
