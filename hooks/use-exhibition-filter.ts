import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = '@protech_selected_exhibition';
const DEFAULT_EXHIBITION = 'All';

export const EXHIBITIONS = [
    'All',
    'Tech Expo Mumbai',
    'Protech Ahmedabad',
    'Build Expo Delhi',
    'Exhibition Bangalore'
];

export const useExhibitionFilter = () => {
    const [selectedExhibition, setSelectedExhibition] = useState(DEFAULT_EXHIBITION);

    useEffect(() => {
        loadExhibition();
    }, []);

    const loadExhibition = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved && EXHIBITIONS.includes(saved)) {
                setSelectedExhibition(saved);
            }
        } catch (error) {
            console.error('Failed to load exhibition:', error);
        }
    };

    const setExhibition = async (exhibition: string) => {
        try {
            setSelectedExhibition(exhibition);
            await AsyncStorage.setItem(STORAGE_KEY, exhibition);
        } catch (error) {
            console.error('Failed to save exhibition:', error);
        }
    };

    return {
        selectedExhibition,
        setSelectedExhibition: setExhibition
    };
};
