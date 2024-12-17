import React, { useRef } from 'react';

const Reviews = ({ product }) => {
    const sliderRef = useRef(null);

    return (
        <section className='product-reviews'>
            <div className='wrapper' ref={sliderRef}>
                {product.reviews && product.reviews.length > 0 ? (
                    <>
                        <div className='slider'>
                            {product.reviews.map((review, index) => (
                                <div key={index} className='slide'>
                                    {product.reviewImages && product.reviewImages.length >= 3 && product.reviewImages[index] && (
                                        <img
                                            src={product.reviewImages[index]}
                                            alt={`Review ${index + 1}`}
                                            className='review-image'
                                        />
                                    )}
                                    <div dangerouslySetInnerHTML={{ __html: review }} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Aucun avis pour ce produit.</p>
                )}
            </div>
        </section>
    );
};

export default Reviews;