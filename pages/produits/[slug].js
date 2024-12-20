import { useState, useEffect, useRef, useContext } from 'react';
import Head from 'next/head';
import content from '../../content.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Products from '../../components/Products';
import productsData from '../../products.json';
import Reviews from '../../components/Reviews';
import { CartContext } from '../../context/CartContext';

export default function ProductDetail({ product, site, products }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [visibleImageIndex, setVisibleImageIndex] = useState(0);
  const [buttonText, setButtonText] = useState('Ajouter au panier');
  const sliderRef = useRef(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartDrawer = document.querySelector('.cart-drawer');
      if (cartDrawer && cartDrawer.contains(event.target)) {
        cartDrawer.classList.add('open');
      } else {
        cartDrawer.classList.remove('open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!product || !site) {
    return <div>Produit ou site non trouvé</div>;
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, id: product.slug });
    setButtonText('Ajouté !');
    setTimeout(() => setButtonText('Ajouter au panier'), 3000);
    // Ouvrir le drawer du panier
    document.querySelector('.cart-drawer').classList.add('open');
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNextImages = () => {
    if (visibleImageIndex + 4 < images.length) {
      setVisibleImageIndex(visibleImageIndex + 4);
    } else {
      setVisibleImageIndex(0); // Reset to the beginning
    }
  };

  const images = product.productImages || [];
  const visibleImages = images.slice(visibleImageIndex, visibleImageIndex + 4);

  return (
    <div className="container">
      <Head>
        <title>{product.productTitle} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Head>
      
      <main>
        <Header shopName={site.shopName} keywordPlurial={site.keywordPlurial} />
        
        <section className="product-hero">
            <div className="product-columns">
              <div className="product-image">
                <div className="thumbnail-container">
                  {visibleImages.map((image, index) => (
                    image && (
                      <img
                        key={index + visibleImageIndex}
                        src={image}
                        alt={`${product.productTitle} ${index + 1}`}
                        onClick={() => handleImageClick(index + visibleImageIndex)}
                        className={`thumbnail ${selectedImageIndex === index + visibleImageIndex ? 'selected' : ''}`}
                      />
                    )
                  ))}
                  {images.length > 3 && (
                    <button className="next-button" onClick={handleNextImages}>
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  )}
                </div>
                {images[selectedImageIndex] && (
                  <img src={images[selectedImageIndex]} alt={product.productTitle} className="large-image" />
                )}
              </div>
              <div className="product-info">
                <h1>{product.productTitle}</h1>
                <p className="product-price">{product.productPrice}</p>
                <article className="purchase-row">
                  <div className="quantity-selector">
                    <button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                  <button onClick={handleAddToCart}>{buttonText}</button>
                </article>
                <ul className='product-features'>
                  <li>
                    <span><i className="fas fa-lock"></i>Paiement Sécurisé</span><img src='/card-badges.png' alt={"paiement " + site.keyword} />
                  </li>
                  <li>
                    <span><i className="fas fa-check"></i>En stock, expédié sous 24/48h</span>
                  </li>
                  <li>
                    <span><i className="fas fa-truck"></i>Livraison Suivie OFFERTE</span>
                  </li>
                </ul>
                <div className='gift-container'>
                  <div className='cover'></div>
                    <h4>JOYEUSE ANNÉE 2025 !</h4>
                    <h5>AVEC {site.shopName.toUpperCase()}</h5>
                    <p>- 15% de réduction avec le code "<strong>YEAR15</strong>"</p>
                    <p>- Livraison gratuite sans minimum d'achat</p>
                    <p>- Retours étendus jusqu'au 14/03/2025 </p>
                </div>
              </div>
          </div>
        </section>

        <Reviews product={product} />
  
        <section className="product-description">
          <div className="wrapper">
            <div className="product-content" dangerouslySetInnerHTML={{ __html: product.productDescription }} />
          </div>
        </section>
  
        <Products title={`Vous pourriez également aimer :`} products={products} />
      </main>
      <Footer shopName={site.shopName} footerText={site.footerText} />
    </div>
  );
}

export async function getStaticPaths() {
  const paths = productsData.products.map(product => ({
    params: { slug: product.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const product = productsData.products.find(p => p.slug === params.slug);
  const site = content.sites[0];
  const products = productsData.products.filter(p => p.siteId === site.id);

  return {
    props: {
      product: product || null,
      site: site || null,
      products,
    },
  };
}