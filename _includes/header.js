import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <ul>
        <li>hsubox.design</li>
        <li>about</li>
      </ul>
    </header>
  );
}
