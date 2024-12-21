import Head from 'next/head'
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; // Importer le composant Products
import About from '@components/About';
import Testimonials from '@components/Testimonials';

import content from '../content.json';

// Limite l'affichage au premier site
const site = content.sites[0]; 

export default function ConditionsGenerales() {
  return (
    <div key={site.id} className="container">
      <Head>
        <title>{`Conditions Générales - ${site.shopName}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} keywordPlurial={site.keywordPlurial} />
        
        <section className='legal'>
          <h1>Conditions Générales de Vente</h1>
          <h2>1. Présentation de l’entreprise</h2>
          <p>
            Le site <a href="/"> www.{site.slug}.expert-francais.shop </a> est édité par, 
            <strong>{site.shopName} SAS </strong>, immatriculée sous le numéro <strong>851 990 135</strong>, 
            située au <strong>125 RUE DE L'ARTISANAT 42110 CIVENS</strong>.
          </p>
          <ul>
            <li><strong>Numéro de SIRET</strong> : 85199013500028</li>
            <li><strong>Responsable légal</strong> : Veronique BERENGÈRE</li>
            <li><strong>Email</strong> : contact@expert-francais.shop</li>
          </ul>
          <h2>2. Champ d’application</h2>
          <p>
            Les présentes CGV régissent les relations entre <strong>{site.shopName}</strong> et tout client effectuant un achat sur 
            <a href="/">notre site</a>. Toute commande implique l’acceptation des CGV.
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
            Une confirmation est envoyée par email. <strong>{site.shopName}</strong> se réserve le droit d'annuler toute commande suspecte.
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
          <h2>8. Politique de retours</h2>
          <p>
            Nous voulons que vous soyez entièrement satisfait de votre achat. Si pour une raison quelconque vous n'êtes pas satisfait, nous acceptons les retours sous certaines conditions.
          </p>
          <h3>8.1 Conditions de retour</h3>
          <p>
            Les articles peuvent être retournés s'ils respectent les conditions suivantes :
          </p>
          <ul>
            <li>Les articles doivent être retournés dans les 30 jours suivant la réception.</li>
            <li>Les articles doivent être dans leur état d'origine, non utilisés et non endommagés.</li>
            <li>Les articles doivent être retournés avec tous les accessoires et emballages d'origine.</li>
          </ul>
          <h3>8.2 Processus de retour</h3>
          <p>
            Pour initier un retour, veuillez suivre les étapes suivantes :
          </p>
          <ul>
            <li>Contactez notre service client à l'adresse suivante : contact@univers-lapin.shop.</li>
            <li>Indiquez votre numéro de commande et la raison du retour.</li>
            <li>Suivez les instructions fournies par notre service client pour retourner l'article.</li>
          </ul>
          <h3>8.3 Remboursements</h3>
          <p>
            Une fois que nous aurons reçu et inspecté l'article retourné, nous vous informerons de l'approbation ou du rejet de votre remboursement. Si votre retour est approuvé, un remboursement sera effectué sur votre méthode de paiement d'origine dans un délai de quelques jours.
          </p>
          <h3>8.4 Échanges</h3>
          <p>
            Si vous souhaitez échanger un article, veuillez suivre le processus de retour et passer une nouvelle commande pour l'article souhaité.
          </p>
          <h3>8.5 Articles non retournables</h3>
          <p>
            Certains articles ne peuvent pas être retournés, tels que :
          </p>
          <ul>
            <li>Cartes cadeaux.</li>
            <li>Articles en solde.</li>
            <li>Articles personnalisés.</li>
          </ul>
          <h2>9. Contact</h2>
          <p>
            Pour toute question concernant ces conditions générales de vente, vous pouvez nous contacter à l'adresse suivante : contact@expert-francais.shop.
          </p>
        </section>
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  )
}