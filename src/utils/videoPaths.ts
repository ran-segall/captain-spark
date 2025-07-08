// Centralized video path management for Captain Spark app

export const VIDEO_PATHS = {
  // Onboarding videos (only include videos that actually exist)
  ONBOARDING: {
    INTRO: '/videos/onboarding/Onboarding-1-HB.mp4',
    WELCOME_NO_NAMES: '/videos/onboarding/Onbaording-Welcome-No-names.mp4',
  },

  // Audio files
  AUDIO: {
    YOUR_CHILD: '/videos/onboarding/Your-child.mp3',
    BUDDY_AUDIO: '/videos/onboarding/Buddy-audio.mp3',
  },
} as const;

// Helper functions for getting video paths
export const getVideoPath = {
  // Get onboarding video by step
  onboarding: (step: number) => {
    switch (step) {
      case 1: return VIDEO_PATHS.ONBOARDING.INTRO;
      case 2: return VIDEO_PATHS.ONBOARDING.WELCOME_NO_NAMES;
      default: return VIDEO_PATHS.ONBOARDING.INTRO;
    }
  },

  // Get audio file by name
  audio: (name: 'your-child' | 'buddy') => {
    switch (name) {
      case 'your-child': return VIDEO_PATHS.AUDIO.YOUR_CHILD;
      case 'buddy': return VIDEO_PATHS.AUDIO.BUDDY_AUDIO;
      default: return VIDEO_PATHS.AUDIO.YOUR_CHILD;
    }
  },
};

// Get all video paths for preloading
export const getAllVideoPaths = (): string[] => {
  return Object.values(VIDEO_PATHS.ONBOARDING);
};

// Get critical videos that should be preloaded on app start
export const getCriticalVideos = (): string[] => [
  VIDEO_PATHS.ONBOARDING.INTRO,
  VIDEO_PATHS.ONBOARDING.WELCOME_NO_NAMES,
];

// Get all audio paths
export const getAllAudioPaths = (): string[] => {
  return Object.values(VIDEO_PATHS.AUDIO);
};

// Type for video path keys
export type VideoPathKey = keyof typeof VIDEO_PATHS;
export type OnboardingVideoKey = keyof typeof VIDEO_PATHS.ONBOARDING;
export type AudioKey = keyof typeof VIDEO_PATHS.AUDIO; 