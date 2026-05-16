"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getDocuments, uploadDocument, deleteDocument, getDocumentDownloadUrl, type Document, type DocumentCategory } from "@/lib/api";

const CAT_COLORS: Record<string, string> = {
  lease:      "var(--dk-brand)",
  inspection: "var(--dk-info)",
  insurance:  "var(--dk-success)",
  photo:      "var(--dk-warning)",
  other:      "var(--dk-fg-2)",
};

function formatBytes(b?: number) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function PropertyDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("other");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const load = () => {
    setLoading(true);
    getDocuments({ property_id: id })
      .then(setDocs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("property_id", id);
        fd.append("category", category);
        fd.append("file", file);
        await uploadDocument(fd);
      }
      load();
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(docId);
    load();
  };

  return (
    <main>
      <div style={{ marginBottom: "var(--dk-space-6)" }}>
        <p className="dk-eyebrow">Property</p>
        <h1 className="dk-h3">Document Vault</h1>
      </div>

      {error && <p style={{ color: "var(--dk-danger)" }} className="dk-meta">{error}</p>}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--dk-brand)" : "var(--dk-border)"}`,
          borderRadius: "var(--dk-radius-lg)",
          padding: "var(--dk-space-8)",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragging ? "var(--dk-brand-soft)" : "var(--dk-bg)",
          marginBottom: "var(--dk-space-6)",
          transition: "all var(--dk-dur-fast) var(--dk-ease-out)",
        }}
      >
        <p className="dk-body" style={{ color: "var(--dk-fg-2)" }}>
          {uploading ? "Uploading…" : "Drag & drop files here, or click to browse"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--dk-space-3)", marginTop: "var(--dk-space-4)" }}>
          <span className="dk-meta">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "var(--dk-space-1) var(--dk-space-3)", borderRadius: "var(--dk-radius-sm)", border: "1px solid var(--dk-border)", fontSize: "var(--dk-text-sm)" }}
          >
            {["lease", "inspection", "insurance", "photo", "other"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleUpload(e.target.files)} />
        {uploadError && <p style={{ color: "var(--dk-danger)", marginTop: "var(--dk-space-3)" }} className="dk-meta">{uploadError}</p>}
      </div>

      {/* Document list */}
      {loading && <p className="dk-meta">Loading…</p>}
      {!loading && docs.length === 0 && (
        <p className="dk-meta" style={{ color: "var(--dk-fg-muted)" }}>No documents uploaded yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--dk-space-3)" }}>
        {docs.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: "var(--dk-bg)",
              borderRadius: "var(--dk-radius-md)",
              boxShadow: "var(--dk-shadow-xs)",
              padding: "var(--dk-space-4) var(--dk-space-5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--dk-space-4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--dk-space-4)", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "24px" }}>
                {doc.category === "photo" ? "🖼" : doc.mime_type?.includes("pdf") ? "📄" : "📎"}
              </span>
              <div style={{ minWidth: 0 }}>
                <p className="dk-body" style={{ fontWeight: "var(--dk-weight-semibold)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</p>
                <div style={{ display: "flex", gap: "var(--dk-space-3)", alignItems: "center", marginTop: "2px" }}>
                  <span
                    style={{
                      backgroundColor: "var(--dk-bg-muted)",
                      color: CAT_COLORS[doc.category] ?? "var(--dk-fg-2)",
                      borderRadius: "var(--dk-radius-pill)",
                      padding: "1px 8px",
                      fontSize: "var(--dk-text-xs)",
                      fontWeight: "var(--dk-weight-semibold)",
                      textTransform: "capitalize",
                    }}
                  >
                    {doc.category}
                  </span>
                  <span className="dk-caption">{formatBytes(doc.file_size)}</span>
                  <span className="dk-caption">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--dk-space-3)", flexShrink: 0 }}>
              <a
                href={getDocumentDownloadUrl(doc.id)}
                download
                style={{
                  backgroundColor: "var(--dk-brand-soft)",
                  color: "var(--dk-brand)",
                  borderRadius: "var(--dk-radius-md)",
                  padding: "var(--dk-space-2) var(--dk-space-4)",
                  fontSize: "var(--dk-text-sm)",
                  fontWeight: "var(--dk-weight-semibold)",
                  textDecoration: "none",
                }}
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                style={{ backgroundColor: "transparent", color: "var(--dk-danger)", border: "none", cursor: "pointer", fontSize: "var(--dk-text-sm)" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
