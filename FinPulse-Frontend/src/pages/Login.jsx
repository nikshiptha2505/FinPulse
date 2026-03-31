import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/UI";

export default function Login() {
  const { onLogin }           = useAuth();
  const navigate              = useNavigate();
  const [mode, setMode]       = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });

  const field = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = mode === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      onLogin({ name: data.name, email: data.email }, data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:500, height:500, background:"radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
      <div className="fade-up" style={{ width:"100%", maxWidth:420, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:"2.5rem", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:800, letterSpacing:"-1px", marginBottom:6 }}>
            <span style={{ color:"var(--accent)" }}>Fin</span><span style={{ color:"var(--text-primary)" }}>Pulse</span>
          </div>
          <p style={{ fontSize:13, color:"var(--text-secondary)" }}>{mode==="login" ? "Sign in to your account" : "Create your free account"}</p>
        </div>
        <div style={{ display:"flex", background:"var(--bg-raised)", borderRadius:"var(--radius-md)", padding:4, marginBottom:"1.5rem" }}>
          {["login","register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex:1, padding:"8px", borderRadius:"var(--radius-sm)", border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                background: mode===m ? "var(--bg-card)" : "transparent",
                color: mode===m ? "var(--accent)" : "var(--text-secondary)",
                boxShadow: mode===m ? "0 1px 6px rgba(0,0,0,0.3)" : "none" }}>
              {m==="login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {mode==="register" && <Input label="Full name" type="text" placeholder="Arjun Sharma" value={form.name} onChange={field("name")} required />}
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={field("email")} required />
          <Input label={mode==="register" ? "Password (min 8 chars)" : "Password"} type="password" placeholder="••••••••" value={form.password} onChange={field("password")} required minLength={8} />
          {error && <div style={{ background:"var(--red-dim)", border:"1px solid rgba(255,77,106,0.25)", borderRadius:"var(--radius-md)", padding:"10px 14px", fontSize:13, color:"var(--red)" }}>{error}</div>}
          <Button type="submit" loading={loading} size="lg" style={{ width:"100%", marginTop:4 }}>
            {mode==="login" ? "Sign In" : "Create Account"}
          </Button>
        </form>
        <p style={{ textAlign:"center", marginTop:"1.25rem", fontSize:12, color:"var(--text-muted)" }}>
          {mode==="login"
            ? <><span>No account? </span><span onClick={() => setMode("register")} style={{ color:"var(--accent)", cursor:"pointer" }}>Register free</span></>
            : <><span>Already registered? </span><span onClick={() => setMode("login")} style={{ color:"var(--accent)", cursor:"pointer" }}>Sign in</span></>}
        </p>
      </div>
    </div>
  );
}
