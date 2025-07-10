import { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
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
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

  const welcomeAudioBlob = location.state?.welcomeAudioBlob;

  // Use useMemo to create object URL only when blob changes
  const welcomeAudioUrl = useMemo(
    () => (welcomeAudioBlob ? URL.createObjectURL(welcomeAudioBlob) : null),
    [welcomeAudioBlob]
  );

  // Clean up object URL on unmount or when blob changes
  useEffect(() => {
    return () => {
      if (welcomeAudioUrl) URL.revokeObjectURL(welcomeAudioUrl);
    };
  }, [welcomeAudioUrl]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = welcomeAudioRef.current;
    
    if (!video) return;

    // If we have custom audio, play video muted and sync audio
    if (welcomeAudioUrl && audio) {
      
      const handleVideoPlay = () => {
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(e => console.error('Welcome audio play error:', e));
        }
      };

      const handleVideoPause = () => {
        if (audio) {
          audio.pause();
        }
      };

      const handleVideoSeek = () => {
        if (audio && !audio.paused) {
          audio.currentTime = video.currentTime;
        }
      };

      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('seeked', handleVideoSeek);

      return () => {
        video.removeEventListener('play', handleVideoPlay);
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('seeked', handleVideoSeek);
      };
    }
  }, [welcomeAudioUrl]);

  const handleProgress = (currentTime: number, duration: number) => {
    setProgress(duration > 0 ? currentTime / duration : 0);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleVideoEnd = () => {
    navigate('/onboarding/ready-to-start');
  };

  useEffect(() => {
    const videoSrc = VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME;
    
    // Check if video is already preloaded
    if (videoPreloader.isVideoReady(videoSrc)) {
      setIsVideoReady(true);
      if (location.state?.interacted) {
        setTimeout(() => {
          const videoElement = document.querySelector('video');
          if (videoElement) {
            // Set muted if we have custom audio
            if (welcomeAudioUrl) {
              videoElement.muted = true;
            }
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
            // Set muted if we have custom audio
            if (welcomeAudioUrl) {
              video.muted = true;
            }
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
  }, [location.state?.interacted, welcomeAudioUrl]);

  return (
    <AppLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 2 }}>
          <div style={{ margin: '2rem' }}>
            <ProgressBar progress={progress} />
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
                if (welcomeAudioRef.current) {
                  welcomeAudioRef.current.currentTime = 0;
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
        
        {/* Video element positioned like in Intro.tsx */}
        <video
          ref={videoRef}
          src={VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME}
          preload="auto"
          muted={welcomeAudioUrl ? true : false}
          playsInline
          style={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#000',
            pointerEvents: 'none',
          }}
          onCanPlay={handleVideoReady}
          onEnded={handleVideoEnd}
          onTimeUpdate={e => handleProgress(e.currentTarget.currentTime, e.currentTarget.duration)}
        />
        {welcomeAudioUrl && (
          <audio ref={welcomeAudioRef} src={welcomeAudioUrl} preload="auto" />
        )}
      </div>
    </AppLayout>
  );
}

export default PersonalWelcome; 