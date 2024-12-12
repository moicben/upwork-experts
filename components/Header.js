import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

export default function Header({ shopName }) {
  return (
    <header className="header">
        <h1>{shopName}</h1>
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
  );
}