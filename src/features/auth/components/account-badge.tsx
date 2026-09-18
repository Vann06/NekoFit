import { signOut } from "@/app/auth/actions";

import styles from "./account-badge.module.css";

type AccountBadgeProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function AccountBadge({ name, email, avatarUrl }: AccountBadgeProps) {
  return (
    <aside className={styles.badge} aria-label="Cuenta activa">
      {avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        : <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>}
      <div><strong>{name}</strong><small>{email}</small></div>
      <form action={signOut}><button type="submit">Cerrar sesión</button></form>
    </aside>
  );
}
