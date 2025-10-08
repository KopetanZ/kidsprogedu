"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { HRMInstruction, HRMProgram } from "@core/hrm/schemas";
import { HRMOpId } from "@core/hrm/schemas";
import { createState, step as hrmStep } from "@core/hrm/vm";

const ALL_OPS = HRMOpId.options;

function parseNumberList(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => Number(t))
    .filter((n) => Number.isFinite(n));
}

type RunMode = "idle" | "running" | "paused" | "halted";

export default function HRMEditor() {
  const [instructions, setInstructions] = useState<HRMInstruction[]>([
    { op: "label", label: "LOOP" },
    { op: "inbox" },
    { op: "outbox" },
    { op: "jump", target: "LOOP" },
  ]);
  const [inboxText, setInboxText] = useState("1 2 3 4");
  const [floorSize, setFloorSize] = useState(8);

  const program: HRMProgram = useMemo(() => ({ instructions }), [instructions]);

  const [mode, setMode] = useState<RunMode>("idle");
  const [state, setState] = useState(() => createState(program, parseNumberList(inboxText), floorSize));
  const timerRef = useRef<number | null>(null);

  // Recreate state when program/inbox/floorSize changes and not running
  useEffect(() => {
    if (mode === "running") return;
    setState(createState(program, parseNumberList(inboxText), floorSize));
    setMode("idle");
  }, [program, inboxText, floorSize]);

  const doStep = () => {
    const r = hrmStep(program, state);
    setState(r.state);
    if (r.done) setMode("halted");
  };

  const onReset = () => {
    stopTimer();
    setState(createState(program, parseNumberList(inboxText), floorSize));
    setMode("idle");
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPlay = () => {
    if (mode === "running") return;
    setMode("running");
    timerRef.current = window.setInterval(() => {
      setState((prev) => {
        const r = hrmStep(program, prev);
        if (r.done) {
          stopTimer();
          setMode("halted");
        }
        return r.state;
      });
    }, 150);
  };

  const onPause = () => {
    stopTimer();
    setMode("paused");
  };

  useEffect(() => () => stopTimer(), []);

  const addInstruction = (idx?: number) => {
    setInstructions((prev) => {
      const next = prev.slice();
      const insertAt = idx === undefined ? prev.length : Math.max(0, Math.min(prev.length, idx));
      next.splice(insertAt, 0, { op: "inbox" });
      return next;
    });
  };

  const removeInstruction = (idx: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateInstruction = (idx: number, patch: Partial<HRMInstruction>) => {
    setInstructions((prev) => prev.map((ins, i) => (i === idx ? { ...ins, ...patch } : ins)));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>プログラム</h2>
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <button onClick={() => addInstruction()} style={{ padding: 8 }}>行を追加</button>
          <span style={{ marginLeft: 12, color: "#666" }}>サイズ: {instructions.length}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: 6 }}>#</th>
              <th style={{ padding: 6 }}>op</th>
              <th style={{ padding: 6 }}>addr</th>
              <th style={{ padding: 6 }}>label</th>
              <th style={{ padding: 6 }}>target</th>
              <th style={{ padding: 6 }}></th>
            </tr>
          </thead>
          <tbody>
            {instructions.map((ins, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: state.pc === i ? "#f0f9ff" : undefined }}>
                <td style={{ padding: 6, width: 32 }}>{i}</td>
                <td style={{ padding: 6 }}>
                  <select
                    value={ins.op}
                    onChange={(e) => updateInstruction(i, { op: e.target.value as HRMInstruction["op"] })}
                  >
                    {ALL_OPS.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 6, width: 80 }}>
                  <input
                    type="number"
                    value={ins.addr ?? ""}
                    onChange={(e) => updateInstruction(i, { addr: e.target.value === "" ? undefined : Number(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ padding: 6 }}>
                  <input
                    value={ins.label ?? ""}
                    onChange={(e) => updateInstruction(i, { label: e.target.value || undefined })}
                    placeholder="LOOP"
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ padding: 6 }}>
                  <input
                    value={ins.target ?? ""}
                    onChange={(e) => updateInstruction(i, { target: e.target.value || undefined })}
                    placeholder="LOOP"
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ padding: 6 }}>
                  <button onClick={() => addInstruction(i)} style={{ padding: 4, marginRight: 4 }}>＋</button>
                  <button onClick={() => removeInstruction(i)} style={{ padding: 4 }}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}>
          <label>INBOX: </label>
          <input
            value={inboxText}
            onChange={(e) => setInboxText(e.target.value)}
            placeholder="例: 1 2 3 4"
            style={{ width: "70%", marginLeft: 6 }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Floor サイズ: </label>
          <input
            type="number"
            value={floorSize}
            onChange={(e) => setFloorSize(Math.max(0, Number(e.target.value)))}
            style={{ width: 100, marginLeft: 6 }}
          />
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={onPlay} disabled={mode === "running"}>▶ 実行</button>
          <button onClick={onPause} disabled={mode !== "running"}>⏸ 一時停止</button>
          <button onClick={doStep} disabled={mode === "running"}>⏭ 1ステップ</button>
          <button onClick={onReset}>↺ リセット</button>
          <span style={{ marginLeft: 8, color: "#666" }}>steps: {state.steps}</span>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>状態</h2>
        <div style={{ marginTop: 8 }}>
          <div>PC: {state.pc}</div>
          <div>手: {state.hand === undefined ? "(空)" : state.hand}</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>INBOX</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {state.inbox.map((v, i) => (
              <span key={i} style={{ padding: "4px 8px", background: "#eef2ff", borderRadius: 6 }}>{v}</span>
            ))}
            {state.inbox.length === 0 && <span style={{ color: "#999" }}>(空)</span>}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>OUTBOX</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {state.outbox.map((v, i) => (
              <span key={i} style={{ padding: "4px 8px", background: "#dcfce7", borderRadius: 6 }}>{v}</span>
            ))}
            {state.outbox.length === 0 && <span style={{ color: "#999" }}>(空)</span>}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>床メモリ</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, Math.min(8, floorSize))}, 1fr)`, gap: 6 }}>
            {Array.from({ length: floorSize }, (_, i) => (
              <div key={i} style={{ padding: 8, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>#{i}</div>
                <div style={{ fontWeight: 600 }}>{state.floor[i] ?? ""}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>ラベル</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from(state.labels.entries()).map(([k, v]) => (
              <span key={k} style={{ padding: "2px 6px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6 }}>{k}:{v}</span>
            ))}
            {state.labels.size === 0 && <span style={{ color: "#999" }}>(なし)</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

