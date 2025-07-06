// Centralized video path management for Captain Spark app

export const VIDEO_PATHS = {
  // Onboarding videos
  ONBOARDING: {
    INTRO: '/videos/onboarding/Onboarding-1-HB.mp4',
    STEP_2: '/videos/onboarding/step-2.mp4',
    STEP_3: '/videos/onboarding/step-3.mp4',
    COMPLETE: '/videos/onboarding/complete.mp4',
  },

  // Lesson videos
  LESSONS: {
    // Lesson 1
    LESSON_1: {
      INTRO: '/videos/lessons/lesson-1/intro.mp4',
      MAIN: '/videos/lessons/lesson-1/main.mp4',
      SUMMARY: '/videos/lessons/lesson-1/summary.mp4',
      PRACTICE: '/videos/lessons/lesson-1/practice.mp4',
    },
    // Lesson 2
    LESSON_2: {
      INTRO: '/videos/lessons/lesson-2/intro.mp4',
      MAIN: '/videos/lessons/lesson-2/main.mp4',
      SUMMARY: '/videos/lessons/lesson-2/summary.mp4',
      PRACTICE: '/videos/lessons/lesson-2/practice.mp4',
    },
    // Add more lessons as needed
  },

  // Common videos used throughout the app
  COMMON: {
    CELEBRATION: '/videos/common/celebration.mp4',
    ERROR: '/videos/common/error.mp4',
    LOADING: '/videos/common/loading.mp4',
    SUCCESS: '/videos/common/success.mp4',
    HINT: '/videos/common/hint.mp4',
  },

  // User level specific videos
  USER_LEVELS: {
    BEGINNER: {
      INTRO: '/videos/levels/beginner/intro.mp4',
      BASICS: '/videos/levels/beginner/basics.mp4',
      ENCOURAGEMENT: '/videos/levels/beginner/encouragement.mp4',
    },
    INTERMEDIATE: {
      INTRO: '/videos/levels/intermediate/intro.mp4',
      ADVANCED: '/videos/levels/intermediate/advanced.mp4',
      PRACTICE: '/videos/levels/intermediate/practice.mp4',
    },
    ADVANCED: {
      INTRO: '/videos/levels/advanced/intro.mp4',
      EXPERT: '/videos/levels/advanced/expert.mp4',
      MASTERY: '/videos/levels/advanced/mastery.mp4',
    },
  },

  // Interactive elements
  INTERACTIVE: {
    HINTS: {
      HINT_1: '/videos/hints/hint-1.mp4',
      HINT_2: '/videos/hints/hint-2.mp4',
      HINT_3: '/videos/hints/hint-3.mp4',
    },
    FEEDBACK: {
      CORRECT: '/videos/feedback/correct.mp4',
      INCORRECT: '/videos/feedback/incorrect.mp4',
      TRY_AGAIN: '/videos/feedback/try-again.mp4',
    },
  },
} as const;

// Helper functions for getting video paths
export const getVideoPath = {
  // Get onboarding video by step
  onboarding: (step: number) => {
    switch (step) {
      case 1: return VIDEO_PATHS.ONBOARDING.INTRO;
      case 2: return VIDEO_PATHS.ONBOARDING.STEP_2;
      case 3: return VIDEO_PATHS.ONBOARDING.STEP_3;
      case 4: return VIDEO_PATHS.ONBOARDING.COMPLETE;
      default: return VIDEO_PATHS.ONBOARDING.INTRO;
    }
  },

  // Get lesson videos by lesson ID
  lesson: (lessonId: number) => {
    const lessonKey = `LESSON_${lessonId}` as keyof typeof VIDEO_PATHS.LESSONS;
    const lesson = VIDEO_PATHS.LESSONS[lessonKey];
    
    if (!lesson) {
      console.warn(`Lesson ${lessonId} not found in video paths`);
      return null;
    }
    
    return {
      intro: lesson.INTRO,
      main: lesson.MAIN,
      summary: lesson.SUMMARY,
      practice: lesson.PRACTICE,
    };
  },

  // Get all videos for a lesson
  lessonAll: (lessonId: number) => {
    const lesson = getVideoPath.lesson(lessonId);
    if (!lesson) return [];
    
    return [lesson.intro, lesson.main, lesson.summary, lesson.practice];
  },

  // Get user level videos
  userLevel: (level: 'beginner' | 'intermediate' | 'advanced') => {
    const levelKey = level.toUpperCase() as keyof typeof VIDEO_PATHS.USER_LEVELS;
    return VIDEO_PATHS.USER_LEVELS[levelKey];
  },

  // Get all videos for a user level
  userLevelAll: (level: 'beginner' | 'intermediate' | 'advanced') => {
    const levelVideos = getVideoPath.userLevel(level);
    return Object.values(levelVideos);
  },

  // Get hint video by number
  hint: (hintNumber: number) => {
    const hintKey = `HINT_${hintNumber}` as keyof typeof VIDEO_PATHS.INTERACTIVE.HINTS;
    return VIDEO_PATHS.INTERACTIVE.HINTS[hintKey] || VIDEO_PATHS.COMMON.HINT;
  },

  // Get feedback video by type
  feedback: (type: 'correct' | 'incorrect' | 'try-again') => {
    const feedbackKey = type.toUpperCase() as keyof typeof VIDEO_PATHS.INTERACTIVE.FEEDBACK;
    return VIDEO_PATHS.INTERACTIVE.FEEDBACK[feedbackKey];
  },
};

// Get all video paths for preloading
export const getAllVideoPaths = (): string[] => {
  const paths: string[] = [];
  
  // Helper function to extract all string values from nested objects
  const extractPaths = (obj: any) => {
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        paths.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractPaths(value);
      }
    });
  };
  
  extractPaths(VIDEO_PATHS);
  return paths;
};

// Get critical videos that should be preloaded on app start
export const getCriticalVideos = (): string[] => [
  VIDEO_PATHS.ONBOARDING.INTRO,
  VIDEO_PATHS.COMMON.CELEBRATION,
  VIDEO_PATHS.COMMON.ERROR,
  VIDEO_PATHS.COMMON.SUCCESS,
  VIDEO_PATHS.COMMON.HINT,
];

// Get videos for a specific user journey
export const getUserJourneyVideos = (userLevel: 'beginner' | 'intermediate' | 'advanced'): string[] => {
  const levelVideos = getVideoPath.userLevelAll(userLevel);
  const commonVideos = Object.values(VIDEO_PATHS.COMMON);
  const feedbackVideos = Object.values(VIDEO_PATHS.INTERACTIVE.FEEDBACK);
  
  return [...levelVideos, ...commonVideos, ...feedbackVideos];
};

// Type for video path keys
export type VideoPathKey = keyof typeof VIDEO_PATHS;
export type LessonVideoKey = keyof typeof VIDEO_PATHS.LESSONS.LESSON_1;
export type UserLevelKey = keyof typeof VIDEO_PATHS.USER_LEVELS; 