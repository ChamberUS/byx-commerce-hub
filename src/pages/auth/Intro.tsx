import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { OnboardingCarousel } from '@/components/auth/OnboardingCarousel';
import { useAuth } from '@/contexts/AuthContext';

const INTRO_SEEN_KEY = 'byx_intro_seen';

export default function Intro() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();

  // Mark intro as seen in localStorage and optionally in profile
  const markIntroAsSeen = async () => {
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    
    // If user is logged in, also mark in profile
    if (user && profile) {
      await updateProfile({ onboarding_seen_at: new Date().toISOString() });
    }
  };

  const handleComplete = async () => {
    await markIntroAsSeen();
    navigate('/auth/profile-choice');
  };

  const handleSkip = async () => {
    await markIntroAsSeen();
    navigate('/auth/profile-choice');
  };

  // Check if intro was already seen
  useEffect(() => {
    const introSeen = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    const introSeenByUser = profile?.onboarding_seen_at != null;
    
    if (introSeen || introSeenByUser) {
      if (user && profile?.onboarding_completo) {
        navigate('/app', { replace: true });
      } else if (user) {
        navigate('/auth/complete-profile', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  return (
    <AuthLayout>
      <OnboardingCarousel onComplete={handleComplete} onSkip={handleSkip} />
    </AuthLayout>
  );
}
