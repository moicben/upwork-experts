import Head from 'next/head';
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import Header from '../components/Header';
import Footer from '../components/Footer';

const stripePromise = loadStripe('pk_test_51QWhAHBtMJnr4ZcdLcrmGdi0YSSjnPLWid4V6nZEkxGKvjYIF2hqr6U7Vuyk0ucJqAqL5xUK94tokoZ7u4pmm3Cy00lFj5lKKI');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
    } else {
      try {
        //const response = await fetch('http://localhost:3001/create-payment-intent', {
        const response = await fetch('https://infinite-springs-01063-e2caff8bf525.herokuapp.com/create-payment-intent', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 1000 }), // Amount in cents
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const { clientSecret } = await response.json();

        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirmError) {
          setError(confirmError.message);
        } else {
          setSuccess(true);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <form style={{ height: '5rem', width: '500px', margin: '0 auto' }} id="payment-form" onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
      </div>
      <button type="submit" disabled={!stripe} style={{ padding: '10px 20px', fontSize: '18px' }}>Pay</button>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '10px' }}>Payment successful!</div>}
    </form>
  );
};

const StripeTest = ({ site }) => (
  <div key={site.id} className="container">
    <Head>
      <title>Stripe Test - {site.shopName}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    
    <main>
      <Header shopName={site.shopName} cartCount={0} keywordPlurial={site.keywordPlurial} />
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </main>
    <Footer shopName={site.shopName} footerText={site.footerText} />
  </div>
);

export async function getStaticProps() {
  const content = await import('../content.json');

  return {
    props: {
      site: content.sites[0],
    },
  };
}

export default StripeTest;