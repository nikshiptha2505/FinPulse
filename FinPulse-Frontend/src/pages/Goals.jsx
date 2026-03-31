import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, Button, Input, Modal, ProgressBar, PageHeader, EmptyState } from "../components/UI";

const ICONS = ["\ud83c\udfaf","\ud83c\udfe0","\u2708\ufe0f","\ud83d\ude97","\ud83c\udf93","\ud83d\udc8d","\ud83d\udcf1","\ud83d\udcb0","\ud83c\udfdd\ufe0f","\ud83d\udcbc"];
const INIT  = { name:"", targetAmount:"", savedAmount:"", deadline:"", icon:"\ud83c\udfaf" };
const fmt   = (n) => `\u20b9${Number(n).toLocaleString("en-IN")}`;
const MOCK  = [
  {id:1,name:"Emergency Fund",targetAmount:300000,savedAmount:120000,deadline:"2025-12-31",icon:"\ud83d\udcb0"},
  {id:2,name:"Goa Trip",       targetAmount:50000, savedAmount:32000, deadline:"2025-06-30",icon:"\u2708\ufe0f"},
  {id:3,name:"New MacBook",    targetAmount:150000,savedAmount:45000, deadline:"2025-09-30",icon:"\ud83d\udcf1"},
];

function daysLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function urgencyColor(days) {
  if (days < 30)  return "var(--red)";
  if (days < 90)  return "var(--amber)";
  return "var(--green)";
}

