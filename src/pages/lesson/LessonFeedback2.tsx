import React, { useState } from 'react';
import AppLayout from '../../components/ScreenLayout';
import Button from '../../components/Button';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/typography.css';

const OPTIONS = [
  { value: 'boring', emoji: '😴', label: 'Boring' },
  { value: 'meh', emoji: '😐', label: 'Meh' },
  { value: 'fun', emoji: '😄', label: 'Fun' },
  { value: 'super_fun', emoji: '🤩', label: 'Super fun!' },
];

const LessonFeedback2: React.FC = () => {
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('user');
  const lessonId = new URLSearchParams(location.search).get('lesson');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!userId || !lessonId || !selected) return;
    setLoading(true);
    setError(null);
    // Fetch current feedback
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('lesson_feedback')
      .eq('id', userId)
      .single();
    if (fetchError) {
      setError('Failed to fetch feedback');
      setLoading(false);
      return;
    }
    const feedback = data?.lesson_feedback || {};
    const updated = {
      ...feedback,
      [lessonId]: {
        ...(feedback[lessonId] || {}),
        enjoyment: selected,
      },
    };
    const { error: updateError } = await supabase
      .from('users')
      .update({ lesson_feedback: updated })
      .eq('id', userId);
    if (updateError) {
      setError('Failed to save feedback');
      setLoading(false);
      return;
    }
    setLoading(false);
    // Navigate to the new CourseTrack page after feedback
    if (userId) {
      window.location.assign(`/courses/CourseTrack?user=${userId}&lesson=${lessonId}`);
    }
  };

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
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' }}>
          <h2>
            Did you enjoy it?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            width: '100%',
            maxWidth: 340,
            marginBottom: 40,
          }}>
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                aria-label={opt.label}
                style={{
                  border: selected === opt.value ? '2px solid #FFA927' : '1px solid #B0B8C1',
                  borderRadius: 5,
                  background: selected === opt.value ? '#FFF7E6' : '#fff',
                  padding: '1.2rem 0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#163657',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border 0.2s, background 0.2s',
                  boxShadow: selected === opt.value ? '0 2px 8px 0 rgba(255,169,39,0.08)' : 'none',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '4rem', marginBottom: 8 }}>{opt.emoji}</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{opt.label}</span>
              </button>
            ))}
          </div>
          {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        </div>
        <div style={{ width: '100%', marginTop: 'auto' }}>
          <Button
            variant={!selected || loading ? 'disabled' : 'primary'}
            onClick={handleContinue}
            fullWidth
            disabled={!selected || loading}
            loading={loading}
          >
            Continue
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonFeedback2; 