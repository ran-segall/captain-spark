import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';

function VideoIntro() {
  const location = useLocation();

  const handleProgress = (currentTime: number, duration: number) => {
    console.log(`Video progress: ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
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
      <VideoPlayer
        src="/videos/onboarding/Onboarding-1-HB.mp4"
        onProgress={handleProgress}
      />
    </AppLayout>
  );
}

export default VideoIntro; 