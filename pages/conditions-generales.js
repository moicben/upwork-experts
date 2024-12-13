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
          <h1>Conditions Générales de Vente</h1>
          <h2>1. Présentation de l’entreprise</h2>
          <p>
            Le site <a href="https://univers-lapin.shop/">https://univers-lapin.shop</a> est édité par 
            <strong>Rabbits World</strong>, immatriculée sous le numéro <strong>851 990 135</strong>, 
            située au <strong>125 RUE DE L'ARTISANAT 42110 CIVENS</strong>.
          </p>
          <ul>
            <li><strong>Numéro de SIRET</strong> : 85199013500028</li>
            <li><strong>Responsable légal</strong> : Veronique BEN-SADOUN</li>
            <li><strong>Email</strong> : contact@univers-lapin.shop</li>
          </ul>
          <h2>2. Champ d’application</h2>
          <p>
            Les présentes CGV régissent les relations entre <strong>Univers Lapin</strong> et tout client effectuant un achat sur 
            <a href="https://univers-lapin.shop/">notre site</a>. Toute commande implique l’acceptation des CGV.
          </p>
          <h2>3. Produits et services</h2>
          <p>
            Les produits destinés aux lapins domestiques sont décrits de manière indicative. 
            Des écarts peuvent exister entre la description et le produit final.
          </p>
          <h2>4. Prix</h2>
          <p>
            Les prix sont indiqués en euros, TVA incluse. Les frais de livraison sont affichés avant validation de la commande. 
            Les tarifs en vigueur au moment de la commande sont appliqués.
          </p>
          <h2>5. Commandes</h2>
          <p>Pour passer commande :</p>
          <ul>
            <li>Ajoutez des produits au panier.</li>
            <li>Validez le panier.</li>
            <li>Renseignez vos informations et acceptez les CGV.</li>
          </ul>
          <p>
            Une confirmation est envoyée par email. <strong>Univers Lapin</strong> se réserve le droit d'annuler toute commande suspecte.
          </p>
          <h2>6. Paiement</h2>
          <p>
            Les paiements sont sécurisés via <strong>Stripe</strong>. Moyens acceptés : carte bancaire et virement bancaire (sous conditions).
          </p>
          <h2>7. Livraison</h2>
          <h3>7.1 Délais de livraison</h3>
          <p>Expédition sous 2 à 5 jours ouvrés après validation du paiement.</p>
          <h3>7.2 Zones de livraison</h3>
          <p>Livraisons en France métropolitaine. Contactez-nous pour des livraisons hors zone.</p>


        </section>

        
        
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  )
}