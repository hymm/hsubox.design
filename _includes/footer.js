import Image from "next/image";
import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Mike Hsu's blog</p>
      <ul>
        <li>
          <Link href="https://github.com/hymm">
            <a className={styles["github-link"]}>
              <Image
                src="/images/Github-Mark-32px.png"
                width={24}
                height={24}
              />
              <span>Github</span>
            </a>
          </Link>
        </li>
      </ul>
    </footer>
  );
}
