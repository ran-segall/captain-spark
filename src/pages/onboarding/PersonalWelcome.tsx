import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';

function PersonalWelcome() {
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
    navigate('/onboarding/ready');
  };

  useEffect(() => {
    const videoSrc = VIDEO_PATHS.ONBOARDING.WELCOME_NO_NAMES;
    
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading...</div>
          </div>
        )}
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <VideoPlayer
            ref={videoRef}
            src={VIDEO_PATHS.ONBOARDING.WELCOME_NO_NAMES}
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

export default PersonalWelcome; 