import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, Button, Input, Select, Modal, Badge, ProgressBar, PageHeader, EmptyState } from "../components/UI";

const MONTHS = Array.from({length:12},(_,i)=>{
  const d=new Date(2025,i,1);
  return {value:`2025-${String(i+1).padStart(2,"0")}`,label:d.toLocaleString("default",{month:"long",year:"numeric"})};
});
const CATEGORIES = ["Food","Entertainment","Utilities","Transport","Groceries","Health","Shopping","Education","Other"];
const INIT = { category:"Food", limit:"", month:new Date().toISOString().slice(0,7) };
const fmt = (n) => `\u20b9${Number(n).toLocaleString("en-IN")}`;
const MOCK = [
  {id:1,category:"Food",          limitAmount:8000,  spent:6200, month:"2025-03"},
  {id:2,category:"Entertainment", limitAmount:3000,  spent:3400, month:"2025-03"},
  {id:3,category:"Utilities",     limitAmount:4000,  spent:2100, month:"2025-03"},
  {id:4,category:"Transport",     limitAmount:3000,  spent:1800, month:"2025-03"},
  {id:5,category:"Health",        limitAmount:2000,  spent:580,  month:"2025-03"},
];

export default function Budgets() {
  const [budgets,setBudgets]     = useState([]);
  const [loading,setLoading]     = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [saving,setSaving]       = useState(false);
  const [form,setForm]           = useState(INIT);

  useEffect(()=>{
    api.get("/budgets/progress")
      .then(setBudgets)
      .catch(()=>setBudgets(MOCK))
      .finally(()=>setLoading(false));
  },[]);

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      const saved = await api.post("/budgets",{...form,limit:Number(form.limit)});
      setBudgets(p=>[...p,{...saved,spent:0}]);
    } catch {
      setBudgets(p=>[...p,{...form,id:Date.now(),limitAmount:Number(form.limit),spent:0}]);
    } finally { setSaving(false); setShowModal(false); setForm(INIT); }
  }

  function handleDelete(id) {
    api.delete(`/budgets/${id}`).catch(()=>{});
    setBudgets(p=>p.filter(b=>b.id!==id));
  }

  const totalBudgeted = budgets.reduce((a,b)=>a+Number(b.limitAmount||b.limit||0),0);
  const totalSpent    = budgets.reduce((a,b)=>a+Number(b.spent||0),0);
  const overCount     = budgets.filter(b=>Number(b.spent)>Number(b.limitAmount||b.limit||0)).length;

  return (
    <div className="fade-up">
      <PageHeader
        title="Budgets"
        subtitle="Track your monthly spending limits"
        action={<Button onClick={()=>setShowModal(true)}>+ New Budget</Button>}
      />

      {/* Summary row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {[
          {label:"Total Budgeted",value:fmt(totalBudgeted),color:"var(--accent)"},
          {label:"Total Spent",   value:fmt(totalSpent),   color:"var(--text-primary)"},
          {label:"Over Budget",   value:`${overCount} categor${overCount===1?"y":"ies"}`,color:overCount?"var(--red)":"var(--green)"},
        ].map(s=>(
          <Card key={s.label} style={{padding:"1.25rem 1.5rem"}}>
            <p style={{fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,fontFamily:"var(--font-display)",marginBottom:8}}>{s.label}</p>
            <p style={{fontSize:24,fontWeight:700,fontFamily:"var(--font-display)",color:s.color}}>{s.value}</p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{height:160,borderRadius:"var(--radius-lg)"}}/>)}
        </div>
      ) : budgets.length===0 ? (
        <EmptyState icon="\u25d1" title="No budgets yet" description="Create a budget to track your spending by category"/>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {budgets.map(b=>{
            const cap = Number(b.limitAmount||b.limit||0);
            const spent = Number(b.spent||0);
            const pct = cap ? Math.round((spent/cap)*100) : 0;
            const over = pct>100;
            const remaining = cap - spent;
            return (
              <Card key={b.id} style={{border:`1px solid ${over?"rgba(255,77,106,0.3)":"var(--border)"}`,position:"relative"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div>
                    <p style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,marginBottom:4}}>{b.category}</p>
                    <p style={{fontSize:11,color:"var(--text-muted)"}}>{b.month}</p>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {over && <Badge color="red">Over</Badge>}
                    <button onClick={()=>handleDelete(b.id)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
                    <span style={{color:"var(--text-secondary)"}}>Spent: <strong style={{color:over?"var(--red)":"var(--text-primary)"}}>{fmt(spent)}</strong></span>
                    <span style={{color:"var(--text-muted)"}}>of {fmt(cap)}</span>
                  </div>
                  <ProgressBar value={spent} max={cap}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:remaining<0?"var(--red)":"var(--green)"}}>
                    {remaining<0 ? `${fmt(Math.abs(remaining))} over budget` : `${fmt(remaining)} remaining`}
                  </span>
                  <span style={{fontSize:12,padding:"3px 10px",borderRadius:99,background:over?"var(--red-dim)":"var(--bg-raised)",color:over?"var(--red)":"var(--text-secondary)",fontWeight:600}}>
                    {pct}%
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="New Budget" onClose={()=>setShowModal(false)}>
          <form onSubmit={handleSave} style={{display:"flex",flexDirection:"column",gap:14}}>
            <Select label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </Select>
            <Input label="Monthly limit (\u20b9)" type="number" min="1" step="1" placeholder="5000" value={form.limit} onChange={e=>setForm(p=>({...p,limit:e.target.value}))} required/>
            <Select label="Month" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))}>
              {MONTHS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <Button type="submit" loading={saving} style={{flex:1}}>Create Budget</Button>
              <Button variant="secondary" onClick={()=>setShowModal(false)} style={{flex:1}}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
