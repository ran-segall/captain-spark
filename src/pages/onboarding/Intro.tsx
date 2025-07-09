import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';

function Intro() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGetStarted = () => {
    navigate('/onboarding/video-intro', { state: { interacted: true } });
  };

  // Enhanced preloading for mobile
  useEffect(() => {
    const videoSrc = VIDEO_PATHS.ONBOARDING.INTRO;
    
    // Use the video preloader utility
    videoPreloader.preloadVideo(videoSrc).catch(error => {
      console.warn('Video preload failed:', error);
    });

    // Also keep the original preload as fallback
    const video = videoRef.current;
    if (!video) return;

    // Set up aggressive preloading
    video.preload = 'auto';
    video.muted = false; // Keep audio for critical app functionality
    video.playsInline = true;
    
    // Force load the video data
    const loadVideo = async () => {
      try {
        await video.load();
        // Start loading the video data
        video.currentTime = 0.1; // Seek to a small time to trigger loading
        video.currentTime = 0; // Reset to beginning
      } catch (error) {
        console.log('Video preload error:', error);
      }
    };

    loadVideo();
  }, []);

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
      
      {/* Enhanced preload video */}
      <video
        ref={videoRef}
        src={VIDEO_PATHS.ONBOARDING.INTRO}
        preload="auto"
        muted
        playsInline
        style={{ 
          display: 'none',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px'
        }}
      />
    </AppLayout>
  );
}

export default Intro;
