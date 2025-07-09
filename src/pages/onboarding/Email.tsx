import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/ScreenLayout';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import Button from '../../components/Button';
import BackIcon from '../../assets/icons/back-icon-blue.svg';
import { supabase } from '../../utils/supabaseClient';
import videoPreloader from '../../utils/videoPreloader';
import { VIDEO_PATHS } from '../../utils/videoPaths';
import { generateWelcomeAudio } from '../../utils/elevenlabsClient';

const Email = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Start preloading the next video when component mounts
  useEffect(() => {
    const nextVideoPath = VIDEO_PATHS.ONBOARDING.PERSONAL_WELCOME;
    videoPreloader.preloadVideo(nextVideoPath).catch(error => {
      console.warn('Failed to preload video:', error);
    });
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Get previously collected data from localStorage
      const parentName = localStorage.getItem('parentName');
      const childName = localStorage.getItem('childName');
      const childAge = localStorage.getItem('childAge');

      if (!parentName || !childName || !childAge) {
        throw new Error('Missing onboarding data.');
      }

      // 1. Start ElevenLabs audio generation with timeout
      const audioPromise = generateWelcomeAudio(parentName, childName, 10000);

      // 2. Insert user row in Supabase (don't wait for audio)
      const { data: _data, error } = await supabase
        .from('users')
        .insert([
          {
            parent_name: parentName,
            kid_name: childName,
            kid_age: parseInt(childAge || '0'),
            email: email,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (error) {
        console.error('Error inserting user:', error);
        return;
      }

      // 3. Wait for audio generation (with timeout already handled)
      let welcomeAudioBlob: Blob | null = null;
      try {
        welcomeAudioBlob = await audioPromise;
      } catch (error) {
        console.log('ElevenLabs failed, continuing without audio');
        welcomeAudioBlob = null;
      }

      // 4. Clear localStorage after successful submission
      localStorage.removeItem('parentName');
      localStorage.removeItem('childName');
      localStorage.removeItem('childAge');

      // 5. Navigate to personal welcome page
      navigate('/onboarding/personal-welcome', {
        state: {
          interacted: true,
          welcomeAudioBlob,
        },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div
        style={{
          padding: '2rem',
          width: '100%',
          height: '100%',
          minHeight: '650px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxSizing: 'border-box',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <OnboardingProgressBar step={4} totalSteps={4} />
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              width: 'fit-content',
            }}
            aria-label="Back"
          >
            <img src={BackIcon} alt="Back" style={{ width: 24, height: 24 }} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', lineHeight: 1.1, margin: 0 }}>
            Create an account
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="email" style={{ fontSize: '1rem', color: '#222' }}>Your Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=""
              style={{
                width: '100%',
                fontSize: '1.1rem',
                padding: '0.75rem',
                border: '2px solid #163657',
                borderRadius: 8,
                outline: 'none',
                fontWeight: 500,
                color: '#163657',
                background: '#fff',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              autoFocus
            />
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Button
            onClick={handleContinue}
            disabled={!isValidEmail(email) || isSubmitting}
            variant={!isValidEmail(email) || isSubmitting ? 'disabled' : 'primary'}
            fullWidth
          >
            {isSubmitting ? 'Creating Account...' : 'Continue'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Email;
