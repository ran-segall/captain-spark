// TypeScript types for lessons, slides, and quiz answers

export type Course = {
  id: string;
  title: string;
  description?: string;
  order: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  tag?: string;
  order: number;
  created_at: string;
};

export type SlideType = 'video' | 'quiz'; // Extendable for future types

export type VideoSlide = {
  id: string;
  lesson_id: string;
  order: number;
  type: 'video';
  video_url: string;
  created_at: string;
};

export type QuizAnswer = {
  text: string;
  image_url: string;
  is_correct: boolean;
};

export type QuizSlide = {
  id: string;
  lesson_id: string;
  order: number;
  type: 'quiz';
  quiz_question: string;
  quiz_audio_url?: string;
  quiz_heading?: string;
  quiz_answers: QuizAnswer[];
  quiz_correct_quote?: string;
  quiz_correct_audio_url?: string;
  quiz_wrong_quote?: string;
  quiz_wrong_audio_url?: string;
  created_at: string;
};

export type Slide = VideoSlide | QuizSlide; 