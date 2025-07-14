import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const fetchStreakData = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('streak_count, last_streak_date')
    .eq('id', userId)
    .single();
  if (error || !data) return { streak_count: 0, last_streak_date: null };
  return data;
};

const updateStreakData = async (userId: string, streak_count: number, last_streak_date: string) => {
  await supabase
    .from('users')
    .update({ streak_count, last_streak_date })
    .eq('id', userId);
};

const getToday = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// Replace getStreakArray with a version that aligns with the week
const getStreakArray = (streak_count: number, last_streak_date: string | null) => {
  // Returns an array of 7 booleans, true for completed days (aligned to today)
  const arr = Array(7).fill(false);
  if (!last_streak_date) return arr;

  const today = new Date();
  const todayIdx = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  for (let i = 0; i < Math.min(streak_count, 7); i++) {
    // Calculate the day index for each streak day
    const dayIdx = (todayIdx - i + 7) % 7;
    arr[dayIdx] = true;
  }
  return arr;
};

const DayStreak: React.FC = () => {
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('user');

  const [streak, setStreak] = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streakArr, setStreakArr] = useState(Array(7).fill(false));

  useEffect(() => {
    const animate = () => {
      if (displayStreak < streak) {
        const step = Math.ceil((streak - displayStreak) / 5);
        setTimeout(() => setDisplayStreak(displayStreak + step), 60);
      } else {
        setDisplayStreak(streak);
      }
    };
    if (displayStreak !== streak) animate();
  }, [displayStreak, streak]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const doStreak = async () => {
      setLoading(true);
      const { streak_count, last_streak_date } = await fetchStreakData(userId);
      const today = getToday();
      const yesterday = getYesterday();
      let newStreak = streak_count || 0;
      if (last_streak_date === today) {
        // Already counted today
      } else if (last_streak_date === yesterday) {
        newStreak = (streak_count || 0) + 1;
      } else {
        newStreak = 1;
      }
      await updateStreakData(userId, newStreak, today);
      if (!isMounted) return;
      setStreak(newStreak);
      setDisplayStreak(0);
      setStreakArr(getStreakArray(newStreak, today));
      setLoading(false);
    };
    doStreak();
    return () => { isMounted = false; };
  }, [userId]);

  // Animate checkmarks (fade/scale in)
  useEffect(() => {
    if (!streakArr.some(Boolean)) return;
    const icons = document.querySelectorAll('.streak-day-icon');
    icons.forEach((icon, i) => {
      icon.classList.remove('show');
      setTimeout(() => icon.classList.add('show'), 120 * i);
    });
  }, [streakArr]);

  const handleContinue = () => {
    // TODO: navigate to feedback or next screen
    // navigate(`/feedback?user=${userId}${lessonId ? `&lesson=${lessonId}` : ''}`);
  };

  return (
    <AppLayout>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        minHeight: 0,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          padding: '2rem',
        }}>
          <img
            src={'/images/post-lesson/fire.jpg'}
            alt="Day Streak Fire"
            style={{ width: 149, height: 149, marginBottom: 24 }}
          />
          <div style={{ fontSize: '5rem', fontWeight: 900, color: '#163657', marginBottom: 8, transition: 'all 0.5s' }}>{loading ? '...' : displayStreak}</div>
          <h1 style={{ margin: 0, marginBottom: '1.2rem', textAlign: 'center' }}>Day Streak</h1>
          <div style={{
            border: '1px solid rgba(22, 54, 87, 0.7)',
            borderRadius: 5,
            padding: 16,
            margin: '1.5rem 0 1.5rem 0',
            background: '#fff',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 8,
              flex: 1,
              alignItems: 'flex-end',
              width: '100%',
              borderBottom: '2px solid #E6EAF0',
              paddingBottom: 12,
            }}>
              {streakArr.map((done, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <img
                    className="streak-day-icon"
                    src={done ? '/images/post-lesson/day-on.svg' : '/images/post-lesson/day-off.svg'}
                    alt={done ? 'Completed' : 'Not completed'}
                    style={{ width: 28, height: 28, opacity: 0, transform: 'scale(0.7)', transition: 'opacity 0.4s, transform 0.4s' }}
                  />
                  <div style={{ fontSize: 12, color: done ? '#FFA927' : '#B0B8C1', fontWeight: 700, marginTop: 2 }}>{DAYS[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', maxWidth: 260 }}>
              Learning daily grows your streak, but skipping a day resets it!
            </div>
          </div>
        </div>
        <div style={{ width: '100%', padding: '0 2rem 2rem 2rem', boxSizing: 'border-box' }}>
          <Button variant="primary" onClick={handleContinue} fullWidth>
            I’m Committed!
          </Button>
        </div>
        <style>{`
          .streak-day-icon.show {
            opacity: 1 !important;
            transform: scale(1) !important;
          }
        `}</style>
      </div>
    </AppLayout>
  );
};

export default DayStreak; 