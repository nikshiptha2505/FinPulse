import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatCard, Card, ProgressBar, AmountPill, PageHeader, Badge } from "../components/UI";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MOCK_SUMMARY = { totalBalance:142350, income:85000, expenses:38450, savings:46550 };
const MOCK_TX = [
  {id:1,description:"Salary Credit", category:"Income",        amount:85000, date:"2025-03-27"},
  {id:2,description:"Zepto",         category:"Groceries",     amount:-890,  date:"2025-03-26"},
  {id:3,description:"Netflix",       category:"Entertainment", amount:-649,  date:"2025-03-25"},
  {id:4,description:"Swiggy",        category:"Food",          amount:-340,  date:"2025-03-24"},
  {id:5,description:"Electricity",   category:"Utilities",     amount:-1250, date:"2025-03-23"},
  {id:6,description:"Freelance",     category:"Income",        amount:12000, date:"2025-03-22"},
];
const MOCK_BUDGETS = [
  {category:"Food",          spent:6200, limit:8000},
  {category:"Entertainment", spent:3400, limit:3000},
  {category:"Utilities",     spent:2100, limit:4000},
  {category:"Transport",     spent:1800, limit:3000},
];
const MOCK_AREA = [
  {month:"Oct",income:72000,expenses:30000},{month:"Nov",income:75000,expenses:35000},
  {month:"Dec",income:80000,expenses:42000},{month:"Jan",income:78000,expenses:38000},
  {month:"Feb",income:82000,expenses:36000},{month:"Mar",income:85000,expenses:38450},
];
const PIE_COLORS = ["#00d4ff","#00e5a0","#ffb930","#ff4d6a","#8b5cf6"];
const fmt = (n) => `\u20b9${Number(n).toLocaleString("en-IN")}`;

function CTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"10px 14px"}}>
      <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>{label}</p>
      {payload.map(p=>(
        <p key={p.name} style={{fontSize:13,color:p.name==="income"?"var(--green)":"var(--red)",fontWeight:600}}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary,setSummary]=useState(null);
  const [transactions,setTx]=useState([]);
  const [budgets,setBudgets]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      try {
        const [s,t,b] = await Promise.all([
          api.get("/summary"),
          api.get("/transactions?page=0&size=6"),
          api.get("/budgets/progress"),
        ]);
        setSummary(s); setTx(t.content??t); setBudgets(b);
      } catch {
        setSummary(MOCK_SUMMARY); setTx(MOCK_TX); setBudgets(MOCK_BUDGETS);
      } finally { setLoading(false); }
    })();
  },[]);

  const greeting = ()=>{ const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

  if (loading) return (
    <div style={{display:"grid",gap:16}}>
      {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{height:100,borderRadius:"var(--radius-lg)"}}/>)}
    </div>
  );

  const pieData = budgets.slice(0,5).map(b=>({name:b.category,value:Number(b.spent)}));

  return (
    <div className="fade-up">
      <PageHeader title={`${greeting()}, ${user?.name?.split(" ")[0]||"there"} \ud83d\udc4b`} subtitle="Here's your financial pulse" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <StatCard label="Total Balance"  value={fmt(summary.totalBalance)} delta={4.2}  valueColor="var(--accent)" icon="\u25c8"/>
        <StatCard label="Monthly Income" value={fmt(summary.income)}       delta={0}    icon="\u2191"/>
        <StatCard label="Expenses"       value={fmt(summary.expenses)}     delta={-8.3} valueColor="var(--red)" icon="\u2193"/>
        <StatCard label="Net Savings"    value={fmt(summary.savings)}      delta={12.1} valueColor="var(--green)" icon="\u25ce"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:20,marginBottom:20}}>
        <Card>
          <p style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,marginBottom:20}}>Income vs Expenses</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_AREA} margin={{top:0,right:0,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e5a0" stopOpacity={0.25}/><stop offset="95%" stopColor="#00e5a0" stopOpacity={0}/></linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff4d6a" stopOpacity={0.25}/><stop offset="95%" stopColor="#ff4d6a" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`\u20b9${v/1000}k`}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="income"   stroke="#00e5a0" strokeWidth={2} fill="url(#gi)"/>
              <Area type="monotone" dataKey="expenses" stroke="#ff4d6a" strokeWidth={2} fill="url(#ge)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,marginBottom:16}}>Spend by Category</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:8}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
            {pieData.map((d,i)=>(
              <div key={d.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:99,background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                  <span style={{fontSize:12,color:"var(--text-secondary)"}}>{d.name}</span>
                </div>
                <span style={{fontSize:12,fontWeight:600}}>{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <p style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,marginBottom:16}}>Recent Transactions</p>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {transactions.slice(0,6).map(t=>(
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border-soft)"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500}}>{t.description}</p>
                  <p style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{t.category} \u00b7 {t.date}</p>
                </div>
                <AmountPill amount={t.amount}/>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,marginBottom:16}}>Budget Progress</p>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            {budgets.map(b=>{
              const cap = b.limit||b.limitAmount;
              const pct = Math.round((b.spent/cap)*100);
              return (
                <div key={b.category}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:500}}>{b.category}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {pct>100 && <Badge color="red">Over</Badge>}
                      <span style={{fontSize:12,color:pct>100?"var(--red)":"var(--text-muted)"}}>{fmt(b.spent)} / {fmt(cap)}</span>
                    </div>
                  </div>
                  <ProgressBar value={b.spent} max={cap}/>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
