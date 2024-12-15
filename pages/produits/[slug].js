import Head from 'next/head';
import content from '../../content.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Products from '../../components/Products';
import fs from 'fs';
import path from 'path';


export default function ProductDetail({ product, site, products }) {
  if (!product) {
    return <p>Produit non trouvé</p>;
  }

  return (
    <div className="container">
      <Head>
        <title>{product.productTitle} - {site.shopName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <Header shopName={site.shopName} />
        
        <section className="product-detail">
          <div className='wrapper'>
            <div className="product-columns">
              <div className="product-image">
                <img src={product.productImage} alt={product.productTitle} />
                <img src={product.productImage2} alt={product.productTitle + "2"} />
                <img src={product.productImage3} alt={product.productTitle + "3"} />
              </div>
              <div className="product-info">
                <h1>{product.productTitle}</h1>
                <p className="product-price">{product.productPrice}</p>
                <button>Ajouter au panier</button>
                <div className="product-content">
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
  const paths = content.sites.flatMap(site => {
    try {
      const filePath = path.join(process.cwd(), 'products', `${site.slug}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent) {
        console.warn(`File ${filePath} is empty. Skipping.`);
        return [];
      }
      const productsData = JSON.parse(fileContent);
      return productsData.products.map(product => ({
        params: { slug: product.slug },
      }));
    } catch (error) {
      console.error(`Error loading products for site ${site.slug}:`, error);
      return [];
    }
  });

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const isLocalhost = process.env.NODE_ENV === 'development';
  let product = null;
  let site = null;
  let products = [];

  const sitesToCheck = isLocalhost ? [content.sites[0]] : content.sites;

  for (const s of sitesToCheck) {
    try {
      const filePath = path.join(process.cwd(), 'products', `${s.slug}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent) {
        console.warn(`File ${filePath} is empty. Skipping.`);
        continue;
      }
      const productsData = JSON.parse(fileContent);
      product = productsData.products.find(p => p.slug === params.slug);
      if (product) {
        site = s;
        products = productsData.products.filter(p => p.siteId === site.id);
        break;
      }
    } catch (error) {
      console.error(`Error loading products for site ${s.slug}:`, error);
    }
  }

  return {
    props: {
      product,
      site,
      products,
    },
  };
}