import Head from 'next/head';
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; 
import Testimonials from '@components/Testimonials';
import About from '@components/About';

import content from '../content.json';
  
const Home = ({ site, products }) => {
  if (!site) {
    return <p>Site non trouvé</p>;
  }

  return (
    <div key={site.id} className="container">
      <Head>
        <title>{site.shopName} - {site.keyword} - {site.heroTitle}</title>
        <meta name="description" content={site.heroDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} />
        
        <section className="hero">
            <h2>{site.heroTitle}</h2>
            <p>{site.heroDescription}</p>
            <a href="/boutique"><button>Découvrir nos produits</button></a>
            <div className='filter'></div>
            <img src={site.heroImageUrl} alt={site.sourceCategory} />
        </section>
        
        <section className="intro">
          <div className='wrapper'>
            <h2>{site.introTitle}</h2>
            <p>{site.introDescription}</p>
          </div>
        </section>

        <Products title={`Tous les produits ${site.shopName}`} products={products} />
        
        <About site={site}/>
        
        <Testimonials site={site}/>
        
        <section className="contact" id='contact'>
          <div className='wrapper'>
            <div className="contact-content">
              <h2>{site.contactTitle}</h2>
              <p>{site.contactDescription}</p>
            </div>
            <div className="contact-form">
              <form>
                <label htmlFor="name">Nom complet</label>
                <input placeholder="Paul Dupont" type="text" id="name" name="name" required />
                
                <label htmlFor="email">Email</label>
                <input placeholder='exemple@gmail.com' type="email" id="email" name="email" required />
                
                <label htmlFor="message">Votre demande</label>
                <textarea placeholder="Écrivez votre demande ici..." id="message" name="message" required></textarea>
                
                <button type="submit">Envoyer</button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  );
}

  export async function getStaticProps() {
    const fs = require('fs');
    const path = require('path');

    // Fonction pour obtenir les produits d'un site donné
    const getProductsForSite = (siteSlug) => {
      try {
        const filePath = path.join(process.cwd(), 'products', `${siteSlug}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (!fileContent) {
          console.warn(`File ${filePath} is empty. Skipping.`);
          return [];
        }
        const productsData = JSON.parse(fileContent);
        return productsData.products;
      } catch (error) {
        console.error(`Error loading products for site ${siteSlug}:`, error);
        return [];
      }
    };

    // Déterminer le site à afficher
    const isLocalhost = process.env.NODE_ENV === 'development';
    const site = isLocalhost ? content.sites[0] : content.sites.find(site => site.slug === process.env.NEXT_PUBLIC_SITE_SLUG);
    if (!site) {
      console.error('Site not found');
      return {
        notFound: true,
      };
    }

  // Importer les produits pour le site déterminé
  const products = getProductsForSite(site.slug);

  return {
    props: {
      site,
      products,
    },
  };
}

export default Home;