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


export default function Mentions() {
  
  return (
    <div key={site.id} className="container">
      <Head>
        <title>Tous les produits : {site.sourceCategory} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} />
        
        <section className='legal'>
          <h1>Mentions Légales</h1>
          <h2>1. Informations sur l’éditeur du site</h2>
          <p>
            Le site <strong>Univers Lapin</strong> accessible à l’adresse 
            <a href="https://univers-lapin.shop/">https://univers-lapin.shop</a> est édité par :
          </p>
          <ul>
            <li><strong>Nom de la société</strong> : Rabbits World</li>
            <li><strong>Forme juridique</strong> : SASU</li>
            <li><strong>Adresse du siège social</strong> : 125 RUE DE L'ARTISANAT 42110 CIVENS</li>
            <li><strong>Numéro de SIRET</strong> : 851 990 135</li>
            <li><strong>Numéro de TVA intracommunautaire</strong> : FR47851990135</li>
            <li><strong>Responsable de la publication</strong> : Veronique BEN-SADOUN</li>
            <li><strong>Contact email</strong> : contact@univers-lapin.shop</li>
          </ul>
          <h2>2. Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <ul>
            <li><strong>Nom de l’hébergeur</strong> : Hostinger</li>
            <li><strong>Adresse</strong> : Hostinger International Ltd, 61 Lordou Vironos Street, 6023 Larnaca, Chypre</li>
            <li><strong>Site web</strong> : <a href="https://www.hostinger.fr/">https://www.hostinger.fr</a></li>
          </ul>
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L’ensemble du contenu présent sur le site <strong>Univers Lapin</strong> 
            (textes, images, logos, graphismes, vidéos, etc.) est protégé par les lois en vigueur sur la propriété intellectuelle.
          </p>
          <ul>
            <li>
              <strong>Propriété exclusive</strong> : Toute reproduction ou utilisation est interdite sans autorisation de 
              <strong>Rabbits World</strong>.
            </li>
          </ul>
          <h2>4. Protection des données personnelles</h2>
          <p>
            Conformément au RGPD, les informations collectées via le site <strong>Univers Lapin</strong> 
            sont utilisées uniquement dans le cadre de la gestion des commandes et des relations clients.
          </p>
          <h3>Droits des utilisateurs</h3>
          <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
          <ul>
            <li>Droit d’accès, de rectification et de suppression.</li>
            <li>Droit à la portabilité des données.</li>
            <li>Droit de limiter ou de vous opposer au traitement des données.</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à : contact@univers-lapin.shop</p>
          <h2>5. Cookies</h2>
          <p>
            Le site utilise des cookies pour améliorer l’expérience utilisateur. 
            Vous pouvez modifier vos préférences via les paramètres de votre navigateur.
          </p>
        </section>

        
        
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  )
}