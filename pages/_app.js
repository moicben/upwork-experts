import '@styles/globals.css'
import '../styles/products.css'; // Importer le fichier CSS
import '../styles/product-page.css'
import '../styles/responsive.css'; // Importer le fichier CSS
import '../styles/paiement.css'; // Importer le fichier CSS
import '../styles/header.css'; // Importer le fichier CSS
import '../styles/footer.css'
import '../styles/faq.css'; // Importer le fichier CSS
import '../styles/suivre-mon-colis.css'; // Importer le fichier CSS
import '../styles/reviews.css'; // Importer le fichier CSS	
import '../styles/partners.css'; // Importer le fichier CSS

import { CartProvider } from '../context/CartContext';

function MyApp({ Component, pageProps }) {
  return (
      <Component {...pageProps} />

  );
}

export default MyApp;
