import React, { useState, useEffect } from 'react';
import '../assets/style/style.css';
import heroBanner1 from '../assets/images/hero-banner-1.png';
import heroBanner2 from '../assets/images/hero-banner-2.png';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    {
      id: 1,
      image: heroBanner1,
      title: 'Prawdziwa kawa. <br /> Każde ziarno.',
      text: 'Nasza kawa to autentyczny smak natury. Każda kropla to jakość i perfekcja w każdym ziarnie.'
    },
    {
      id: 2,
      image: heroBanner2,
      title: 'Prawdziwy smak. <br /> każda filiżanka.',
      text: 'Esencja natury i pasja zamknięte w każdej kropli kawy. Delektuj się wyjątkowym smakiem i aromatem.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="section hero" id="home" aria-label="hero" data-section>
      <div className="container">
        <ul
          className="hero-carousel"
          style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 1s' }}
        >
          {banners.map((banner, index) => (
            <li key={banner.id} className="carousel-item">
              <div className="hero-card has-bg-image" style={{ backgroundImage: `url(${banner.image})` }}>
                <div className="card-content">
                  <h1 className="h1 hero-title" dangerouslySetInnerHTML={{ __html: banner.title }} />
                  <p className="hero-text">{banner.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Hero;
