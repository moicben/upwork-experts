import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; // Importer le composant Products
import About from '@components/About';
import Testimonials from '@components/Testimonials';

import content from '../content.json';
import productsData from '../products.json';

const Boutique = ({ site, products }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(storedCart.length);
  }, []);

  return (
    <div key={site.id} className="container">
      <Head>
        <title>{"Tous nos " + site.keywordPlurial + " - " +  site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} cartCount={cartCount} keywordPlurial={site.keywordPlurial} />
        <Products title={`${site.keywordPlurial} - Tous les produits`} products={products} description={site.productsDescription} />
        <About site={site} />
        <Testimonials site={site} />
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  );
}

export async function getStaticProps() {
  const content = await import('../content.json');
  const productsData = await import('../products.json');

  return {
    props: {
      site: content.sites[0],
      products: productsData.products,
    },
  };
}

export default Boutique;