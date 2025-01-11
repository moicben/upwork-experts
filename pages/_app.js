import Head from 'next/head';
import '@styles/globals.css';
import '../styles/responsive.css';
import '../styles/starts.css';
import '../styles/dashboard.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>  
        <link rel="icon" href="https://talentsgroupe.fr/wp-content/uploads/2021/10/cropped-favicon-talents-groupe-180x180.png" />
        <title>{pageProps.title || 'Talents Groupe x Upwork'}</title>
        <meta name="robots" content="noindex nofollow" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;