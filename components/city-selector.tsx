import { API_URL } from '@/constants/config';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

export type City = string;

interface CitySelectorProps {
    selectedCity: City;
    onSelectCity: (city: City) => void;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onSelectCity }) => {
    const [cities, setCities] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoading(true);
                const baseUrl = API_URL.replace(/\/customers$/, '');
                const response = await fetch(`${baseUrl}/cities`);

                if (!response.ok) {
                    console.error(`City fetch failed with status ${response.status}`);
                    return;
                }

                const data = await response.json();
                if (data.success) {
                    setCities(['All', ...data.data]);
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCities();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color="#6366f1" />
            </View>
        );
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {cities.map((city) => (
                <TouchableOpacity
                    key={city}
                    style={[
                        styles.cityButton,
                        selectedCity === city && styles.cityButtonActive,
                    ]}
                    onPress={() => onSelectCity(city)}
                >
                    <ThemedText
                        style={[
                            styles.cityText,
                            selectedCity === city && styles.cityTextActive,
                        ]}
                    >
                        {city}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        marginBottom: 16,
    },
    contentContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    cityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cityButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    cityText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    cityTextActive: {
        color: '#fff',
    },
});
