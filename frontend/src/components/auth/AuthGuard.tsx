import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveLegalDocument, useUserAcceptances } from '@/hooks/use-legal';
import { LoadingState } from '@/components/common/LoadingState';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

const INTRO_SEEN_KEY = 'byx_intro_seen';
const PUBLIC_AUTH_ROUTES = ['/auth/intro', '/auth/profile-choice', '/auth/login', '/auth/verify'];

export function AuthGuard({
  children,
  requireAuth = false,
  requireOnboarding = false,
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  const { data: termsDoc, isLoading: loadingTerms } = useActiveLegalDocument('terms');
  const { data: acceptances, isLoading: loadingAcceptances } = useUserAcceptances();

  useEffect(() => {
    // Wait for all loading states to complete
    if (loading || (requireOnboarding && (loadingTerms || loadingAcceptances))) {
      return;
    }

    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(location.pathname);
    const isTermsRoute = location.pathname === '/auth/terms';
    const isIntroRoute = location.pathname === '/auth/intro';

    // Check if intro was already seen (device-level)
    const introSeenLocally = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    // Check if user has seen intro (user-level)
    const introSeenByUser = profile?.onboarding_seen_at != null;

    // 1. If route requires auth but user is not logged in
    if (requireAuth && !user) {
      // Check if intro should be shown first
      if (!introSeenLocally) {
        navigate('/auth/intro', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // 2. If user is on intro but already saw it
    if (isIntroRoute && (introSeenLocally || introSeenByUser)) {
      if (user && profile?.onboarding_completo) {
        navigate('/app', { replace: true });
      } else if (user) {
        navigate('/auth/complete-profile', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // 3. Check if user needs to accept new terms version
    if (requireOnboarding && user && termsDoc) {
      const hasAcceptedCurrentTerms = acceptances?.some(a => a.document_id === termsDoc.id);
      
      if (!hasAcceptedCurrentTerms && !isTermsRoute) {
        navigate('/auth/terms', { replace: true });
        return;
      }
    }

    // 4. Check if onboarding is complete
    if (requireOnboarding && user && !profile?.onboarding_completo) {
      if (location.pathname !== '/auth/complete-profile' && 
          location.pathname !== '/auth/terms' &&
          location.pathname !== '/auth/success') {
        navigate('/auth/complete-profile', { replace: true });
        return;
      }
    }

    // 5. If user is fully logged in and on public auth routes, redirect to app
    if (user && profile?.onboarding_completo && isPublicAuthRoute) {
      navigate('/app', { replace: true });
      return;
    }

    // All checks passed, ready to render
    setIsReady(true);
  }, [
    user, 
    profile, 
    loading, 
    navigate, 
    location.pathname, 
    requireAuth, 
    requireOnboarding, 
    termsDoc, 
    acceptances, 
    loadingTerms, 
    loadingAcceptances
  ]);

  // Show loading while auth is being verified
  if (loading || (requireOnboarding && (loadingTerms || loadingAcceptances))) {
    return <LoadingState fullScreen message="Carregando..." />;
  }

  // Don't render content until all guards have been checked
  if (!isReady) {
    return <LoadingState fullScreen message="Carregando..." />;
  }

  return <>{children}</>;
}
