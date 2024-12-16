import { useState, useEffect } from 'react';
import Head from 'next/head';
import content from '../../content.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Products from '../../components/Products';
import productsData from '../../products.json';

export default function ProductDetail({ product, site, products }) {
  const [cartCount, setCartCount] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const images = [product.productImage, product.productImage2, product.productImage3, product.productImage4, product.productImage5];

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(storedCart.length);
  }, []);

  if (!product || !site) {
    return <div>Produit ou site non trouvé</div>;
  }

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productWithQuantity = { ...product, quantity };
    cart.push(productWithQuantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);
    // Ouvrir le drawer du panier
    document.querySelector('.cart-container').click();
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNextClick = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

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
        <Header shopName={site.shopName} cartCount={cartCount} keywordPlurial={site.keywordPlurial}/>
        
        <section className="product-hero">
            <div className="product-columns">
              <div className="product-image">
                <div className="thumbnail-container">
                  {images.map((image, index) => (
                    image && (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.productTitle} ${index + 1}`}
                        onClick={() => handleImageClick(index)}
                        className={`thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
                      />
                    )
                  ))}
                  <button onClick={handleNextClick} className="arrow next">
                    <i className="fas fa-chevron-down"></i>
                  </button>
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
                  <button onClick={handleAddToCart}>Ajouter au panier</button>
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

        
        <section className='product-reviews'>
          <div className='wrapper'>
            {product.reviews && product.reviews.length > 0 ? (
              <div className='slider'>
                {product.reviews.map((review, index) => (
                  <div key={index} className="slide">
                    {product.reviewImages && product.reviewImages[index] && (
                      <img src={product.reviewImages[index]} alt={`Review ${index + 1}`} className="review-image" />
                    )}
                    <div dangerouslySetInnerHTML={{ __html: review }} />
                    
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun avis pour ce produit.</p>
            )}
          </div>
        </section>
  
        <section className="product-description">
          <div className="wrapper">
            <div className="product-content" dangerouslySetInnerHTML={{ __html: product.description }} />
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