import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Mic, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';
import VoiceSearch from '../VoiceSearch/VoiceSearch';

const Navbar = ({ onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [lang, setLang] = useState('en');
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setIsMenuOpen(false);
    }
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ta' : 'en');
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <div className={styles.logoPart}>
          <button className={styles.menuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoTamil}>சுகுணா</span>
            <span className={styles.logoEnglish}>Suguna Wet Grinder</span>
          </Link>
        </div>

        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder={lang === 'en' ? "Search for grinders, fans, TVs..." : "தேடுக..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.searchActions}>
            <button type="button" className={styles.micBtn} onClick={() => setIsVoiceActive(true)}>
              <Mic size={20} />
            </button>
            <button type="submit" className={styles.searchBtn}>
              <Search size={20} />
            </button>
          </div>
        </form>

        <div className={`${styles.navActions} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <button className={styles.langToggle} onClick={toggleLang}>
            <Globe size={18} />
            <span>{lang === 'en' ? 'English' : 'தமிழ்'}</span>
          </button>
          <Link to="/products" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            {lang === 'en' ? 'Products' : 'தயாரிப்புகள்'}
          </Link>
          <Link to="/my-orders" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
            {lang === 'en' ? 'My Orders' : 'எனது ஆர்டர்கள்'}
          </Link>
          <button className={styles.cartBtn} onClick={() => { onCartClick(); setIsMenuOpen(false); }}>
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <VoiceSearch 
        isActive={isVoiceActive} 
        onClose={() => setIsVoiceActive(false)} 
        onResult={(text) => {
          setSearchQuery(text);
          navigate(`/products?search=${text}`);
        }}
        lang={lang === 'en' ? 'en-IN' : 'ta-IN'}
      />
    </nav>
  );
};

export default Navbar;
