import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Card, Button, Input, Select, Modal, Badge, AmountPill, PageHeader, EmptyState } from "../components/UI";

const CATEGORIES = ["Food","Income","Entertainment","Utilities","Transport","Groceries","Health","Shopping","Other"];
const INIT = { description:"", amount:"", category:"Food", type:"EXPENSE", date:new Date().toISOString().slice(0,10) };
const fmt = (n) => `\u20b9${Math.abs(Number(n)).toLocaleString("en-IN")}`;

const MOCK = [
  {id:1,description:"Salary Credit",  category:"Income",        amount:85000, date:"2025-03-27",type:"INCOME"},
  {id:2,description:"Swiggy",         category:"Food",          amount:-340,  date:"2025-03-26",type:"EXPENSE"},
  {id:3,description:"Netflix",        category:"Entertainment", amount:-649,  date:"2025-03-25",type:"EXPENSE"},
  {id:4,description:"Electricity",    category:"Utilities",     amount:-1250, date:"2025-03-24",type:"EXPENSE"},
  {id:5,description:"Zepto",          category:"Groceries",     amount:-890,  date:"2025-03-23",type:"EXPENSE"},
  {id:6,description:"Freelance",      category:"Income",        amount:12000, date:"2025-03-22",type:"INCOME"},
  {id:7,description:"Ola Cabs",       category:"Transport",     amount:-430,  date:"2025-03-21",type:"EXPENSE"},
  {id:8,description:"Apollo Pharmacy",category:"Health",        amount:-580,  date:"2025-03-20",type:"EXPENSE"},
];

function catColor(cat) {
  const map = {Income:"green",Food:"accent",Entertainment:"amber",Utilities:"amber",Health:"accent",Transport:"default",Groceries:"default",Shopping:"amber"};
  return map[cat]||"default";
}

export default function Transactions() {
  const [items,setItems]         = useState([]);
  const [loading,setLoading]     = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [saving,setSaving]       = useState(false);
  const [form,setForm]           = useState(INIT);
  const [search,setSearch]       = useState("");
  const [catFilter,setCatFilter] = useState("All");

  useEffect(()=>{
    api.get("/transactions?page=0&size=50")
      .then(d=>setItems(d.content??d))
      .catch(()=>setItems(MOCK))
      .finally(()=>setLoading(false));
  },[]);

  const filtered = items.filter(t=>{
    const ok1 = catFilter==="All"||t.category===catFilter;
    const ok2 = t.description.toLowerCase().includes(search.toLowerCase());
    return ok1&&ok2;
  });

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, amount: form.type==="EXPENSE" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount)) };
    try {
      const saved = await api.post("/transactions", payload);
      setItems(p=>[saved,...p]);
    } catch {
      setItems(p=>[{...payload,id:Date.now()},...p]);
    } finally { setSaving(false); setShowModal(false); setForm(INIT); }
  }

  function handleDelete(id) {
    api.delete(`/transactions/${id}`).catch(()=>{});
    setItems(p=>p.filter(t=>t.id!==id));
  }

  return (
    <div className="fade-up">
      <PageHeader
        title="Transactions"
        subtitle={`${items.length} total transactions`}
        action={<Button onClick={()=>setShowModal(true)}>+ Add Transaction</Button>}
      />

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <Input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:220}}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All",...CATEGORIES].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{
              padding:"6px 12px",borderRadius:99,border:"1px solid",fontSize:12,cursor:"pointer",transition:"all 0.15s",
              borderColor:catFilter===c?"var(--accent)":"var(--border)",
              background:catFilter===c?"var(--accent-dim)":"transparent",
              color:catFilter===c?"var(--accent)":"var(--text-secondary)",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        {loading ? (
          <div style={{padding:"2rem"}}>
            {[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{height:52,marginBottom:8,borderRadius:8}}/>)}
          </div>
        ) : filtered.length===0 ? (
          <EmptyState icon="\u21c4" title="No transactions found" description="Add your first transaction or adjust filters"/>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--border)"}}>
                {["Description","Category","Date","Amount",""].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"12px 16px",fontSize:11,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--font-display)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id} style={{borderBottom:"1px solid var(--border-soft)",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-raised)"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:500}}>{t.description}</td>
                  <td style={{padding:"13px 16px"}}><Badge color={catColor(t.category)}>{t.category}</Badge></td>
                  <td style={{padding:"13px 16px",fontSize:12,color:"var(--text-muted)"}}>{t.date}</td>
                  <td style={{padding:"13px 16px"}}><AmountPill amount={t.amount}/></td>
                  <td style={{padding:"13px 16px",textAlign:"right"}}>
                    <button onClick={()=>handleDelete(t.id)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:18,lineHeight:1,padding:4}}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add Transaction" onClose={()=>setShowModal(false)}>
          <form onSubmit={handleSave} style={{display:"flex",flexDirection:"column",gap:14}}>
            <Input label="Description" placeholder="e.g. Swiggy order" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} required/>
            <Input label="Amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} required/>
            <Select label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </Select>
            <div>
              <label style={{fontSize:12,color:"var(--text-secondary)",fontWeight:500,display:"block",marginBottom:6}}>Type</label>
              <div style={{display:"flex",gap:8}}>
                {["EXPENSE","INCOME"].map(t=>(
                  <button key={t} type="button" onClick={()=>setForm(p=>({...p,type:t}))} style={{
                    flex:1,padding:"9px",borderRadius:"var(--radius-md)",border:"1px solid",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.15s",
                    borderColor:form.type===t?(t==="INCOME"?"var(--green)":"var(--red)"):"var(--border)",
                    background:form.type===t?(t==="INCOME"?"var(--green-dim)":"var(--red-dim)"):"transparent",
                    color:form.type===t?(t==="INCOME"?"var(--green)":"var(--red)"):"var(--text-secondary)",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <Input label="Date" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} required/>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <Button type="submit" loading={saving} style={{flex:1}}>Save Transaction</Button>
              <Button variant="secondary" onClick={()=>setShowModal(false)} style={{flex:1}}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
