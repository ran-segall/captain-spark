import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import Button from '../../components/Button';
import BackIcon from '../../assets/icons/back-icon-blue.svg';

const KidAge = () => {
  const [childAge, setChildAge] = useState('');
  const navigate = useNavigate();

  const handleContinue = () => {
    // Store in localStorage as a temporary global state
    localStorage.setItem('childAge', childAge);
    navigate('/onboarding/create-account');
  };

  const isValidAge = () => {
    const age = parseInt(childAge);
    return !isNaN(age) && age >= 3 && age <= 18;
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
          if (e.key === 'Enter' && isValidAge()) {
            handleContinue();
          }
        }}
        tabIndex={-1}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <OnboardingProgressBar step={3} totalSteps={4} />
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
            What's their age?
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="child-age" style={{ fontSize: '1rem', color: '#222' }}>Child Age</label>
            <input
              id="child-age"
              type="number"
              value={childAge}
              onChange={e => setChildAge(e.target.value)}
              placeholder=""
              min="3"
              max="18"
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
        </div>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Button
            onClick={handleContinue}
            disabled={!isValidAge()}
            variant={!isValidAge() ? 'disabled' : 'primary'}
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default KidAge;
