import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (user && profile?.onboarding_completo) {
        navigate('/app', { replace: true });
      } else if (user && !profile?.onboarding_completo) {
        navigate('/auth/complete-profile', { replace: true });
      } else {
        navigate('/auth/intro', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo */}
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center">
          <span className="text-3xl font-bold text-primary-foreground">B</span>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">BYX</h1>
          <p className="text-muted-foreground mt-1">A moeda do novo comércio</p>
        </div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20"
      >
        <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}