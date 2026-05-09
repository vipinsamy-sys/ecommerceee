import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Zap, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const placeholderImg = 'https://via.placeholder.com/400?text=Image+Not+Found';

const ProductCard = ({ product }) => {
  const { addToCart, toggleCompare, compareList } = useCart();
  const navigate = useNavigate();
  const [showBuyNow, setShowBuyNow] = useState(false);

  const isComparing = compareList.some(p => p.id === product.id);

  const handleBuyNow = () => {
    addToCart(product);
    setShowBuyNow(true);
    // Show preview then navigate after short delay
    setTimeout(() => {
      setShowBuyNow(false);
      navigate('/checkout');
    }, 2500);
  };

  const handleImgError = (e) => {
    e.target.src = placeholderImg;
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.image} 
              alt={product.name} 
              className={styles.image} 
              onError={handleImgError}
            />
          </Link>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <div className={styles.compareCheck}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={isComparing}
                onChange={() => toggleCompare(product)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.compareText}>+ Compare</span>
            </label>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.brandRow}>
            <span className={styles.brand}>{product.brand}</span>
            <div className={styles.rating}>
              <Star size={14} fill="var(--gold)" color="var(--gold)" />
              <span>{product.rating}</span>
              <span className={styles.reviews}>({product.reviews.toLocaleString()})</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span className={styles.discount}>{product.discount}% off</span>
          </div>

          {product.price > 5000 && (
            <p className={styles.emi}>EMI available from ₹999/month</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.cartBtn}
              onClick={() => addToCart(product)}
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
            <button
              className={styles.buyBtn}
              onClick={handleBuyNow}
            >
              <Zap size={18} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>

      {showBuyNow && (
        <div className={styles.buyNowOverlay}>
          <div className={styles.buyNowModal}>
            <button className={styles.closeBtn} onClick={() => setShowBuyNow(false)}>
              <X size={20} />
            </button>
            <img 
              src={product.image} 
              alt={product.name} 
              className={styles.previewImg} 
              onError={handleImgError}
            />
            <h3>Added to Cart!</h3>
            <p>{product.name}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
