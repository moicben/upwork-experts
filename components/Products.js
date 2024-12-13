import React, { useState } from 'react';
import content from '../content.json';

const Products = ({title, products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Calculer les produits à afficher sur la page actuelle
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Gérer le changement de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Limite l'affichage au premier site
  const site = content.sites[0]; 


  return (
    <section className="products">
      <div className='wrapper'>
        <h2>{title}</h2>
        <div className="product-list">
          {currentProducts.map(product => (
            <a href={`/produits/${product.slug}`} key={product.id} className="product-item">
              <img src={product.imageUrl} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price}</p>
            </a>
          ))}
        </div>
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Précédent
          </button>
          <span>{currentPage} sur {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
};

export default Products;