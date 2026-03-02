import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProfileTypeSelector } from '@/components/auth/ProfileTypeSelector';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function ProfileChoice() {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<'cliente' | 'lojista'>();

  const handleContinue = () => {
    if (profileType) {
      // Store choice in sessionStorage for later
      sessionStorage.setItem('byx_profile_type', profileType);
      navigate('/auth/login');
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Como você quer usar o BYX?
          </h1>
          <p className="text-muted-foreground mt-2">
            Escolha seu perfil principal. Você pode mudar isso depois nas configurações.
          </p>
        </div>

        {/* Options */}
        <div className="flex-1">
          <ProfileTypeSelector value={profileType} onChange={setProfileType} />
        </div>

        {/* Footer */}
        <div className="pt-6">
          <Button
            onClick={handleContinue}
            disabled={!profileType}
            className="w-full h-12 rounded-xl gap-2"
            size="lg"
          >
            Continuar
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}