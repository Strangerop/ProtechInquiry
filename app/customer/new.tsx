import { CustomerFormScreen } from '@/frontend/CustomerFormScreen';
import { useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewCustomerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <CustomerFormScreen
            topInset={insets.top}
            onBack={() => router.back()}
        />
    );
}
