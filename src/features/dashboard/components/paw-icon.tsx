import styles from "../dashboard.module.css";

type PawIconProps = {
  active: boolean;
};

export function PawIcon({ active }: PawIconProps) {
  return (
    <svg
      className={active ? styles.pawActive : undefined}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <ellipse cx="24" cy="31" rx="11" ry="9" />
      <ellipse cx="10" cy="22" rx="5" ry="7" transform="rotate(-24 10 22)" />
      <ellipse cx="20" cy="13" rx="5" ry="7" transform="rotate(-8 20 13)" />
      <ellipse cx="30" cy="13" rx="5" ry="7" transform="rotate(8 30 13)" />
      <ellipse cx="40" cy="22" rx="5" ry="7" transform="rotate(24 40 22)" />
    </svg>
  );
}
