import Head from 'next/head';
import content from '../../content.json';
import productsData from '../../products.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Products from '../../components/Products';

export default function ProductDetail({ product, site, products }) {
  if (!product) {
    return <p>Produit non trouvé</p>;
  }

  return (
    <div className="container">
      <Head>
        <title>{product.name} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} />
        
        <section className="product-detail">
          <div className='wrapper'>
            <div className="product-columns">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className="product-info">
                <h1>{product.name}</h1>
                <p className="product-price">{product.price}</p>
                <button>Ajouter au panier</button>
                <div className="product-content">
                  <h3>À propos du produit</h3>
                  <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <Products title={`Produits similaires`} products={products} />
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
  const site = content.sites.find(s => s.id === product.siteId);
  const products = productsData.products.filter(p => p.siteId === site.id);

  return {
    props: {
      product,
      site,
      products,
    },
  };
}