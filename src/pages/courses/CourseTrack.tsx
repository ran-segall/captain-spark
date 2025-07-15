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

const CourseTrack: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('user');
  const courseId = new URLSearchParams(location.search).get('course');
  const lessonId = new URLSearchParams(location.search).get('lesson');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCourseId, setResolvedCourseId] = useState<string | null>(courseId || null);
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [kidName, setKidName] = useState<string>('');
  const [isMagicLinkRedirect, setIsMagicLinkRedirect] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(userId);

  // Check if this is a magic link redirect and get user data
  useEffect(() => {
    const checkMagicLinkAndGetUser = async () => {
      // Check if we have a session (magic link redirect)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsMagicLinkRedirect(true);
        // Get user data from our custom users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('kid_name, lesson_progress')
          .eq('id', session.user.id)
          .single();
        
        if (!userError && userData) {
          setKidName(userData.kid_name || '');
          setProgress(userData.lesson_progress || {});
        }
      }
    };
    
    checkMagicLinkAndGetUser();
  }, []);

  // Resolve userId from session if not present in URL, using email lookup in custom users table
  useEffect(() => {
    const resolveUserId = async () => {
      if (userId) {
        setResolvedUserId(userId);
        return;
      }
      // Get current auth user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.email) {
        setResolvedUserId(null);
        return;
      }
      const email = authData.user.email;
      // Look up custom user by email
      const { data: userRows, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);
      if (userError || !userRows || userRows.length === 0) {
        setResolvedUserId(null);
        return;
      }
      setResolvedUserId(userRows[0].id);
    };
    resolveUserId();
  }, [userId]);

  // Dynamic course resolution based on user progress
  useEffect(() => {
    if (!resolvedUserId) return;
    
    // If courseId is provided, use it directly
    if (courseId) {
      setResolvedCourseId(courseId);
      return;
    }
    
    // If lessonId is provided, resolve course from lesson
    if (lessonId) {
      setInitLoading(true);
      setInitError(null);
      (async () => {
        try {
          const { data, error } = await supabase.from('lessons').select('course_id').eq('id', lessonId).single();
          if (error || !data?.course_id) {
            setInitError('Could not resolve course for this lesson.');
            await resolveCourseFromProgress();
          } else {
            setResolvedCourseId(data.course_id);
          }
        } catch {
          setInitError('Could not resolve course for this lesson.');
          await resolveCourseFromProgress();
        } finally {
          setInitLoading(false);
        }
      })();
      return;
    }
    
    // No courseId or lessonId provided - resolve from user progress
    resolveCourseFromProgress();
  }, [resolvedUserId, courseId, lessonId]);

  // Function to resolve course from user progress
  const resolveCourseFromProgress = async () => {
    if (!resolvedUserId) return;
    try {
      // 1. Get user's progress
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('lesson_progress')
        .eq('id', resolvedUserId)
        .single();
      let courseIdToUse = null;
      if (userError || !userData?.lesson_progress) {
        // No progress - use the first lesson in the system
        const { data: lessons, error: firstLessonError } = await supabase
          .from('lessons')
          .select('course_id')
          .order('order', { ascending: true })
          .limit(1);
        const firstLesson = lessons && lessons.length > 0 ? lessons[0] : null;
        if (firstLessonError || !firstLesson?.course_id) {
          setInitError('Could not find any lessons.');
          return;
        }
        courseIdToUse = firstLesson.course_id;
      } else {
        // Find completed lessons
        const userProgress = userData.lesson_progress;
        const completedLessons = Object.keys(userProgress).filter(
          lessonId => userProgress[lessonId]?.completed
        );
        if (completedLessons.length === 0) {
          // No completed lessons - use the first lesson in the system
          const { data: lessons, error: firstLessonError } = await supabase
            .from('lessons')
            .select('course_id')
            .order('order', { ascending: true })
            .limit(1);
          const firstLesson = lessons && lessons.length > 0 ? lessons[0] : null;
          if (firstLessonError || !firstLesson?.course_id) {
            setInitError('Could not find any lessons.');
            return;
          }
          courseIdToUse = firstLesson.course_id;
        } else {
          // Use the course of the last completed lesson
          const lastCompletedLessonId = completedLessons[completedLessons.length - 1];
          const { data: lessons, error: lastLessonError } = await supabase
            .from('lessons')
            .select('course_id')
            .eq('id', lastCompletedLessonId)
            .limit(1);
          const lastLesson = lessons && lessons.length > 0 ? lessons[0] : null;
          if (lastLessonError || !lastLesson?.course_id) {
            setInitError('Could not determine your current course.');
            return;
          }
          courseIdToUse = lastLesson.course_id;
        }
      }
      setResolvedCourseId(courseIdToUse);
    } catch (error) {
      console.error('Error resolving course from progress:', error);
      setInitError('Could not determine your current course.');
    }
  };

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
    if (typeof resolvedUserId !== 'string' || !resolvedUserId.trim() || !resolvedCourseId) {
      console.log('Skipping fetch: invalid resolvedUserId or resolvedCourseId', { resolvedUserId, resolvedCourseId });
      return;
    }
    console.log('Fetching for user:', resolvedUserId, 'course:', resolvedCourseId);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const lessonPromise = supabase.from('lessons').select('*').eq('course_id', resolvedCourseId).order('order', { ascending: true });
        // Fetch both lesson_progress and kid_name
        const userProgressPromise = supabase.from('users').select('lesson_progress, kid_name').eq('id', resolvedUserId).single();
        const [lessonRes, userRes] = await Promise.all([lessonPromise, userProgressPromise]);
        console.log('User progress fetch result', userRes);
        if (lessonRes.error) throw lessonRes.error;
        if (userRes.error) throw userRes.error;
        setLessons(lessonRes.data || []);
        let userProgress = userRes.data?.lesson_progress || {};
        setKidName(userRes.data?.kid_name || '');
        // If lessonId is present and not marked complete, mark it as complete
        if (lessonId && lessonId in userProgress && !userProgress[lessonId]?.completed) {
          userProgress = {
            ...userProgress,
            [lessonId]: { ...(userProgress[lessonId] || {}), completed: true },
          };
          try {
            const updateRes = await supabase.from('users').update({ lesson_progress: userProgress }).eq('id', resolvedUserId);
            console.log('Update result (existing lesson)', updateRes);
          } catch (err) {
            console.error('Update error (existing lesson)', err);
          }
        } else if (lessonId && !(lessonId in userProgress)) {
          userProgress = {
            ...userProgress,
            [lessonId]: { completed: true },
          };
          try {
            const updateRes = await supabase.from('users').update({ lesson_progress: userProgress }).eq('id', resolvedUserId);
            console.log('Update result (new lesson)', updateRes);
          } catch (err) {
            console.error('Update error (new lesson)', err);
          }
        }
        setProgress(userProgress);
      } catch (err) {
        setError((err as Error).message || 'Failed to load course data');
        console.error('Main data-fetching effect error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedUserId, resolvedCourseId, lessonId]);

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
    if (resolvedUserId && nextLesson) {
      navigate(`/lesson/${nextLesson.id}?user=${resolvedUserId}`);
    }
  };

  // Get the appropriate heading
  const getHeading = () => {
    // If arriving from login (no lessonId in URL), show welcome back
    if (!lessonId && kidName) {
      return `Welcome Back ${kidName}!`;
    }
    // If arriving from lesson feedback, show course title
    return courseTitle || <span style={{ background: '#E6EAF0', borderRadius: 8, width: 180, height: 36, display: 'inline-block', animation: 'pulse 1.2s infinite' }} />;
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

  if (!resolvedUserId) {
    return (
      <AppLayout>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#163657', fontSize: 24 }}>Loading...</div>
        </div>
      </AppLayout>
    );
  }

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
        <div style={{ textAlign: 'center' }}>Course Progress</div>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{getHeading()}</h1>
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