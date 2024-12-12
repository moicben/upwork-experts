import Head from 'next/head'
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import content from '../content.json'

export default function Home() {
  const site = content.sites[0]; // Limite l'affichage au premier site

  return (
    <div className="container">
      <Head className="header">
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main key={site.id}>
        <section className="sub">
          Livraison gratuite en 48h | Produit Made in France | 10% de promotion : WELCOME10
        </section>
        <header className="header">
            <h2>{site.shopName}</h2>
          <nav className="nav">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
          <div className="cart-icon">
            <FaShoppingCart />
          </div>
        </header>
        
        <section className="hero" style={{ backgroundImage: `url('/path/to/your/image.jpg')` }}>
          <h2>{site.heroTitle}</h2>
          <p>{site.heroDescription}</p>
          <button>Shop Now</button>
        </section>
        
        <section className="intro">
          <h2>{site.introTitle}</h2>
          <p>{site.introDescription}</p>
        </section>

        <section className="products">
          <h2>Tous nos produits</h2>
          
        </section>
        
        <section className="about">
          <div className="about-content">
            <h2>{site.aboutTitle}</h2>
            <p>{site.aboutDescription}</p>
          </div>
          <div className="about-image">
            <img src="/path/to/your/image.jpg" alt="About Us" />
          </div>
        </section>
        
        <section className="testimonials">
          <h2>Nos clients témoignent !</h2>
          <div>
            <blockquote className="testimonial">
              <p>{site.testimonial1}</p>
              <p>{site.author1}</p>
            </blockquote>
            <blockquote className="testimonial">
              <p>{site.testimonial2}</p>
              <p>{site.author2}</p>
            </blockquote>
            <blockquote className="testimonial">
              <p>{site.testimonial3}</p>
              <p>{site.author3}</p>
            </blockquote>
          </div>
        </section>
        
        <section className="contact">
          <div className="contact-content">
            <h2>{site.contactTitle}</h2>
            <p>{site.contactDescription}</p>
          </div>
          <div className="contact-form">
            <form>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
              
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
              
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required></textarea>
              
              <button type="submit">Send</button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div class="footer-column">
          <h4>{site.shopName}</h4>
          <p>{site.footerText}</p>
        </div>
        <div class="footer-column">
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/shop">Boutique</a></li>
            <li><a href="/about">À propos</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Informations</h4>
          <ul>
            <li><a href="/conditions-generales">Conditions Générales</a></li>
            <li><a href="/confidentialite">Politique de Confidentialité</a></li>
            <li><a href="/mentions-legales">Mentions Légales</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Newsletter</h4>
          <form action="mailto:benedikt.strokin@gmail.com"> 
            <label for="email">Inscrivez-vous pour des nouvelles et des offres exclusives :</label>
            <input type="email" id="email" name="email" placeholder="Votre email" required />
            <button type="submit">S'inscrire</button>
          </form>
        </div>
      </footer>
       
    </div>
  )
}