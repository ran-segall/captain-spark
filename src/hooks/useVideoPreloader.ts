import { useEffect, useState } from 'react';
import videoPreloader from '../utils/videoPreloader';

interface UseVideoPreloaderOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

interface UseVideoPreloaderReturn {
  isReady: boolean;
  isLoading: boolean;
  progress: number;
  error: Error | null;
  preloadVideo: (src: string) => Promise<void>;
  preloadMultipleVideos: (srcs: string[]) => Promise<void>;
}

export function useVideoPreloader(options: UseVideoPreloaderOptions = {}): UseVideoPreloaderReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const preloadVideo = async (src: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await videoPreloader.preloadVideo(src);
      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to preload video');
      setError(error);
      setIsLoading(false);
      options.onError?.(error);
    }
  };

  const preloadMultipleVideos = async (srcs: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await videoPreloader.preloadMultipleVideos(srcs);
      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to preload videos');
      setError(error);
      setIsLoading(false);
      options.onError?.(error);
    }
  };

  // Update progress periodically
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        const currentProgress = videoPreloader.getLoadingProgress('/videos/onboarding/Onboarding-1-HB.mp4');
        setProgress(currentProgress);
        options.onProgress?.(currentProgress);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, options.onProgress]);

  return {
    isReady,
    isLoading,
    progress,
    error,
    preloadVideo,
    preloadMultipleVideos,
  };
}

// Convenience hook for preloading a single video
export function usePreloadVideo(videoSrc: string, options: UseVideoPreloaderOptions = {}) {
  const preloader = useVideoPreloader(options);

  useEffect(() => {
    if (videoSrc) {
      preloader.preloadVideo(videoSrc);
    }
  }, [videoSrc]);

  return preloader;
}

// Hook for preloading multiple videos
export function usePreloadMultipleVideos(videoSrcs: string[], options: UseVideoPreloaderOptions = {}) {
  const preloader = useVideoPreloader(options);

  useEffect(() => {
    if (videoSrcs.length > 0) {
      preloader.preloadMultipleVideos(videoSrcs);
    }
  }, [videoSrcs.join(',')]); // Re-run when video sources change

  return preloader;
} 