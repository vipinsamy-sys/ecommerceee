import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HeroCarousel.module.css';
import heroImage from '../../assets/hero.png';

const slides = [
  {
    id: 1,
    title: "Grand Sale — Up to 50% Off",
    subtitle: "Premium Wet Grinders starting from ₹2,999",
    cta: "Shop Now",
    bg: "#0A1628",
    image: heroImage
  },
  {
    id: 2,
    title: "New Smart TVs — EMI Available",
    subtitle: "Experience 4K clarity with easy monthly payments",
    cta: "Explore TVs",
    bg: "#00B4D8",
    image: heroImage
  },
  {
    id: 3,
    title: "Free Delivery in Erode!",
    subtitle: "Fast and reliable delivery across all Erode areas",
    cta: "Check Pincode",
    bg: "#FFB800",
    image: heroImage
  }
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className={styles.hero}>
      <div className={styles.slider} style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map(slide => (
          <div key={slide.id} className={styles.slide} style={{ backgroundColor: slide.bg }}>
            <div className={`container ${styles.slideContent}`}>
              <div className={styles.textContent}>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <button className={styles.ctaBtn}>{slide.cta}</button>
              </div>
              <div className={styles.imageContent}>
                <img src={slide.image} alt={slide.title} onError={(e) => e.target.src='https://via.placeholder.com/400?text=Image+Not+Found'} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevSlide}><ChevronLeft /></button>
      <button className={`${styles.navBtn} ${styles.next}`} onClick={nextSlide}><ChevronRight /></button>
      
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === current ? styles.active : ''}`} onClick={() => setCurrent(i)}></span>
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
