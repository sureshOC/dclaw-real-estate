"use client";

import { useRef, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

type ImportType = "properties" | "tenants";
type Step = "upload" | "confirm" | "result";

interface ImportResult {
  created: number;
  error_count: number;
  total_rows: number;
  errors: { row: number; error: string }[];
}

export default function ImportPage() {
  const [type, setType] = useState<ImportType>("properties");
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setFile(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function runImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/import/${type}`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--dk-bg)",
    borderRadius: "var(--dk-radius-lg)",
    boxShadow: "var(--dk-shadow-sm)",
    padding: "var(--dk-space-8)",
  };

  return (
    <main>
      <h1 className="dk-h3" style={{ marginBottom: "var(--dk-space-2)" }}>Bulk CSV Import</h1>
      <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-6)" }}>
        Migrate your existing portfolio from Excel or CSV in minutes.
      </p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "var(--dk-space-3)", marginBottom: "var(--dk-space-6)" }}>
        {(["upload", "confirm", "result"] as Step[]).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-2)" }}>
            {i > 0 && <span style={{ color: "var(--dk-border)" }}>→</span>}
            <span
              className="dk-meta"
              style={{
                padding: "var(--dk-space-1) var(--dk-space-3)",
                borderRadius: "var(--dk-radius-pill)",
                backgroundColor: step === s ? "var(--dk-brand)" : "var(--dk-bg)",
                color: step === s ? "#fff" : "var(--dk-fg-2)",
                border: "1px solid",
                borderColor: step === s ? "var(--dk-brand)" : "var(--dk-border)",
                fontWeight: step === s ? "var(--dk-weight-semibold)" : undefined,
              }}
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: "var(--dk-space-3)", marginBottom: "var(--dk-space-6)" }}>
            {(["properties", "tenants"] as ImportType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="dk-meta"
                style={{
                  padding: "var(--dk-space-2) var(--dk-space-5)",
                  borderRadius: "var(--dk-radius-pill)",
                  border: "1px solid",
                  borderColor: type === t ? "var(--dk-brand)" : "var(--dk-border)",
                  backgroundColor: type === t ? "var(--dk-brand-soft)" : "transparent",
                  color: type === t ? "var(--dk-brand)" : "var(--dk-fg-2)",
                  cursor: "pointer",
                  fontWeight: type === t ? "var(--dk-weight-semibold)" : undefined,
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div
            style={{
              border: "2px dashed var(--dk-border)",
              borderRadius: "var(--dk-radius-lg)",
              padding: "var(--dk-space-12)",
              textAlign: "center",
              marginBottom: "var(--dk-space-6)",
            }}
          >
            <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-4)" }}>
              {file ? `✓ ${file.name}` : "Drop your CSV file here or click to browse"}
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                backgroundColor: "var(--dk-brand)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--dk-radius-pill)",
                padding: "var(--dk-space-3) var(--dk-space-6)",
                fontFamily: "var(--dk-font-display)",
                fontWeight: "var(--dk-weight-semibold)",
                fontSize: "var(--dk-text-sm)",
                cursor: "pointer",
              }}
            >
              Choose File
            </button>
          </div>

          <div style={{ backgroundColor: "var(--dk-bg-muted)", borderRadius: "var(--dk-radius-md)", padding: "var(--dk-space-4)", marginBottom: "var(--dk-space-6)" }}>
            <p className="dk-meta" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-2)" }}>
              <strong>Expected columns for {type}:</strong>
            </p>
            <p className="dk-caption" style={{ color: "var(--dk-fg-3)", fontFamily: "monospace" }}>
              {type === "properties"
                ? "title, address, city, state, zip, price, type, beds, baths, sqft"
                : "first_name, last_name, email, phone, rent"}
            </p>
          </div>

          {error && <p className="dk-meta" style={{ color: "var(--dk-danger)", marginBottom: "var(--dk-space-4)" }}>{error}</p>}

          <button
            disabled={!file}
            onClick={() => setStep("confirm")}
            style={{
              backgroundColor: file ? "var(--dk-brand)" : "var(--dk-border)",
              color: file ? "#fff" : "var(--dk-fg-3)",
              border: "none",
              borderRadius: "var(--dk-radius-pill)",
              padding: "var(--dk-space-3) var(--dk-space-6)",
              fontFamily: "var(--dk-font-display)",
              fontWeight: "var(--dk-weight-semibold)",
              fontSize: "var(--dk-text-sm)",
              cursor: file ? "pointer" : "not-allowed",
            }}
          >
            Preview & Confirm →
          </button>
        </div>
      )}

      {step === "confirm" && file && (
        <div style={cardStyle}>
          <h2 className="dk-h4" style={{ marginBottom: "var(--dk-space-4)" }}>Ready to import</h2>
          <p className="dk-body" style={{ color: "var(--dk-fg-2)", marginBottom: "var(--dk-space-6)" }}>
            Importing <strong>{file.name}</strong> as <strong>{type}</strong>.
            The system will skip duplicate emails and report any row errors.
          </p>
          {error && <p className="dk-meta" style={{ color: "var(--dk-danger)", marginBottom: "var(--dk-space-4)" }}>{error}</p>}
          <div style={{ display: "flex", gap: "var(--dk-space-3)" }}>
            <button onClick={reset} style={{ background: "none", border: "1px solid var(--dk-border)", borderRadius: "var(--dk-radius-pill)", padding: "var(--dk-space-3) var(--dk-space-5)", cursor: "pointer", fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-sm)" }}>
              ← Back
            </button>
            <button
              onClick={runImport}
              disabled={loading}
              style={{
                backgroundColor: "var(--dk-brand)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--dk-radius-pill)",
                padding: "var(--dk-space-3) var(--dk-space-6)",
                fontFamily: "var(--dk-font-display)",
                fontWeight: "var(--dk-weight-semibold)",
                fontSize: "var(--dk-text-sm)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Importing..." : "Run Import"}
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: "var(--dk-space-6)", marginBottom: "var(--dk-space-6)" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-3xl)", fontWeight: "var(--dk-weight-bold)", color: "var(--dk-success)" }}>{result.created}</p>
              <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>Created</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-3xl)", fontWeight: "var(--dk-weight-bold)", color: result.error_count > 0 ? "var(--dk-danger)" : "var(--dk-fg-2)" }}>{result.error_count}</p>
              <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>Errors</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--dk-font-display)", fontSize: "var(--dk-text-3xl)", fontWeight: "var(--dk-weight-bold)", color: "var(--dk-fg)" }}>{result.total_rows}</p>
              <p className="dk-meta" style={{ color: "var(--dk-fg-2)" }}>Total Rows</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginBottom: "var(--dk-space-6)" }}>
              <p className="dk-meta" style={{ color: "var(--dk-danger)", marginBottom: "var(--dk-space-3)" }}>Row errors:</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="dk-caption" style={{ textAlign: "left", padding: "var(--dk-space-2)", borderBottom: "1px solid var(--dk-border)" }}>Row</th>
                    <th className="dk-caption" style={{ textAlign: "left", padding: "var(--dk-space-2)", borderBottom: "1px solid var(--dk-border)" }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e) => (
                    <tr key={e.row}>
                      <td className="dk-meta" style={{ padding: "var(--dk-space-2)", color: "var(--dk-fg-2)" }}>{e.row}</td>
                      <td className="dk-meta" style={{ padding: "var(--dk-space-2)", color: "var(--dk-danger)" }}>{e.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={reset}
            style={{
              backgroundColor: "var(--dk-brand)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--dk-radius-pill)",
              padding: "var(--dk-space-3) var(--dk-space-6)",
              fontFamily: "var(--dk-font-display)",
              fontWeight: "var(--dk-weight-semibold)",
              fontSize: "var(--dk-text-sm)",
              cursor: "pointer",
            }}
          >
            Import Another File
          </button>
        </div>
      )}
    </main>
  );
}
