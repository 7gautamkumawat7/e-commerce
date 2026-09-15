import React from 'react';

export const Hero: React.FC = () => {
  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('product-catalog-section');
    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">THE SUMMER EDIT</p>
        <h1>
          Make room for
          <br />
          <em>more joy.</em>
        </h1>
        <p className="hero-copy">
          Fresh finds for brighter days, from everyday essentials to statement pieces.
        </p>
        <a className="primary-button" href="#product-catalog-section" onClick={scrollToCatalog}>
          Shop summer picks <span>→</span>
        </a>
      </div>
      <div className="hero-art">
        <div className="sun"></div>
        <div className="hero-card card-one">☕</div>
        <div className="hero-card card-two">🎧</div>
        <div className="hero-card card-three">🕶️</div>
        <div className="hero-card card-four">🪴</div>
      </div>
    </section>
  );
};