export default function Goals() {
  const [goals,setGoals]         = useState([]);
  const [loading,setLoading]     = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [depositId,setDepositId] = useState(null);
  const [depositAmt,setDepositAmt] = useState("");
  const [saving,setSaving]       = useState(false);
  const [form,setForm]           = useState(INIT);

  useEffect(() => {
    api.get("/goals")
      .then(setGoals)
      .catch(() => setGoals(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const field = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount || 0) };
    try {
      const saved = await api.post("/goals", payload);
      setGoals(p => [...p, saved]);
    } catch {
      setGoals(p => [...p, { ...payload, id: Date.now() }]);
    } finally { setSaving(false); setShowModal(false); setForm(INIT); }
  }

  async function handleDeposit() {
    if (!depositAmt || isNaN(depositAmt)) return;
    const amt = Number(depositAmt);
    try {
      const updated = await api.patch(`/goals/${depositId}/deposit`, { amount: amt });
      setGoals(p => p.map(g => g.id === depositId ? updated : g));
    } catch {
      setGoals(p => p.map(g => g.id === depositId ? { ...g, savedAmount: Number(g.savedAmount) + amt } : g));
    } finally { setDepositId(null); setDepositAmt(""); }
  }

  function handleDelete(id) {
    api.delete(`/goals/${id}`).catch(() => {});
    setGoals(p => p.filter(g => g.id !== id));
  }

  const totalTarget = goals.reduce((a, g) => a + Number(g.targetAmount), 0);
  const totalSaved  = goals.reduce((a, g) => a + Number(g.savedAmount),  0);
  const completed   = goals.filter(g => Number(g.savedAmount) >= Number(g.targetAmount)).length;

  return (
    <div className="fade-up">
      <PageHeader
        title="Savings Goals"
        subtitle={`${goals.length} active goals · ${completed} completed`}
        action={<Button onClick={() => setShowModal(true)}>+ New Goal</Button>}
      />

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Target", value:fmt(totalTarget), color:"var(--accent)" },
          { label:"Total Saved",  value:fmt(totalSaved),  color:"var(--green)"  },
          { label:"Completed",    value:`${completed} / ${goals.length}`, color: completed===goals.length&&goals.length>0?"var(--green)":"var(--text-primary)" },
        ].map(s => (
          <Card key={s.label} style={{ padding:"1.25rem 1.5rem" }}>
            <p style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, fontFamily:"var(--font-display)", marginBottom:8 }}>{s.label}</p>
            <p style={{ fontSize:24, fontWeight:700, fontFamily:"var(--font-display)", color:s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {[...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height:200, borderRadius:"var(--radius-lg)" }}/>)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState icon="\u25ce" title="No goals yet" description="Set a savings goal to start tracking your progress"/>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {goals.map(g => {
            const target  = Number(g.targetAmount);
            const saved   = Number(g.savedAmount);
            const pct     = target ? Math.min(Math.round((saved / target) * 100), 100) : 0;
            const done    = saved >= target;
            const days    = daysLeft(g.deadline);
            const monthly = days > 0 ? Math.ceil((target - saved) / (days / 30)) : 0;

            return (
              <Card key={g.id} style={{ border:`1px solid ${done ? "rgba(0,229,160,0.3)" : "var(--border)"}`, position:"relative" }}>
                {done && (
                  <div style={{ position:"absolute", top:12, right:12, background:"var(--green-dim)", color:"var(--green)", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, border:"1px solid rgba(0,229,160,0.3)" }}>
                    Achieved \u2713
                  </div>
                )}

                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:"var(--radius-md)", background:"var(--bg-raised)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {g.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.name}</p>
                    <p style={{ fontSize:11, color: urgencyColor(days) }}>
                      {done ? "Goal reached!" : `${days} days left · ${g.deadline}`}
                    </p>
                  </div>
                  {!done && (
                    <button onClick={() => handleDelete(g.id)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:18, lineHeight:1, flexShrink:0 }}>×</button>
                  )}
                </div>

                {/* Progress */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:8 }}>
                    <span style={{ color:"var(--text-secondary)" }}>Saved: <strong style={{ color:"var(--text-primary)" }}>{fmt(saved)}</strong></span>
                    <span style={{ color:"var(--text-muted)" }}>of {fmt(target)}</span>
                  </div>
                  <ProgressBar value={saved} max={target} colorOverride={done ? "var(--green)" : undefined}/>
                </div>

                {/* Stats */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:done?0:12 }}>
                  <span style={{ fontSize:26, fontWeight:800, fontFamily:"var(--font-display)", color: done ? "var(--green)" : "var(--accent)" }}>
                    {pct}%
                  </span>
                  {!done && (
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:11, color:"var(--text-muted)" }}>Monthly needed</p>
                      <p style={{ fontSize:13, fontWeight:700, color:"var(--amber)" }}>{fmt(monthly)}/mo</p>
                    </div>
                  )}
                </div>

                {/* Deposit button */}
                {!done && (
                  <Button variant="secondary" size="sm" onClick={() => setDepositId(g.id)} style={{ width:"100%", marginTop:4 }}>
                    + Add Savings
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <Modal title="New Savings Goal" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Icon picker */}
            <div>
              <label style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:500, display:"block", marginBottom:8 }}>Icon</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon:ic }))}
                    style={{ width:40, height:40, borderRadius:"var(--radius-md)", fontSize:20, border:`1px solid ${form.icon===ic?"var(--accent)":"var(--border)"}`, background:form.icon===ic?"var(--accent-dim)":"var(--bg-raised)", cursor:"pointer", transition:"all 0.15s" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Goal name" placeholder="e.g. Emergency Fund" value={form.name} onChange={field("name")} required/>
            <Input label={`Target amount (\u20b9)`} type="number" min="1" placeholder="100000" value={form.targetAmount} onChange={field("targetAmount")} required/>
            <Input label={`Already saved (\u20b9)`} type="number" min="0" placeholder="0" value={form.savedAmount} onChange={field("savedAmount")}/>
            <Input label="Deadline" type="date" value={form.deadline} onChange={field("deadline")} required/>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <Button type="submit" loading={saving} style={{ flex:1 }}>Create Goal</Button>
              <Button variant="secondary" onClick={() => setShowModal(false)} style={{ flex:1 }}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deposit Modal */}
      {depositId && (
        <Modal title="Add Savings" onClose={() => { setDepositId(null); setDepositAmt(""); }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <p style={{ fontSize:13, color:"var(--text-secondary)" }}>
              How much are you adding to <strong style={{ color:"var(--text-primary)" }}>{goals.find(g=>g.id===depositId)?.name}</strong>?
            </p>
            <Input label={`Amount (\u20b9)`} type="number" min="1" placeholder="5000" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} autoFocus/>
            <div style={{ display:"flex", gap:10 }}>
              <Button onClick={handleDeposit} style={{ flex:1 }}>Add Savings</Button>
              <Button variant="secondary" onClick={() => { setDepositId(null); setDepositAmt(""); }} style={{ flex:1 }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
