import Head from 'next/head';
import '@styles/globals.css';
import '../styles/responsive.css';
import '../styles/starts.css';
import '../styles/dashboard.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>  
        <link rel="icon" href="/favicon-collective.png" />
        <title>{pageProps.title || 'Collective Partners'}</title>
        <meta name="robots" content="noindex nofollow" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;