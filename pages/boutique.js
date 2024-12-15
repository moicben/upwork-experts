import Head from 'next/head';
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; // Importer le composant Products
import About from '@components/About';
import Testimonials from '@components/Testimonials';

import content from '../content.json';

// Fonction pour obtenir les produits d'un site donné
const getProductsForSite = (siteSlug) => {
  try {
    const productsData = require(`../products/${siteSlug}.json`);
    return productsData.products;
  } catch (error) {
    console.error(`Error loading products for site ${siteSlug}:`, error);
    return [];
  }
};

// Déterminer le site à afficher
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const site = isLocalhost ? content.sites[0] : content.sites.find(site => site.slug === process.env.NEXT_PUBLIC_SITE_SLUG);

// Importer les produits pour le site déterminé
const products = getProductsForSite(site.slug);

export default function Boutique() {
  return (
    <div key={site.id} className="container">
      <Head>
        <title>Tous les produits : {site.sourceCategory} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} />
        <Products title={`Tous les produits ${site.shopName}`} products={products} />
        <About site={site} />
        <Testimonials site={site} />
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  );
}