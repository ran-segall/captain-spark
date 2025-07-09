import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';

// Spinner SVG reused from Button.tsx
const Spinner = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: 0, verticalAlign: 'middle', display: 'inline-block' }}
  >
    <circle
      cx="10"
      cy="10"
      r="8"
      stroke="#222"
      strokeWidth="3"
      strokeDasharray="40 20"
      strokeLinecap="round"
      fill="none"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 10 10"
        to="360 10 10"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

function Intro() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Preload video on mount
  useEffect(() => {
    const videoSrc = VIDEO_PATHS.ONBOARDING.INTRO;
    videoPreloader.preloadVideo(videoSrc)
      .then(() => {
        console.log('Intro: video preloader utility finished');
      })
      .catch(error => {
        console.warn('Video preload failed:', error);
      });

    const video = videoRef.current;
    if (!video) return;
    video.preload = 'auto';
    video.muted = true; // Mute for preloading
    video.playsInline = true;
    video.style.opacity = '0'; // Hide but keep in layout
    video.style.pointerEvents = 'none';
    video.style.position = 'absolute';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    const loadVideo = async () => {
      try {
        await video.load();
        video.currentTime = 0.1;
        video.currentTime = 0;
        console.log('Intro: video element load finished');
      } catch (error) {
        console.log('Video preload error:', error);
      }
    };
    const handleCanPlayThrough = () => {
      console.log('Intro: video element canplaythrough fired');
    };
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    loadVideo();
    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  // Play video when showVideo is set
  useEffect(() => {
    if (showVideo && videoRef.current && isVideoReady) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false; // Unmute for playback
      videoRef.current.style.opacity = '1';
      videoRef.current.style.position = '';
      videoRef.current.style.top = '';
      videoRef.current.style.left = '';
      videoRef.current.style.pointerEvents = '';
      videoRef.current.play();
    }
  }, [showVideo, isVideoReady]);

  const handleGetStarted = () => {
    setShowVideo(true);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleVideoEnd = () => {
    navigate('/onboarding/parent-name');
  };

  const handleProgress = (currentTime: number, duration: number) => {
    setProgress(duration > 0 ? currentTime / duration : 0);
  };

  // Layout
  return (
    <AppLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Intro content */}
        {!showVideo && (
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
        )}
        {/* Video content */}
        {showVideo && (
          <div style={{ width: '100%', height: '100%', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2 }}>
              <div style={{ margin: '2rem' }}>
                <ProgressBar progress={progress} />
                <button
                  onClick={() => setShowVideo(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginTop: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'none',
                  }}
                  aria-label="Back"
                >
                  <img src={BackIcon} alt="Back" style={{ width: 24, height: 24 }} />
                </button>
              </div>
            </div>
            {/* Show loading state if video isn't ready */}
            {!isVideoReady && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100dvh',
                backgroundColor: '#000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
              }}>
                <Spinner />
                <div style={{ color: '#fff', fontSize: '1.2rem', marginTop: 16 }}>Loading</div>
              </div>
            )}
            <video
              ref={videoRef}
              src={VIDEO_PATHS.ONBOARDING.INTRO}
              preload="auto"
              // muted is set dynamically
              playsInline
              style={{
                width: '100%',
                height: '100%',
                padding: 0,
                margin: 0,
                display: 'block',
                border: 'none',
                outline: 'none',
                objectFit: 'fill',
                background: '#000',
              }}
              onCanPlay={handleVideoReady}
              onEnded={handleVideoEnd}
              onTimeUpdate={e => handleProgress(e.currentTarget.currentTime, e.currentTarget.duration)}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Intro;
