import { CustomerFormScreen } from '@/frontend/CustomerFormScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NewCustomerScreen() {
    const { initialExhibition } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const exhibition = Array.isArray(initialExhibition) ? initialExhibition[0] : initialExhibition;

    return (
        <CustomerFormScreen
            topInset={insets.top}
            onBack={() => router.back()}
            initialExhibition={exhibition}
        />
    );
}
