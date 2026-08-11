export type FeatureIconName =
  | "dashboard"
  | "nutrition"
  | "calendar"
  | "recipes"
  | "workouts"
  | "progress"
  | "shopping"
  | "wardrobe";

type FeatureIconProps = {
  name: FeatureIconName;
};

export function FeatureIcon({ name }: FeatureIconProps) {
  const paths: Record<FeatureIconName, React.ReactNode> = {
    dashboard: <path d="M4 11.5 12 5l8 6.5V20h-5v-5H9v5H4Z" />,
    nutrition: (
      <>
        <path d="M7 3v8M4.5 3v4.5A2.5 2.5 0 0 0 7 10M9.5 3v4.5A2.5 2.5 0 0 1 7 10v11" />
        <path d="M16 3c-2 2.2-2.3 6.8 0 9v9M16 12h3V3c-1.1 0-2.1.4-3 1.2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18M7 14h3M14 14h3M7 18h3" />
      </>
    ),
    recipes: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z" />
      </>
    ),
    workouts: (
      <>
        <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
      </>
    ),
    progress: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    shopping: (
      <>
        <path d="M3 4h2l2.3 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    wardrobe: (
      <>
        <path d="M12 7a2.5 2.5 0 1 0-2.5-2.5" />
        <path d="m12 7-9 8h18ZM6 15v3h12v-3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
