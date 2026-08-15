import { ShoppingPaper } from "./shopping-paper";
import styles from "../shopping.module.css";

export function ShoppingView() {
  return (
    <main className={styles.shoppingPage}>
      <header className={styles.pageIntro} data-page-title>
        <div>
          <p className={styles.pageEyebrow}>Lista de Compras</p>
          <h1>¡Que no se te olvide nada!</h1>
        </div>
        <aside className={styles.loveNote}>
          <span aria-hidden="true">♡</span>
          Tu puedes! 
          - Peque
        </aside>
      </header>
      <ShoppingPaper />
    </main>
  );
}
