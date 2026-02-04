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

export function AuthGuard({
  children,
  requireAuth = false,
  requireOnboarding = false,
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: termsDoc, isLoading: loadingTerms } = useActiveLegalDocument('terms');
  const { data: acceptances, isLoading: loadingAcceptances } = useUserAcceptances();

  useEffect(() => {
    if (loading || loadingTerms || loadingAcceptances) return;

    const isAuthRoute = location.pathname.startsWith('/auth');
    const isPublicAuthRoute = ['/auth/intro', '/auth/profile-choice', '/auth/login', '/auth/verify'].includes(location.pathname);
    const isTermsRoute = location.pathname === '/auth/terms';

    if (requireAuth && !user) {
      // Not logged in, redirect to intro
      navigate('/auth/intro', { replace: true });
      return;
    }

    // Check if user needs to accept new terms version
    if (requireOnboarding && user && termsDoc) {
      const hasAcceptedCurrentTerms = acceptances?.some(a => a.document_id === termsDoc.id);
      
      if (!hasAcceptedCurrentTerms && !isTermsRoute) {
        // User hasn't accepted current terms version
        navigate('/auth/terms', { replace: true });
        return;
      }
    }

    if (requireOnboarding && user && !profile?.onboarding_completo) {
      // Logged in but onboarding not complete
      if (location.pathname !== '/auth/complete-profile' && 
          location.pathname !== '/auth/terms' &&
          location.pathname !== '/auth/success') {
        navigate('/auth/complete-profile', { replace: true });
      }
      return;
    }

    if (user && profile?.onboarding_completo && isPublicAuthRoute) {
      // Already logged in and onboarding complete, redirect to app
      navigate('/app', { replace: true });
      return;
    }
  }, [user, profile, loading, navigate, location, requireAuth, requireOnboarding, termsDoc, acceptances, loadingTerms, loadingAcceptances]);

  if (loading || (requireOnboarding && (loadingTerms || loadingAcceptances))) {
    return <LoadingState fullScreen message="Carregando..." />;
  }

  return <>{children}</>;
}
