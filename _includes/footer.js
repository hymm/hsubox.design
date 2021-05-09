import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <p>Mike Hsu's blog</p>
      <ul>
        <li>
          <Image src="/images/Github-Mark-32px.png" width={24} height={24} />
          Github
        </li>
      </ul>
    </footer>
  );
}
