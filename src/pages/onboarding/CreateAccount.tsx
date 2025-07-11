import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';
import BackIcon from '../../assets/icons/back-icon-blue.svg';
import BackIconVideo from '../../assets/icons/back-icon-video.svg';
import { supabase } from '../../utils/supabaseClient';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';
import { generateWelcomeAudio } from '../../utils/elevenlabsClient';

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

// Utility to detect mobile
const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [welcomeAudioBlob, setWelcomeAudioBlob] = useState<Blob | null>(null);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false); // for mobile tap-to-play

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

  // Start preloading the video when component mounts
  useEffect(() => {
    const videoPath = VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME;
    videoPreloader.preloadVideo(videoPath).catch(error => {
      console.warn('Failed to preload video:', error);
    });
  }, []);

  // Handle video and audio synchronization when video is shown
  useEffect(() => {
    const video = videoRef.current;
    const audio = welcomeAudioRef.current;
    
    console.log('Audio sync effect triggered:', { 
      hasVideo: !!video, 
      showVideo, 
      hasWelcomeAudioUrl: !!welcomeAudioUrl, 
      hasAudio: !!audio 
    });
    
    if (!video || !showVideo) return;

    // If we have custom audio, play video muted and sync audio
    if (welcomeAudioUrl && audio) {
      console.log('Setting up audio-video synchronization');
      
      const handleVideoPlay = () => {
        console.log('Video play event - starting audio');
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(e => console.error('Welcome audio play error:', e));
        }
      };

      const handleVideoPause = () => {
        console.log('Video pause event - pausing audio');
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
    } else {
      console.log('No custom audio - video will play with original audio');
      // Ensure video is not muted when no custom audio
      if (video) {
        video.muted = false;
      }
    }
  }, [welcomeAudioUrl, showVideo]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Get previously collected data from localStorage
      const parentName = localStorage.getItem('parentName');
      const childName = localStorage.getItem('childName');
      const childAge = localStorage.getItem('childAge');

      if (!parentName || !childName || !childAge) {
        throw new Error('Missing onboarding data.');
      }

      // 1. Send magic link for passwordless sign-up/login
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/lesson/intro`,
        },
      });
      if (otpError) {
        if (otpError.message.includes('already registered')) {
          alert('This email is already registered. Please use a different email or log in via the magic link.');
        } else {
          alert('Error sending magic link: ' + otpError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // 2. Start ElevenLabs audio generation with timeout
      console.log('Starting ElevenLabs audio generation for:', { parentName, childName });
      let audioPromise: Promise<Blob | null>;
      try {
        audioPromise = generateWelcomeAudio(parentName, childName, 10000);
      } catch (error) {
        console.error('Failed to start ElevenLabs audio generation:', error);
        audioPromise = Promise.resolve(null);
      }

      // 3. Insert user row in Supabase (don't wait for audio)
      const { data: _data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            parent_name: parentName,
            kid_name: childName,
            kid_age: parseInt(childAge || '0'),
            email: email,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (insertError) {
        console.error('Error inserting user:', insertError);
        alert('Error saving user data. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 4. Wait for audio generation (with timeout already handled)
      let audioBlob: Blob | null = null;
      try {
        console.log('Waiting for ElevenLabs audio...');
        audioBlob = await audioPromise;
        console.log('ElevenLabs audio generated successfully:', audioBlob ? 'Blob received' : 'No blob');
      } catch (error) {
        console.error('ElevenLabs failed:', error);
        audioBlob = null;
      }

      // 5. Set the audio blob
      setWelcomeAudioBlob(audioBlob);

      // 6. Clear localStorage after successful submission
      localStorage.removeItem('parentName');
      localStorage.removeItem('childAge');
      // Do NOT remove childName here, so it is available for ReadyToStart and later steps

      // 7. Mobile: show play overlay, Desktop: auto-play
      if (isMobile) {
        setShowVideo(true); // show video UI
        setShowPlayOverlay(true); // show play overlay
        // Pause video on first frame
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.pause();
          }
        }, 50);
      } else {
        setShowVideo(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = audioBlob ? true : false;
            videoRef.current.play();
            videoRef.current.style.zIndex = '1';
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Play handler for mobile overlay
  const handleMobilePlay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = welcomeAudioBlob ? true : false;
      videoRef.current.play();
    }
    if (welcomeAudioRef.current && welcomeAudioBlob) {
      welcomeAudioRef.current.currentTime = 0;
      welcomeAudioRef.current.play();
    }
    setShowPlayOverlay(false);
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  const handleVideoEnd = () => {
    if (showVideo) {
      navigate('/onboarding/ready-to-start');
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
          src={VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME}
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
        
        {/* Email form content */}
        {!showVideo && (
          <div
            style={{
              padding: '2rem',
              width: '100%',
              height: '100%',
              minHeight: '650px',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              boxSizing: 'border-box',
              alignItems: 'center',
              backgroundColor: 'white',
              zIndex: 1,
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && isValidEmail(email) && !isSubmitting) {
                handleContinue();
              }
            }}
            tabIndex={-1}
          >
            <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <OnboardingProgressBar step={4} totalSteps={4} />
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 'none',
                  width: 'fit-content',
                }}
                aria-label="Back"
              >
                <img src={BackIcon} alt="Back" style={{ width: 24, height: 24 }} />
              </button>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0 }}>
                Create an account
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="email" style={{ fontSize: '1rem', color: '#222' }}>Your Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%',
                    fontSize: '1.1rem',
                    padding: '0.75rem',
                    border: '2px solid #163657',
                    borderRadius: 8,
                    outline: 'none',
                    fontWeight: 500,
                    color: '#163657',
                    background: '#fff',
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ width: '100%', maxWidth: 400 }}>
              <Button
                onClick={handleContinue}
                disabled={!isValidEmail(email) || isSubmitting}
                variant={!isValidEmail(email) || isSubmitting ? 'disabled' : 'primary'}
                fullWidth
                loading={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Continue'}
              </Button>
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
            {/* Play overlay for mobile */}
            {showPlayOverlay && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  background: 'rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <button
                  onClick={handleMobilePlay}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: '50%',
                    width: '30vw',
                    height: '30vw',
                    minWidth: 120,
                    minHeight: 120,
                    maxWidth: 240,
                    maxHeight: 240,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  aria-label="Play Welcome Video"
                >
                  <svg width="40%" height="40%" viewBox="0 0 100 100" style={{ display: 'block', margin: 'auto' }}>
                    <polygon points="35,20 80,50 35,80" fill="white" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' }} />
                  </svg>
                </button>
              </div>
            )}
            {/* Clickable overlay for rewind functionality (z-index: 2) */}
            {!showPlayOverlay && (
              <div
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickPercentage = (clickX / rect.width) * 100;
                  if (clickPercentage <= 30 && videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                  if (welcomeAudioRef.current) {
                    welcomeAudioRef.current.currentTime = 0;
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
            )}
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
                  <img src={BackIconVideo} alt="Back" style={{ width: 24, height: 24 }} />
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
        
        {/* Audio element for ElevenLabs audio */}
        {welcomeAudioUrl && (
          <audio 
            ref={welcomeAudioRef} 
            src={welcomeAudioUrl} 
            preload="auto"
            onLoadStart={() => console.log('Audio loading started')}
            onCanPlay={() => console.log('Audio can play')}
            onError={(e) => console.error('Audio error:', e)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CreateAccount; 