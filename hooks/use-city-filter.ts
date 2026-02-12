import { City } from '@/components/city-selector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const CITY_STORAGE_KEY = '@protech_selected_city';

export const useCityFilter = () => {
    const [selectedCity, setSelectedCity] = useState<City>('All');

    useEffect(() => {
        // Load persisted city on mount
        const loadCity = async () => {
            try {
                const savedCity = await AsyncStorage.getItem(CITY_STORAGE_KEY);
                if (savedCity) {
                    setSelectedCity(savedCity as City);
                }
            } catch (error) {
                console.error('Failed to load city from storage:', error);
            }
        };

        loadCity();
    }, []);

    const updateCity = async (city: City) => {
        setSelectedCity(city);
        try {
            await AsyncStorage.setItem(CITY_STORAGE_KEY, city);
        } catch (error) {
            console.error('Failed to save city to storage:', error);
        }
    };

    return {
        selectedCity,
        setSelectedCity: updateCity,
    };
};
