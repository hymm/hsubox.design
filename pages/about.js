import DefaultLayout from "@layouts/default";
import Link from "next/link";
import { getConfig, getAllPosts } from "@api";

export default function Blog({ title, description, posts }) {
  return (
    <DefaultLayout title={title} description={description}>
      <article>
        <h1>About Me</h1>
        <p>ToDo</p>
      </article>
    </DefaultLayout>
  );
}
