import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import type { Lesson, Slide } from '../../data/types';
import SlideRenderer from './SlideRenderer';
import LessonProgressBar from './LessonProgressBar';
import { useAssetPreloader } from '../../hooks/useAssetPreloader';
import AppLayout from '../../components/ScreenLayout';
import Spinner from '../../components/Spinner';
import BackIcon from '../../assets/icons/back-icon-video.svg';
const BLUE_BACK_ICON = '/images/ui/back-blue.svg';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface LessonPlayerProps {
  lessonId: string;
  userId: string;
}

const getSignedUrl = async (path: string | undefined | null) => {
  if (!path) return undefined;
  console.log('Requesting signed URL for path: [' + path + ']');
  const { data, error } = await supabase.storage.from('content').createSignedUrl(path, 60 * 60); // 1 hour
  if (error) {
    console.error('Error creating signed URL for', '[' + path + ']', error.message);
    return undefined;
  }
  console.log('Signed URL for', '[' + path + ']', ':', data.signedUrl);
  return data.signedUrl;
};

const LessonPlayer = (props: Partial<{ lessonId: string; userId: string }>) => {
  const params = useParams();
  const location = useLocation();

  // Get lessonId from route params or props
  const lessonId = props.lessonId || params.lessonId;
  // Get userId from props or query string
  const userId = props.userId || new URLSearchParams(location.search).get('user');

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [progress, setProgress] = useState<any>(null); // TODO: type user progress
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const prevSlideIdx = useRef(currentSlideIdx);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const navigate = useNavigate();

  // Always call the hook, even if slides is empty
  const { nextLoaded } = useAssetPreloader(slides, currentSlideIdx);

  useEffect(() => {
    setCurrentSlideIdx(0);
  }, [lessonId]);

  useEffect(() => {
    if (prevSlideIdx.current !== currentSlideIdx) {
      setFade(false);
      setTimeout(() => setFade(true), 50);
      prevSlideIdx.current = currentSlideIdx;
    }
  }, [currentSlideIdx]);

  useEffect(() => {
    const fetchLessonData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch lesson metadata
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId);
        console.log('lessonData', lessonData, 'lessonId', lessonId);
        if (lessonError) throw lessonError;
        if (!lessonData || lessonData.length === 0) throw new Error('No lesson found for this ID');
        if (lessonData.length > 1) throw new Error('Multiple lessons found for this ID');
        setLesson(lessonData[0]);

        // Fetch slides for the lesson, ordered
        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order', { ascending: true });
        if (slidesError) throw slidesError;

        // Generate signed URLs for all private assets in slides
        const slidesWithSignedUrls = await Promise.all(
          slidesData.map(async (slide: any) => {
            if (slide.type === 'video') {
              return {
                ...slide,
                video_url: await getSignedUrl(slide.video_url),
              };
            } else if (slide.type === 'quiz') {
              return {
                ...slide,
                quiz_audio_url: await getSignedUrl(slide.quiz_audio_url),
                quiz_correct_audio_url: await getSignedUrl(slide.quiz_correct_audio_url),
                quiz_wrong_audio_url: await getSignedUrl(slide.quiz_wrong_audio_url),
                quiz_answers: await Promise.all(
                  (slide.quiz_answers || []).map(async (answer: any) => ({
                    ...answer,
                    image_url: await getSignedUrl(answer.image_url),
                  }))
                ),
              };
            }
            return slide;
          })
        );
        setSlides(slidesWithSignedUrls);

        // Fetch user progress
        console.log('Fetching user progress for userId:', userId);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('lesson_progress')
          .eq('id', userId)
          .single();
        console.log('userData:', userData, 'userError:', userError);
        if (userError) {
          setError('User not found or duplicate users in database.');
          return;
        }
        setProgress(userData?.lesson_progress || {});
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [lessonId, userId]);

  // Progress update logic (to Supabase)
  const updateProgress = useCallback(async (slideIdx: number) => {
    if (!lessonId) return;
    try {
      const newProgress = {
        ...progress,
        [String(lessonId)]: { slide: slideIdx, completed: slideIdx >= slides.length - 1 },
      };
      setProgress(newProgress);
      await supabase
        .from('users')
        .update({ lesson_progress: newProgress })
        .eq('id', userId);
    } catch (err) {
      // Optionally handle error
    }
  }, [lessonId, slides.length, userId, progress]);

  // Navigation handlers
  const goToPrevSlide = () => {
    if (currentSlideIdx > 0) {
      const prevIdx = currentSlideIdx - 1;
      setCurrentSlideIdx(prevIdx);
      updateProgress(prevIdx);
    }
  };

  const handleNext = () => {
    if (currentSlideIdx < slides.length - 1) {
      if (!nextLoaded) return; // Prevent advancing if next assets aren't ready
      const nextIdx = currentSlideIdx + 1;
      setCurrentSlideIdx(nextIdx);
      updateProgress(nextIdx);
    } else {
      // Last slide completed: navigate to Mission Accomplished
      navigate(`/lesson/mission-accomplished?user=${userId}&lesson=${lessonId}`);
    }
  };

  // Back button handler
  const handleBack = () => {
    if (currentSlideIdx === 0) {
      navigate('/lesson/intro');
    } else {
      goToPrevSlide();
    }
  };

  // Rewind handler for left 30% overlay
  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (loading) return (
    <AppLayout>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit'
      }}>
        <Spinner color="#fff" />
        <div style={{ color: '#fff', fontSize: '1.2rem', marginTop: 16 }}>Loading lesson...</div>
      </div>
    </AppLayout>
  );
  if (error) return (
    <AppLayout>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>
    </AppLayout>
  );
  if (!lesson) return (
    <AppLayout>
      <div style={{ padding: '2rem', textAlign: 'center' }}>Lesson not found.</div>
    </AppLayout>
  );
  if (!slides.length) return (
    <AppLayout>
      <div style={{ padding: '2rem', textAlign: 'center' }}>No slides found.</div>
    </AppLayout>
  );

  const currentSlide = slides[currentSlideIdx];
  const isVideoSlide = currentSlide.type === 'video';
  const isQuizSlide = currentSlide.type === 'quiz';
  const backIconSrc = isQuizSlide ? BLUE_BACK_ICON : BackIcon;

  return (
    <AppLayout>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        zIndex: 1,
        background: 'white'
      }}>
        {/* Header with progress bar and back button for all slides */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}>
          <div style={{ width: '100%' }}>
            <LessonProgressBar
              slides={slides}
              currentIdx={currentSlideIdx}
              currentProgress={isVideoSlide ? videoProgress : 0}
              variant={isQuizSlide ? 'blue' : 'default'}
            />
          </div>
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: 16,
              cursor: 'pointer',
              zIndex: 11,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              alignSelf: 'flex-start',
            }}
            aria-label="Back"
          >
            <img src={backIconSrc} alt="Back" style={{ width: 28, height: 28 }} />
          </button>
        </div>
        {/* Main content area */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative'
        }}>
          {/* Left 30% overlay for rewind (video slides only, below back button area) */}
          {isVideoSlide && (
            <div
              onClick={handleRewind}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '30%',
                height: '100%',
                zIndex: 5,
                cursor: 'pointer',
                background: 'transparent',
                pointerEvents: 'auto',
              }}
            />
          )}
          <div
            style={{
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
            key={currentSlideIdx}
          >
            <SlideRenderer
              slide={currentSlide}
              onNext={handleNext}
              videoRef={isVideoSlide ? videoRef : undefined}
              onVideoProgress={isVideoSlide ? (currentTime, duration) => setVideoProgress(duration > 0 ? currentTime / duration : 0) : undefined}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonPlayer; 