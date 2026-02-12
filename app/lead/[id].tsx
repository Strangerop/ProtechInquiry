import { CustomerFormScreen } from '@/frontend/CustomerFormScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditLeadScreen() {
    const { id, readOnly } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const leadId = Array.isArray(id) ? id[0] : id;
    const isReadOnly = readOnly === 'true';

    return (
        <CustomerFormScreen
            topInset={insets.top}
            onBack={() => router.back()}
            customerId={leadId}
            readOnly={isReadOnly}
            isLead={true}
        />
    );
}
