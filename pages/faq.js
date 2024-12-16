import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Faq = ({ site }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        { question: 'Quelle est votre politique de retour ?', answer: 'Vous pouvez retourner tout article dans les 30 jours suivant l\'achat.' },
        { question: 'Comment puis-je suivre ma commande ?', answer: 'Vous pouvez suivre votre commande en utilisant le numéro de suivi fourni dans votre email de confirmation.' },
        { question: 'Offrez-vous la livraison internationale ?', answer: 'Oui, nous offrons la livraison internationale vers de nombreux pays.' },
        { question: 'Comment puis-je contacter le service client ?', answer: 'Vous pouvez contacter notre service client via notre formulaire de contact sur le site.' },
        { question: 'Quels modes de paiement acceptez-vous ?', answer: 'Nous acceptons les cartes de crédit, PayPal et les virements bancaires.' },
        { question: 'Puis-je modifier ma commande après l\'avoir passée ?', answer: 'Oui, vous pouvez modifier votre commande tant qu\'elle n\'a pas encore été expédiée.' },
        { question: 'Proposez-vous des réductions pour les commandes en gros ?', answer: 'Oui, nous offrons des réductions pour les commandes en gros. Veuillez nous contacter pour plus de détails.' },
        { question: 'Comment puis-je m\'inscrire à votre newsletter ?', answer: 'Vous pouvez vous inscrire à notre newsletter en entrant votre email dans le champ prévu à cet effet en bas de notre site.' },
        { question: 'Quels sont vos délais de livraison ?', answer: 'Les délais de livraison varient en fonction de votre localisation et du mode de livraison choisi.' },
        { question: 'Puis-je annuler ma commande ?', answer: 'Oui, vous pouvez annuler votre commande tant qu\'elle n\'a pas encore été expédiée.' },
        { question: 'Comment puis-je utiliser un code promo ?', answer: 'Vous pouvez entrer votre code promo lors du processus de paiement dans le champ prévu à cet effet.' },
        { question: 'Avez-vous un programme de fidélité ?', answer: 'Oui, nous avons un programme de fidélité. Vous pouvez vous inscrire dès votre première commande réalisée pour commencer à accumuler des points.' },
    ];

    return (
        <div key={site.id} className="container">
            <Head>
                <title>{`Questions fréquentes - ${site.shopName}`}</title>
                <meta name="description" content="Frequently Asked Questions" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <Header shopName={site.shopName} keywordPlurial={site.keywordPlurial} />
            
            <main>
                <div className="faq-container">
                    <h1>Questions fréquentes</h1>
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <div className="faq-question" onClick={() => toggleFAQ(index)}>
                                {faq.question}
                            </div>
                            <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            <Footer shopName={site.shopName} footerText={site.footerText} />
        </div>
    );
};

export async function getStaticProps() {
    const content = await import('../content.json');
    if (!content.sites || content.sites.length === 0) {
        return {
            notFound: true,
        };
    }
    return {
        props: {
            site: content.sites[0],
        },
    };
}

export default Faq;