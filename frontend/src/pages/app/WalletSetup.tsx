import { useNavigate } from 'react-router-dom';
import { WalletSetupWizard } from '@/components/wallet/WalletSetupWizard';

export default function WalletSetup() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/app', { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <WalletSetupWizard 
      onComplete={handleComplete} 
      onCancel={handleCancel} 
    />
  );
}
