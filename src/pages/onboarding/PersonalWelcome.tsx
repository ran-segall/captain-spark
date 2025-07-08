import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressBar from '../../components/ProgressBar';
import BackIcon from '../../assets/icons/back-icon-video.svg';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';

function PersonalWelcome() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parentAudioRef = useRef<HTMLAudioElement | null>(null);
  const kidAudioRef = useRef<HTMLAudioElement | null>(null);
  const [parentPlayed, setParentPlayed] = useState(false);
  const [kidPlayed, setKidPlayed] = useState(false);
  const [parentPlaying, setParentPlaying] = useState(false);
  const [kidPlaying, setKidPlaying] = useState(false);

  const parentAudioBlob = location.state?.parentAudioBlob;
  const kidAudioBlob = location.state?.kidAudioBlob;

  // Use useMemo to create object URLs only when blobs change
  const parentAudioUrl = useMemo(
    () => (parentAudioBlob ? URL.createObjectURL(parentAudioBlob) : null),
    [parentAudioBlob]
  );
  const kidAudioUrl = useMemo(
    () => (kidAudioBlob ? URL.createObjectURL(kidAudioBlob) : null),
    [kidAudioBlob]
  );

  // Clean up object URLs on unmount or when blob changes
  useEffect(() => {
    return () => {
      if (parentAudioUrl) URL.revokeObjectURL(parentAudioUrl);
      if (kidAudioUrl) URL.revokeObjectURL(kidAudioUrl);
    };
  }, [parentAudioUrl, kidAudioUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (!parentPlayed && !parentPlaying && parentAudioRef.current && currentTime >= 0.6) {
        parentAudioRef.current.currentTime = 0;
        setParentPlaying(true);
        parentAudioRef.current.play()
          .catch(e => console.error('Parent audio play error:', e));
        setParentPlayed(true);
      }
      if (!kidPlayed && !kidPlaying && kidAudioRef.current && currentTime >= 2.4) {
        kidAudioRef.current.currentTime = 0;
        setKidPlaying(true);
        kidAudioRef.current.play()
          .catch(e => console.error('Kid audio play error:', e));
        setKidPlayed(true);
      }
    };

    const handleParentEnded = () => setParentPlaying(false);
    const handleKidEnded = () => setKidPlaying(false);

    if (parentAudioRef.current) {
      parentAudioRef.current.addEventListener('ended', handleParentEnded);
    }
    if (kidAudioRef.current) {
      kidAudioRef.current.addEventListener('ended', handleKidEnded);
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', () => {
      setParentPlayed(false);
      setKidPlayed(false);
      setParentPlaying(false);
      setKidPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (parentAudioRef.current) {
        parentAudioRef.current.removeEventListener('ended', handleParentEnded);
      }
      if (kidAudioRef.current) {
        kidAudioRef.current.removeEventListener('ended', handleKidEnded);
      }
    };
  }, [parentAudioUrl, kidAudioUrl, parentPlayed, kidPlayed, parentPlaying, kidPlaying]);

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
    // Do nothing for now
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
              onClick={() => {
                // Reset played state and restart video
                setParentPlayed(false);
                setKidPlayed(false);
                setParentPlaying(false);
                setKidPlaying(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
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
          {parentAudioUrl && (
            <audio ref={parentAudioRef} src={parentAudioUrl} preload="auto" />
          )}
          {kidAudioUrl && (
            <audio ref={kidAudioRef} src={kidAudioUrl} preload="auto" />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default PersonalWelcome; 