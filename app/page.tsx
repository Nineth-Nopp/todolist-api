"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

type Filter = "all" | "active" | "completed";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ─── Helper ────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Toast Component ──────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error";
  visible: boolean;
}
function Toast({ message, type, visible }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999,
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: type === "success"
          ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))"
          : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))",
        border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: type === "success" ? "#10b981" : "#ef4444",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: 16 }}>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  todo: Todo | null;
  onClose: () => void;
  onSave: (id: number, title: string, description: string) => Promise<void>;
  saving: boolean;
}
function EditModal({ todo, onClose, onSave, saving }: EditModalProps) {
  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description ?? "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(todo.id, title.trim(), description.trim());
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(135deg, #1a1a2e, #16162a)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
          animation: "fadeInUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            แก้ไข Task
          </h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: "6px 8px" }}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              ชื่อ Task
            </label>
            <input
              ref={inputRef}
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่อ task..."
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              รายละเอียด
            </label>
            <textarea
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
              rows={3}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !title.trim()}
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {saving ? <div className="spinner" /> : <SaveIcon />}
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" }>({ message: "", type: "success" });
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  // ── Fetch todos ──
  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch {
      showToast("โหลด task ไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ── Add todo ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
      setNewDescription("");
      setAddingNote(false);
      showToast("เพิ่ม task สำเร็จ! 🎉");
    } catch {
      showToast("เพิ่ม task ไม่สำเร็จ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle complete ──
  const handleToggle = async (todo: Todo) => {
    setTogglingId(todo.id);
    try {
      const res = await fetch(`/api/todos?id=${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todo.title, description: todo.description, completed: !todo.completed }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      showToast(updated.completed ? "เสร็จแล้ว! ✨" : "ยังไม่เสร็จ");
    } catch {
      showToast("อัปเดตสถานะไม่สำเร็จ", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Edit save ──
  const handleEditSave = async (id: number, title: string, description: string) => {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/todos?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || null }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditTodo(null);
      showToast("บันทึกการแก้ไขแล้ว ✓");
    } catch {
      showToast("แก้ไขไม่สำเร็จ", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== id));
      showToast("ลบ task แล้ว");
    } catch {
      showToast("ลบไม่สำเร็จ", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtered todos ──
  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const progressPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <>
      <Toast message={toast.message} type={toast.type} visible={toastVisible} />
      <EditModal
        todo={editTodo}
        onClose={() => setEditTodo(null)}
        onSave={handleEditSave}
        saving={editSaving}
      />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "40px 16px 80px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* ── Header ── */}
          <header style={{ textAlign: "center", marginBottom: 40, animation: "fadeInUp 0.5s ease" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              marginBottom: 16,
              boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
              fontSize: 26,
            }}>
              ✓
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 5vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 8,
            }}>
              My Tasks
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              จัดการงานของคุณอย่างมีประสิทธิภาพ
            </p>
          </header>

          {/* ── Progress Card ── */}
          {todos.length > 0 && (
            <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 20, animation: "fadeInUp 0.5s ease 0.05s both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                  ความคืบหน้า
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                  {completedCount} / {todos.length} เสร็จแล้ว
                </span>
              </div>
              <div style={{
                height: 6,
                borderRadius: 99,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  borderRadius: 99,
                  background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                  transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                {[
                  { label: "ทั้งหมด", value: todos.length, color: "var(--text-secondary)" },
                  { label: "ยังเหลือ", value: activeCount, color: "#f59e0b" },
                  { label: "เสร็จแล้ว", value: completedCount, color: "var(--success)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Add Form ── */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 20, animation: "fadeInUp 0.5s ease 0.1s both" }}>
            <form onSubmit={handleAdd}>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  id="new-todo-title"
                  className="input-field"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onFocus={() => setAddingNote(true)}
                  placeholder="เพิ่ม task ใหม่..."
                  autoComplete="off"
                />
                <button
                  type="submit"
                  id="add-todo-btn"
                  className="btn-primary"
                  disabled={submitting || !newTitle.trim()}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  {submitting ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <PlusIcon />}
                  <span className="hidden-mobile">เพิ่ม</span>
                </button>
              </div>

              {/* Description field — shows on focus */}
              {addingNote && (
                <div style={{ marginTop: 10, animation: "fadeInUp 0.2s ease" }}>
                  <textarea
                    id="new-todo-description"
                    className="input-field"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)..."
                    rows={2}
                    style={{ resize: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => { setAddingNote(false); setNewDescription(""); }}
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    ซ่อนรายละเอียด
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* ── Filter Tabs ── */}
          <div style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            padding: "4px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            border: "1px solid var(--border-color)",
            animation: "fadeInUp 0.5s ease 0.15s both",
          }}>
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
                style={{ flex: 1 }}
              >
                {f === "all" ? `ทั้งหมด (${todos.length})` : f === "active" ? `ยังเหลือ (${activeCount})` : `เสร็จแล้ว (${completedCount})`}
              </button>
            ))}
          </div>

          {/* ── Todo List ── */}
          <div style={{ animation: "fadeInUp 0.5s ease 0.2s both" }}>
            {loading ? (
              // Skeleton
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="skeleton" style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, width: `${60 + i * 10}%`, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 11, width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              // Empty state
              <div className="empty-state glass-card" style={{
                padding: "48px 24px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, filter: "grayscale(0.3)" }}>
                  {filter === "completed" ? "🎉" : filter === "active" ? "✅" : "📝"}
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  {filter === "completed" ? "ยังไม่มี task ที่เสร็จ" : filter === "active" ? "ทุก task เสร็จหมดแล้ว!" : "ยังไม่มี task"}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {filter === "all" ? "เพิ่ม task แรกของคุณด้านบน" : ""}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((todo, idx) => (
                  <div
                    key={todo.id}
                    className={`glass-card todo-item ${todo.completed ? "completed" : ""}`}
                    style={{
                      padding: "16px 20px",
                      animationDelay: `${idx * 0.05}s`,
                      opacity: todo.completed ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* Checkbox */}
                      <button
                        id={`toggle-${todo.id}`}
                        className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
                        onClick={() => handleToggle(todo)}
                        disabled={togglingId === todo.id}
                        style={{ marginTop: 2 }}
                        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {togglingId === todo.id ? (
                          <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        ) : todo.completed ? (
                          <CheckIcon />
                        ) : null}
                      </button>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="todo-title"
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: todo.completed ? "var(--text-muted)" : "var(--text-primary)",
                            lineHeight: 1.4,
                            marginBottom: todo.description ? 4 : 0,
                            wordBreak: "break-word",
                          }}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                            marginBottom: 6,
                            wordBreak: "break-word",
                          }}>
                            {todo.description}
                          </p>
                        )}
                        <p style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.6 }}>
                          {formatDate(todo.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          id={`edit-${todo.id}`}
                          className="btn-ghost"
                          onClick={() => setEditTodo(todo)}
                          style={{ padding: "6px 8px" }}
                          title="แก้ไข"
                        >
                          <EditIcon />
                        </button>
                        <button
                          id={`delete-${todo.id}`}
                          className="btn-danger"
                          onClick={() => handleDelete(todo.id)}
                          disabled={deletingId === todo.id}
                          title="ลบ"
                        >
                          {deletingId === todo.id ? (
                            <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "var(--danger)" }} />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer hint ── */}
          {!loading && todos.length > 0 && completedCount > 0 && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                id="clear-completed-btn"
                onClick={async () => {
                  const completed = todos.filter((t) => t.completed);
                  for (const t of completed) await handleDelete(t.id);
                }}
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  background: "none",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--danger)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.borderColor = "var(--border-color)";
                }}
              >
                ลบ task ที่เสร็จแล้วทั้งหมด ({completedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
