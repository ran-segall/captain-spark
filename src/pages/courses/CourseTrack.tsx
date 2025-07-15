import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import type { Lesson } from '../../data/types';
import '../../styles/typography.css';

type LessonStatus = 'done' | 'current' | 'upcoming';

// Only the current lesson is full opacity, done and upcoming are dimmed
const statusOpacity: Record<LessonStatus, number> = {
  done: 0.4,
  current: 1,
  upcoming: 0.4,
};

const statusIcon: Record<LessonStatus, string> = {
  done: '/images/ui/lesson-done.jpg',
  current: '/images/ui/lesson-current.jpg',
  upcoming: '/images/ui/lesson-upcoming.jpg',
};

const DEFAULT_COURSE_ID = 'course-1'; // TODO: Replace with real course id or get from query param

const CourseTrack: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('user');
  const courseId = new URLSearchParams(location.search).get('course') || DEFAULT_COURSE_ID;
  const lessonId = new URLSearchParams(location.search).get('lesson');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCourseId, setResolvedCourseId] = useState<string | null>(courseId !== DEFAULT_COURSE_ID ? courseId : null);
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');

  // If courseId is not a real UUID, but lessonId is present, fetch the lesson to get its course_id
  useEffect(() => {
    if (courseId !== DEFAULT_COURSE_ID) {
      setResolvedCourseId(courseId);
      return;
    }
    if (!lessonId) return;
    setInitLoading(true);
    setInitError(null);
    (async () => {
      try {
        const { data, error } = await supabase.from('lessons').select('course_id').eq('id', lessonId).single();
        if (error || !data?.course_id) {
          setInitError('Could not resolve course for this lesson.');
          setResolvedCourseId(null);
        } else {
          setResolvedCourseId(data.course_id);
        }
      } catch {
        setInitError('Could not resolve course for this lesson.');
        setResolvedCourseId(null);
      } finally {
        setInitLoading(false);
      }
    })();
  }, [courseId, lessonId]);

  // Fetch course title when resolvedCourseId changes
  useEffect(() => {
    if (!resolvedCourseId) return;
    setCourseTitle('');
    supabase.from('courses').select('title').eq('id', resolvedCourseId).single()
      .then(({ data, error }) => {
        if (!error && data?.title) setCourseTitle(data.title);
      });
  }, [resolvedCourseId]);

  useEffect(() => {
    if (!userId || !resolvedCourseId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      supabase.from('lessons').select('*').eq('course_id', resolvedCourseId).order('order', { ascending: true }),
      supabase.from('users').select('lesson_progress').eq('id', userId).single(),
    ])
      .then(async ([lessonRes, userRes]) => {
        if (lessonRes.error) throw lessonRes.error;
        if (userRes.error) throw userRes.error;
        setLessons(lessonRes.data || []);
        let userProgress = userRes.data?.lesson_progress || {};
        // If lessonId is present and not marked complete, mark it as complete
        if (lessonId && lessonId in userProgress && !userProgress[lessonId]?.completed) {
          userProgress = {
            ...userProgress,
            [lessonId]: { ...(userProgress[lessonId] || {}), completed: true },
          };
          await supabase.from('users').update({ lesson_progress: userProgress }).eq('id', userId);
        } else if (lessonId && !(lessonId in userProgress)) {
          userProgress = {
            ...userProgress,
            [lessonId]: { completed: true },
          };
          await supabase.from('users').update({ lesson_progress: userProgress }).eq('id', userId);
        }
        setProgress(userProgress);
      })
      .catch((err) => setError(err.message || 'Failed to load course data'))
      .finally(() => setLoading(false));
  }, [userId, resolvedCourseId, lessonId]);

  // Determine lesson status for each lesson
  let foundCurrent = false;
  const lessonsWithStatus = lessons.map((lesson) => {
    let status: LessonStatus = 'upcoming';
    if (progress[lesson.id]?.completed) {
      status = 'done';
    } else if (!foundCurrent) {
      status = 'current';
      foundCurrent = true;
    }
    return { ...lesson, status };
  });

  const nextLesson = lessonsWithStatus.find((l) => l.status === 'current') || lessonsWithStatus.find((l) => l.status === 'upcoming');

  const handleGetStarted = () => {
    if (userId && nextLesson) {
      navigate(`/lesson/${nextLesson.id}?user=${userId}`);
    }
  };

  // Skeleton UI for loading state
  const Skeleton = () => (
    <div style={{ position: 'relative', flex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        {[0, 1, 2, 3].map((_, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: 0.5,
              marginBottom: idx === 3 ? 0 : 24,
              transition: 'opacity 0.2s',
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E6EAF0', flexShrink: 0, animation: 'pulse 1.2s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                background: '#F3F4F6',
                borderRadius: 16,
                width: 110,
                height: 18,
                marginBottom: 8,
                animation: 'pulse 1.2s infinite',
              }} />
              <div style={{
                background: '#E6EAF0',
                borderRadius: 8,
                width: 180,
                height: 28,
                animation: 'pulse 1.2s infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  return (
    <AppLayout>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        padding: '2rem',
        boxSizing: 'border-box',
        minHeight: 0,
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{courseTitle || <span style={{ background: '#E6EAF0', borderRadius: 8, width: 180, height: 36, display: 'inline-block', animation: 'pulse 1.2s infinite' }} />}</h1>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {initLoading ? (
            <Skeleton />
          ) : initError ? (
            <div style={{ flex: 1, color: 'red', textAlign: 'center' }}>{initError}</div>
          ) : loading ? (
            <Skeleton />
          ) : error ? (
            <div style={{ flex: 1, color: 'red', textAlign: 'center' }}>{error}</div>
          ) : (
            <div style={{ position: 'relative', flex: 1, minHeight: 0, width: '100%', maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
              {/* Gradient overlays */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 80,
                background: 'linear-gradient(to bottom, #fff 20%, rgba(255,255,255,0))',
                zIndex: 2,
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 140,
                background: 'linear-gradient(to top, #fff 30%, rgba(255,255,255,0))',
                zIndex: 2,
                pointerEvents: 'none',
              }} />
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '8px 0 70px',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {lessonsWithStatus.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      opacity: statusOpacity[lesson.status],
                      marginBottom: idx === lessonsWithStatus.length - 1 ? 0 : 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <img
                      src={statusIcon[lesson.status]}
                      alt={lesson.status}
                      style={{ marginTop: 36, width: 75, height: 85, objectFit: 'contain', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'inline-block',
                        background: '#FFEACA',
                        color: '#163657',
                        fontWeight: 700,
                        fontSize: 15,
                        borderRadius: 16,
                        padding: '2px 16px',
                        marginBottom: 8,
                        marginLeft: -15,
                      }}>{lesson.tag}</div>
                      <h2 style={{ margin: 0 }}>{lesson.title}</h2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '100%', marginTop: 24 }}>
          <Button
            variant={nextLesson ? 'primary' : 'disabled'}
            onClick={handleGetStarted}
            fullWidth
            disabled={!nextLesson || loading || initLoading}
          >
            Get Started
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseTrack; 