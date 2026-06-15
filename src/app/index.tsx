import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SplashScreens } from '@/components/splash-screens';

export default function SplashRoute() {
  const router = useRouter();
  const handleComplete = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);
  return <SplashScreens onComplete={handleComplete} />;
}
