import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import content from '../content.json';


const Testimonials = ({ site }) => {
  return (
    <>
      <section className="testimonials">
        <div className='wrapper'>
            <h2>Nos clients témoignent !</h2>
            <div className='testimonials-content'>
                <blockquote className="testimonial">
                <p>{site.testimonial1}</p>
                <p>{site.author1}</p>
                </blockquote>
                <blockquote className="testimonial">
                <p>{site.testimonial2}</p>
                <p>{site.author2}</p>
                </blockquote>
                <blockquote className="testimonial">
                <p>{site.testimonial3}</p>
                <p>{site.author3}</p>
                </blockquote>
            </div>
            </div>
        </section>
    </>
  );
};

export default Testimonials;