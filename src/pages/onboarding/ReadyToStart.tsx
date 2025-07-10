import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';

function capitalizeName(name: string) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const ReadyToStart = () => {
  const navigate = useNavigate();
  
  // Get child name from localStorage, fallback to 'your child' if not available or empty
  let childName = localStorage.getItem('childName')?.trim() || '';
  childName = childName ? capitalizeName(childName) : 'your child';

  const handleStartNow = () => {
    navigate('/onboarding/lesson-intro');
  };

  const handleStartLater = () => {
    navigate('/onboarding/start-later');
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
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0 }}>
            Are you ready to start now?
          </h1>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#222', lineHeight: 1.4, margin: 0 }}>
            Is {childName} with you to start the first lesson?
          </h2>
        </div>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button
            onClick={handleStartNow}
            variant="primary"
            fullWidth
          >
            Start Now
          </Button>
          <Button
            onClick={handleStartLater}
            variant="secondary"
            fullWidth
          >
            Start Later
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReadyToStart; 