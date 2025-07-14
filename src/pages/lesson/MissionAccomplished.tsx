import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const XP_REWARD = 70;

const fetchCurrentXP = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('users')
    .select('lifetime_xp')
    .eq('id', userId)
    .single();
  if (error || !data) return 0;
  return data.lifetime_xp || 0;
};

const updateXP = async (userId: string, newXP: number) => {
  await supabase
    .from('users')
    .update({ lifetime_xp: newXP })
    .eq('id', userId);
};

const MissionAccomplished: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('user');
  const lessonId = new URLSearchParams(location.search).get('lesson');

  if (!userId) {
    console.error('MissionAccomplished: Missing userId. location:', location);
    return (
      <AppLayout>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          Missing lesson or user ID<br />
          <pre style={{ fontSize: 12, color: '#333', background: '#eee', padding: 8, marginTop: 16 }}>{JSON.stringify(location, null, 2)}</pre>
        </div>
      </AppLayout>
    );
  }

  const [startXP, setStartXP] = useState<number | null>(null);
  const [endXP, setEndXP] = useState<number | null>(null);
  const [displayXP, setDisplayXP] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Play sound on mount
  useEffect(() => {
    const audio = new Audio('/audio/mission-accomplished.mp3');
    audio.play();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const doXPUpdate = async () => {
      setLoading(true);
      const currentXP = await fetchCurrentXP(userId);
      // Use lessonId if available, otherwise fallback to a generic key
      const xpKey = `xp_awarded_${userId}_${lessonId || 'mission'}`;
      const alreadyAwarded = localStorage.getItem(xpKey);
      let newXP = currentXP;
      if (!alreadyAwarded) {
        newXP = currentXP + XP_REWARD;
        await updateXP(userId, newXP);
        localStorage.setItem(xpKey, 'true');
      }
      if (!isMounted) return;
      setStartXP(currentXP);
      setEndXP(newXP);
      setDisplayXP(currentXP);
      setLoading(false);
    };
    doXPUpdate();
    return () => { isMounted = false; };
  }, [userId, lessonId]);

  // Animate XP counter
  useEffect(() => {
    if (startXP === null || endXP === null) return;
    if (startXP === endXP) return setDisplayXP(endXP);
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(startXP + (endXP - startXP) * progress);
      setDisplayXP(value);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [startXP, endXP]);

  const handleContinue = () => {
    navigate(`/lesson/day-streak?user=${userId}${lessonId ? `&lesson=${lessonId}` : ''}`);
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
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 0,
            marginBottom: '2rem',
          }}>
            <img
              src={'/images/post-lesson/mission-accomplished.jpg'}
              alt="Mission Accomplished"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: 340,
                objectFit: 'contain',
                flexGrow: 1,
                minHeight: 0,
              }}
            />
          </div>
          <h1 style={{ margin: 0, marginBottom: '1.2rem',textAlign: 'center' }}>Mission Accomplished!</h1>
          <div style={{
            fontSize: '1rem',
            color: 'rgba(22,54,87,0.7)',
            marginBottom: 8,
          }}>
            Lifetime XP
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#FEA41A',
            marginBottom: 24,
            minHeight: 48,
            lineHeight: 1.1,
          }}>
            {loading ? '...' : displayXP}
          </div>
        </div>
        <div style={{ width: '100%', padding: '0 2rem 2rem 2rem', boxSizing: 'border-box' }}>
          <Button variant="primary" onClick={handleContinue} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default MissionAccomplished; 