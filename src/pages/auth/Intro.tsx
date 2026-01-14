import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { OnboardingCarousel } from '@/components/auth/OnboardingCarousel';

export default function Intro() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/auth/profile-choice');
  };

  const handleSkip = () => {
    navigate('/auth/profile-choice');
  };

  return (
    <AuthLayout>
      <OnboardingCarousel onComplete={handleComplete} onSkip={handleSkip} />
    </AuthLayout>
  );
}