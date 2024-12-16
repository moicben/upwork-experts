import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TrackOrder = ({ site }) => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [error, setError] = useState('');

    const handleTrackOrder = async () => {
        try {
            const response = await fetch(`/api/track?number=${trackingNumber}`);
            const data = await response.json();
            if (data && data.status) {
                setTrackingInfo(data);
                setError('');
            } else {
                setTrackingInfo(null);
                setError('Code de suivi non-trouvé');
            }
        } catch (err) {
            setTrackingInfo(null);
            setError('Erreur : code de suivi non-trouvé dans la base de données'); 
        }
    };

    return (
        <div key={site.id} className="container">
            <Head>
                <title>{`Suivre mon colis - ${site.shopName}`}</title>
                <meta name="description" content="Suivez votre commande en temps réel" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <Header shopName={site.shopName} keywordPlurial={site.keywordPlurial} />
            
            <main>
                <div className="track-order-container">
                    <h1>Suivre mon colis</h1>
                    <p>Entrez votre numéro de suivi ci-dessous pour obtenir les informations les plus récentes sur votre commande. Nous nous engageons à vous fournir des mises à jour en temps réel pour que vous puissiez suivre votre colis en toute tranquillité.</p>
                    <div className="track-order-form">
                        <input
                            type="text"
                            placeholder="Entrez votre numéro de suivi"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <button onClick={handleTrackOrder}>Suivre</button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {trackingInfo && (
                        <div className="tracking-info">
                            <h2>Informations de suivi</h2>
                            <p>Status: {trackingInfo.status}</p>
                            <p>Dernière mise à jour: {trackingInfo.lastUpdate}</p>
                            <p>Lieu actuel: {trackingInfo.currentLocation}</p>
                        </div>
                    )}
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

export default TrackOrder;
