import DefaultLayout from "@layouts/default";
import Head from "next/head";
import Link from "next/link";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import gfm from "remark-gfm";
import Image from "next/image";
// import CodeBlock from "./CodeBlock";

export default function PostLayout({ title, content }) {
  return (
    <DefaultLayout>
      <Head>
        <title>{title}</title>
      </Head>
      <article>
        <h1>{title}</h1>
        <Markdown
          remarkPlugins={[gfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  useInlineStyles={false}
                  language={match[1]}
                  children={String(children).replace(/\n$/, "")}
                  {...props}
                  style={{ textShadow: "none", color: undefined }}
                />
              ) : (
                <code className={className} {...props} />
              );
            },
            image({ ...props }) {
              return <Image {...props} />;
            },
          }}
        >
          {content}
        </Markdown>
        <div>
          <Link href="/">
            <a>Home</a>
          </Link>
        </div>
      </article>
    </DefaultLayout>
  );
}
