// Video preloading utility for better mobile performance
class VideoPreloader {
  private static instance: VideoPreloader;
  private preloadedVideos: Map<string, HTMLVideoElement> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private isMobile: boolean;

  constructor() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static getInstance(): VideoPreloader {
    if (!VideoPreloader.instance) {
      VideoPreloader.instance = new VideoPreloader();
    }
    return VideoPreloader.instance;
  }

  async preloadVideo(src: string): Promise<void> {
    // If already preloading or preloaded, return existing promise
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const preloadPromise = this.performPreload(src);
    this.loadingPromises.set(src, preloadPromise);
    
    try {
      await preloadPromise;
    } catch (error) {
      console.warn('Video preload failed:', src, error);
    }
    
    return preloadPromise;
  }

  private async performPreload(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if video is already preloaded
      if (this.preloadedVideos.has(src)) {
        const video = this.preloadedVideos.get(src)!;
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA
          resolve();
          return;
        }
      }

      // Create new video element for preloading
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = false; // Keep audio for critical app functionality
      video.playsInline = true;
      video.style.position = 'absolute';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      video.style.display = 'none';

      // Mobile-specific optimizations
      if (this.isMobile) {
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-playsinline', 'true');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', 'false');
      }

      const handleCanPlay = () => {
        this.preloadedVideos.set(src, video);
        resolve();
      };

      const handleError = () => {
        reject(new Error(`Failed to preload video: ${src}`));
      };

      const handleLoadedData = () => {
        // For mobile, we might want to resolve earlier
        if (this.isMobile && video.readyState >= 1) { // HAVE_METADATA
          this.preloadedVideos.set(src, video);
          resolve();
        }
      };

      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('error', handleError, { once: true });
      video.addEventListener('loadeddata', handleLoadedData, { once: true });

      // Start loading
      video.src = src;
      video.load();

      // Also try fetch preloading for better mobile caching
      this.fetchPreload(src).catch(() => {
        // Ignore fetch errors, video element preloading is the fallback
      });

      // Timeout for mobile devices
      if (this.isMobile) {
        setTimeout(() => {
          if (video.readyState >= 1) { // HAVE_METADATA
            this.preloadedVideos.set(src, video);
            resolve();
          }
        }, 3000); // 3 second timeout for mobile
      }
    });
  }

  private async fetchPreload(src: string): Promise<void> {
    try {
      const response = await fetch(src, {
        method: 'HEAD',
        cache: 'force-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Fetch preloading failed, but that's okay
      console.debug('Fetch preload failed:', src, error);
    }
  }

  getPreloadedVideo(src: string): HTMLVideoElement | null {
    return this.preloadedVideos.get(src) || null;
  }

  isVideoReady(src: string): boolean {
    const video = this.preloadedVideos.get(src);
    if (!video) return false;
    
    // For mobile, we can be more lenient with ready state
    const minReadyState = this.isMobile ? 1 : 2; // HAVE_METADATA for mobile, HAVE_CURRENT_DATA for desktop
    return video.readyState >= minReadyState;
  }

  clearPreloadedVideo(src: string): void {
    const video = this.preloadedVideos.get(src);
    if (video) {
      video.remove();
      this.preloadedVideos.delete(src);
    }
    this.loadingPromises.delete(src);
  }

  clearAll(): void {
    this.preloadedVideos.forEach(video => video.remove());
    this.preloadedVideos.clear();
    this.loadingPromises.clear();
  }

  // Get loading progress for a video
  getLoadingProgress(src: string): number {
    const video = this.preloadedVideos.get(src);
    if (!video) return 0;
    
    if (video.buffered.length > 0) {
      return video.buffered.end(0) / video.duration;
    }
    return 0;
  }

  // Preload multiple videos at once
  async preloadMultipleVideos(videoSrcs: string[]): Promise<void> {
    const preloadPromises = videoSrcs.map(src => this.preloadVideo(src));
    await Promise.allSettled(preloadPromises);
  }

  // Get all preloaded video sources
  getPreloadedVideoSources(): string[] {
    return Array.from(this.preloadedVideos.keys());
  }
}

export const videoPreloader = VideoPreloader.getInstance();
export default videoPreloader; 