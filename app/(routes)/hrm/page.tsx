export const dynamic = "force-static";

import HRMEditor from "@app/editor/hrm/HRMEditor";

export default function HRMEntryPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>HRMモード（実験）</h1>
      <p style={{ marginTop: 12 }}>
        Human Resource Machine 風の低レベル命令で考える発展モードです。既存機能とは分離された入口として提供します。
      </p>
      <div style={{ marginTop: 16 }}>
        <HRMEditor />
      </div>
    </div>
  );
}
