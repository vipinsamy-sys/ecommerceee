import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Check, MapPin, CreditCard, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import { ERODE_PINCODES } from '../data/pincodes';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form State
  const [address, setAddress] = useState({
    name: '', phone: '', pincode: '', line1: '', line2: '', landmark: '', 
    city: 'Erode', district: 'Erode'
  });
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'valid', 'invalid', null
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setAddress({ ...address, pincode: val });
    if (val.length === 6) {
      if (ERODE_PINCODES.includes(parseInt(val))) {
        setPincodeStatus('valid');
      } else {
        setPincodeStatus('invalid');
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (pincodeStatus !== 'valid') return;
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'online' && !transactionId) return;
      // Finalize order
      clearCart();
      navigate('/order-confirmation');
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className={`container ${styles.empty}`}>
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Shop Now</button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 1 ? <Check size={16} /> : 1}</div>
          <span>Address</span>
        </div>
        <div className={styles.connector}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 2 ? <Check size={16} /> : 2}</div>
          <span>Payment</span>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 1 && (
            <div className={styles.card}>
              <h3>Delivery Address</h3>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Enter name" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="10-digit number" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>Pincode</label>
                    <input type="text" maxLength={6} value={address.pincode} onChange={handlePincodeChange} placeholder="6 digits" />
                    {pincodeStatus === 'invalid' && (
                      <p className={styles.errorText}><AlertCircle size={14} /> Delivery available only in Erode & surrounding areas.</p>
                    )}
                    {pincodeStatus === 'valid' && (
                      <p className={styles.successText}><Check size={14} /> Delivery available to your area!</p>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Address (House No, Building, Street, Area)</label>
                  <input type="text" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" value={address.city} readOnly disabled />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>District</label>
                    <input type="text" value={address.district} readOnly disabled />
                  </div>
                </div>

                <button 
                  className={styles.nextBtn} 
                  disabled={pincodeStatus !== 'valid' || !address.name || !address.phone}
                  onClick={handleNext}
                >
                  DELIVER TO THIS ADDRESS
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.card}>
              <h3>Payment Options</h3>
              <div className={styles.paymentList}>
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.selected : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                  <div className={styles.optionContent}>
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive the product</p>
                  </div>
                </div>

                <div 
                  className={`${styles.paymentOption} ${paymentMethod === 'online' ? styles.selected : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <input type="radio" checked={paymentMethod === 'online'} readOnly />
                  <div className={styles.optionContent}>
                    <h4>UPI Payment (GPay, PhonePe, Paytm)</h4>
                    <p>Pay securely via QR Code</p>
                  </div>
                </div>
              </div>

              {paymentMethod === 'online' && (
                <div className={styles.qrSection}>
                  <div className={styles.qrBox}>
                    {/* Placeholder QR */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=suguna.wetgrinder@upi" alt="Payment QR" />
                    <p>UPI ID: <strong>suguna.wetgrinder@upi</strong></p>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Enter Transaction ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 329048123456" 
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                    />
                    <p className={styles.hint}>Verify after scanning the QR code</p>
                  </div>
                </div>
              )}

              <button 
                className={styles.nextBtn} 
                disabled={paymentMethod === 'online' && !transactionId}
                onClick={handleNext}
              >
                {paymentMethod === 'cod' ? 'CONFIRM ORDER' : 'COMPLETE PAYMENT'}
              </button>
            </div>
          )}
        </div>

        <aside className={styles.summary}>
          <div className={styles.card}>
            <h3>Price Details</h3>
            <div className={styles.summaryRow}>
              <span>Price ({cart.length} items)</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span className={styles.free}>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.savings}>
              You will save ₹{Math.round(cartTotal * 0.2).toLocaleString()} on this order
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
