import '@styles/globals.css'
import '../styles/products.css'; // Importer le fichier CSS
import '../styles/product-page.css'
import '../styles/responsive.css'; // Importer le fichier CSS
import '../styles/welcome.css'; // Importer le fichier CSS
import '../styles/header.css'; // Importer le fichier CSS
import '../styles/footer.css'
import '../styles/faq.css'; // Importer le fichier CSS
import '../styles/suivre-mon-colis.css'; // Importer le fichier CSS
import '../styles/reviews.css'; // Importer le fichier CSS	
import '../styles/partners.css'; // Importer le fichier CSS
import '../styles/dashboard.css';


function MyApp({ Component, pageProps }) {
  return (
    
      <>
        <Head>
          <link rel="icon" href="/favicon-collective.png" />
          <title>{pageProps.title || 'Default Title'}</title>
        </Head>
        <Component {...pageProps} />
      </>
  );
}

export default MyApp;
