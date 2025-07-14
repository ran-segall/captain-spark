import React, { useRef, useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface VideoSlideProps {
  videoUrl: string;
  onEnded: () => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onProgress?: (currentTime: number, duration: number) => void;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ videoUrl, onEnded, videoRef, onProgress }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef || localRef;
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = 0;
      // Don't auto-play - wait for user interaction
      setIsPlaying(false);
    }
    setError(false);
    setHasUserInteracted(false);
  }, [videoUrl, ref]);

  const handlePlay = async () => {
    if (ref.current) {
      try {
        await ref.current.play();
        setIsPlaying(true);
        setHasUserInteracted(true);
      } catch (err) {
        console.error('Failed to play video:', err);
        setError(true);
      }
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onProgress) {
      onProgress(e.currentTarget.currentTime, e.currentTarget.duration);
    }
  };

  const handlePlayEvent = () => {
    setIsPlaying(true);
  };

  const handlePauseEvent = () => {
    setIsPlaying(false);
  };

  if (error) {
    return <div style={{ color: 'red', padding: 24 }}>Video failed to load. Please check your connection or try again later.</div>;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      position: 'relative'
    }}>
      <video
        ref={ref}
        src={videoUrl}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'fill',
          background: '#000',
          pointerEvents: 'none',
        }}
        onEnded={onEnded}
        playsInline
        onError={() => setError(true)}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlayEvent}
        onPause={handlePauseEvent}
      />
      
      {/* Play button overlay - only show when video is not playing */}
      {!isPlaying && (
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
            background: 'rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            zIndex: 10,
          }}
          onClick={handlePlay}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '20px solid #333',
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                marginLeft: 4,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSlide; 