import styles from "../shopping.module.css";

export function BasketDoodle() {
  return (
    <svg className={styles.basketDoodle} viewBox="0 0 240 190" aria-hidden="true">
      <g className={`${styles.produce} ${styles.apple}`}>
        <circle className={styles.doodleFillPurple} cx="55" cy="83" r="20" />
        <path className={styles.doodleLineThin} d="M55 63c0-9 4-14 10-18M59 53c-8-5-14-3-18 2" />
      </g>
      <g className={`${styles.produce} ${styles.carrot}`}>
        <path className={styles.doodleFillYellow} d="m166 57 22 9-30 57-15-7Z" />
        <path className={styles.doodleLineThin} d="M166 58c-5-14-1-23 10-28M171 60c8-12 17-15 28-9M165 57c4-16-2-23-12-27" />
      </g>
      <g className={`${styles.produce} ${styles.greens}`}>
        <path className={styles.doodleFillLime} d="M122 87c-22-10-27-29-14-48 10 4 17 12 20 23 4-14 13-22 26-25 11 22 2 41-25 54Z" />
        <path className={styles.doodleLineThin} d="M128 84V53M128 68l-13-15M129 70l16-17" />
      </g>
      <g className={`${styles.produce} ${styles.banana}`}>
        <path className={styles.doodleFillYellow} d="M70 101c15 8 34 4 46-13-3 25-24 39-49 30-8-3-10-12-5-19 2 0 5 1 8 2Z" />
      </g>

      <g className={styles.catGroup}>
        <path className={styles.catPeek} d="M82 82V43l17 12c13-6 29-6 42 0l17-12v39c0 19-16 31-38 31S82 101 82 82Z" />
        <circle cx="107" cy="78" r="3" />
        <circle cx="133" cy="78" r="3" />
        <path className={styles.doodleLineThin} d="m115 88 5 3 5-3M120 91v5M96 88l-16-3M96 94l-17 3M144 88l16-3M144 94l17 3" />
      </g>

      <g className={styles.basketGroup}>
        <path className={styles.basketFill} d="M38 94h164l-23 77H61Z" />
        <path className={styles.doodleLine} d="M38 94h164l-23 77H61Z" />
        <path className={styles.doodleLine} d="M70 94c3-43 22-66 50-66s47 23 50 66" />
        <path className={styles.doodleLine} d="M51 116h139M56 142h128M83 98l7 70M120 98v71M157 98l-8 70" />
      </g>
    </svg>
  );
}
