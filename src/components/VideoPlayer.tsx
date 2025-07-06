import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  onFinished?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onFinished, onProgress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      if (onFinished) {
        onFinished();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onFinished]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercentage = (clickX / rect.width) * 100;

    // If click is in the left 30% of the screen, restart video
    if (clickPercentage <= 30) {
      video.currentTime = 0;
      video.play();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted={false}
        playsInline
        style={{
            width: '100%',
            height: '100%',
            padding: 0,
            margin: 0,
            display: 'block',
            border: 'none',
            outline: 'none',
            objectFit: 'fill',
        }}
      />
    </div>
  );
};

export default VideoPlayer; 