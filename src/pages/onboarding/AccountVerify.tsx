import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const AccountVerify = () => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate('/lesson/intro');
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
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, alignItems: 'flex-start' }}>
          <img
            src="/images/onboarding/Email.jpg"
            alt="Email Reminder"
            style={{ maxWidth: '40%', height: 'auto', marginBottom: '1.5rem', borderRadius: 12, display: 'block' }}
          />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0, textAlign: 'left' }}>
            We've sent you an account verification email, please check your inbox.
          </h1>
        </div>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button
            onClick={handleStartNow}
            variant="disabled"
            fullWidth
            disabled
          >
            Check Your Inbox
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AccountVerify; 