import React from 'react';
import { usePreloadVideo, usePreloadMultipleVideos } from '../hooks/useVideoPreloader';

// Example 1: Preload a single video for a specific page
export function SingleVideoPreloader() {
  const { isReady, isLoading, progress, error } = usePreloadVideo('/videos/lesson-1.mp4');

  return (
    <div>
      {isLoading && <div>Loading video... {Math.round(progress * 100)}%</div>}
      {error && <div>Error: {error.message}</div>}
      {isReady && <div>Video ready to play!</div>}
    </div>
  );
}

// Example 2: Preload multiple videos for a lesson sequence
export function LessonVideoPreloader() {
  const lessonVideos = [
    '/videos/lesson-1-intro.mp4',
    '/videos/lesson-1-main.mp4',
    '/videos/lesson-1-summary.mp4'
  ];

  const { isReady, isLoading, progress, error } = usePreloadMultipleVideos(lessonVideos);

  return (
    <div>
      {isLoading && <div>Loading lesson videos... {Math.round(progress * 100)}%</div>}
      {error && <div>Error: {error.message}</div>}
      {isReady && <div>All lesson videos ready!</div>}
    </div>
  );
}

// Example 3: Preload videos with custom progress handling
export function CustomProgressPreloader() {
  const { isReady, isLoading, progress, error, preloadVideo } = usePreloadVideo('', {
    onProgress: (progress) => {
      console.log(`Video loading: ${Math.round(progress * 100)}%`);
    },
    onError: (error) => {
      console.error('Video preload failed:', error);
    }
  });

  const handlePreloadSpecificVideo = () => {
    preloadVideo('/videos/special-content.mp4');
  };

  return (
    <div>
      <button onClick={handlePreloadSpecificVideo}>Preload Special Video</button>
      {isLoading && <div>Loading... {Math.round(progress * 100)}%</div>}
      {error && <div>Error: {error.message}</div>}
      {isReady && <div>Video ready!</div>}
    </div>
  );
}

// Example 4: Preload videos for different user paths
export function UserPathPreloader({ userPath }: { userPath: 'beginner' | 'intermediate' | 'advanced' }) {
  const getVideosForPath = (path: string) => {
    switch (path) {
      case 'beginner':
        return ['/videos/beginner/intro.mp4', '/videos/beginner/basics.mp4'];
      case 'intermediate':
        return ['/videos/intermediate/advanced.mp4', '/videos/intermediate/practice.mp4'];
      case 'advanced':
        return ['/videos/advanced/expert.mp4', '/videos/advanced/mastery.mp4'];
      default:
        return [];
    }
  };

  const videos = getVideosForPath(userPath);
  const { isReady, isLoading, progress } = usePreloadMultipleVideos(videos);

  return (
    <div>
      {isLoading && <div>Loading {userPath} videos... {Math.round(progress * 100)}%</div>}
      {isReady && <div>{userPath} videos ready!</div>}
    </div>
  );
}

// Example 5: Preload videos based on user interaction
export function InteractivePreloader() {
  const { isReady, isLoading, preloadVideo } = usePreloadVideo('');

  const handleUserAction = (action: string) => {
    switch (action) {
      case 'start_lesson':
        preloadVideo('/videos/lesson-start.mp4');
        break;
      case 'show_hint':
        preloadVideo('/videos/hint-video.mp4');
        break;
      case 'celebration':
        preloadVideo('/videos/celebration.mp4');
        break;
    }
  };

  return (
    <div>
      <button onClick={() => handleUserAction('start_lesson')}>Start Lesson</button>
      <button onClick={() => handleUserAction('show_hint')}>Show Hint</button>
      <button onClick={() => handleUserAction('celebration')}>Celebrate</button>
      
      {isLoading && <div>Loading video...</div>}
      {isReady && <div>Video ready to play!</div>}
    </div>
  );
} 