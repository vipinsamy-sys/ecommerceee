import React, { useState, useEffect } from 'react';
import { X, Bot, Loader2, MessageSquare } from 'lucide-react';
import styles from './AIAdvisor.module.css';

const AIAdvisor = ({ products, onClose }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAdvice = async () => {
      setLoading(true);
      setError(null);
      
      const productDetails = products.map(p => 
        `${p.name} (${p.brand}) - ₹${p.price}. Specs: ${JSON.stringify(p.specs)}`
      ).join('\n');

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 300,
            system: "You are a helpful electronics shop assistant for Suguna Wet Grinder in Erode, Tamil Nadu. A customer is comparing these products. Give a friendly, honest recommendation in 3-4 sentences in simple English. End with a single clear recommendation of which to buy and why. Be concise.",
            messages: [
              {
                role: 'user',
                content: `Please compare these products and recommend one:\n${productDetails}`
              }
            ]
          })
        });

        if (!res.ok) throw new Error('Failed to fetch advice from AI.');
        
        const data = await res.json();
        setResponse(data.content[0].text);
      } catch (err) {
        console.error(err);
        setError("Our AI Advisor is currently busy helping other customers in Erode. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };

    getAdvice();
  }, [products]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X /></button>
        
        <div className={styles.header}>
          <div className={styles.botIcon}>
            <Bot size={32} />
          </div>
          <div>
            <h3>Suguna AI Advisor</h3>
            <p>Smart recommendations for you</p>
          </div>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2 className={styles.spinner} />
              <p>Analyzing products for the best choice...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : (
            <div className={styles.response}>
              <MessageSquare className={styles.quoteIcon} size={24} />
              <div className={styles.text}>{response}</div>
              <div className={styles.footer}>
                <p>✓ Based on local Erode customer preferences</p>
              </div>
            </div>
          )}
        </div>

        <button className={styles.doneBtn} onClick={onClose}>Got it, thanks!</button>
      </div>
    </div>
  );
};

export default AIAdvisor;
