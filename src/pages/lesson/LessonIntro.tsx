import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

/**
 * LessonIntro page: Introduces lesson one (Treasure Tracker) with themed image and description.
 * No video, mobile-first layout, consistent with onboarding intro. Used after PersonalWelcome.
 */
function LessonIntro() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) {
        navigate('/onboarding');
        return;
      }
      // Look up user in custom users table by email
      const { data: existing, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);
      if (error || !existing || existing.length === 0) {
        navigate('/onboarding');
        return;
      }
      setUserId(existing[0].id);
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    // Use the correct lesson id for course 1
    setLessonId('730c367b-b4b2-46d0-80e9-0eb63d42b840');
  }, []);

  const handleGetStarted = () => {
    if (userId && lessonId) {
      navigate(`/lesson/${lessonId}?user=${userId}`);
    }
  };

  return (
    <AppLayout>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 1, background: 'white' }}>
        <div
          style={{
            padding: '2rem',
            display: 'flex',
            backgroundColor: 'white',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            zIndex: 1,
            minHeight: 0,
            boxSizing: 'border-box',
            borderRadius: 28,
            boxShadow: '0 2px 16px 0 rgba(22,54,87,0.04)',
            maxWidth: 480,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <h1>
              Captain Spark’s<br />Treasure Tracker
            </h1>
            <div style={{ flex: 1, minHeight: 0, maxHeight: '60%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="/images/onboarding/Start-Course-1.jpg"
                alt="Captain Spark and robot with coins"
                style={{
                  maxWidth: '80%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  height: 'auto',
                  width: 'auto',
                  minHeight: 0,
                }}
              />
            </div>
            <p style={{ maxWidth: 340, margin: '1.5rem 0 2.5rem 0' }}>
              Turns allowance into a life lesson: master needs vs wants, set savings goals, and practice smart spending & giving in five bite-size missions.
            </p>
          </div>
          <div style={{ marginTop: 'auto', width: '100%', flexShrink: 0 }}>
            <Button variant="primary" onClick={handleGetStarted} disabled={!userId || !lessonId}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default LessonIntro; 