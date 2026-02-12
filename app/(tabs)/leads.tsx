import { LeadsListScreen } from '@/frontend/LeadsListScreen';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LeadsScreen = () => {
    const insets = useSafeAreaInsets();
    return <LeadsListScreen topInset={insets.top} />;
};

export default LeadsScreen;
