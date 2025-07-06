import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressBar from '../../components/ProgressBar';

function VideoIntro() {
  const location = useLocation();
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