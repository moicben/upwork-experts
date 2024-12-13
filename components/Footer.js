import React from 'react';
import styles from './Footer.module.css'

const Footer = ({ shopName, footerText }) => {
  return (
    <>
      <footer>
        <div class="footer-column">
        <a href="/"><h4>{shopName}</h4></a>
          <p>{footerText}</p>
        </div>
        <div class="footer-column">
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/shop">Boutique</a></li>
            <li><a href="/about">A propos</a></li>
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
    </>
  )
}

export default Footer;