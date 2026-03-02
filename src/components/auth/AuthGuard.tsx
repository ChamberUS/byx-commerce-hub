import { ReactNode, useEffect, useState, useRef } from 'react';
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
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [decision, setDecision] = useState<'loading' | 'render' | 'redirecting'>('loading');
  const redirectedRef = useRef(false);

  // Only fetch legal docs when needed (user is logged in and onboarding required)
  const shouldCheckLegal = requireOnboarding && !!user;
  const { data: termsDoc, isLoading: loadingTerms } = useActiveLegalDocument('terms');
  const { data: acceptances, isLoading: loadingAcceptances } = useUserAcceptances();

  useEffect(() => {
    // Reset on route change
    redirectedRef.current = false;
    setDecision('loading');
  }, [location.pathname]);

  useEffect(() => {
    // Wait for auth to resolve
    if (loading || profileLoading) return;

    // Wait for legal docs if needed
    if (shouldCheckLegal && (loadingTerms || loadingAcceptances)) return;

    // Prevent double redirects
    if (redirectedRef.current) return;

    const path = location.pathname;
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(path);
    const isIntroRoute = path === '/auth/intro';
    const isTermsRoute = path === '/auth/terms';
    const introSeenLocally = localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    const introSeenByUser = profile?.onboarding_seen_at != null;

    // 1. Route requires auth but no user → redirect to login/intro
    if (requireAuth && !user) {
      redirectedRef.current = true;
      setDecision('redirecting');
      if (!introSeenLocally) {
        navigate('/auth/intro', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // 2. User on intro but already saw it
    if (isIntroRoute && (introSeenLocally || introSeenByUser)) {
      redirectedRef.current = true;
      setDecision('redirecting');
      if (user && profile?.onboarding_completo) {
        navigate('/app', { replace: true });
      } else if (user) {
        navigate('/auth/complete-profile', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
      return;
    }

    // 3. Check terms acceptance
    if (shouldCheckLegal && termsDoc) {
      const hasAcceptedCurrentTerms = acceptances?.some(a => a.document_id === termsDoc.id);
      if (!hasAcceptedCurrentTerms && !isTermsRoute) {
        redirectedRef.current = true;
        setDecision('redirecting');
        navigate('/auth/terms', { replace: true });
        return;
      }
    }

    // 4. Onboarding incomplete
    if (requireOnboarding && user && !profile?.onboarding_completo) {
      const allowedPaths = ['/auth/complete-profile', '/auth/terms', '/auth/success'];
      if (!allowedPaths.includes(path)) {
        redirectedRef.current = true;
        setDecision('redirecting');
        navigate('/auth/complete-profile', { replace: true });
        return;
      }
    }

    // 5. Logged in user on public auth routes → go to app
    if (user && profile?.onboarding_completo && isPublicAuthRoute) {
      redirectedRef.current = true;
      setDecision('redirecting');
      navigate('/app', { replace: true });
      return;
    }

    // All checks passed
    setDecision('render');
  }, [
    user,
    profile,
    loading,
    profileLoading,
    navigate,
    location.pathname,
    requireAuth,
    requireOnboarding,
    shouldCheckLegal,
    termsDoc,
    acceptances,
    loadingTerms,
    loadingAcceptances,
  ]);

  if (decision === 'loading' || decision === 'redirecting') {
    return <LoadingState fullScreen message="Carregando..." />;
  }

  return <>{children}</>;
}
