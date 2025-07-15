import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/ScreenLayout';
import Button from '../components/Button';
import BackIcon from '../assets/icons/back-icon-blue.svg';
import { supabase, getLoginRedirectUrl } from '../utils/supabaseClient';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Check if email exists in our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        setError('Email not found');
        setTimeout(() => {
          navigate('/onboarding');
        }, 1500);
        setIsSubmitting(false);
        return;
      }

      // 2. Send magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getLoginRedirectUrl(),
        },
      });
      
      if (otpError) {
        setError('Error sending magic link: ' + otpError.message);
        setIsSubmitting(false);
        return;
      }
      
      // Success - navigate to MagicLinkSent screen
      navigate('/magic-link-sent');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div
        style={{
          padding: '2rem',
          width: '100%',
          height: '100%',
          minHeight: '650px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxSizing: 'border-box',
          alignItems: 'center',
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && isValidEmail(email) && !isSubmitting) {
            handleContinue();
          }
        }}
        tabIndex={-1}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              width: 'fit-content',
            }}
            aria-label="Back"
          >
            <img src={BackIcon} alt="Back" style={{ width: 24, height: 24 }} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0 }}>
            What Email did you sign up with?
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="email" style={{ fontSize: '1rem', color: '#222' }}>Your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=""
              style={{
                width: '100%',
                fontSize: '1.1rem',
                padding: '0.75rem',
                border: '2px solid #163657',
                borderRadius: 8,
                outline: 'none',
                fontWeight: 500,
                color: '#163657',
                background: '#fff',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              autoFocus
            />
          </div>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Button
            onClick={handleContinue}
            disabled={!isValidEmail(email) || isSubmitting}
            variant={!isValidEmail(email) || isSubmitting ? 'disabled' : 'primary'}
            fullWidth
            loading={isSubmitting}
          >
            {isSubmitting ? 'Sending Magic Link...' : 'Continue'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LogIn; 