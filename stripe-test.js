import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import express from 'express';

// Express server setup
const app = express();
app.use(express.static('.'));
app.use(express.json());

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const createPaymentIntent = async (amount, currency) => {
    try {
        const response = await axios.post('/create-payment-intent', { amount, currency });
        return response.data.clientSecret;
    } catch (error) {
        console.error('Error creating Payment Intent:', error);
        throw error;
    }
};

app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: ['card'],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(4242, () => console.log('Server running on port 4242'));

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [paymentIntent, setPaymentIntent] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const clientSecret = await createPaymentIntent(2000, 'eur');

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: 'Jenny Rosen',
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setPaymentIntent(paymentIntent);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <CardElement id="card-element" />
            <button type="submit">Submit Payment</button>
            {error && <div id="card-errors" role="alert">{error}</div>}
            {paymentIntent && <div>Payment successful!</div>}
        </form>
    );
};

const StripePayment = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default StripePayment;