import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaRegTrashAlt } from 'react-icons/fa';

const Header = ({ shopName, cartCount, onAddToCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const cartDrawerRef = useRef(null);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  }, []);

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
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  };

  const handleAddToCart = (item) => {
    const updatedCart = [...cart, item];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <>
      <section className="sub">
        Livraison gratuite en 48h | Produit Made in France | CODE PROMO 10% : WELCOME10
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
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
          <span className="burger-icon" onClick={toggleMenu}>{isMenuOpen ? <FaTimes /> : <FaBars />} </span>
      </header>
      {isCartOpen && (
        <div className="cart-drawer" ref={cartDrawerRef}>
          <h2>Panier</h2>
          {cart.length === 0 ? (
            <p>Votre panier est vide</p>
          ) : (
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  <img src={item.productImage} alt={item.productTitle} />
                  <div>
                    <h3>{item.productTitle}</h3>
                    <p>{item.productPrice}</p>
                    <div className="quantity-selector">
                      <button onClick={() => handleQuantityChange(index, item.quantity > 1 ? item.quantity - 1 : 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                    </div>
                    <button className="delete" onClick={() => handleRemoveFromCart(index)}>
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
      )}
    </>
  );
};

export default Header;