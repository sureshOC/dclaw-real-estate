"use client";

import { useState } from "react";
import { authHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const SUGGESTED = [
  "Late rent this month",
  "Leases expiring in 60 days",
  "Properties with open maintenance requests",
  "Vacant properties",
  "All tenants",
  "Emergency maintenance requests",
];

interface QueryResult {
  query_interpreted: string;
  results: Record<string, unknown>[];
  result_count: number;
  suggested_followups: string[];
}

export default function AIQueryPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  async function runQuery(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setQuestion(q);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setHistory((h) => [q, ...h.filter((x) => x !== q)].slice(0, 10));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  }

  function getColumns(results: Record<string, unknown>[]): string[] {
    if (!results.length) return [];
    return Object.keys(results[0]).filter((k) => k !== "type");
  }

  return (
    <main>
      <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-2)" }}>AI Query Interface</h1>
      <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-6)" }}>
        Ask questions about your portfolio in plain English.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--dk-space-6)", alignItems: "start" }}>
        {/* Sidebar */}
        <div>
          <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-5)", marginBottom: "var(--dk-space-4)" }}>
            <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-3)" }}>Suggested Queries</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-2)" }}>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => runQuery(s)}
                  className="dk-meta"
                  style={{
                    textAlign: "left",
                    background: "none",
                    border: "1px solid var(--dk-border)",
                    borderRadius: "var(--dk-radius-md)",
                    padding: "var(--dk-space-2) var(--dk-space-3)",
                    cursor: "pointer",
                    color: "var(--dk-fg-2)",
                    transition: "border-color 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-5)" }}>
              <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-3)" }}>History</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-2)" }}>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => runQuery(h)}
                    className="dk-caption"
                    style={{
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--dk-brand)",
                      padding: 0,
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main */}
        <div>
          <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)", marginBottom: "var(--dk-space-4)" }}>
            <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runQuery(question)}
                placeholder="e.g. Show me tenants with late payments this month..."
                style={{
                  flex: 1,
                  padding: "var(--dk-space-3) var(--dk-space-4)",
                  border: "1px solid var(--dk-border)",
                  borderRadius: "var(--dk-radius-md)",
                  fontSize: "var(--dk-text-sm)",
                  fontFamily: "var(--dk-font-body)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => runQuery(question)}
                disabled={loading || !question.trim()}
                style={{
                  backgroundColor: "var(--dk-brand)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--dk-radius-pill)",
                  padding: "var(--dk-space-3) var(--dk-space-5)",
                  fontFamily: "var(--dk-font-display)",
                  fontWeight: "var(--dk-weight-semibold)",
                  fontSize: "var(--dk-text-sm)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Searching..." : "Ask →"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "var(--dk-danger-bg)", border: "1px solid var(--dk-danger)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)", marginBottom: "var(--dk-space-4)", color: "var(--dk-danger)" }} className="dk-meta">
              {error}
            </div>
          )}

          {result && (
            <div style={{ backgroundColor: "var(--dk-bg)", borderRadius: "var(--dk-radius-lg)", boxShadow: "var(--dk-shadow-sm)", padding: "var(--dk-space-6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--dk-space-4)" }}>
                <div>
                  <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-1)" }}>Interpreted as</p>
                  <p className="dk-body" style={{ color: "var(--dk-fg)" }}>{result.query_interpreted}</p>
                </div>
                <span style={{ backgroundColor: "var(--dk-brand-soft)", color: "var(--dk-brand)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-1) var(--dk-space-3)" }} className="dk-meta">
                  {result.result_count} result{result.result_count !== 1 ? "s" : ""}
                </span>
              </div>

              {result.results.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {getColumns(result.results).map((col) => (
                          <th key={col} className="dk-caption" style={{ textAlign: "left", padding: "var(--dk-space-2) var(--dk-space-3)", borderBottom: "1px solid var(--dk-border)", color: "var(--dk-fg-2)" }}>
                            {col.replace(/_/g, " ").toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((row, i) => (
                        <tr key={i}>
                          {getColumns(result.results).map((col) => (
                            <td key={col} className="dk-meta" style={{ padding: "var(--dk-space-2) var(--dk-space-3)", borderBottom: "1px solid var(--dk-bg-muted)", color: "var(--dk-fg)" }}>
                              {String(row[col] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dk-body" style={{ color: "var(--dk-fg-2)", textAlign: "center", padding: "var(--dk-space-8)" }}>
                  No results found for this query.
                </p>
              )}

              {result.suggested_followups.length > 0 && (
                <div style={{ marginTop: "var(--dk-space-6)" }}>
                  <p className="dk-eyebrow" style={{ marginBottom: "var(--dk-space-3)" }}>Try next</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dk-space-2)" }}>
                    {result.suggested_followups.map((f) => (
                      <button
                        key={f}
                        onClick={() => runQuery(f)}
                        className="dk-meta"
                        style={{
                          background: "none",
                          border: "1px solid var(--dk-brand)",
                          borderRadius: "var(--dk-radius-pill)",
                          padding: "var(--dk-space-1) var(--dk-space-4)",
                          cursor: "pointer",
                          color: "var(--dk-brand)",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
