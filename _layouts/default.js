import Head from "next/head";
import Header from "@includes/header";
import Footer from "@includes/footer";

export default function DefaultLayout({ children, title, description }) {
  return (
    <main>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
