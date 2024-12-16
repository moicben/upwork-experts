import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import emailjs from 'emailjs-com';
import Header from '../components/Header';
import Footer from '../components/Footer';
import content from '../content.json';

const site = content.sites[0]

export default function Paiement () {

  const [cart, setCart] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const groupedCart = storedCart.reduce((acc, item) => {
      const existingItem = acc.find(i => i.productTitle === item.productTitle);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        acc.push({ ...item, quantity: 1 });
      }
      return acc;
    }, []);
    setCart(groupedCart);
  }, []);

  useEffect(() => {
    emailjs.init("8SL7vzVHt7qSqEd4i");
  }, []);

  const totalPrice = cart.reduce((total, item) => {
    const price = parseFloat(item.productPrice.replace('€', '').replace(',', '.')) || 0;
    return total + (price * item.quantity);
  }, 0).toFixed(2);

  const discount = (totalPrice * 0.1).toFixed(2);
  const discountedPrice = (totalPrice - discount).toFixed(2);

  const sendEmail = (event) => {
    event.preventDefault();
    emailjs.sendForm('gmail-benedikt', 'new-payment', event.target)
      .then(() => {
        console.log('SUCCESS!');
        localStorage.removeItem('cart'); // Clear the cart from localStorage
        document.querySelector('.left-column').style.display = 'none';
        document.querySelector('.right-column').style.width = '100%';
        document.querySelector('.right-column').style.maxWidth = 'none';

        setCart([]); // Clear the cart state
        showStep(2); // Move to the confirmation step after successful email sending
      })
      .catch((error) => {
        console.log('FAILED...', error);
      });
  };

  //fonction pour cacher un élément et en afficher un autre :
  function showStep(step) {
    if (typeof document !== 'undefined') {
      const steps = document.querySelectorAll('.checkout-step');
      steps.forEach(s => s.classList.remove('active'));
      steps[step].classList.add('active');
    }
  }

  

  return (
    <div className="paiement-container">
      <div className="left-column">
        <a className="back" href="/boutique">&lt; Retour à la boutique</a>
        <div className="shop-info">
          <h2>{`Payez ${site.shopName}`}</h2>
          <h1>{`${parseFloat(totalPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}</h1>
        </div>
        <div className="cart-summary">
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <div className="cart-item">
                  <h4>{item.productTitle}</h4>
                  <p className='quantity'>(x{item.quantity})</p>
                  <p>{`${parseFloat(item.productPrice.replace('€', '').replace(',', '.')).toFixed(2).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-item discount">
            <h4>Réduction 10% première commande</h4>
            <p>{`-${parseFloat(discount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}</p>
          </div>
          <div className="total-price">
            <h4>Total dû :</h4>
            <p>{`${parseFloat(discountedPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}</p>
          </div>
        </div>
        <p className='secure footer'>© 2024 - Tous droits réservés -  {site.shopName} SAS 32455</p>
      </div>
      <div className="right-column">
        <form className="checkout-form" onSubmit={sendEmail}>
          <input type="hidden" name="totalPrice" value={discountedPrice} />
          <input type="hidden" name="products" value={cart.map(item => `${item.productTitle} (x${item.quantity})`).join(', ')} />
          <input type="hidden" name="website" value={site.shopName} />

          <div className='checkout-step active'>
            <h3>Informations de livraison</h3>
            <input type="text" name="address" placeholder="Adresse du domicile"  />
            <input type="text" name="suite" placeholder="Maison, suite, numéro, etc. (optionnel)" />
            <div className="form-row">
              <input type="text" name="postalCode" placeholder="Code postal"  />
              <input type="text" name="city" placeholder="Ville"  />
            </div>
            <h3>Compte client</h3>
            <input type="text" name="email" placeholder="Email"  />
            <div className="form-row">
              <input type="text" name="firstName" placeholder="Prénom"  />
              <input type="text" name="lastName" placeholder="Nom"  />
            </div>
            <button type="button" id="delivery-checkout" onClick={() => showStep(1)}>Étape suivante</button>
          </div>

          <div className='checkout-step'>
            <h3>Mode de paiement</h3>
            <label className={`payment-method ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="card" checked={selectedPaymentMethod === 'card'} onChange={() => setSelectedPaymentMethod('card')}  />
              <img src='/card-badges.png' alt='cartes bancaires'/>
              <span>Stripe</span>
            </label>
            <label className={`unvalaible payment-method ${selectedPaymentMethod === 'paypal' ? 'selected' : ''}`}>
              <input type="radio" name="paymentMethod" value="paypal" checked={selectedPaymentMethod === 'paypal'} onChange={() => setSelectedPaymentMethod('paypal')}  />
              <img src='/paypal-simple.png' alt='cartes bancaires'/>
              <span>Momentanément indisponible</span>
            </label>
            <h3>Informations de la carte</h3>
            <input type="text" name="cardNumber" placeholder="1234 1234 1234 1234"  />
            <div className="form-row">
              <input type="text" name="expiryDate" placeholder="MM/YY" maxLength="5"  />
              <input type="text" name="cvv" placeholder="CVV" maxLength="3"  />
            </div>
            <article className='checkout-buttons'>
              <button className="back-checkout" type="button" onClick={() => showStep(0)}>&lt;</button>
              <button id="pay-checkout" type="submit">Procéder au paiement</button>
            </article>
          </div>

          <div className='checkout-step confirmation'>
            <h2>Commande confirmée</h2>
            <p>Merci pour votre commande, {site.shopName} vous remercie pour votre confiance.</p>
            <p>Comptez environ 3 jours ouvrés avant réception de votre commande à bon port !</p>
            <a href="/"><button type="button">Retour à la boutique</button></a>
          </div>
        </form>
      </div>
    </div>
  );
};