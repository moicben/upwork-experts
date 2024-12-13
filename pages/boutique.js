import Head from 'next/head'
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; // Importer le composant Products
import About from '@components/About';
import Testimonials from '@components/Testimonials';

import content from '../content.json';
import productsData from '../products.json';


// Limite l'affichage au premier site
const site = content.sites[0]; 
// Import + Filtrer les produits par site
const products = productsData.products.filter(product => product.siteId === site.id); 


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
        
        
        <About site={site}/>
        
        <Testimonials site={site}/>
        
        
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  )
}