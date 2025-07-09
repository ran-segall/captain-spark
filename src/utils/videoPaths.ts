// Centralized video path management for Captain Spark app

export const VIDEO_PATHS = {
  // Onboarding videos (only include videos that actually exist)
  ONBOARDING: {
    INTRO: '/videos/onboarding/Onboarding-1-HB.mp4',
    PERSONAL_WELCOME: '/videos/onboarding/Onboarding-personal.mp4',
  },
} as const;

// Helper functions for getting video paths
export const getVideoPath = {
  // Get onboarding video by step
  onboarding: (step: number) => {
    switch (step) {
      case 1: return VIDEO_PATHS.ONBOARDING.INTRO;
      case 2: return VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME;
      default: return VIDEO_PATHS.ONBOARDING.INTRO;
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
  VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME,
];

// Type for video path keys
export type VideoPathKey = keyof typeof VIDEO_PATHS;
export type OnboardingVideoKey = keyof typeof VIDEO_PATHS.ONBOARDING; 