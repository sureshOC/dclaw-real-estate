const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.dclaw.ai";

/* ─── shared style helpers ────────────────────────────────────────────── */
const btn = (variant: "primary" | "outline" | "ghost"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 28px",
  borderRadius: "var(--radius-pill)",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "var(--font)",
  border: "none",
  cursor: "pointer",
  transition: "opacity .15s, transform .1s",
  ...(variant === "primary" && {
    background: "var(--brand)",
    color: "var(--white)",
  }),
  ...(variant === "outline" && {
    background: "transparent",
    color: "var(--brand)",
    border: "1.5px solid var(--brand)",
  }),
  ...(variant === "ghost" && {
    background: "transparent",
    color: "var(--gray-1)",
    padding: "10px 16px",
  }),
});

const section: React.CSSProperties = {
  maxWidth: "1160px",
  margin: "0 auto",
  padding: "0 24px",
};

/* ─── data ────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "🧠",
    title: "AI Tenant Screening",
    desc: "Income-to-rent ratio checks, eviction history flags, and Claude-powered risk reports in seconds. Know who you're renting to before signing.",
  },
  {
    icon: "💰",
    title: "Rent Collection & Tracking",
    desc: "Mark payments, apply late fees automatically, and see your entire rent roll in one dashboard. ACH collection coming — 0.5% platform fee.",
  },
  {
    icon: "📊",
    title: "Portfolio Health Score",
    desc: "AI generates a 0–100 grade for your entire portfolio every day. Occupancy, payment rate, maintenance backlog, lease renewal risk — one number.",
  },
  {
    icon: "💬",
    title: "Natural Language Queries",
    desc: 'Ask "which tenants have late payments?" or "leases expiring in 60 days?" in plain English. Live DB results, no SQL needed.',
  },
  {
    icon: "🔧",
    title: "Vendor Auto-Dispatch",
    desc: "Submit a maintenance request and AI picks the best available vendor by specialty and rating — then assigns them instantly.",
  },
  {
    icon: "📄",
    title: "AI Lease Abstraction",
    desc: "Upload any lease PDF and Claude extracts rent, deposit, dates, late fee clause, pet policy, and renewal terms into structured fields.",
  },
  {
    icon: "🏢",
    title: "Financial Analytics",
    desc: "Per-property NOI, cap rate, and P&L. Expense tracking by category. Portfolio-level financials. The reports your accountant and bank need.",
  },
  {
    icon: "📱",
    title: "Tenant Self-Service Portal",
    desc: "Tenants log in with a portal code to view their lease, check payment history, and submit maintenance requests — without calling you.",
  },
  {
    icon: "📥",
    title: "Bulk CSV Import",
    desc: "Migrate your entire portfolio from Excel in minutes. Flexible header detection handles any column naming convention.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Register your org",
    desc: "Create your account in 30 seconds — no credit card required. Invite your team with role-based access (owner, manager, maintenance tech, accountant).",
  },
  {
    n: "02",
    title: "Import your portfolio",
    desc: "Upload a CSV or add properties manually. Tenants and leases sync instantly. Existing data migrates in minutes, not weeks.",
  },
  {
    n: "03",
    title: "Let AI work for you",
    desc: "Your portfolio health score updates daily. Late rent alerts fire automatically. Vendors get auto-dispatched. You focus on growth.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    limit: "Up to 3 units",
    highlight: false,
    features: [
      "Property & tenant CRUD",
      "Maintenance requests",
      "Basic dashboard",
      "Document vault",
      "Market comps",
    ],
    cta: "Start free",
  },
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    limit: "Up to 20 units",
    highlight: true,
    features: [
      "Everything in Free",
      "AI tenant screening",
      "Rent payment tracker",
      "Lease lifecycle alerts",
      "Bulk CSV import",
      "Email notifications",
      "Vendor management",
      "Financial analytics (NOI)",
    ],
    cta: "Start free trial",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ month",
    limit: "Up to 100 units",
    highlight: false,
    features: [
      "Everything in Starter",
      "Portfolio health score",
      "Natural language query",
      "AI lease abstraction",
      "AI maintenance auto-dispatch",
      "Tenant self-service portal",
      "Portfolio benchmarking",
      "Priority support",
    ],
    cta: "Start free trial",
  },
];

const STATS = [
  { value: "500+", label: "Property managers" },
  { value: "$12M+", label: "Rent managed / mo" },
  { value: "50K+", label: "Units tracked" },
  { value: "4.9★", label: "Average rating" },
];

const FAQ = [
  {
    q: "Is my data safe?",
    a: "Yes. Every customer's data is fully isolated by organisation ID. No data is shared between accounts. All traffic is TLS-encrypted.",
  },
  {
    q: "Do I need an Anthropic API key?",
    a: "No. AI features work out of the box on Starter and Pro — the key is managed by DClaw. All AI features degrade gracefully if connectivity is interrupted.",
  },
  {
    q: "Can I import from AppFolio or Buildium?",
    a: "Yes. Export a CSV from any existing PM tool and import it directly. Our flexible header detection handles most column naming conventions automatically.",
  },
  {
    q: "What happens when I exceed my unit limit?",
    a: "You'll see a soft warning at 90% and a paywall banner at 100%. Existing data is never deleted — just upgrade to continue adding units.",
  },
  {
    q: "Is there a transaction fee on rent collection?",
    a: "ACH rent collection (coming soon) charges 0.5% of rent collected through the platform. On a 50-unit portfolio at $2,000/mo average rent, that's $500/mo in platform revenue.",
  },
];

/* ─── components ──────────────────────────────────────────────────────── */

