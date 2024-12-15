import React from 'react';
import Head from 'next/head';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; // Importer le composant Products
import About from '@components/About';
import Testimonials from '@components/Testimonials';

import content from '../content.json';

// Limite l'affichage au premier site
const site = content.sites[0];  

const PolitiqueDeConfidentialite = () => {
  return (

    <div key={site.id} className="container">
      <Head>
        <title>Tous les produits : {site.sourceCategory} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main >
        <Header shopName={site.shopName} />

    
      <section  className='legal'> 
        <h1>Politique de Confidentialité</h1>
        <p>
          Nous attachons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
      
        <section>
          <h2>1. Collecte des données</h2>
          <p>
            Nous collectons les données suivantes :
          </p>
          <ul>
            <li>Informations personnelles (nom, adresse, etc.).</li>
            <li>Données de navigation (cookies, adresses IP, etc.).</li>
          </ul>
        </section>
        <section>
          <h2>2. Consentement</h2>
          <p>
            En utilisant notre site, vous consentez à notre politique de confidentialité.
          </p>
        </section>
        <section>
          <h2>3. Utilisation des données</h2>
          <p>
            Vos données sont utilisées pour :
          </p>
          <ul>
            <li>Traiter vos commandes et assurer le service après-vente.</li>
            <li>Améliorer votre expérience sur notre site.</li>
            <li>Envoyer des communications marketing (avec votre consentement).</li>
          </ul>
        </section>
        <section>
          <h2>4. Partage des données</h2>
          <p>
            Vos données peuvent être partagées avec :
          </p>
          <ul>
            <li>Nos prestataires de services (paiement, livraison).</li>
            <li>Les autorités légales en cas d’obligation.</li>
          </ul>
        </section>
        <section>
          <h2>5. Protection des données</h2>
          <p>
            Nous utilisons des mesures de sécurité avancées pour protéger vos données personnelles contre tout accès non autorisé, modification ou perte.
          </p>
        </section>
        <section>
          <h2>6. Vos droits</h2>
          <p>
            Vous avez le droit de :
          </p>
          <ul>
            <li>Accéder à vos données personnelles.</li>
            <li>Demander la rectification de vos données.</li>
            <li>Demander la suppression de vos données.</li>
            <li>Vous opposer au traitement de vos données.</li>
          </ul>
        </section>
        <section>
          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : contact@rabbits-world.com.
          </p>
        </section>
      </section>
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  );
};

export default PolitiqueDeConfidentialite;