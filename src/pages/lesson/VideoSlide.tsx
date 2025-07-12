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

  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play();
    }
    setError(false);
  }, [videoUrl, ref]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onProgress) {
      onProgress(e.currentTarget.currentTime, e.currentTarget.duration);
    }
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
      background: '#000'
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
      />
    </div>
  );
};

export default VideoSlide; 