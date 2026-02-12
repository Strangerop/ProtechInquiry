import { CustomerFormScreen } from '@/frontend/CustomerFormScreen';
import { LandingScreen } from '@/frontend/LandingScreen';
import { SplashScreen } from '@/frontend/SplashScreen';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'landing' | 'form'>('splash');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setCurrentScreen('landing');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleShowForm = () => {
    setCurrentScreen('form');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  if (currentScreen === 'splash') {
    return <SplashScreen topInset={insets.top} />;
  }

  if (currentScreen === 'landing') {
    return <LandingScreen topInset={insets.top} onAddCustomer={handleShowForm} />;
  }

  return (
    <CustomerFormScreen
      topInset={insets.top}
      onBack={handleBackToLanding}
    />
  );
}
