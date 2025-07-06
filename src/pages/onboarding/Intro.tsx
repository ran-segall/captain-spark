import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding/video-intro', { state: { interacted: true } });
  };

  return (
    <AppLayout>
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.06rem', color: '#1f2d3d' }}>
          Captain Spark
        </h1>

        <img
          src="/images/onboarding/captain-intro.jpg"
          alt="Captain Spark"
          style={{
            maxWidth: '80%',
            maxHeight: '40vh',
            objectFit: 'contain',
            margin: '0',
          }}
        />

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2d3d', margin: '0 0' }}>
          Where Smart Kids Level Up
        </h2>

        <p style={{ maxWidth: 300, fontSize: '1rem', color: '#555', margin: '0.5rem 0rem 2rem 0px' }}>
          Fun learning adventures in life skills, money smarts, and confident thinking.
        </p>

        <div style={{ marginTop: 'auto', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button variant="primary" onClick={handleGetStarted}>Get Started</Button>
            <Button variant="secondary">Log In</Button>
          </div>
        </div>
      </div>
      {/* Preload video invisibly */}
    <video
      src="/videos/onboarding/Onboarding-1-HB.mp4"
      preload="auto"
      style={{ display: 'none' }}
    />
    </AppLayout>
  );
}

export default Intro;
