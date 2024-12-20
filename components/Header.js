import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaRegTrashAlt } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';

const Header = ({ shopName, keywordPlurial }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartDrawerRef = useRef(null);
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartDrawerRef.current && !cartDrawerRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  useEffect(() => {
    const cartDrawer = document.querySelector('.cart-drawer');
    if (isCartOpen) {
      cartDrawer.classList.add('open');
    } else {
      cartDrawer.classList.remove('open');
    }
  }, [isCartOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    const nav = document.querySelector('.header .nav ul');
    if (nav.style.display === 'none' || nav.style.display === '') {
      nav.style.display = 'block';
    } else {
      nav.style.display = 'none';
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      <section className="sub">
        Commencez 2025 en beauté : -15% sur tous nos {keywordPlurial} avec le code : "YEAR15" !
      </section>
      <header className="header">
          <a className="logo-header" href="/"><img src='/favicon.ico'/><h2>{shopName}</h2></a>
          <nav className="nav">
            <ul>
              <li><a href="/">Accueil</a></li>
              <li><a href="/boutique">Boutique</a></li>
              <li><a href="/#a-propos">A propos</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </nav>
          <div className="cart-container" onClick={toggleCart}>
            <FaShoppingCart className="cart-icon" />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </div>
          <span className="burger-icon" onClick={toggleMenu}>{isMenuOpen ? <FaTimes /> : <FaBars />} </span>
      </header>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} ref={cartDrawerRef}>
        <h2>Panier</h2>
        {cart.length === 0 ? (
          <p>Votre panier est vide</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <img src={item.productImages[0]} alt={item.productTitle} />
                <div>
                  <h3>{item.productTitle}</h3>
                  <p>{item.productPrice}</p>
                  <div className="quantity-selector">
                    <button onClick={() => updateQuantity(index, item.quantity > 1 ? item.quantity - 1 : 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                  </div>
                  <button className="delete" onClick={() => removeFromCart(index)}>
                    <FaRegTrashAlt />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="total">
            <h4>Total dû :</h4>
            <p>{cart.reduce((total, item) => total + parseFloat(item.productPrice.replace('€', '').replace(',', '.')) * item.quantity, 0).toFixed(2)} €</p>
        </div>
        <button className="close" onClick={toggleCart}>+</button>
        <a href='/paiement'><button className="checkout">Passer à la caisse</button></a>
      </div>
    </>
  );
};

export default Header;