import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { VIDEO_PATHS } from '../../utils/videoPaths';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';

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

  // Play video muted in the background on mount
  // No need for preloading logic, just let it play

  const handleGetStarted = () => {
    setShowVideo(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.play();
      videoRef.current.style.zIndex = '1';
    }
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleVideoEnd = () => {
    if (showVideo) {
      navigate('/onboarding/parent-name');
    }
  };

  const handleProgress = (currentTime: number, duration: number) => {
    setProgress(duration > 0 ? currentTime / duration : 0);
  };

  return (
    <AppLayout>
      {/* Main content overlays, always above video */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 1, background: 'white' }}>
        {/* Video element always present, muted and playing in the background */}
        <video
          ref={videoRef}
          src={VIDEO_PATHS.ONBOARDING.INTRO}
          preload="auto"
          muted
          autoPlay
          playsInline
          style={{
            position: 'absolute',
            zIndex: 0,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#000',
            pointerEvents: 'none',
            transition: 'z-index 0.2s, position 0.2s',
          }}
          onCanPlay={handleVideoReady}
          onEnded={handleVideoEnd}
          onTimeUpdate={e => handleProgress(e.currentTarget.currentTime, e.currentTarget.duration)}
        />
        {/* Intro content */}
        {!showVideo && (
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              backgroundColor: 'white',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              zIndex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <h1>
                Captain Spark
              </h1>
              <div style={{ flexShrink: 1, minHeight: 0, maxHeight: '40%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src="/images/onboarding/captain-intro.jpg"
                  alt="Captain Spark"
                  style={{
                    maxWidth: '80%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    height: 'auto',
                    width: 'auto',
                    minHeight: 0,
                  }}
                />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2d3d', margin: '0 0' }}>
                Where Smart Kids Level Up
              </h2>
              <p style={{ maxWidth: 300, fontSize: '1rem', color: '#555', margin: '0.5rem 0rem 2rem 0px' }}>
                Fun learning adventures in life skills, money smarts, and confident thinking.
              </p>
            </div>
            <div style={{ marginTop: 'auto', width: '100%', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Button variant="primary" onClick={handleGetStarted}>Get Started</Button>
                <Button variant="secondary">Log In</Button>
                <Button variant="secondary" onClick={() => navigate('/onboarding/lesson-intro')}>Dev: Lesson Intro</Button>
              </div>
            </div>
          </div>
        )}
        {/* Video content overlays */}
        {showVideo && (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
            }}
          >
            {/* Clickable overlay for rewind functionality (z-index: 2) */}
            <div
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickPercentage = (clickX / rect.width) * 100;
                if (clickPercentage <= 30 && videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                cursor: 'pointer',
                background: 'transparent',
                pointerEvents: 'auto',
              }}
            />
            {/* Overlays always above video and clickable area (z-index: 3) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 3, pointerEvents: 'auto' }}>
              <div style={{ margin: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ProgressBar progress={progress} />
                <button
                  onClick={() => {
                    setShowVideo(false);
                    if (videoRef.current) {
                      videoRef.current.style.zIndex = '0';
                      videoRef.current.pause();
                    }
                  }}
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
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Intro;
