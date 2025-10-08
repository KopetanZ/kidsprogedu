export const dynamic = "force-static";

export default function HRMEntryPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>HRMモード（実験）</h1>
      <p style={{ marginTop: 12 }}>
        Human Resource Machine 風の低レベル命令で考える発展モードです。既存機能とは分離された入口として提供します。
      </p>
      <ul style={{ marginTop: 12, lineHeight: 1.7 }}>
        <li>INBOX/OUTBOX、床メモリ、ジャンプ/条件分岐を段階的に体験</li>
        <li>命令数と実行ステップの2軸最適化（予定）</li>
        <li>今後、課題とチュートリアルを追加予定です</li>
      </ul>
      <p style={{ marginTop: 16, color: '#666' }}>
        現在はスケルトン実装のため、学習課題やエディタは順次実装します。
      </p>
    </div>
  );
}

