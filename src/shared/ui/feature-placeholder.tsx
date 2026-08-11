import Link from "next/link";

type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <main className="feature-page">
      <section className="feature-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="feature-card__title">{title}</h1>
        <p className="feature-card__description">{description}</p>
        <p className="feature-card__status">Próximamente construiremos este módulo.</p>
        <Link href="/" className="retro-button">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
