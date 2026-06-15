import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScreens } from '@/components/onboarding-screens';

export default function OnboardingRoute() {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return <OnboardingScreens onComplete={handleComplete} />;
}
