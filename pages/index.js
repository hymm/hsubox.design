import DefaultLayout from "@layouts/default";
import Link from "next/link";
import { getConfig, getAllPosts } from "@api";

export default function Blog({ title, description, posts }) {
  return (
    <DefaultLayout title={title} description={description}>
      <p>List of posts:</p>
      <ul>
        {posts.map(({ slug, title }, idx) => {
          return (
            <li key={idx}>
              <Link href={`/posts/${slug}`}>
                <a>{title}</a>
              </Link>
            </li>
          );
        })}
      </ul>
    </DefaultLayout>
  );
}

export async function getStaticProps() {
  const { title, description } = await getConfig();
  const posts = await getAllPosts();
  return {
    props: {
      posts,
      title,
      description,
    },
  };
}
