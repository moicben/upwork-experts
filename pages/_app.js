import '@styles/globals.css'
import '../styles/products.css'; // Importer le fichier CSS
import '../styles/responsive.css'; // Importer le fichier CSS


function Application({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default Application
