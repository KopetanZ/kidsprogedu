import Link from 'next/link';
import Button from '../components/Button';
import voice from '../../content/voice/ja.json';

export default function HomePage() {
  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Kids Prog Edu</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/lessons">
          <Button aria-label="れっすん">れっすん</Button>
        </Link>
        <Link href="/editor">
          <Button aria-label="さくひん" variant="ghost">さくひん</Button>
        </Link>
      </div>
      <div style={{ marginTop: 24, fontSize: 18, color: '#1F2430' }}>{voice.common.welcome}</div>
    </main>
  );
}
