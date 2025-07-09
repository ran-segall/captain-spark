import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';

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

function VideoIntro() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleProgress = (currentTime: number, duration: number) => {
    console.log(`Video progress: ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
  };

  const handleProgressUpdate = (progressValue: number) => {
    setProgress(progressValue);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleVideoEnd = () => {
    navigate('/onboarding/parent-name');
  };

  useEffect(() => {
    const videoSrc = VIDEO_PATHS.ONBOARDING.INTRO;
    
    // Check if video is already preloaded
    if (videoPreloader.isVideoReady(videoSrc)) {
      setIsVideoReady(true);
      if (location.state?.interacted) {
        setTimeout(() => {
          const videoElement = document.querySelector('video');
          if (videoElement) {
            videoElement.play();
          }
        }, 50); // Reduced delay for faster start
      }
    } else {
      // Video needs to load, set up loading state
      const video = videoRef.current;
      if (video) {
        const handleCanPlay = () => {
          setIsVideoReady(true);
          if (location.state?.interacted) {
            video.play();
          }
        };

        video.addEventListener('canplay', handleCanPlay);
        
        // Also try to start loading immediately
        video.load();
        
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [location.state?.interacted]);

  return (
    <AppLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2 }}>
          <div style={{ margin: '2rem' }}>
            <ProgressBar progress={progress} />
            <button
              onClick={() => navigate(-1)}
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
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <Spinner />
            <div style={{ color: '#fff', fontSize: '1.2rem', marginTop: 16 }}>Loading</div>
          </div>
        )}
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <VideoPlayer
            ref={videoRef}
            src={VIDEO_PATHS.ONBOARDING.INTRO}
            onProgress={handleProgress}
            onProgressUpdate={handleProgressUpdate}
            onReady={handleVideoReady}
            onFinished={handleVideoEnd}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default VideoIntro; 