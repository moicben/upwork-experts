import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import content from '../content.json';
import partnersData from '../partners.json';

const Partenaires = () => {
    const [partners, setPartners] = useState([]);
    const site = content.sites[0];

    useEffect(() => {
        setPartners(partnersData);
    }, []);

    return (
        <div key={site.id} className="container">
            <Head>
                <title>{`Nos Partenaires - ${site.shopName}`}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <main>
                <Header shopName={site.shopName} keywordPlurial={site.keywordPlurial} />
                
                <section className='partners'>
                    <h1>{`Partenaires de ${site.shopName}`}</h1>
                    <ul>
                        {partners.map((partenaire, index) => (
                            <li key={index}>
                                <a href={partenaire.url} target="_blank" rel="noopener noreferrer">
                                    <h3>{partenaire.name}</h3>
                                </a>
                            </li>
                        ))}
                    </ul>

                        <p>
                            <strong>Chez {site.shopName}</strong>, nous collaborons avec une large gamme de partenaires pour transformer votre quotidien et répondre à tous vos besoins en matière de <strong>{site.keywordPlurial}</strong>. 
                            Nos partenaires sont des experts reconnus dans des domaines variés comme l’électronique, la maison, le jardinage et bien sûr, <strong>{site.keyword}</strong>. 
                            Grâce à notre réseau de confiance, nous vous offrons des produits exceptionnels comme "{site.heroTitle}", qui allient <strong>{site.heroDescription}</strong> pour une expérience client inégalée.
                        </p>

                        <p>
                            Lorsque vous choisissez {site.shopName}, vous bénéficiez d’un service de qualité qui met votre satisfaction au centre de nos priorités. 
                            Nous travaillons en étroite collaboration avec nos partenaires pour sélectionner des produits fabriqués avec passion et savoir-faire en <strong>France</strong>. 
                            Nos produits, tels que nos <strong>{site.keywordPlurial}</strong>, sont conçus pour garantir à la fois <strong>durabilité</strong>, <strong>confort</strong> et respect de votre budget.
                        </p>

                        <p>
                            <strong>Découvrez les offres exclusives de nos partenaires</strong> et accédez à des avantages uniques sur notre site {site.shopName}. 
                            Avec une politique de retour sous 30 jours et un service client réactif, nous nous engageons à vous offrir une expérience d'achat sans tracas. 
                            Chez {site.shopName}, nous croyons que chaque détail compte. C’est pourquoi nous vous proposons des produits comme "{site.heroTitle}", spécialement sélectionnés pour répondre aux besoins des foyers modernes.
                        </p>
                </section>
            </main>
            <Footer shopName={site.shopName} footerText={site.footerText} />
        </div>
    );
};

export default Partenaires;