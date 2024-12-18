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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-payment-intent`, {
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
    <form style={formStyle} id="payment-form" onSubmit={handleSubmit}>
      <h2 style={headerStyle}>Payment Information</h2>
      <div style={inputContainerStyle}>
        <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
      </div>
      <button type="submit" disabled={!stripe} style={buttonStyle}>Pay</button>
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>Payment successful!</div>}
    </form>
  );
};

const formStyle = {
  height: '25rem',
  width: '500px',
  margin: '0 auto',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '20px',
};

const inputContainerStyle = {
  marginBottom: '20px',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '18px',
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '100%',
};

const errorStyle = {
  color: 'red',
  marginTop: '10px',
  textAlign: 'center',
};

const successStyle = {
  color: 'green',
  marginTop: '10px',
  textAlign: 'center',
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
