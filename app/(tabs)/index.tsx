import { LandingScreen } from '@/frontend/LandingScreen';
import { SplashScreen } from '@/frontend/SplashScreen';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddCustomer = () => {
    router.push('/customer/new');
  };

  if (showSplash) {
    return <SplashScreen topInset={insets.top} />;
  }

  return <LandingScreen topInset={insets.top} onAddCustomer={handleAddCustomer} />;
}
