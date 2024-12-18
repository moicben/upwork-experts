const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors({
    origin: '*'
})); // Ajoutez cette ligne pour utiliser le middleware CORS avec toutes les origines
app.use(express.json());

// Gérer les requêtes préliminaires (OPTIONS)
app.options('*', cors());

/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});*/

app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3001, () => console.log('Server running on port 3001'));