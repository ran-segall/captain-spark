import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';

const PersonalWelcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the main app or next step
    navigate('/dashboard'); // or wherever you want to go after onboarding
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
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0 }}>
            Welcome to Captain Spark!
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.5, margin: 0 }}>
            Your account has been created successfully. We're excited to help you and your child on this learning journey!
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: 400, marginTop: '2rem' }}>
          <Button
            onClick={handleGetStarted}
            variant="primary"
            fullWidth
          >
            Get Started
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PersonalWelcome; 