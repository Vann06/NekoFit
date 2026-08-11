import Link from "next/link";

export default function HomePage() {
  return (
    <main className="welcome">
      <p className="eyebrow">Tu espacio personal</p>
      <h1>NekoFit</h1>
      <p className="welcome__description">
        Alimentación, entrenamientos y progreso en un solo lugar.
      </p>
      <Link href="/dashboard" className="retro-button">
        Comenzar
      </Link>
    </main>
  );
}
