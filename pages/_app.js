import Head from 'next/head';
import '@styles/globals.css';
import '../styles/products.css';
import '../styles/product-page.css';
import '../styles/responsive.css';
import '../styles/welcome.css';
import '../styles/header.css';
import '../styles/footer.css';
import '../styles/faq.css';
import '../styles/suivre-mon-colis.css';
import '../styles/reviews.css';
import '../styles/partners.css';
import '../styles/dashboard.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>  
        <link rel="icon" href="/favicon-collective.png" />
        <title>{pageProps.title || 'Collective Partners'}</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;