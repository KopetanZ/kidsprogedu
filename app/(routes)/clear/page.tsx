import Link from 'next/link';
import Button from '../../components/Button';
import voice from '../../../content/voice/ja.json';

export default function ClearPage() {
  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh' }}>
      <div style={{
        height: 360,
        borderRadius: 16,
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#1F2430', marginBottom: 24,
      }}>
        {voice.common.clear}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/lessons">
          <Button aria-label="つぎへ">つぎへ</Button>
        </Link>
        <Link href="/editor">
          <Button aria-label="もう いちど" variant="ghost">もう いちど</Button>
        </Link>
      </div>
    </main>
  );
}

