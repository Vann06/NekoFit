import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <span aria-hidden="true">ฅ^•ﻌ•^ฅ</span>
      <p>Modo sin conexión</p>
      <h1>NekoFit sigue contigo</h1>
      <p>Vuelve a intentarlo cuando recuperes internet. Tus entrenamientos guardados localmente no se perderán.</p>
      <Link href="/workouts" className="retro-button">Reintentar</Link>
    </main>
  );
}
