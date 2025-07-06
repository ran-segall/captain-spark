import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';

function VideoIntro() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const handleProgress = (currentTime: number, duration: number) => {
    console.log(`Video progress: ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
  };

  const handleProgressUpdate = (progressValue: number) => {
    setProgress(progressValue);
  };

  useEffect(() => {
    if (location.state?.interacted) {
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.play();
      }
    }
  }, [location.state?.interacted]);

  return (
    <AppLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        <VideoPlayer
          src="/videos/onboarding/Onboarding-1-HB.mp4"
          onProgress={handleProgress}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </AppLayout>
  );
}

export default VideoIntro; 