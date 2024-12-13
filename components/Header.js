import React, { useState } from 'react';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ shopName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    const nav = document.querySelector('.header .nav ul');
    if (nav.style.display === 'none' || nav.style.display === '') {
      nav.style.display = 'block';
    } else {
      nav.style.display = 'none';
    }
  };

  return (
    <>
      <section className="sub">
        Livraison gratuite en 48h | Produit Made in France | CODE PROMO 10% : WELCOME10
      </section>
      <header className="header">
          <a href="/"><h2>{shopName}</h2></a>
          <nav className="nav">
            <ul>
              <li><a href="/">Accueil</a></li>
              <li><a href="/boutique">Boutique</a></li>
              <li><a href="/#a-propos">A propos</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </nav>
          <span className="cart-icon"><FaShoppingCart /></span>
          <span className="burger-icon" onClick={toggleMenu}>{isMenuOpen ? <FaTimes /> : <FaBars />} </span>
      </header>
    </>
  );
};

export default Header;