function NavBar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--gray-4)",
      }}
    >
      <div
        style={{
          ...section,
          display: "flex",
          alignItems: "center",
          height: "64px",
          gap: "8px",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "auto" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            D
          </div>
          <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--ink)" }}>
            DClaw
            <span style={{ color: "var(--brand)", marginLeft: "1px" }}>RE</span>
          </span>
        </a>

        {/* Nav links — hidden on small screens via style */}
        <nav style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {["Features", "Pricing", "AI"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--gray-1)",
                transition: "background .15s",
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
          <a href={`${APP_URL}/login`} style={btn("ghost")}>Sign in</a>
          <a href={`${APP_URL}/register`} style={btn("primary")}>
            Start free →
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      style={{
        background: "linear-gradient(160deg, var(--brand-soft) 0%, var(--white) 60%)",
        padding: "100px 0 80px",
      }}
    >
      <div style={{ ...section, textAlign: "center" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--brand-soft)",
            border: "1px solid var(--brand-border)",
            borderRadius: "var(--radius-pill)",
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--brand)",
            marginBottom: "28px",
          }}
        >
          <span>✦</span> YC-backed · AI-native · Built for 2026
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: "var(--ink)",
            maxWidth: "820px",
            margin: "0 auto 24px",
          }}
        >
          Property management,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--brand) 0%, #B0A4CE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            powered by AI
          </span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: "20px",
            color: "var(--gray-2)",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Collect rent, screen tenants, manage maintenance, and get a daily AI health score
          for your entire portfolio — all in one platform.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`${APP_URL}/register`} style={{ ...btn("primary"), padding: "14px 32px", fontSize: "16px" }}>
            Start free — no card needed
          </a>
          <a href="#features" style={{ ...btn("outline"), padding: "14px 32px", fontSize: "16px" }}>
            See all features
          </a>
        </div>

        {/* Trust line */}
        <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--gray-3)" }}>
          Free plan forever · Upgrade anytime · No lock-in
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            flexWrap: "wrap",
            marginTop: "72px",
            paddingTop: "40px",
            borderTop: "1px solid var(--gray-4)",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--brand)",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: "13px", color: "var(--gray-2)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" style={{ background: "var(--gray-6)", padding: "100px 0" }}>
      <div style={section}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--brand)", textTransform: "uppercase", marginBottom: "12px" }}>
            Everything you need
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Built for how PMs actually work
          </h2>
          <p style={{ fontSize: "18px", color: "var(--gray-2)", maxWidth: "520px", margin: "0 auto" }}>
            Not a generic CRM retrofitted for property management. Every feature is designed for landlords and PMs.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
                padding: "28px",
                border: "1px solid var(--gray-4)",
                transition: "box-shadow .2s, transform .2s",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "16px",
                  width: "52px",
                  height: "52px",
                  background: "var(--brand-soft)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "var(--ink)" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--gray-2)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIShowcase() {
  return (
    <section id="ai" style={{ padding: "100px 0", background: "var(--white)" }}>
      <div style={section}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--brand)", textTransform: "uppercase", marginBottom: "12px" }}>
            The AI moat
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Your portfolio, understood by AI
          </h2>
          <p style={{ fontSize: "18px", color: "var(--gray-2)", maxWidth: "520px", margin: "0 auto" }}>
            Every lease, payment, and maintenance job trains our models — making screening, pricing, and dispatch smarter for everyone.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Health Score card */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--brand) 0%, #9384BD 100%)",
              borderRadius: "var(--radius-xl)",
              padding: "40px",
              color: "var(--white)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
            <p style={{ fontSize: "13px", fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
              Portfolio Health Score
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "80px", fontWeight: 800, lineHeight: 1 }}>84</span>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700 }}>/ 100</span>
                <p style={{ fontSize: "18px", fontWeight: 600, opacity: 0.85 }}>Grade B</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Occupancy", score: 92 },
                { label: "On-time Payments", score: 88 },
                { label: "Maintenance Backlog", score: 70 },
                { label: "Lease Renewals", score: 75 },
              ].map((b) => (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px", opacity: 0.85 }}>
                    <span>{b.label}</span><span>{b.score}/100</span>
                  </div>
                  <div style={{ height: "5px", background: "rgba(255,255,255,.25)", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${b.score}%`, background: "rgba(255,255,255,.85)", borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(255,255,255,.15)", borderRadius: "var(--radius-md)", fontSize: "13px", lineHeight: 1.5, opacity: 0.9 }}>
              💡 Strong occupancy and payments. 3 maintenance requests have been open more than 7 days — action recommended.
            </div>
          </div>

          {/* NL Query card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "var(--gray-6)", borderRadius: "var(--radius-xl)", padding: "32px", border: "1px solid var(--gray-4)", flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>
                Natural Language Query
              </p>
              <div style={{ background: "var(--white)", borderRadius: "var(--radius-md)", padding: "14px 18px", border: "1px solid var(--gray-4)", fontSize: "15px", color: "var(--gray-1)", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ color: "var(--brand)" }}>💬</span>
                "Show me tenants with late rent this month"
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "Sarah Chen — Unit 4B", amount: "$2,400", status: "14 days late" },
                  { name: "Marcus Lee — Unit 7A", amount: "$1,850", status: "5 days late" },
                  { name: "Priya Nair — Unit 2C", amount: "$3,100", status: "2 days late" },
                ].map((r) => (
                  <div key={r.name} style={{ background: "var(--white)", borderRadius: "var(--radius-sm)", padding: "12px 16px", border: "1px solid var(--gray-4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{r.name}</span>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600 }}>{r.amount}</p>
                      <p style={{ fontSize: "12px", color: "#B3261E" }}>{r.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                {["Apply late fees", "Email tenants", "View history"].map((s) => (
                  <span key={s} style={{ fontSize: "12px", background: "var(--brand-soft)", color: "var(--brand)", borderRadius: "var(--radius-pill)", padding: "4px 12px", fontWeight: 500 }}>
                    {s} →
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--ink)", borderRadius: "var(--radius-xl)", padding: "28px", color: "var(--white)" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, opacity: 0.5, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                AI Lease Abstraction
              </p>
              <p style={{ fontSize: "14px", opacity: 0.75, marginBottom: "16px" }}>
                Upload any lease PDF — Claude extracts all key terms in seconds.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {["Rent: $2,400/mo", "Deposit: $4,800", "End: 2026-08-31", "Late fee: $75 + 5%", "Pet policy: No", "Notice: 30 days"].map((t) => (
                  <div key={t} style={{ background: "rgba(255,255,255,.08)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", fontWeight: 500 }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section style={{ background: "var(--brand-soft)", padding: "100px 0" }}>
      <div style={section}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--brand)", textTransform: "uppercase", marginBottom: "12px" }}>
            Get started in minutes
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Up and running in 3 steps
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ position: "relative" }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: "absolute", top: "28px", right: "-16px", fontSize: "20px", color: "var(--brand-border)", zIndex: 1, display: "none" }}>→</div>
              )}
              <div
                style={{
                  background: "var(--white)",
                  borderRadius: "var(--radius-xl)",
                  padding: "36px",
                  boxShadow: "var(--shadow-sm)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: "44px",
                    fontWeight: 800,
                    color: "var(--brand-border)",
                    lineHeight: 1,
                    marginBottom: "20px",
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>{s.title}</h3>
                <p style={{ fontSize: "15px", color: "var(--gray-2)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={{ background: "var(--white)", padding: "100px 0" }}>
      <div style={section}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--brand)", textTransform: "uppercase", marginBottom: "12px" }}>
            Pricing
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: "18px", color: "var(--gray-2)", maxWidth: "440px", margin: "0 auto" }}>
            Start free, upgrade when you grow. No hidden fees, no lock-in.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {PLANS.map((p) => (
            <div
              key={p.name}
              style={{
                borderRadius: "var(--radius-xl)",
                padding: p.highlight ? "40px 36px" : "36px 32px",
                background: p.highlight ? "var(--brand)" : "var(--white)",
                border: p.highlight ? "none" : "1.5px solid var(--gray-4)",
                boxShadow: p.highlight ? "var(--shadow-lg)" : "var(--shadow-sm)",
                transform: p.highlight ? "scale(1.04)" : "scale(1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    background: "#FFD700",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderBottomLeftRadius: "var(--radius-md)",
                    letterSpacing: "0.5px",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <p style={{ fontSize: "20px", fontWeight: 700, color: p.highlight ? "rgba(255,255,255,.85)" : "var(--gray-2)", marginBottom: "4px" }}>
                {p.name}
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "4px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, color: p.highlight ? "var(--white)" : "var(--ink)" }}>
                  {p.price}
                </span>
                <span style={{ fontSize: "16px", color: p.highlight ? "rgba(255,255,255,.7)" : "var(--gray-2)", marginBottom: "8px" }}>
                  {p.period}
                </span>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: p.highlight ? "rgba(255,255,255,.7)" : "var(--gray-2)", marginBottom: "28px" }}>
                {p.limit}
              </p>
              <a
                href={`${APP_URL}/register`}
                style={{
                  ...btn(p.highlight ? "ghost" : "primary"),
                  display: "flex",
                  justifyContent: "center",
                  background: p.highlight ? "var(--white)" : "var(--brand)",
                  color: p.highlight ? "var(--brand)" : "var(--white)",
                  width: "100%",
                  marginBottom: "28px",
                  padding: "14px",
                  fontSize: "15px",
                }}
              >
                {p.cta}
              </a>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      gap: "10px",
                      fontSize: "14px",
                      color: p.highlight ? "rgba(255,255,255,.85)" : "var(--gray-1)",
                    }}
                  >
                    <span style={{ color: p.highlight ? "rgba(255,255,255,.7)" : "var(--success)", flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "var(--gray-2)" }}>
          Enterprise (100+ units)? <a href="mailto:hello@dclaw.ai" style={{ color: "var(--brand)", fontWeight: 600 }}>Contact us</a>
        </p>
      </div>
    </section>
  );
}

function FAQ_Section() {
  return (
    <section style={{ background: "var(--gray-6)", padding: "100px 0" }}>
      <div style={{ ...section, maxWidth: "800px" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.5px", textAlign: "center", marginBottom: "56px" }}>
          Frequently asked questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQ.map((item) => (
            <div
              key={item.q}
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius-lg)",
                padding: "24px 28px",
                border: "1px solid var(--gray-4)",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px", color: "var(--ink)" }}>
                {item.q}
              </p>
              <p style={{ fontSize: "14px", color: "var(--gray-2)", lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--brand) 0%, #9384BD 100%)",
        padding: "100px 0",
        textAlign: "center",
      }}
    >
      <div style={section}>
        <h2
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            color: "var(--white)",
            letterSpacing: "-1px",
            maxWidth: "700px",
            margin: "0 auto 20px",
            lineHeight: 1.15,
          }}
        >
          Ready to manage smarter?
        </h2>
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,.8)",
            maxWidth: "500px",
            margin: "0 auto 40px",
          }}
        >
          Join 500+ property managers who've moved to AI-native property management.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={`${APP_URL}/register`}
            style={{
              ...btn("primary"),
              background: "var(--white)",
              color: "var(--brand)",
              padding: "16px 36px",
              fontSize: "16px",
            }}
          >
            Start free — no card needed
          </a>
          <a
            href={`${APP_URL}/login`}
            style={{
              ...btn("ghost"),
              color: "rgba(255,255,255,.85)",
              padding: "16px 28px",
              fontSize: "16px",
            }}
          >
            Sign in →
          </a>
        </div>
        <p style={{ marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,.55)" }}>
          Free plan · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "rgba(255,255,255,.6)", padding: "60px 0 40px" }}>
      <div style={section}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "14px" }}>D</div>
              <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--white)" }}>DClaw RE</span>
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.65, maxWidth: "280px" }}>
              AI-native property management for modern landlords and property managers. Built by a team obsessed with real estate operations.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "16px" }}>Product</p>
            {["Features", "Pricing", "AI Tools", "Changelog"].map((l) => (
              <a key={l} href="#" style={{ display: "block", fontSize: "14px", marginBottom: "10px", color: "rgba(255,255,255,.6)" }}>{l}</a>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "16px" }}>Company</p>
            {["About", "Blog", "Careers", "Contact"].map((l) => (
              <a key={l} href="#" style={{ display: "block", fontSize: "14px", marginBottom: "10px", color: "rgba(255,255,255,.6)" }}>{l}</a>
            ))}
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: "16px" }}>Legal</p>
            {["Privacy", "Terms", "Security", "Status"].map((l) => (
              <a key={l} href="#" style={{ display: "block", fontSize: "14px", marginBottom: "10px", color: "rgba(255,255,255,.6)" }}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "13px" }}>© 2026 DClaw Real Estate. All rights reserved.</p>
          <p style={{ fontSize: "13px" }}>
            Built with{" "}
            <a href="https://anthropic.com" style={{ color: "var(--brand)", fontWeight: 600 }}>Claude AI</a>
            {" "}·{" "}
            <a href="https://github.com/dclawstack/dclaw-real-estate" style={{ color: "rgba(255,255,255,.4)" }}>GitHub</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Features />
        <AIShowcase />
        <HowItWorks />
        <Pricing />
        <FAQ_Section />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
