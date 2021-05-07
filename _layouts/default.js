import Head from "next/head";
import Header from "@includes/header";
import Footer from "@includes/footer";

export default function DefaultLayout({ children, title, description }) {
  return (
    <main className="grid">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Arimo&family=Overpass:wght@900&display=swap');
        </style>
      </Head>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
