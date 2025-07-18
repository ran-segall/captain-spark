import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface VideoPlayerProps {
  src: string;
  onFinished?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onProgressUpdate?: (progress: number) => void; // 0 to 1
  onReady?: () => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, onFinished, onProgress, onProgressUpdate, onReady }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => videoRef.current!, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (onProgress) {
          onProgress(video.currentTime, video.duration);
        }
        
        if (onProgressUpdate && video.duration > 0) {
          const progress = video.currentTime / video.duration;
          onProgressUpdate(progress);
        }
      };

      const handleEnded = () => {
        if (onFinished) {
          onFinished();
        }
      };

      const handleCanPlay = () => {
        if (onReady) {
          onReady();
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, [onProgress, onProgressUpdate, onFinished, onReady]);

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
          preload="auto"
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
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 